import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, Star, BookOpen, Filter, X, ChevronLeft, ChevronRight, UserPlus, History, Heart, SlidersHorizontal, BookMarked, CheckCircle, AlertCircle, ArrowRight, Sparkles, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getBooks, getRecommendedBooks, filterBooks, borrowBook, joinQueue, getBookQueue, getQueuePosition, toggleWishlist, isInWishlist, rateBook, getBookDetailById, type Book } from '../services/bookService';
import { getCategories, refreshCategories } from '../services/dataService';
import { getCurrentUser, isLoggedIn } from '../services/authService';
import SafeImage from '../components/SafeImage';
import libBooks from '../assets/image/lib-books.webp';




// HARDCODE: ukuran halaman katalog pada mode list/grid utama.
const BOOKS_PER_PAGE = 12;

export default function KatalogBuku() {
  const [books, setBooks] = useState<Book[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingBookDetail, setIsLoadingBookDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterBahasa, setFilterBahasa] = useState('');
  const [filterTersedia, setFilterTersedia] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const catalogRef = useRef<HTMLDivElement>(null);
  const recScrollRef = useRef<HTMLDivElement>(null);
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Bootstrap awal: ambil rekomendasi + muat katalog dari cache/service.
    const bootstrapCatalog = () => {
      setIsLoadingCatalog(true);
      setRecommendedBooks(getRecommendedBooks());
      loadBooks();
      setIsLoadingCatalog(false);
    };

    bootstrapCatalog();
    refreshCategories();

    const onDbChange = () => {
      setRecommendedBooks(getRecommendedBooks());
      loadBooks();
    };
    window.addEventListener('dbChange', onDbChange);
    return () => window.removeEventListener('dbChange', onDbChange);
  }, []);

  const openBookDetail = async (book: Book) => {
    // Buka detail cepat dari data card, lalu hydrate versi lengkap dari service.
    setSelectedBook(book);
    setIsLoadingBookDetail(true);
    try {
      const fullBook = await getBookDetailById(book.id);
      if (fullBook) setSelectedBook(fullBook);
    } finally {
      setIsLoadingBookDetail(false);
    }
  };

  useEffect(() => {
    // Deep-link: dukung buka modal detail via query param ?bookId=...
    const bookId = searchParams.get('bookId');
    if (bookId) {
      const book = getBooks().find(b => b.id === bookId);
      if (book) {
        openBookDetail(book);
        // Clear param to avoid re-opening if user closes it
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams]);

  const loadBooks = () => {
    // Filter utama dijalankan di service agar aturan konsisten lintas halaman.
    const filtered = filterBooks({
      query: searchQuery,
      kategori: selectedCategory,
      bahasa: filterBahasa || undefined,
      tersedia: filterTersedia || undefined,
    });
    setBooks(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    loadBooks();
  }, [searchQuery, selectedCategory, filterBahasa, filterTersedia]);

  const totalPages = Math.ceil(books.length / BOOKS_PER_PAGE);
  const paginatedBooks = books.slice((currentPage - 1) * BOOKS_PER_PAGE, currentPage * BOOKS_PER_PAGE);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: Array<number | '...'> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('...');
    for (let page = start; page <= end; page += 1) pages.push(page);
    if (end < totalPages - 1) pages.push('...');

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // UX: pindah halaman sekaligus scroll ke area katalog.
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleBorrow = async (book: Book) => {
    // Guard auth: peminjaman hanya untuk member login.
    if (!isLoggedIn()) {
      showToast('Silakan login terlebih dahulu untuk meminjam buku.', 'error');
      return;
    }
    const user = getCurrentUser()!;
    try {
      const result = await borrowBook(book.id, user.id, user.namaLengkap);
      showToast(result.message, result.success ? 'success' : 'error');
      if (result.success) {
        // Refresh data cache + panel detail agar stok/status terbaru langsung tampil.
        setBooks(getBooks());
        setRecommendedBooks(getRecommendedBooks());
        const refreshed = getBooks().find(b => b.id === book.id);
        if (refreshed) setSelectedBook(refreshed);
      }
    } catch (err) {
      showToast('Gagal memproses peminjaman.', 'error');
    }
  };

  const handleWishlist = (bookId: string) => {
    // Guard auth: wishlist bersifat personal per member.
    if (!isLoggedIn()) {
      showToast('Silakan login untuk menyimpan ke Wishlist.', 'error');
      return;
    }
    const user = getCurrentUser()!;
    const result = toggleWishlist(bookId, user.id);
    showToast(result.message, result.success ? 'success' : 'error');
    if (selectedBook) {
      setSelectedBook({ ...selectedBook }); // Force re-render
    }
  };



  const scrollRec = (dir: 'left' | 'right') => {
    // Horizontal scroll helper untuk rail rekomendasi.
    if (recScrollRef.current) {
      recScrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  const scrollCat = (dir: 'left' | 'right') => {
    // Horizontal scroll helper untuk rail kategori.
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const renderStars = (rating: number) => {
    // Render bintang statis 1..5 berdasarkan pembulatan rating.
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} size={14} className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
      );
    }
    return stars;
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen">

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border max-w-lg"
            style={{
              background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
              borderColor: toast.type === 'success' ? '#6ee7b7' : '#fca5a5',
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={20} className="text-emerald-600 shrink-0" /> : <AlertCircle size={20} className="text-red-600 shrink-0" />}
            <span className={`text-sm font-medium ${toast.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{toast.message}</span>
            <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-[#8b1c24] via-[#7a1820] to-[#5a1018] py-24 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={libBooks} className="w-full h-full object-cover" alt="bg" />
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#d6a54a]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[#e2b769] font-bold tracking-widest uppercase mb-4 text-sm flex items-center justify-center gap-2">
              <BookMarked size={16} /> KATALOG PERPUSTAKAAN DIGITAL
            </p>
            <h1 className="font-serif text-white text-5xl lg:text-6xl font-bold mb-6">Jelajahi Koleksi Kami</h1>
            <p className="text-gray-200 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Temukan ribuan buku dari berbagai kategori. Cari, jelajahi, dan pinjam buku secara online.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari judul, penulis, atau ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-800 text-base outline-none focus:ring-4 focus:ring-[#d6a54a]/30 shadow-2xl placeholder:text-gray-400 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => { catalogRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-[#8b1c24] flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-[#8b1c24]/10 flex items-center justify-center shrink-0">
              <Search className="text-[#8b1c24]" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a1a] text-sm">Katalog Buku</h3>
              <p className="text-xs text-gray-500 mt-0.5">{books.length} koleksi tersedia</p>
            </div>
          </button>

          <Link to="/register" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-[#0c2f3d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0c2f3d]/10 flex items-center justify-center shrink-0">
              <UserPlus className="text-[#0c2f3d]" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a1a] text-sm">Daftar Anggota</h3>
              <p className="text-xs text-gray-500 mt-0.5">Daftar online, pinjam buku</p>
            </div>
          </Link>

          {isLoggedIn() ? (
            <Link to="/riwayat-pinjaman" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-[#d6a54a] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#d6a54a]/10 flex items-center justify-center shrink-0">
                <History className="text-[#d6a54a]" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] text-sm">Riwayat Pinjaman</h3>
                <p className="text-xs text-gray-500 mt-0.5">Kelola buku pinjamanmu</p>
              </div>
            </Link>
          ) : (
            <Link to="/login" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-[#d6a54a] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#d6a54a]/10 flex items-center justify-center shrink-0">
                <BookOpen className="text-[#d6a54a]" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] text-sm">Pinjam Buku</h3>
                <p className="text-xs text-gray-500 mt-0.5">Login untuk meminjam buku</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Recommended Section */}
      {!searchQuery && selectedCategory === 'Semua' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#d6a54a]" />
                <p className="text-[#8b1c24] font-bold text-xs tracking-widest uppercase">Kurator Memilih</p>
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#1a1a1a]">Rekomendasi Pilihan</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scrollRec('left')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#0c2f3d] hover:text-white hover:border-[#0c2f3d] transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollRec('right')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#0c2f3d] hover:text-white hover:border-[#0c2f3d] transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div ref={recScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory pr-4">
            {recommendedBooks.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedBook(book)}
                className="min-w-[240px] max-w-[240px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group snap-start hover:shadow-xl transition-shadow"
              >
                <div className="h-64 relative overflow-hidden bg-gray-100">
                  <SafeImage
                    src={book.cover}
                    alt={book.judul}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-[#d6a54a] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-white" /> {book.rating}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-[#8b1c24] font-bold tracking-wider uppercase mb-1">{book.kategori}</p>
                  <h4 className="font-bold text-[#1a1a1a] text-sm leading-tight line-clamp-2 mb-1 group-hover:text-[#8b1c24] transition-colors">{book.judul}</h4>
                  <p className="text-xs text-gray-500">{book.penulis}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Main Catalog */}
      <section ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Catalog Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#1a1a1a]">
              {searchQuery ? `Hasil Pencarian "${searchQuery}"` : 'Katalog Lengkap'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{books.length} buku ditemukan</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-[#0c2f3d] text-white border-[#0c2f3d]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#0c2f3d]'}`}
          >
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>

        {/* Filter Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-wrap gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Bahasa</label>
                  <select
                    value={filterBahasa}
                    onChange={(e) => setFilterBahasa(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#0c2f3d]/20"
                  >
                    <option value="">Semua Bahasa</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Sunda">Sunda</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-[#0c2f3d] transition-colors">
                    <input
                      type="checkbox"
                      checked={filterTersedia}
                      onChange={(e) => setFilterTersedia(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#0c2f3d]"
                    />
                    <span className="text-sm text-gray-700 font-medium">Hanya tersedia</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => { setFilterBahasa(''); setFilterTersedia(false); setSearchQuery(''); setSelectedCategory('Semua'); }}
                    className="text-sm text-[#8b1c24] font-medium hover:underline"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <div className="relative flex items-center gap-2 mb-8">
          <button
            onClick={() => scrollCat('left')}
            className="shrink-0 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-[#0c2f3d] hover:text-white hover:border-[#0c2f3d] transition-colors shadow-sm z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <div ref={catScrollRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1">
            {['Semua', ...getCategories('books').map(category => category.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                  ? 'bg-[#0c2f3d] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0c2f3d] hover:text-[#0c2f3d]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollCat('right')}
            className="shrink-0 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-[#0c2f3d] hover:text-white hover:border-[#0c2f3d] transition-colors shadow-sm z-10"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Books Grid */}
        {isLoadingCatalog ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-2 w-16 bg-gray-100 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {paginatedBooks.map((book) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ y: -6 }}
                onClick={() => openBookDetail(book)}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-xl transition-all ${book.stok <= 0 ? 'opacity-60 grayscale-[30%]' : ''}`}
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-gray-100">
                  <SafeImage
                    src={book.cover}
                    alt={book.judul}
                    loading="lazy"
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${book.stok <= 0 ? 'brightness-75' : ''}`}
                  />
                  {/* Out of stock full overlay */}
                  {book.stok <= 0 && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 z-10">
                      <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">STOK HABIS</div>
                      <span className="text-white/80 text-[9px]">Daftar antrian →</span>
                    </div>
                  )}
                  {/* Hover Overlay (only if in stock) */}
                  {book.stok > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-white text-xs font-semibold flex items-center gap-1">
                        <BookOpen size={12} /> Lihat Detail
                      </span>
                    </div>
                  )}
                  {/* Stock badge */}
                  {book.stok > 0 && book.stok <= 2 && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">SISA {book.stok}</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[9px] text-[#8b1c24] font-bold tracking-wider uppercase mb-0.5">{book.kategori}</p>
                  <h4 className="font-bold text-[#1a1a1a] text-xs leading-tight line-clamp-2 mb-1">{book.judul}</h4>
                  <p className="text-[10px] text-gray-500 mb-1.5">{book.penulis}</p>
                  <div className="flex items-center gap-1">
                    {renderStars(book.rating)}
                    <span className="text-[10px] text-gray-400 ml-1">{book.rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">Tidak ada buku ditemukan</h3>
            <p className="text-sm text-gray-500">Coba ubah kata kunci pencarian atau filter Anda.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur px-4 py-4 sm:px-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-600">
                Halaman <span className="font-bold text-[#0c2f3d]">{currentPage}</span> dari <span className="font-bold text-[#0c2f3d]">{totalPages}</span>
                <span className="text-gray-400"> • </span>
                <span>{books.length} buku total</span>
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-10 min-w-10 px-3 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-[#0c2f3d] hover:text-white hover:border-[#0c2f3d] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {visiblePages.map((page, index) => (
                  page === '...'
                    ? <span key={`ellipsis-${index}`} className="w-10 text-center text-gray-400">...</span>
                    : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`h-10 min-w-10 px-3 rounded-xl text-sm font-bold transition-colors ${currentPage === page
                          ? 'bg-[#0c2f3d] text-white shadow-md'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    )
                ))}

                <button
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 min-w-10 px-3 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-[#0c2f3d] hover:text-white hover:border-[#0c2f3d] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>



      {/* Book Detail Side Panel */}
      <AnimatePresence>
        {selectedBook && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-gray-600 hover:bg-black/20 z-10"
              >
                <X size={20} />
              </button>

              {/* Cover */}
              <div className="relative h-80 bg-gradient-to-b from-[#f0ebe5] to-white flex items-center justify-center p-8">
                <SafeImage
                  src={selectedBook.cover}
                  alt={selectedBook.judul}
                  className="h-full max-w-[200px] object-contain rounded-lg shadow-2xl"
                />
              </div>

              {/* Info */}
              <div className="p-6">
                <p className="text-xs text-[#8b1c24] font-bold tracking-wider uppercase mb-2">{selectedBook.kategori}</p>
                <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-1">{selectedBook.judul}</h2>
                <p className="text-gray-500 mb-4">{selectedBook.penulis}</p>

                {/* Rating & Wishlist */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(selectedBook.rating)}</div>
                    <span className="text-sm font-bold text-gray-700">{selectedBook.rating}</span>
                    <span className="text-xs text-gray-400">({selectedBook.totalRating} ulasan)</span>
                  </div>
                  
                  <button 
                    onClick={() => handleWishlist(selectedBook.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isLoggedIn() && isInWishlist(selectedBook.id, getCurrentUser()!.id) ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                    title="Tambah ke Wishlist"
                  >
                    <Heart size={20} className={isLoggedIn() && isInWishlist(selectedBook.id, getCurrentUser()!.id) ? 'fill-red-500' : ''} />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-[#f8f9fa] p-3 rounded-xl">
                    <p className="font-bold text-[#0c2f3d] text-lg">{selectedBook.halaman}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Halaman</p>
                  </div>
                  <div className="text-center bg-[#f8f9fa] p-3 rounded-xl">
                    <p className="font-bold text-[#0c2f3d] text-lg">{selectedBook.tahun}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Tahun</p>
                  </div>
                  <div className="text-center bg-[#f8f9fa] p-3 rounded-xl">
                    <p className={`font-bold text-lg ${selectedBook.stok > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{selectedBook.stok}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Stok</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 bg-[#f8f9fa] rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Penerbit</span>
                    <span className="font-medium text-[#1a1a1a]">{selectedBook.penerbit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ISBN</span>
                    <span className="font-medium text-[#1a1a1a] font-mono text-xs">{selectedBook.isbn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bahasa</span>
                    <span className="font-medium text-[#1a1a1a]">{selectedBook.bahasa}</span>
                  </div>
                </div>

                {/* Synopsis */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm text-[#1a1a1a] mb-2">Sinopsis</h4>
                  {isLoadingBookDetail ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                      <div className="h-3 bg-gray-100 rounded w-4/6" />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedBook.sinopsis || 'Sinopsis belum tersedia.'}</p>
                  )}
                </div>

                {/* Borrowing Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <div className="text-xs text-blue-800 space-y-1">
                      <p className="font-semibold">Ketentuan Peminjaman:</p>
                      <p>• Masa pinjam: <strong>7 hari</strong></p>
                      <p>• Ambil buku: <strong>1×24 jam</strong> setelah pinjam</p>
                      <p>• Jika tidak diambil, pinjaman dibatalkan otomatis</p>
                    </div>
                  </div>
                </div>

                {/* Queue Info (if out of stock) */}
                {selectedBook.stok <= 0 && (() => {
                  const queue = getBookQueue(selectedBook.id);
                  const userPos = isLoggedIn() ? getQueuePosition(selectedBook.id, getCurrentUser()!.id) : null;
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-amber-600" />
                        <p className="text-sm font-bold text-amber-800">Antrian Peminjaman</p>
                      </div>
                      <p className="text-xs text-amber-700">
                        {queue.length > 0
                          ? `${queue.length} orang sedang menunggu buku ini.`
                          : 'Belum ada yang mengantri. Jadilah yang pertama!'}
                      </p>
                      {userPos && (
                        <p className="text-xs text-amber-800 font-bold mt-1">📋 Posisi antrian Anda: #{userPos}</p>
                      )}
                    </div>
                  );
                })()}

                {/* Borrow / Queue Button */}
                {isLoggedIn() ? (
                  selectedBook.stok > 0 ? (
                    <button
                      onClick={() => handleBorrow(selectedBook)}
                      className="w-full py-4 rounded-xl font-bold text-white bg-[#8b1c24] hover:bg-[#721720] hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 transition-all shadow-lg"
                    >
                      <BookOpen size={20} /> Pinjam Buku Ini
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        const user = getCurrentUser()!;
                        const result = await joinQueue(selectedBook.id, user.id, user.namaLengkap);
                        showToast(result.message, result.success ? 'success' : 'error');
                        if (result.success) {
                          const refreshed = getBooks().find(b => b.id === selectedBook.id);
                          if (refreshed) setSelectedBook(refreshed);
                        }
                      }}
                      className="w-full py-4 rounded-xl font-bold text-white bg-[#d6a54a] hover:bg-[#c4943e] hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 transition-all shadow-lg"
                    >
                      <Users size={20} /> Daftar Antrian
                    </button>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="w-full py-4 rounded-xl font-bold text-white bg-[#0c2f3d] hover:bg-[#1a4254] flex items-center justify-center gap-3 transition-colors shadow-lg"
                  >
                    <BookOpen size={20} /> Login untuk Meminjam
                  </Link>
                )}

                {selectedBook.stok > 0 && isLoggedIn() && (
                  <p className="text-center text-[10px] text-gray-400 mt-2">⏰ Buku harus diambil dalam 1×24 jam setelah pinjam</p>
                )}

                {!isLoggedIn() && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Belum punya akun? <Link to="/register" className="text-[#8b1c24] font-bold hover:underline">Daftar Anggota</Link>
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
