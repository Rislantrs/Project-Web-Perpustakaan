// Book Service — Complete book catalog & borrowing system for Disipusda Perpustakaan
import { supabase } from './supabase';
import { dbGet, dbSave } from './db';
import { uploadDataUrlImage } from './storageService';
import { getCategories } from './dataService';
export interface Book {
  id: string;
  judul: string;
  penulis: string;
  penerbit: string;
  tahun: number;
  kategori: string;
  isbn: string;
  cover: string;
  sinopsis: string;
  halaman: number;
  bahasa: string;
  stok: number;
  rating: number;
  totalRating: number;
  isRecommended?: boolean;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  memberId: string;
  memberName: string;
  bookTitle: string;
  tanggalPinjam: string;
  tanggalKembali: string;
  batasAmbil: string; // Deadline pengambilan 1x24 jam
  tanggalDikembalikan?: string;
  status: 'menunggu_diambil' | 'dipinjam' | 'dikembalikan' | 'terlambat' | 'batal';
}

export interface QueueRecord {
  id: string;
  bookId: string;
  memberId: string;
  memberName: string;
  bookTitle: string;
  nomorAntrian: number;
  tanggalAntri: string;
  status: 'menunggu' | 'siap' | 'dibatalkan';
}

const BOOKS_KEY = 'disipusda_books';
const BORROWS_KEY = 'disipusda_borrows';
const QUEUE_KEY = 'disipusda_queue';
const BOOK_LIST_COLUMNS = 'id, judul, penulis, penerbit, tahun, kategori, isbn, cover, halaman, bahasa, stok, rating, "totalRating", "isRecommended"';

export const getBookCategoryNames = (): string[] => getCategories('books').map(category => category.name);
export const getBookCategoryOptions = (): string[] => ['Semua', ...getBookCategoryNames()];

const defaultBooks: Book[] = [];
const failedCoverMigrationIds = new Set<string>();
// HARDCODE PERF GUARD:
// Minimal jeda refresh cloud agar UI tidak spam query saat event beruntun.
const MIN_REFRESH_INTERVAL_MS = 10000;
let lastRefreshBooksAt = 0;
let refreshBooksInFlight: Promise<void> | null = null;

const normalizeBookRow = (row: Partial<Book>): Book => ({
  id: row.id || '',
  judul: row.judul || '',
  penulis: row.penulis || '',
  penerbit: row.penerbit || '',
  tahun: row.tahun || new Date().getFullYear(),
  kategori: row.kategori || 'Fiksi',
  isbn: row.isbn || '',
  cover: row.cover || '',
  sinopsis: row.sinopsis || '',
  halaman: row.halaman || 0,
  bahasa: row.bahasa || 'Indonesia',
  stok: row.stok || 0,
  rating: row.rating || 0,
  totalRating: row.totalRating || 0,
  isRecommended: !!row.isRecommended,
});

const isBase64Image = (value?: string) => !!value && value.startsWith('data:image/');

const migrateBookCoverIfNeeded = async (book: Book): Promise<Book> => {
  if (!isBase64Image(book.cover) || failedCoverMigrationIds.has(book.id)) {
    return book;
  }

  try {
    const url = await uploadDataUrlImage(book.cover, { bucket: 'articles', folder: 'books', maxWidth: 600, quality: 0.8 });
    const { error } = await supabase.from('books').update({ cover: url }).eq('id', book.id);
    if (error) throw error;
    return { ...book, cover: url };
  } catch (err) {
    console.error(`Migrasi cover base64 gagal untuk buku ${book.id}:`, err);
    failedCoverMigrationIds.add(book.id);
    return book;
  }
};

const generateBorrowId = (): string => {
  return 'BR-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
};

// Initialize books in localStorage
const initBooks = (): Book[] => {
  const data = localStorage.getItem(BOOKS_KEY);
  if (!data) {
    return [];
  }
  return JSON.parse(data);
};

// === CATALOG FUNCTIONS ===

