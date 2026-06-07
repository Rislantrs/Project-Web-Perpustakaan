import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Edit2, Trash2, BookOpen, AlertCircle, CheckCircle, X, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBooks, deleteBook, type Book } from '../../services/bookService';
import { getCategories, refreshCategories } from '../../services/dataService';
import { getCurrentAdmin } from '../../services/authService';
import { motion, AnimatePresence } from 'motion/react';
import SafeImage from '../../components/SafeImage';

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStock, setFilterStock] = useState(''); // '', 'tersedia', 'habis'
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    const loadCloudBooks = () => {
      // Data ditarik dari local cache yang sudah disinkron oleh bookService.
      setIsLoading(true);
      setBooks(getBooks());
      setIsLoading(false);
    };
    loadCloudBooks();
    refreshCategories();
    window.addEventListener('dbChange', loadCloudBooks);
    return () => window.removeEventListener('dbChange', loadCloudBooks);
  }, []);

  // Reset ke halaman 1 ketika query, filter, atau limit berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [query, filterCategory, filterYear, filterStock, itemsPerPage]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  const handleDelete = async (book: Book) => {
    // Guard: aksi delete hanya boleh saat session admin valid.
    const admin = getCurrentAdmin();
    if (!admin) { showToast('Akses ditolak: Sesi admin tidak valid.', 'error'); return; }
    const result = await deleteBook(book.id, admin.id);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) { setBooks(getBooks()); setConfirmDelete(null); }
  };

  // Ekstrak daftar tahun terbit unik secara dinamis dari data buku
  const uniqueYears = useMemo(() => {
    const years = books.map(b => b.tahun).filter(Boolean);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [books]);

  // Search & Filters dilakukan client-side
  const filtered = useMemo(() => {
    return books.filter(b => {
      const q = query.toLowerCase().trim();
      const matchQuery = q ? (
        b.judul.toLowerCase().includes(q) ||
        b.penulis.toLowerCase().includes(q) ||
        b.kategori.toLowerCase().includes(q) ||
        (b.isbn && b.isbn.toLowerCase().includes(q))
      ) : true;

      const matchCategory = filterCategory ? b.kategori === filterCategory : true;
      const matchYear = filterYear ? b.tahun.toString() === filterYear : true;
      
      let matchStock = true;
      if (filterStock === 'tersedia') {
        matchStock = b.stok > 0;
      } else if (filterStock === 'habis') {
        matchStock = b.stok === 0;
      }

      return matchQuery && matchCategory && matchYear && matchStock;
    });
  }, [books, query, filterCategory, filterYear, filterStock]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: Array<number | '...'> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push('...');
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-red-600" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(p => ({ ...p, show: false }))}><X size={14} className="text-gray-400" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Hapus Buku</h3>
              <p className="text-sm text-gray-500 mb-6">Yakin ingin menghapus <strong>"{confirmDelete.judul}"</strong>? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Buku</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} buku {query && 'hasil pencarian'}</p>
        </div>
        <Link
          to="/admin/books/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-xl hover:bg-brand-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Buku
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Buku', value: books.length, color: 'text-brand-primary', bg: 'bg-brand-primary-5' },
          { label: 'Tersedia', value: books.filter(b => b.stok > 0).length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Stok Habis', value: books.filter(b => b.stok === 0).length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Kategori', value: getCategories('books').length, color: 'text-brand-accent', bg: 'bg-brand-accent-10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6 flex flex-col gap-4">
        <div className="relative w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari buku berdasarkan judul, penulis, ISBN, atau kategori..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary-10 focus:border-brand-primary outline-none transition-all bg-white"
          />
          {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Filter Kategori */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-primary min-w-[140px] flex-grow sm:flex-grow-0"
          >
            <option value="">Semua Kategori</option>
            {getCategories('books').map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Filter Tahun Terbit */}
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-primary min-w-[140px] flex-grow sm:flex-grow-0"
          >
            <option value="">Semua Tahun</option>
            {uniqueYears.map(year => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>

          {/* Filter Status Stok */}
          <select
            value={filterStock}
            onChange={e => setFilterStock(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-primary min-w-[140px] flex-grow sm:flex-grow-0"
          >
            <option value="">Semua Status Stok</option>
            <option value="tersedia">Tersedia (Stok &gt; 0)</option>
            <option value="habis">Stok Habis</option>
          </select>

          {/* Limit per Halaman */}
          <select
            value={itemsPerPage}
            onChange={e => setItemsPerPage(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-primary min-w-[120px] ml-auto flex-grow sm:flex-grow-0"
            title="Jumlah buku per halaman"
          >
            <option value={10}>10 per hal</option>
            <option value={15}>15 per hal</option>
            <option value={30}>30 per hal</option>
            <option value={50}>50 per hal</option>
          </select>
        </div>
      </div>

      {/* Book Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Buku</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Kategori</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Penulis</th>
                <th className="text-center px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Stok</th>
                <th className="text-center px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-12 rounded-md bg-gray-100" />
                        <div className="space-y-2 w-56">
                          <div className="h-3 bg-gray-100 rounded w-full" />
                          <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-6 bg-gray-100 rounded w-24" /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><div className="h-3 bg-gray-100 rounded w-28" /></td>
                    <td className="px-4 py-3.5"><div className="mx-auto h-6 bg-gray-100 rounded w-14" /></td>
                    <td className="px-4 py-3.5"><div className="mx-auto h-6 bg-gray-100 rounded w-14" /></td>
                  </tr>
                )) : paginated.map(book => (
                  <motion.tr
                    key={book.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                          <SafeImage src={book.cover} alt={book.judul} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">{book.judul}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{book.isbn ? `ISBN: ${book.isbn}` : 'ISBN: -'}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{book.tahun} · {book.halaman} hal</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary-5 text-brand-primary">{book.kategori}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-gray-600 text-xs">{book.penulis}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${book.stok > 2 ? 'bg-emerald-100 text-emerald-700' : book.stok > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        <Package size={10} /> {book.stok}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/admin/books/edit/${book.id}`}
                          className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary-5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(book)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Tidak ada buku ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </div>
        )}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}</span> dari <span className="font-bold text-gray-900">{filtered.length}</span> buku
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-30 hover:bg-gray-50 transition-colors bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            {visiblePages.map((p, i) => (
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400 select-none">...</span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => setCurrentPage(p as number)}
                  className={`min-w-[36px] h-9 rounded-lg text-xs font-bold transition-all border ${currentPage === p ? 'bg-brand-primary border-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 border-gray-200 bg-white'}`}
                >
                  {p}
                </button>
              )
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-30 hover:bg-gray-50 transition-colors bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
