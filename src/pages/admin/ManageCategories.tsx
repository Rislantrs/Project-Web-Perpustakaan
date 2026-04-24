import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Tags, BookOpen, FileText, Loader2, Sparkles } from 'lucide-react';
import { addCategory, deleteCategory, getCategories, refreshCategories, type Category, type CategoryType } from '../../services/dataService';
import { getCurrentAdmin } from '../../services/authService';

const tabMeta: Record<CategoryType, { label: string; icon: ReactNode; description: string }> = {
  articles: { label: 'Kategori Artikel', icon: <FileText size={18} />, description: 'Kategori yang dipakai di editor berita dan artikel.' },
  books: { label: 'Kategori Buku', icon: <BookOpen size={18} />, description: 'Kategori yang dipakai di katalog dan editor buku.' },
};

export default function ManageCategories() {
  const [activeTab, setActiveTab] = useState<CategoryType>('articles');
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const loadCategories = async () => {
    setLoading(true);
    await refreshCategories();
    setCategories(getCategories(activeTab));
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [activeTab]);

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

    setSaving(true);
    const result = await addCategory({ name, type: activeTab }, admin.id);
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
    <div className="space-y-6">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c2f3d]/5 text-[#0c2f3d] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            <Sparkles size={14} /> Manajemen Terpadu
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Kategori</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">Atur kategori untuk artikel dan buku dari satu tempat supaya dropdown editor selalu mengikuti data Supabase.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
          {(Object.entries(tabMeta) as Array<[CategoryType, { label: string; icon: ReactNode; description: string }]>)
            .map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-3 rounded-2xl border text-left transition-all ${activeTab === key ? 'bg-[#0c2f3d] text-white border-[#0c2f3d] shadow-lg shadow-[#0c2f3d]/15' : 'bg-white text-gray-600 border-gray-200 hover:border-[#0c2f3d]/30'}`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {meta.icon}
                  {meta.label}
                </div>
                <p className={`text-xs mt-1 ${activeTab === key ? 'text-white/75' : 'text-gray-400'}`}>{meta.description}</p>
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-6">
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 h-fit">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tambah Kategori Baru</label>
            <h2 className="text-lg font-semibold text-gray-900">{tabMeta[activeTab].label}</h2>
            <p className="text-sm text-gray-500 mt-1">Nama akan otomatis diubah menjadi slug saat disimpan.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nama Kategori</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={activeTab === 'articles' ? 'Contoh: Event Literasi' : 'Contoh: Majalah'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0c2f3d]/15 focus:border-[#0c2f3d] bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0c2f3d] text-white font-semibold hover:bg-[#163c4c] transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {saving ? 'Menyimpan...' : 'Tambah Kategori'}
          </button>

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-900">
            Kategori yang sudah dipakai di artikel atau buku tetap muncul di data lama, jadi pastikan nama baru konsisten sebelum dipakai di konten.
          </div>
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Daftar {tabMeta[activeTab].label}</h2>
              <p className="text-sm text-gray-500 mt-1">{categories.length} kategori aktif</p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#0c2f3d]/5 text-[#0c2f3d] text-xs font-semibold uppercase tracking-wider">
              {activeTab}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <Loader2 size={18} className="animate-spin" /> Memuat kategori...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Tags size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="font-medium">Belum ada kategori</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map(category => (
                <motion.div
                  key={category.id}
                  layout
                  className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-500 mt-1">/{category.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(category)}
                    className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus kategori"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}