export const getBooks = (): Book[] => {
  return initBooks();
};

export const getBookById = (id: string): Book | undefined => {
  return getBooks().find(b => b.id === id);
};

export const getBookDetailById = async (id: string): Promise<Book | undefined> => {
  // Strategi hemat query:
  // - pakai local dulu
  // - fetch cloud hanya saat sinopsis belum ada
  const localBook = getBookById(id);
  if (!localBook) return undefined;
  if (localBook.sinopsis) return localBook;

  try {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
    if (error || !data) return localBook;
    const merged = normalizeBookRow({ ...localBook, ...data });
    const allBooks = getBooks();
    const idx = allBooks.findIndex(b => b.id === id);
    if (idx !== -1) {
      allBooks[idx] = merged;
      dbSave(BOOKS_KEY, allBooks);
    }
    return merged;
  } catch (err) {
    console.error('Gagal memuat detail buku:', err);
    return localBook;
  }
};

export const migrateLegacyBookCovers = async () => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('id, cover')
      .like('cover', 'data:image/%');

    if (error || !data || data.length === 0) return;

    for (const row of data) {
      const localBook = getBookById(row.id) || normalizeBookRow(row as Partial<Book>);
      await migrateBookCoverIfNeeded({ ...localBook, cover: row.cover || '' });
    }
  } catch (err) {
    console.error('Migrasi cover buku gagal:', err);
  }
};

export const getRecommendedBooks = (): Book[] => {
  return getBooks().filter(b => b.isRecommended);
};

export const searchBooks = (query: string): Book[] => {
  const q = query.toLowerCase().trim();
  if (!q) return getBooks();
  return getBooks().filter(b =>
    b.judul.toLowerCase().includes(q) ||
    b.penulis.toLowerCase().includes(q) ||
    b.penerbit.toLowerCase().includes(q) ||
    b.isbn.includes(q) ||
    b.kategori.toLowerCase().includes(q)
  );
};

export const getBooksByCategory = (kategori: string): Book[] => {
  if (kategori === 'Semua') return getBooks();
  return getBooks().filter(b => b.kategori === kategori);
};

export const filterBooks = (options: {
  kategori?: string;
  query?: string;
  bahasa?: string;
  tahunMin?: number;
  tahunMax?: number;
  tersedia?: boolean;
}): Book[] => {
  let books = getBooks();

  if (options.query) {
    const q = options.query.toLowerCase().trim();
    books = books.filter(b =>
      b.judul.toLowerCase().includes(q) ||
      b.penulis.toLowerCase().includes(q) ||
      b.isbn.includes(q)
    );
  }

  if (options.kategori && options.kategori !== 'Semua') {
    books = books.filter(b => b.kategori === options.kategori);
  }

  if (options.bahasa) {
    books = books.filter(b => b.bahasa === options.bahasa);
  }

  if (options.tahunMin) {
    books = books.filter(b => b.tahun >= options.tahunMin!);
  }

  if (options.tahunMax) {
    books = books.filter(b => b.tahun <= options.tahunMax!);
  }

  if (options.tersedia) {
    books = books.filter(b => b.stok > 0);
  }

  return books;
};

// === BOOK CRUD (Admin) ===

const generateBookId = (): string =>
  'bk' + Date.now().toString(36) + Math.random().toString(36).substr(2, 3);

