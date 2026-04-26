import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Camera, Edit3, Save, X, BookOpen, Clock, CheckCircle2,
  ArrowLeft, Star, Calendar, Users, Award, BarChart3,
  Mail, Phone, MapPin, User, AlertCircle, LogOut, Heart,
  ShieldCheck, Eye, EyeOff, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, isLoggedIn, updateMember, deleteMember, logout, getInitials, type Member } from '../services/authService';
import { getMemberBorrows, getMemberQueues, getMemberWishlist, type BorrowRecord, type QueueRecord, type Book } from '../services/bookService';
// IMPORT KOMPONEN KARTU ANGGOTA QR CODE (Hilangkan komentar untuk mengaktifkan):
// import MemberCardQR from '../components/MemberCardQR';

export default function Profil() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<Member | null>(null);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [queues, setQueues] = useState<QueueRecord[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ namaLengkap: '', bio: '', telepon: '', alamat: '' });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [activeTab, setActiveTab] = useState<'statistik' | 'riwayat' | 'antrian' | 'wishlist'>('statistik');
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    const u = getCurrentUser()!;
    setUser(u);
    setForm({ namaLengkap: u.namaLengkap, bio: u.bio || '', telepon: u.telepon, alamat: u.alamat });
    setBorrows(getMemberBorrows(u.id));
    setQueues(getMemberQueues(u.id));
    setWishlist(getMemberWishlist(u.id));
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  const handleSave = () => {
    if (!user) return;
    const result = updateMember(user.id, form);
    if (result.success && result.member) {
      setUser(result.member);
      showToast(result.message, 'success');
      setEditMode(false);
    } else showToast(result.message, 'error');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const result = updateMember(user.id, { avatarUrl: base64 });
      if (result.success && result.member) {
        setUser(result.member);
        showToast('Foto profil berhasil diperbarui!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleDeleteAccount = () => {
    // Safety phrase sederhana sebelum self-delete akun.
    if (deleteInput !== 'Konfirmasi') {
      showToast('Ketik "Konfirmasi" dengan benar.', 'error');
      return;
    }
    if (!user) return;
    const res = deleteMember(user.id, user.id, true);
    if (res.success) {
      logout();
      navigate('/login');
    } else {
      showToast(res.message, 'error');
    }
  };

  if (!user) return null;

  // Stats
  const totalBorrow = borrows.length;
  const activeBorrow = borrows.filter(b => b.status === 'dipinjam').length;
  const returned = borrows.filter(b => b.status === 'dikembalikan').length;
  const activeQueue = queues.length;
  const memberSince = user.tanggalDaftar;

  const stats = [
    { label: 'Total Pinjaman', value: totalBorrow, icon: BookOpen, color: '#0c2f3d', bg: '#0c2f3d08' },
    { label: 'Sedang Dipinjam', value: activeBorrow, icon: Clock, color: '#d6a54a', bg: '#d6a54a12' },
    { label: 'Dikembalikan', value: returned, icon: CheckCircle2, color: '#10b981', bg: '#10b98112' },
    { label: 'Dalam Antrian', value: activeQueue, icon: Users, color: '#8b5cf6', bg: '#8b5cf612' },
  ];

  return (
    <div className="bg-[#f0f2f5] min-h-screen pb-20">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border max-w-md"
            style={{ background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2', borderColor: toast.type === 'success' ? '#6ee7b7' : '#fca5a5' }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <AlertCircle size={18} className="text-red-600 shrink-0" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeletePrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4"><Trash2 size={22} className="text-red-600" /></div>
              <h3 className="font-bold text-lg mb-2">Hapus Akun Permanen</h3>
              <p className="text-sm text-gray-500 mb-4">Tindakan ini tidak bisa dibatalkan. Semua data riwayat pinjaman akan terpisah dari akun Anda. Ketik <strong>Konfirmasi</strong> untuk melanjutkan.</p>
              <input 
                value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                placeholder="Ketik Konfirmasi"
                className="w-full px-4 py-2 mb-6 border border-gray-200 rounded-xl focus:border-red-500 outline-none"
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowDeletePrompt(false); setDeleteInput(''); }} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">Batal</button>
                <button onClick={handleDeleteAccount} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700">Hapus Akun</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      {/* Cover / Banner */}
      <div className="relative h-52 bg-gradient-to-br from-[#0c2f3d] via-[#1a4254] to-[#8b1c24] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000" className="w-full h-full object-cover" alt="bg" />
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-16 bg-gradient-to-t from-[#f0f2f5] to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link to="/perpustakaan" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl transition-colors">
            <ArrowLeft size={16} /> Katalog
          </Link>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setShowDeletePrompt(true)} className="inline-flex items-center gap-2 text-white/80 hover:text-red-300 text-sm bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl transition-colors">
            <Trash2 size={14} /> Hapus Akun
          </button>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 text-white/80 hover:text-[#d6a54a] text-sm bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl transition-colors">
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 
          Untuk menampilkan Kartu Anggota QR Code, hilangkan komentar kode di bawah ini:
          <div className="relative -mt-32 mb-6 z-10">
            <MemberCardQR member={user} />
          </div>
        */}

        {/* Profile Card */}
        <div className="relative -mt-16 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                  style={{ background: user.avatarUrl ? 'transparent' : user.avatarColor }}
                >
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : getInitials(user.namaLengkap)
                  }
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={20} className="text-white" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <input
                    value={form.namaLengkap}
                    onChange={e => setForm(p => ({ ...p, namaLengkap: e.target.value }))}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-[#0c2f3d] outline-none bg-transparent w-full mb-2"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.namaLengkap}</h1>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#0c2f3d] text-white text-xs font-bold px-3 py-1 rounded-full">{user.nomorAnggota}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={11} /> Anggota sejak {memberSince}
                  </span>
                </div>

                {editMode ? (
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tulis bio singkat tentang dirimu..."
                    rows={2}
                    className="w-full text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-[#0c2f3d]/20"
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic">{user.bio || 'Belum ada bio. Klik edit untuk menambahkan.'}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 shrink-0">
                {editMode ? (
                  <>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-[#0c2f3d] text-white text-sm font-medium rounded-xl hover:bg-[#1a4254] transition-colors">
                      <Save size={15} /> Simpan
                    </button>
                    <button onClick={() => setEditMode(false)} className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    <Edit3 size={15} /> Edit Profil
                  </button>
                )}
              </div>
            </div>

            {/* Edit fields */}
            <AnimatePresence>
              {editMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-4 pt-4 border-t border-gray-100"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Phone size={11} /> Telepon</label>
                      <input value={form.telepon} onChange={e => setForm(p => ({ ...p, telepon: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><MapPin size={11} /> Alamat</label>
                      <input value={form.alamat} onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none transition-all" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map(s => (
            <motion.div
              key={s.label}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{s.value}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Activity Meter */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-[#0c2f3d]" />
            <h2 className="font-semibold text-gray-800">Aktivitas Membaca</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Buku dikembalikan tepat waktu', value: returned, max: Math.max(totalBorrow, 1), color: '#10b981' },
              { label: 'Tingkat penyelesaian pinjaman', value: returned, max: Math.max(totalBorrow, 1), color: '#0c2f3d' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{m.label}</span>
                  <span className="font-medium">{totalBorrow === 0 ? '0%' : `${Math.round((m.value / m.max) * 100)}%`}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalBorrow === 0 ? 0 : (m.value / m.max) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-[#d6a54a]" />
              <p className="text-sm font-semibold text-gray-800">Badge Pembaca</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {totalBorrow >= 1 && <span className="px-3 py-1 bg-[#d6a54a]/10 text-[#c09030] text-xs font-bold rounded-full">📚 Pembaca Perdana</span>}
              {totalBorrow >= 5 && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">⭐ Pembaca Aktif</span>}
              {totalBorrow >= 10 && <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full">🏆 Pembaca Setia</span>}
              {returned >= 5 && <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">✅ Tepat Waktu</span>}
              {totalBorrow === 0 && <span className="text-sm text-gray-400 italic">Pinjam buku pertamamu untuk mendapatkan badge!</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {([
              { key: 'statistik', label: 'Info Pribadi', icon: User },
              { key: 'riwayat', label: 'Riwayat Pinjam', icon: BookOpen },
              { key: 'antrian', label: 'Antrian', icon: Users },
              { key: 'wishlist', label: 'Wishlist', icon: Heart },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${activeTab === tab.key ? 'text-[#0c2f3d] border-b-2 border-[#0c2f3d]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <tab.icon size={15} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Info Pribadi */}
            {activeTab === 'statistik' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 text-emerald-700">
                    <ShieldCheck size={20} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">Keamanan Data</p>
                      <p className="text-[10px] opacity-80">Informasi sensitif Anda terenkripsi secara lokal.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                  >
                    {showPrivateInfo ? <><EyeOff size={14} /> Sembunyikan</> : <><Eye size={14} /> Tampilkan Detail</>}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: 'Nama Lengkap', value: user.namaLengkap, isPrivate: false },
                    { icon: Mail, label: 'Email', value: user.email, isPrivate: true },
                    { icon: Phone, label: 'Telepon', value: user.telepon || '-', isPrivate: true },
                    { icon: MapPin, label: 'Alamat', value: user.alamat || '-', isPrivate: true },
                    { icon: Calendar, label: 'Tanggal Lahir', value: user.tanggalLahir || '-', isPrivate: true },
                    { icon: Users, label: 'Jenis Kelamin', value: user.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan', isPrivate: false },
                  ].map(item => (
                    <div key={item.label} className="group bg-white border border-gray-100 p-4 rounded-2xl hover:border-[#0c2f3d]/30 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#0c2f3d]/5 flex items-center justify-center shrink-0 group-hover:bg-[#0c2f3d] group-hover:text-white transition-colors">
                          <item.icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm text-gray-800 font-bold mt-0.5 truncate">
                            {item.isPrivate && !showPrivateInfo 
                              ? '••••••••••••' 
                              : item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Riwayat */}
            {activeTab === 'riwayat' && (
              borrows.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Belum ada riwayat pinjaman</p>
                  <Link to="/perpustakaan" className="mt-3 inline-flex items-center gap-2 text-sm text-[#0c2f3d] font-semibold hover:underline">
                    Jelajahi Katalog →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {borrows.slice(0, 8).map(b => (
                    <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        b.status === 'menunggu_diambil' ? 'bg-red-50' : 
                        b.status === 'dipinjam' ? 'bg-amber-50' : 'bg-emerald-50'
                      }`}>
                        {b.status === 'menunggu_diambil' ? <Clock size={15} className="text-red-600" /> : 
                         b.status === 'dipinjam' ? <Clock size={15} className="text-amber-600" /> : 
                         <CheckCircle2 size={15} className="text-emerald-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{b.bookTitle}</p>
                        <p className="text-xs text-gray-400">
                          {b.status === 'menunggu_diambil' ? `Ambil sebelum: ${b.batasAmbil}` : `${b.tanggalPinjam} · Kembali: ${b.tanggalKembali}`}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'menunggu_diambil' ? 'bg-red-100 text-red-700' :
                        b.status === 'dipinjam' ? 'bg-amber-100 text-amber-700' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {b.status === 'menunggu_diambil' ? '⏰ Ambil' : 
                         b.status === 'dipinjam' ? '📖 Dipinjam' : '✅ Kembali'}
                      </span>
                    </div>
                  ))}
                  {borrows.length > 8 && (
                    <Link to="/riwayat-pinjaman" className="block text-center text-sm text-[#0c2f3d] font-semibold hover:underline pt-2">
                      Lihat semua riwayat →
                    </Link>
                  )}
                </div>
              )
            )}

            {/* Antrian */}
            {activeTab === 'antrian' && (
              queues.length === 0 ? (
                <div className="text-center py-10">
                  <Users size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Tidak ada antrian aktif</p>
                  <Link to="/perpustakaan" className="mt-3 inline-flex items-center gap-2 text-sm text-[#0c2f3d] font-semibold hover:underline">
                    Cari buku yang diinginkan →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {queues.map(q => (
                    <div key={q.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#d6a54a]/5 border border-[#d6a54a]/20">
                      <div className="w-10 h-10 rounded-xl bg-[#d6a54a]/15 flex items-center justify-center shrink-0">
                        <span className="text-base font-bold text-[#c09030]">#{q.nomorAntrian}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{q.bookTitle}</p>
                        <p className="text-xs text-gray-400">Daftar: {q.tanggalAntri}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d6a54a]/15 text-[#c09030]">
                        ⏳ Menunggu
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              wishlist.length === 0 ? (
                <div className="text-center py-10">
                  <Heart size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Wishlist Anda masih kosong</p>
                  <Link to="/perpustakaan" className="mt-3 inline-flex items-center gap-2 text-sm text-[#0c2f3d] font-semibold hover:underline">
                    Jelajahi Katalog →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wishlist.map(book => (
                    <Link key={book.id} to={`/perpustakaan?bookId=${book.id}`} className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all block">
                      <div className="aspect-[2/3] bg-gray-100 relative">
                        <img src={book.cover} alt={book.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-red-500 shadow-sm">
                          <Heart size={12} className="fill-red-500" />
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-1 group-hover:text-[#8b1c24] transition-colors">{book.judul}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{book.penulis}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link to="/perpustakaan" className="bg-[#0c2f3d] text-white rounded-2xl p-4 hover:bg-[#1a4254] transition-colors shadow-sm flex items-center gap-3">
            <BookOpen size={20} /> <span className="font-medium text-sm">Katalog Buku</span>
          </Link>
          <Link to="/riwayat-pinjaman" className="bg-white text-[#0c2f3d] rounded-2xl p-4 hover:bg-gray-50 transition-colors shadow-sm border border-gray-100 flex items-center gap-3">
            <Star size={20} className="text-[#d6a54a]" /> <span className="font-medium text-sm">Riwayat Lengkap</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
