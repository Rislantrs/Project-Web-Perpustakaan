import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { BookOpen, History, ArrowLeft, CheckCircle, AlertCircle, X, Calendar, Clock, RotateCcw, BookMarked, Users, XCircle, Timer, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, isLoggedIn } from '../services/authService';
import { getMemberBorrows, returnBook, getBookById, getMemberQueues, cancelQueue, rateBook, type BorrowRecord, type QueueRecord } from '../services/bookService';

export default function RiwayatPinjaman() {
  const navigate = useNavigate();
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [queues, setQueues] = useState<QueueRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<'semua' | 'dipinjam' | 'dikembalikan'>('semua');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [ratingModal, setRatingModal] = useState<{ show: boolean, bookId: string, bookTitle: string } | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    // Guard route: halaman riwayat hanya untuk member login.
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    loadBorrows();
  }, []);

  const loadBorrows = () => {
    // Tarik dua domain sekaligus: histori pinjam + status antrian buku.
    const user = getCurrentUser();
    if (user) {
      setBorrows(getMemberBorrows(user.id));
      setQueues(getMemberQueues(user.id));
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleReturn = async (borrowId: string, bookId: string, bookTitle: string) => {
    // Guard ownership: backend/service memverifikasi bahwa record milik member aktif.
    const u = getCurrentUser();
    if (!u) { showToast('Silakan login terlebih dahulu.', 'error'); return; }
    try {
      const result = await returnBook(borrowId, u.id); // pass memberId for backend ownership check
      if (result.success) {
        loadBorrows();
        // Setelah pengembalian sukses, user langsung diminta memberi rating.
        setRatingModal({ show: true, bookId, bookTitle });
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      showToast('Gagal memproses pengembalian.', 'error');
    }
  };

  const handleRateSubmit = async (rating: number) => {
    // Submit rating per buku + member untuk agregasi skor katalog.
    const u = getCurrentUser();
    if (ratingModal && u) {
      try {
        const res = await rateBook(ratingModal.bookId, u.id, rating);
        showToast(res.message, res.success ? 'success' : 'error');
        setRatingModal(null);
      } catch (err) {
        showToast('Gagal mengirim penilaian.', 'error');
      }
    }
  };

  const user = getCurrentUser();
  // Filter tab status berjalan client-side untuk respons UI yang cepat.
  const filteredBorrows = filterStatus === 'semua' ? borrows : borrows.filter(b => b.status === filterStatus);
  const activeBorrows = borrows.filter(b => b.status === 'dipinjam').length;
  const returnedBorrows = borrows.filter(b => b.status === 'dikembalikan').length;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">

      {/* Toast */}
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

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingModal && ratingModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center"
            >
              <button
                onClick={() => setRatingModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                <Star size={32} className="fill-amber-500" />
              </div>
              
              <h3 className="font-bold text-[#1a1a1a] text-xl mb-2">Beri Penilaian</h3>
              <p className="text-sm text-gray-500 mb-6">Bagaimana pendapat Anda tentang buku <strong className="text-[#0c2f3d]">"{ratingModal.bookTitle}"</strong>?</p>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRateSubmit(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      size={36} 
                      className={`${
                        star <= hoveredRating 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-gray-200'
                      } transition-colors`} 
                    />
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setRatingModal(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
              >
                Lewati
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="relative bg-gradient-to-br from-[#0c2f3d] via-[#15465c] to-[#1a5570] py-16 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#d6a54a]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/perpustakaan" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft size={16} /> Kembali ke Katalog
          </Link>
          <h1 className="font-serif text-white text-4xl lg:text-5xl font-bold mb-3">Riwayat Peminjaman</h1>
          <p className="text-gray-300 text-lg">
            Halo, <span className="text-[#d6a54a] font-semibold">{user?.namaLengkap}</span>! Kelola buku pinjaman Anda di sini.
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#0c2f3d]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Pinjaman</p>
                <p className="text-3xl font-bold text-[#0c2f3d] mt-1">{borrows.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#0c2f3d]/10 flex items-center justify-center">
                <BookMarked className="text-[#0c2f3d]" size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sedang Dipinjam</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{activeBorrows}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <BookOpen className="text-amber-500" size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Dikembalikan</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{returnedBorrows}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="text-emerald-500" size={22} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 mb-8">
          {(['semua', 'dipinjam', 'dikembalikan'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                filterStatus === status
                  ? 'bg-[#0c2f3d] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0c2f3d]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Records */}
        {filteredBorrows.length > 0 ? (
          <div className="space-y-4">
            {filteredBorrows.map((record) => {
              const book = getBookById(record.bookId);
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow"
                >
                  {/* Book Cover */}
                  <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {book && (
                      <img src={book.cover} alt={book.judul} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-[#1a1a1a] text-lg leading-tight">{record.bookTitle}</h3>
                        {book && <p className="text-sm text-gray-500 mt-0.5">{book.penulis} • {book.penerbit}</p>}
                      </div>
                      <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                        record.status === 'menunggu_diambil' ? 'bg-orange-100 text-orange-700' :
                        record.status === 'dipinjam' ? 'bg-amber-100 text-amber-700' :
                        record.status === 'dikembalikan' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {record.status === 'menunggu_diambil' ? '⏰ Menunggu Ambil' : 
                         record.status === 'dipinjam' ? '📖 Dipinjam' : 
                         record.status === 'dikembalikan' ? '✅ Dikembalikan' : '⚠️ Terlambat'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#0c2f3d]" />
                        <span>Pinjam: <span className="font-medium text-gray-700">{record.tanggalPinjam}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-[#d6a54a]" />
                        <span>Kembali: <span className="font-medium text-gray-700">{record.tanggalKembali}</span> (7 hari)</span>
                      </div>
                      {record.tanggalDikembalikan && (
                        <div className="flex items-center gap-1.5">
                          <RotateCcw size={14} className="text-emerald-500" />
                          <span>Dikembalikan: <span className="font-medium text-emerald-700">{record.tanggalDikembalikan}</span></span>
                        </div>
                      )}
                    </div>

                    {/* Pickup Deadline */}
                    {record.status === 'menunggu_diambil' && record.batasAmbil && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Timer size={14} className="text-orange-500 shrink-0" />
                        <p className="text-xs text-orange-700">
                          <strong>Ambil sebelum:</strong> {record.batasAmbil} — Jika tidak diambil, pinjaman akan dibatalkan otomatis.
                        </p>
                      </div>
                    )}

                    {/* Return Button */}
                    {record.status === 'dipinjam' && (
                      <button
                        onClick={() => handleReturn(record.id, record.bookId, record.bookTitle)}
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#8b1c24] text-white text-sm font-bold hover:bg-[#721720] transition-colors shadow-sm"
                      >
                        <RotateCcw size={14} /> Kembalikan Buku
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <History size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {filterStatus === 'semua' ? 'Belum ada riwayat peminjaman' : `Tidak ada buku yang ${filterStatus}`}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {filterStatus === 'semua' ? 'Mulai pinjam buku dari katalog kami!' : 'Ubah filter untuk melihat riwayat lainnya.'}
            </p>
            <Link
              to="/perpustakaan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0c2f3d] text-white rounded-xl font-bold hover:bg-[#1a4254] transition-colors shadow-lg"
            >
              <BookOpen size={18} /> Jelajahi Katalog
            </Link>
          </div>
        )}
      </section>

      {/* Queue Section */}
      {queues.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Users size={20} className="text-[#d6a54a]" />
            <h2 className="font-serif text-2xl font-bold text-[#1a1a1a]">Antrian Buku</h2>
          </div>
          <div className="space-y-3">
            {queues.map((q) => {
              const book = getBookById(q.bookId);
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row items-start md:items-center gap-4"
                >
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {book && <img src={book.cover} alt={book.judul} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1a1a1a] text-sm">{q.bookTitle}</h3>
                    {book && <p className="text-xs text-gray-500">{book.penulis}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs bg-[#d6a54a]/10 text-[#d6a54a] font-bold px-2.5 py-0.5 rounded-full">Antrian #{q.nomorAntrian}</span>
                      <span className="text-[10px] text-gray-400">Daftar: {q.tanggalAntri}</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const u = getCurrentUser();
                      const result = await cancelQueue(q.id, u?.id); // pass memberId for ownership check
                      showToast(result.message, result.success ? 'success' : 'error');
                      if (result.success) loadBorrows();
                    }}
                    className="shrink-0 text-xs text-red-500 font-semibold hover:text-red-700 flex items-center gap-1 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={14} /> Batalkan
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
