import { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar, Trash2, User, CheckCircle, AlertCircle, X, Shield, MapPin } from 'lucide-react';
import { getMembers, deleteMember, getInitials, type Member } from '../../services/authService';
import { motion, AnimatePresence } from 'motion/react';

export default function ManageMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState<Member | null>(null);

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = () => { setMembers(getMembers()); };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  const handleDelete = (member: Member) => {
    const result = deleteMember(member.id);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) { loadMembers(); setConfirmDelete(null); }
  };

  const filtered = members.filter(m =>
    m.namaLengkap.toLowerCase().includes(query.toLowerCase()) ||
    m.nomorAnggota.toLowerCase().includes(query.toLowerCase()) ||
    m.nik.includes(query)
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

      {/* Confirm Delete */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4"><Trash2 size={22} className="text-red-600" /></div>
              <h3 className="font-bold text-lg mb-1">Hapus Anggota</h3>
              <p className="text-sm text-gray-500 mb-6">Yakin menghapus anggota <strong>"{confirmDelete.namaLengkap}"</strong>? Data peminjaman tidak akan hilang tapi akun tidak bisa login.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Anggota</h1>
        <p className="text-sm text-gray-500 mt-1">{members.length} anggota terdaftar dalam sistem</p>
      </div>

      {/* Search & Filter */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cari anggota berdasarkan nama, nomor anggota, atau NIK..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none transition-all bg-white"
        />
        {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>}
      </div>

      {/* Member List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Anggota</th>
                <th className="px-4 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Kontak</th>
                <th className="px-4 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">NIK</th>
                <th className="px-4 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Tgl Daftar</th>
                <th className="px-4 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(member => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: member.avatarColor }}
                      >
                        {getInitials(member.namaLengkap)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{member.namaLengkap}</p>
                        <p className="text-xs text-[#d6a54a] font-bold">{member.nomorAnggota}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail size={12} className="text-gray-400" /> {member.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Phone size={12} className="text-gray-400" /> {member.telepon}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-500 font-mono tracking-wider">{member.nik}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} className="text-gray-400" /> {member.tanggalDaftar}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => setConfirmDelete(member)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Anggota"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <User size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Tidak ada anggota ditemukan</p>
          </div>
        )}
      </div>

    </div>
  );
}
