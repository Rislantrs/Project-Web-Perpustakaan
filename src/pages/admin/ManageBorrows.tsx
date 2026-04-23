import { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, AlertCircle, X, BookOpen, User, Calendar, History, Trash2 } from 'lucide-react';
import { getAllBorrows, getPendingBorrows, confirmPickup, returnBook, type BorrowRecord } from '../../services/bookService';
import { motion, AnimatePresence } from 'motion/react';

export default function ManageBorrows() {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [filter, setFilter] = useState<'semua' | 'menunggu_diambil' | 'dipinjam' | 'dikembalikan'>('semua');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => { loadData(); }, [filter]);

  const loadData = () => {
    let data = getAllBorrows();
    if (filter !== 'semua') data = data.filter(d => d.status === filter);
    setBorrows(data.sort((a,b) => b.id.localeCompare(a.id)));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  const handleConfirm = async (id: string) => {
    const res = await confirmPickup(id);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) loadData();
  };

  const handleReturn = async (id: string) => {
    const res = await returnBook(id);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) loadData();
  };

  const filtered = borrows.filter(b => 
    b.bookTitle.toLowerCase().includes(query.toLowerCase()) ||
    b.memberName.toLowerCase().includes(query.toLowerCase()) ||
    b.memberId.toLowerCase().includes(query.toLowerCase())
  );

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

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(b => (
          <motion.div 
            layout 
            key={b.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Book Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                  <BookOpen size={20} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{b.bookTitle}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#d6a54a] font-bold">
                    <User size={12} /> {b.memberName} ({b.memberId})
                  </div>
                </div>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-x-8 gap-y-2 shrink-0">
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
              <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                {b.status === 'menunggu_diambil' && (
                  <button 
                    onClick={() => handleConfirm(b.id)}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-[#0c2f3d] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1a4254] transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} /> Konfirmasi Pengambilan
                  </button>
                )}
                {b.status === 'dipinjam' && (
                  <button 
                    onClick={() => handleReturn(b.id)}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <History size={14} /> Konfirmasi Kembali
                  </button>
                )}
                {b.status === 'dikembalikan' && (
                  <span className="px-5 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle size={14} /> Sudah Kembali pada {b.tanggalDikembalikan}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <History size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium whitespace-pre-wrap">Tidak ada data peminjaman yang sesuai</p>
          </div>
        )}
      </div>
    </div>
  );
}
