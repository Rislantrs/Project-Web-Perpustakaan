import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Mail, Calendar, X, CheckCircle, AlertCircle, Crown, User } from 'lucide-react';
import { getAdmins, addAdmin, deleteAdmin, getInitials, type Admin } from '../../services/authService';
import { motion, AnimatePresence } from 'motion/react';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Admin | null>(null);
  const [form, setForm] = useState({ namaLengkap: '', email: '', password: '', role: 'admin' as 'admin' | 'super_admin' });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    // Initial load daftar admin dari service auth.
    const load = async () => {
      setAdmins(await getAdmins());
    };
    void load();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi detail dilakukan di service (email unik, role, dsb).
    const result = await addAdmin(form);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setAdmins(await getAdmins());
      setForm({ namaLengkap: '', email: '', password: '', role: 'admin' });
      setShowForm(false);
    }
  };

  const handleDelete = async (admin: Admin) => {
    // Guard role super_admin diterapkan pada UI (tombol hapus tidak ditampilkan).
    const result = await deleteAdmin(admin.id);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) { setAdmins(await getAdmins()); setConfirmDelete(null); }
  };

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
              <h3 className="font-bold text-lg mb-1">Hapus Admin</h3>
              <p className="text-sm text-gray-500 mb-6">Yakin menghapus admin <strong>"{confirmDelete.namaLengkap}"</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Admin</h1>
          <p className="text-sm text-gray-500 mt-1">{admins.length} admin terdaftar</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0c2f3d] text-white text-sm font-medium rounded-xl hover:bg-[#1a4254] transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Admin
        </button>
      </div>

      {/* Add Admin Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Shield size={18} className="text-[#0c2f3d]" /> Tambah Admin Baru</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Lengkap *</label>
                  <input required value={form.namaLengkap} onChange={e => setForm(p => ({ ...p, namaLengkap: e.target.value }))} placeholder="Nama admin" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@disipusda.go.id" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Password *</label>
                  <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Role</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as 'admin' | 'super_admin' }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none transition-all">
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-[#0c2f3d] text-white rounded-xl text-sm font-medium hover:bg-[#1a4254] transition-colors">Simpan Admin</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {admins.map(admin => (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: admin.avatarColor }}
              >
                {getInitials(admin.namaLengkap)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{admin.namaLengkap}</h3>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${admin.role === 'super_admin' ? 'bg-[#d6a54a]/15 text-[#c09030]' : 'bg-[#0c2f3d]/10 text-[#0c2f3d]'}`}>
                    {admin.role === 'super_admin' ? <Crown size={9} /> : <User size={9} />}
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Mail size={11} /> <span className="truncate">{admin.email}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} /> Dibuat: {admin.tanggalDibuat}
                </div>
              </div>

              {admin.role !== 'super_admin' && (
                <button
                  onClick={() => setConfirmDelete(admin)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
