import { useState, useEffect, useMemo } from 'react';
import { Search, Mail, Phone, Calendar, Trash2, User, CheckCircle, AlertCircle, X, Shield, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentAdmin, getInitials, type Member } from '../../services/authService';
import { deleteMemberFromSupabase, refreshMembersFromSupabase } from '../../services/supabaseAuthService';
import { motion, AnimatePresence } from 'motion/react';

// HARDCODE: jumlah data member per halaman di tabel admin.
const MEMBERS_PER_PAGE = 10;

export default function ManageMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState<Member | null>(null);

  useEffect(() => { void loadMembers(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const loadMembers = async () => {
    // Sumber data utama dari Supabase, local cache diperbarui oleh service.
    const next = await refreshMembersFromSupabase();
    setMembers(next);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 4500);
  };

  const handleDelete = async (member: Member) => {
    // Guard: hanya admin dengan sesi valid yang boleh hapus member.
    const admin = getCurrentAdmin();
    if (!admin) { 
      showToast('Akses ditolak: Sesi admin tidak valid atau Anda bukan admin.', 'error'); 
      return; 
    }
    
    const result = await deleteMemberFromSupabase(member.id);
    showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) { 
      await loadMembers(); 
      setConfirmDelete(null); 
    }
  };

  // Search client-side untuk memudahkan screening cepat di panel admin.
  const filtered = members.filter(m =>
    m.namaLengkap.toLowerCase().includes(query.toLowerCase()) ||
    m.nomorAnggota.toLowerCase().includes(query.toLowerCase()) ||
    m.nik.includes(query)
  );

  const totalPages = Math.ceil(filtered.length / MEMBERS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * MEMBERS_PER_PAGE, currentPage * MEMBERS_PER_PAGE);

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
        <p className="text-sm text-gray-500 mt-1">{filtered.length} anggota {query && 'hasil pencarian'}</p>
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
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6">
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
              <AnimatePresence mode="popLayout">
                {paginated.map(member => (
                  <motion.tr 
                    key={member.id} 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
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
                  </motion.tr>
                ))}
              </AnimatePresence>
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

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-bold text-gray-900">{paginated.length}</span> dari <span className="font-bold text-gray-900">{filtered.length}</span> anggota
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {visiblePages.map((p, i) => (
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => setCurrentPage(p as number)}
                  className={`min-w-[36px] h-9 rounded-lg text-xs font-bold transition-all ${currentPage === p ? 'bg-[#0c2f3d] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 border border-transparent'}`}
                >
                  {p}
                </button>
              )
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
