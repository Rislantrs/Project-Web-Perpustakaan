import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Tags, BookOpen, Loader2, Sparkles, Hash, AlertCircle } from 'lucide-react';
import { addCategory, deleteCategory, getCategories, refreshCategories, type Category } from '../../services/dataService';
import { getCurrentAdmin } from '../../services/authService';

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const loadCategories = async () => {
    setLoading(true);
    await refreshCategories();
    setCategories(getCategories('books'));
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    window.setTimeout(() => setToast(current => ({ ...current, show: false })), 3000);
  };

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    const admin = getCurrentAdmin();
    if (!admin) {
      showToast('Akses ditolak: sesi admin tidak valid.', 'error');
      return;
    }

    if (!name.trim()) {
        showToast('Nama kategori tidak boleh kosong.', 'error');
        return;
    }

    setSaving(true);
    const result = await addCategory({ name, type: 'books' }, admin.id);
    setSaving(false);

    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setName('');
      await loadCategories();
    }
  };

  const handleDelete = async (category: Category) => {
    const admin = getCurrentAdmin();
    if (!admin) {
      showToast('Akses ditolak: sesi admin tidak valid.', 'error');
      return;
    }

    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;
    const result = await deleteCategory(category.id, admin.id);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      await loadCategories();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Mini Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg border flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {toast.type === 'success' ? <Sparkles size={16} /> : <AlertCircle size={16} />}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ramping Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tags className="text-[#0c2f3d]" size={20} />
            Kategori Katalog Buku
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Atur klasifikasi koleksi perpustakaan Anda</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
          <BookOpen size={16} className="text-[#d6a54a]" />
          <span className="text-sm font-bold text-gray-700">{categories.length} <span className="text-gray-400 font-medium">Kategori</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6">
        {/* Simple Input Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#0c2f3d]" />
            Tambah Baru
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Kategori</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Sejarah, Komik..."
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0c2f3d]/5 focus:border-[#0c2f3d] outline-none transition-all text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0c2f3d] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#1a4a5e] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Simpan Kategori
            </button>
          </form>
        </div>

        {/* Compact List Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Daftar Kategori Aktif</h2>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-md">Global List</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <Loader2 size={30} className="animate-spin mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-50 rounded-2xl">
              <Tags size={32} className="text-gray-100 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">Belum ada kategori buku.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-[#0c2f3d]/30 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#0c2f3d]/5 group-hover:text-[#0c2f3d] transition-colors">
                        <Hash size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{category.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Slug: {category.slug}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(category)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}