export const addBook = async (data: Omit<Book, 'id'>, requestedByAdminId?: string): Promise<{ success: boolean; message: string; book?: Book }> => {
  // === BACKEND VALIDATION: Must be admin ===
  if (!requestedByAdminId) return { success: false, message: 'Akses ditolak: Hanya admin yang dapat menambah buku.' };
  if (!data.judul?.trim()) return { success: false, message: 'Judul buku tidak boleh kosong.' };
  if (!data.penulis?.trim()) return { success: false, message: 'Nama penulis tidak boleh kosong.' };
  if (data.stok < 0) return { success: false, message: 'Stok tidak boleh negatif.' };
  
  const books = getBooks();
  const newBook: Book = { id: generateBookId(), ...data };
  
  // 1. Update Local
  books.push(newBook);
  dbSave(BOOKS_KEY, books);
  
  // 2. Sync Cloud
  try {
    const { error } = await supabase.from('books').upsert(newBook);
    if (error) throw error;
    return { success: true, message: `Buku "${newBook.judul}" berhasil ditambahkan.`, book: newBook };
  } catch (err: any) {
    return { success: false, message: 'Gagal sinkron ke Cloud: ' + err.message };
  }
};

export const updateBook = async (id: string, updates: Partial<Book>, requestedByAdminId?: string): Promise<{ success: boolean; message: string }> => {
  // === BACKEND VALIDATION: Must be admin ===
  if (!requestedByAdminId) return { success: false, message: 'Akses ditolak: Hanya admin yang dapat mengubah data buku.' };
  if (updates.stok !== undefined && updates.stok < 0) return { success: false, message: 'Stok tidak boleh negatif.' };
  
  const books = getBooks();
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return { success: false, message: 'Buku tidak ditemukan.' };
  
  // Block tampering the book ID itself
  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  const updatedBook = { ...books[idx], ...safeUpdates };
  
  // 1. Update Local
  books[idx] = updatedBook;
  dbSave(BOOKS_KEY, books);
  
  // 2. Sync Cloud
  try {
    const { error } = await supabase.from('books').upsert(updatedBook);
    if (error) throw error;
    return { success: true, message: 'Buku berhasil diperbarui.' };
  } catch (err: any) {
    return { success: false, message: 'Gagal sinkron update ke Cloud: ' + err.message };
  }
};

export const deleteBook = async (id: string, requestedByAdminId?: string): Promise<{ success: boolean; message: string }> => {
  // === BACKEND VALIDATION: Must be admin ===
  if (!requestedByAdminId) return { success: false, message: 'Akses ditolak: Hanya admin yang dapat menghapus buku.' };
  
  // 1. Update Local
  const books = getBooks().filter(b => b.id !== id);
  dbSave(BOOKS_KEY, books);
  
  // 2. Sync Cloud
  try {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Buku berhasil dihapus.' };
  } catch (err: any) {
    return { success: false, message: 'Gagal hapus di Cloud: ' + err.message };
  }
};

export const getAllBorrows = (): BorrowRecord[] => getBorrows();

// === BORROW FUNCTIONS ===

// getBorrows is now defined at the bottom with auto-cancel logic

export const getMemberBorrows = (memberId: string): BorrowRecord[] => {
  return getBorrows().filter(b => b.memberId === memberId);
};

