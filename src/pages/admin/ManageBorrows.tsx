import { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, AlertCircle, X, BookOpen, User, History, Download } from 'lucide-react';
import { getAllBorrows, confirmPickup, returnBook, exportBorrowsToCsv, type BorrowRecord } from '../../services/bookService';
import { motion, AnimatePresence } from 'motion/react';

const BORROWS_PER_PAGE = 25;

const getCurrentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function ManageBorrows() {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [filter, setFilter] = useState<'semua' | 'menunggu_diambil' | 'dipinjam' | 'dikembalikan'>('semua');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [archiveMonth, setArchiveMonth] = useState(getCurrentMonthValue());
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => { loadData(); }, [filter]);
  useEffect(() => { setCurrentPage(1); }, [filter, query]);

  const loadData = () => {
    // Data source utama dari service, lalu difilter sesuai tab status.
    let data = getAllBorrows();
    if (filter !== 'semua') data = data.filter(d => d.status === filter);
    setBorrows(data.sort((a,b) => b.id.localeCompare(a.id)));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  const handleConfirm = async (id: string) => {
    // Konfirmasi pengambilan akan mengubah status ke "dipinjam" di service.
    const res = await confirmPickup(id);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) loadData();
  };

  const handleReturn = async (id: string) => {
    // Konfirmasi pengembalian akan restore stok buku di service.
    const res = await returnBook(id);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) loadData();
  };

  const handleExportMonthlyCsv = () => {
    const result = exportBorrowsToCsv({ month: archiveMonth, status: filter });
    if (result.rowCount === 0) {
      showToast('Tidak ada data untuk periode/filter yang dipilih.', 'error');
      return;
    }

    const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(`CSV berhasil diekspor (${result.rowCount} baris).`, 'success');
  };

  // Search client-side untuk mempercepat screening admin saat data sedang ditampilkan.
  const filtered = useMemo(() => borrows.filter(b =>
    b.bookTitle.toLowerCase().includes(query.toLowerCase()) ||
    b.memberName.toLowerCase().includes(query.toLowerCase()) ||
    b.memberId.toLowerCase().includes(query.toLowerCase())
  ), [borrows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / BORROWS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * BORROWS_PER_PAGE, currentPage * BORROWS_PER_PAGE);

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
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border"
            style={{ background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2', borderColor: toast.type === 'success' ? '#6ee7b7' : '#fca5a5' }}
          >
            {toast.type === 'success' ? <CheckCircle size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-red-600" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(p => ({ ...p, show: false }))}><X size={14} className="text-gray-400" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Peminjaman</h1>
        <p className="text-sm text-gray-500 mt-1">Konfirmasi pengambilan buku dan kelola pengembalian</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Cari berdasarkan judul buku, nama peminjam, atau ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none transition-all bg-white"
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['semua', 'menunggu_diambil', 'dipinjam', 'dikembalikan'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === tab ? 'bg-white text-[#0c2f3d] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
        <p className="text-xs text-gray-500 font-semibold">Menampilkan {paginated.length} dari {filtered.length} data</p>
        <div className="lg:ml-auto flex items-center gap-2">
          <input
            type="month"
            value={archiveMonth}
            onChange={e => setArchiveMonth(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
          />
          <button
            onClick={handleExportMonthlyCsv}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Download size={14} /> Ekspor CSV Bulanan
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-3">
        {paginated.map(b => (
          <motion.div 
            layout 
            key={b.id}
            className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm hover:shadow transition-all"
          >
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_auto_auto] gap-3 items-center">
              {/* Book Info */}
              <div className="min-w-0">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{b.bookTitle}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#d6a54a] font-bold truncate">
                    <User size={12} /> {b.memberName} ({b.memberId})
                  </div>
                </div>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-xs shrink-0">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Pinjam</p>
                  <p className="text-xs font-semibold text-gray-700">{b.tanggalPinjam}</p>
                </div>
                <div>
                  {b.status === 'menunggu_diambil' ? (
                    <>
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-0.5">Batas Ambil</p>
                      <p className="text-xs font-semibold text-red-600">{b.batasAmbil}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Kembali</p>
                      <p className="text-xs font-semibold text-gray-700">{b.tanggalKembali}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {b.status === 'menunggu_diambil' && (
                  <button 
                    onClick={() => handleConfirm(b.id)}
                    className="px-3 py-2 bg-[#0c2f3d] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#1a4254] transition-colors shadow-sm flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={14} /> Konfirmasi Pengambilan
                  </button>
                )}
                {b.status === 'dipinjam' && (
                  <button 
                    onClick={() => handleReturn(b.id)}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1"
                  >
                    <History size={14} /> Konfirmasi Kembali
                  </button>
                )}
                {b.status === 'dikembalikan' && (
                  <span className="px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={14} /> Sudah Kembali pada {b.tanggalDikembalikan}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {paginated.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <History size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium whitespace-pre-wrap">Tidak ada data peminjaman yang sesuai</p>
          </div>
        )}
      </div>

      {filtered.length > BORROWS_PER_PAGE && (
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg disabled:opacity-40"
          >
            Sebelumnya
          </button>
          {visiblePages.map((page, idx) => page === '...'
            ? <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
            : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === page ? 'bg-[#0c2f3d] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
              >
                {page}
              </button>
            ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