export const getActiveBorrows = (memberId: string): BorrowRecord[] => {
  return getMemberBorrows(memberId).filter(b => b.status === 'dipinjam');
};

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const formatDate = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
const formatDateTime = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export const borrowBook = async (bookId: string, memberId: string, _memberNameFromFrontend: string): Promise<{ success: boolean; message: string }> => {
  // === SECURITY: Re-fetch member name from DB — never trust Frontend-supplied data ===
  const membersRaw = localStorage.getItem('disipusda_members');
  const members: Array<{ id: string; namaLengkap: string }> = membersRaw ? JSON.parse(membersRaw) : [];
  const verifiedMember = members.find(m => m.id === memberId);
  if (!verifiedMember) return { success: false, message: 'Anggota tidak ditemukan atau sesi tidak valid.' };
  const memberName = verifiedMember.namaLengkap; // Use DB name, not the frontend-supplied one

  const book = getBookById(bookId);
  if (!book) return { success: false, message: 'Buku tidak ditemukan.' };
  if (book.stok <= 0) return { success: false, message: 'Stok buku habis. Anda bisa mendaftar antrian untuk buku ini.' };

  // Check if already borrowing this book
  const activeBorrows = getActiveBorrows(memberId);
  if (activeBorrows.find(b => b.bookId === bookId)) {
    return { success: false, message: 'Anda sudah meminjam buku ini. Kembalikan terlebih dahulu.' };
  }

  // HARDCODE BUSINESS RULE: maksimal 3 buku aktif per member.
  if (activeBorrows.length >= 3) {
    return { success: false, message: 'Maksimal peminjaman 3 buku. Silakan kembalikan buku terlebih dahulu.' };
  }

  const now = new Date();
  // HARDCODE BUSINESS RULE: masa pinjam standar 7 hari.
  const returnDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 hari masa pinjam
  // HARDCODE BUSINESS RULE: batas ambil buku 1x24 jam setelah request pinjam.
  const pickupDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1x24 jam batas ambil

  const record: BorrowRecord = {
    id: generateBorrowId(),
    bookId,
    memberId,
    memberName,
    bookTitle: book.judul,
    tanggalPinjam: formatDate(now),
    tanggalKembali: formatDate(returnDate),
    batasAmbil: formatDateTime(pickupDeadline),
    status: 'menunggu_diambil',
  };

  try {
    // Semua langkah diproses berurutan agar state lokal dan cloud tetap sinkron.
    // 1. Decrease stock locally & Cloud
    const books = getBooks();
    const bookIdx = books.findIndex(b => b.id === bookId);
    if (bookIdx !== -1) {
      books[bookIdx].stok -= 1;
      dbSave(BOOKS_KEY, books);
      await supabase.from('books').upsert(books[bookIdx]);
    }

    // 2. Remove from queue locally & Cloud
    const queues = getQueues();
    const queueIdx = queues.findIndex(q => q.bookId === bookId && q.memberId === memberId && q.status === 'menunggu');
    if (queueIdx !== -1) {
      queues[queueIdx].status = 'dibatalkan';
      dbSave(QUEUE_KEY, queues);
      await supabase.from('queue').update({ status: 'dibatalkan' }).eq('id', queues[queueIdx].id);
    }

    // 3. Save Borrow Record locally & Cloud
    const borrows = getBorrows();
    borrows.push(record);
    dbSave(BORROWS_KEY, borrows);
    await supabase.from('borrows').insert(record);

    return {
      success: true,
      message: `Buku "${book.judul}" berhasil dipinjam!\n⏰ Ambil sebelum: ${formatDateTime(pickupDeadline)}\n📅 Batas pengembalian: ${formatDate(returnDate)} (7 hari)`
    };
  } catch (err: any) {
    return { success: false, message: 'Gagal sinkronisasi peminjaman ke Cloud: ' + err.message };
  }
};

export const getPendingBorrows = (): BorrowRecord[] => {
  return getBorrows().filter(b => b.status === 'menunggu_diambil');
};

export const confirmPickup = async (borrowId: string): Promise<{ success: boolean; message: string }> => {
  const borrows = getBorrows();
  const idx = borrows.findIndex(b => b.id === borrowId);
  if (idx === -1) return { success: false, message: 'Data peminjaman tidak ditemukan.' };

  if (borrows[idx].status !== 'menunggu_diambil') {
    return { success: false, message: 'Status peminjaman bukan menunggu pengambilan.' };
  }

  try {
    // SECURITY: wajib ada sesi cloud agar lolos kebijakan RLS.
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return { success: false, message: 'Sesi Cloud tidak ditemukan. Silakan login ulang admin.' };
    }
    
    // Update row yang ada. Hindari upsert karena bisa kena cek INSERT policy.
    const { error } = await supabase
      .from('borrows')
      .update({ status: 'dipinjam' })
      .eq('id', borrowId);
    
    if (error) {
      if (error.code === '42501') {
         return { success: false, message: 'Database menolak akses (RLS). Pastikan kebijakan SQL sudah dijalankan.' };
      }
      throw error;
    }

    // 2. ONLY if cloud succeeds, update Local
    borrows[idx].status = 'dipinjam';
    dbSave(BORROWS_KEY, borrows);
    
    return { success: true, message: 'Pengambilan buku berhasil dikonfirmasi!' };
  } catch (err: any) {
    return { success: false, message: 'Gagal konfirmasi: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
};

export const returnBook = async (borrowId: string, requestedByMemberId?: string): Promise<{ success: boolean; message: string }> => {
  const borrows = getBorrows();
  const idx = borrows.findIndex(b => b.id === borrowId);
  if (idx === -1) return { success: false, message: 'Data peminjaman tidak ditemukan.' };

  // === BACKEND VALIDATION: Verify ownership ===
  if (requestedByMemberId && borrows[idx].memberId !== requestedByMemberId) {
    return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin untuk mengembalikan buku orang lain.' };
  }

  if (borrows[idx].status !== 'dipinjam') {
    return { success: false, message: 'Buku ini tidak sedang dalam status dipinjam.' };
  }

  const now = new Date();
  const tanggalDikembalikan = formatDate(now);

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return { success: false, message: 'Sesi Cloud tidak ditemukan. Silakan login ulang.' };
    }

    // 1. Restore stock locally & Cloud
    const books = getBooks();
    const bookIdx = books.findIndex(b => b.id === borrows[idx].bookId);
    if (bookIdx !== -1) {
      books[bookIdx].stok += 1;
      dbSave(BOOKS_KEY, books);
      await supabase.from('books').upsert(books[bookIdx]);
    }

    // 2. Update Borrow record Cloud FIRST
    const { error: borrowUpdateError } = await supabase
      .from('borrows')
      .update({ status: 'dikembalikan', tanggalDikembalikan })
      .eq('id', borrowId);

    if (borrowUpdateError) {
      if (borrowUpdateError.code === '42501') {
        return { success: false, message: 'Akses ditolak Cloud (RLS). Pastikan akun ini punya izin update peminjaman.' };
      }
      throw borrowUpdateError;
    }

    // 3. Setelah cloud sukses, sinkronkan cache lokal
    borrows[idx].status = 'dikembalikan';
    borrows[idx].tanggalDikembalikan = tanggalDikembalikan;
    dbSave(BORROWS_KEY, borrows);

    // Cek antrian berikutnya untuk informasi admin/user setelah pengembalian berhasil.
    const queues = getQueues();
    const nextInQueue = queues
      .filter(q => q.bookId === borrows[idx].bookId && q.status === 'menunggu')
      .sort((a, b) => a.nomorAntrian - b.nomorAntrian)[0];

    let extraMsg = '';
    if (nextInQueue) {
      extraMsg = ' Buku ini akan diberikan kepada antrian berikutnya.';
    }

    return { success: true, message: `Buku berhasil dikembalikan!${extraMsg}` };
  } catch (err: any) {
    return { success: false, message: 'Gagal sinkron pengembalian ke Cloud: ' + err.message };
  }
};

// === QUEUE FUNCTIONS ===

export const getQueues = (): QueueRecord[] => {
  const data = localStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getBookQueue = (bookId: string): QueueRecord[] => {
  return getQueues()
    .filter(q => q.bookId === bookId && q.status === 'menunggu')
    .sort((a, b) => a.nomorAntrian - b.nomorAntrian);
};

export const getMemberQueues = (memberId: string): QueueRecord[] => {
  return getQueues().filter(q => q.memberId === memberId && q.status === 'menunggu');
};

export const getQueuePosition = (bookId: string, memberId: string): number | null => {
  const queue = getBookQueue(bookId);
  const idx = queue.findIndex(q => q.memberId === memberId);
  return idx !== -1 ? idx + 1 : null;
};

export const joinQueue = async (bookId: string, memberId: string, _memberNameFromFrontend: string): Promise<{ success: boolean; message: string; nomorAntrian?: number }> => {
  // === SECURITY: Re-fetch member name from DB — never trust Frontend-supplied data ===
  const membersRaw = localStorage.getItem('disipusda_members');
  const members: Array<{ id: string; namaLengkap: string }> = membersRaw ? JSON.parse(membersRaw) : [];
  const verifiedMember = members.find(m => m.id === memberId);
  if (!verifiedMember) return { success: false, message: 'Anggota tidak ditemukan atau sesi tidak valid.' };
  const memberName = verifiedMember.namaLengkap;

  const book = getBookById(bookId);
  if (!book) return { success: false, message: 'Buku tidak ditemukan.' };

  // Check if already in queue
  const existingQueue = getBookQueue(bookId);
  if (existingQueue.find(q => q.memberId === memberId)) {
    const pos = getQueuePosition(bookId, memberId);
    return { success: false, message: `Anda sudah terdaftar di antrian buku ini. Posisi antrian: #${pos}` };
  }

  // Check if already borrowing this book
  const activeBorrows = getActiveBorrows(memberId);
  if (activeBorrows.find(b => b.bookId === bookId)) {
    return { success: false, message: 'Anda sudah meminjam buku ini.' };
  }

  const now = new Date();
  // Nomor antrian berbasis urutan saat ini (1..N).
  const nomorAntrian = existingQueue.length + 1;

  const queueRecord: QueueRecord = {
    id: 'Q-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    bookId,
    memberId,
    memberName,
    bookTitle: book.judul,
    nomorAntrian,
    tanggalAntri: formatDateTime(now),
    status: 'menunggu',
  };

  try {
    const queues = getQueues();
    queues.push(queueRecord);
    dbSave(QUEUE_KEY, queues);
    await supabase.from('queue').insert(queueRecord);

    return {
      success: true,
      message: `Berhasil mendaftar antrian buku "${book.judul}"! Nomor antrian Anda: #${nomorAntrian}. Anda akan diberitahu saat buku tersedia.`,
      nomorAntrian,
    };
  } catch (err: any) {
    return { success: false, message: 'Gagal mendaftar antrian di Cloud: ' + err.message };
  }
};

export const cancelQueue = async (queueId: string, requestedByMemberId?: string): Promise<{ success: boolean; message: string }> => {
  const queues = getQueues();
  const idx = queues.findIndex(q => q.id === queueId);
  if (idx === -1) return { success: false, message: 'Data antrian tidak ditemukan.' };

  // === BACKEND VALIDATION: Only the queue owner can cancel their spot ===
  if (requestedByMemberId && queues[idx].memberId !== requestedByMemberId) {
    return { success: false, message: 'Akses ditolak: Anda hanya dapat membatalkan antrian milik Anda sendiri.' };
  }

  queues[idx].status = 'dibatalkan';
  dbSave(QUEUE_KEY, queues);

  try {
    const { error } = await supabase
      .from('queue')
      .update({ status: 'dibatalkan' })
      .eq('id', queues[idx].id);
    if (error) throw error;
    return { success: true, message: 'Antrian berhasil dibatalkan.' };
  } catch (err: any) {
    return { success: false, message: 'Gagal membatalkan antrian di Cloud: ' + err.message };
  }
};

/**
 * AUTOMATIC LOGIC: Cancel borrows that are not picked up within 24 hours.
 * This runs locally on the user's browser whenever they access borrowing lists.
 */
export const checkAndCancelOverdueBorrows = () => {
  const borrowsRaw = localStorage.getItem(BORROWS_KEY);
  const booksRaw = localStorage.getItem(BOOKS_KEY);
  
  if (!borrowsRaw || !booksRaw) return;
  
  const borrows = JSON.parse(borrowsRaw) as BorrowRecord[];
  const books = JSON.parse(booksRaw) as Book[];
  let changed = false;
  const now = new Date();

  const updatedBorrows = borrows.map(record => {
    // Only check records that are waiting for pickup
    if (record.status === 'menunggu_diambil') {
      const deadline = new Date(record.batasAmbil);
      if (now > deadline) {
        // Otomatis batal jika lewat batas ambil.
        record.status = 'batal';
        changed = true;
        
        // Stok dikembalikan supaya dapat dipinjam/antri lagi.
        const bookIdx = books.findIndex(b => b.id === record.bookId);
        if (bookIdx !== -1) {
          books[bookIdx].stok += 1;
        }
      }
    }
    return record;
  });

  if (changed) {
    localStorage.setItem(BORROWS_KEY, JSON.stringify(updatedBorrows));
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  }
};

// Hook into getBorrows logic
export const getBorrows = (): BorrowRecord[] => {
  checkAndCancelOverdueBorrows();
  const data = localStorage.getItem(BORROWS_KEY);
  return data ? JSON.parse(data) : [];
};

const parseIndonesianDate = (value?: string): Date | null => {
  if (!value) return null;
  const normalized = value.split(',')[0].trim();
  const match = normalized.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const monthName = match[2].toLowerCase();
  const year = Number(match[3]);
  const monthIndex = months.findIndex((item) => item.toLowerCase() === monthName);
  if (monthIndex < 0) return null;

  return new Date(year, monthIndex, day);
};

const csvEscape = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export const exportBorrowsToCsv = (options?: { month?: string; status?: BorrowRecord['status'] | 'semua' }) => {
  const month = (options?.month || '').trim();
  const status = options?.status || 'semua';
  const borrows = getBorrows();

  const targetYear = month ? Number(month.split('-')[0]) : null;
  const targetMonth = month ? Number(month.split('-')[1]) : null;

  const rows = borrows.filter((item) => {
    if (status !== 'semua' && item.status !== status) return false;
    if (!targetYear || !targetMonth) return true;

    const borrowDate = parseIndonesianDate(item.tanggalPinjam);
    if (!borrowDate) return false;

    return borrowDate.getFullYear() === targetYear && borrowDate.getMonth() + 1 === targetMonth;
  });

  const header = [
    'id',
    'book_id',
    'book_title',
    'member_id',
    'member_name',
    'status',
    'tanggal_pinjam',
    'batas_ambil',
    'tanggal_kembali',
    'tanggal_dikembalikan',
  ];

  const body = rows.map((item) => [
    item.id,
    item.bookId,
    item.bookTitle,
    item.memberId,
    item.memberName,
    item.status,
    item.tanggalPinjam,
    item.batasAmbil,
    item.tanggalKembali,
    item.tanggalDikembalikan || '',
  ]);

  const csvLines = [header, ...body].map((line) => line.map(csvEscape).join(','));
  const csv = '\ufeff' + csvLines.join('\n');
  const fileSuffix = month || 'semua-periode';

  return {
    csv,
    fileName: `arsip-peminjaman-${fileSuffix}.csv`,
    rowCount: rows.length,
  };
};

// === WISHLIST FUNCTIONS ===

const WISHLIST_KEY = 'disipusda_wishlist';

export interface WishlistRecord {
  memberId: string;
  bookId: string;
}

export const getWishlists = (): WishlistRecord[] => {
  const data = localStorage.getItem(WISHLIST_KEY);
  return data ? JSON.parse(data) : [];
};

export const toggleWishlist = (bookId: string, memberId: string): { success: boolean; isAdded: boolean; message: string } => {
  const wishlists = getWishlists();
  const existingIdx = wishlists.findIndex(w => w.bookId === bookId && w.memberId === memberId);
  
  if (existingIdx !== -1) {
    // Remove
    wishlists.splice(existingIdx, 1);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
    return { success: true, isAdded: false, message: 'Dihapus dari Wishlist.' };
  } else {
    // Add
    wishlists.push({ bookId, memberId });
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
    return { success: true, isAdded: true, message: 'Ditambahkan ke Wishlist!' };
  }
};

export const getMemberWishlist = (memberId: string): Book[] => {
  const wishlists = getWishlists().filter(w => w.memberId === memberId);
  const books = getBooks();
  return wishlists.map(w => books.find(b => b.id === w.bookId)).filter(b => b !== undefined) as Book[];
};

export const isInWishlist = (bookId: string, memberId: string): boolean => {
  const wishlists = getWishlists();
  return wishlists.some(w => w.bookId === bookId && w.memberId === memberId);
};

// === RATING FUNCTION ===

export const rateBook = async (bookId: string, memberId: string, newRating: number): Promise<{ success: boolean; message: string }> => {
  // === VALIDASI BACKEND (Security Best Practice) ===
  const borrows = getMemberBorrows(memberId);
  const hasReturned = borrows.some(b => b.bookId === bookId && b.status === 'dikembalikan');
  
  if (!hasReturned) {
    return { success: false, message: 'Keamanan: Anda hanya boleh memberi rating untuk buku yang sudah Anda kembalikan.' };
  }

  const books = getBooks();
  const idx = books.findIndex(b => b.id === bookId);
  if (idx === -1) return { success: false, message: 'Buku tidak ditemukan.' };

  const book = books[idx];
  // Rata-rata dihitung incremental tanpa re-scan seluruh histori rating.
  const currentTotal = book.totalRating || 0;
  const currentAvg = book.rating || 5; 
  
  const newTotal = currentTotal + 1;
  const newAvg = ((currentAvg * currentTotal) + newRating) / newTotal;
  
  const updatedBook = {
    ...book,
    rating: Number(newAvg.toFixed(1)),
    totalRating: newTotal
  };

  // 1. Update Local
  books[idx] = updatedBook;
  dbSave(BOOKS_KEY, books);
  
  // 2. Sync Cloud
  try {
    const { error } = await supabase.from('books').upsert(updatedBook);
    if (error) throw error;
    return { success: true, message: 'Terima kasih atas penilaian Anda!' };
  } catch (err: any) {
    return { success: false, message: 'Gagal simpan rating ke Cloud: ' + err.message };
  }
};

// --- CLOUD SYNC ENGINE ---
export const refreshBooks = async (force: boolean = false) => {
  // Engine sinkronisasi utama katalog/pinjam/antrian dari cloud ke local cache.
  // Dipanggil saat startup, realtime event, dan operasi admin tertentu.
  const now = Date.now();
  if (!force && now - lastRefreshBooksAt < MIN_REFRESH_INTERVAL_MS) {
    return;
  }

  if (refreshBooksInFlight) {
    return refreshBooksInFlight;
  }

  refreshBooksInFlight = (async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      // 1. Sync Books
      const { data: books } = await supabase.from('books').select(BOOK_LIST_COLUMNS);
      if (books && books.length > 0) {
        const normalized = (books as Partial<Book>[]).map(normalizeBookRow);
        const migrated: Book[] = [];
        for (const book of normalized) {
          migrated.push(await migrateBookCoverIfNeeded(book));
        }
        dbSave(BOOKS_KEY, migrated);
      } else {
        // Seed default books if empty
        const localBooks = getBooks();
        if (localBooks.length > 0) {
          await supabase.from('books').insert(localBooks);
        }
      }

      // 2-3. Sync Borrows & Queue hanya saat ada sesi auth.
      // Ini mencegah spam 403 ketika user publik membuka aplikasi.
      if (sessionData.session) {
        const { data: borrows, error: borrowsError } = await supabase.from('borrows').select('*');
        if (!borrowsError && borrows && borrows.length > 0) dbSave(BORROWS_KEY, borrows);

        const { data: queue, error: queueError } = await supabase.from('queue').select('*');
        if (!queueError && queue && queue.length > 0) dbSave(QUEUE_KEY, queue);
      }

      lastRefreshBooksAt = Date.now();
    } catch (err) {
      console.error('Books sync failed:', err);
    } finally {
      refreshBooksInFlight = null;
    }
  })();

  return refreshBooksInFlight;
};
