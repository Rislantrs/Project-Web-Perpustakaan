import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Tags, BookOpen, Loader2, Sparkles, Filter, Hash } from 'lucide-react';
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
    <div className="space-y-8 pb-12">
      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-md border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/90 text-white border-emerald-400/20' 
                : 'bg-red-500/90 text-white border-red-400/20'
            } flex items-center gap-3`}
          >
            <div className="bg-white/20 p-1.5 rounded-full">
                {toast.type === 'success' ? <Sparkles size={16} /> : <Filter size={16} />}
            </div>
            <span className="font-semibold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section with Glassmorphism */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0c2f3d] to-[#1a4a5e] p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d6a54a]/10 blur-[120px] rounded-full -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#d6a54a] text-xs font-bold uppercase tracking-[0.2em] mb-6"
            >
              <Sparkles size={14} className="animate-pulse" /> Manajemen Taksonomi
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            >
              Kategori <span className="text-[#d6a54a]">Katalog Buku</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-lg leading-relaxed"
            >
              Atur klasifikasi koleksi perpustakaan dengan fleksibel. Kategori ini akan langsung terintegrasi dengan filter pencarian di katalog publik.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-shrink-0 group"
          >
            <div className="relative p-1 rounded-[2rem] bg-gradient-to-tr from-white/20 to-transparent backdrop-blur-xl">
                <div className="bg-[#0c2f3d]/40 rounded-[1.9rem] p-6 text-center border border-white/10 group-hover:bg-[#0c2f3d]/60 transition-all duration-500">
                    <div className="w-16 h-16 bg-[#d6a54a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_10px_30px_rgba(214,165,74,0.3)] group-hover:rotate-6 transition-transform">
                        <BookOpen size={32} className="text-[#0c2f3d]" />
                    </div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-white/50 text-xs uppercase tracking-widest font-bold mt-1">Total Kategori</p>
                </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[400px,1fr] gap-8">
        {/* Left Panel: Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#0c2f3d] text-white flex items-center justify-center shadow-lg shadow-[#0c2f3d]/20">
                    <Plus size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Input Kategori</h2>
                    <p className="text-xs text-gray-400 font-medium">Buat klasifikasi buku baru</p>
                </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Nama Kategori Buku</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c2f3d] transition-colors">
                        <Hash size={18} />
                    </div>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Contoh: Sains Fiksi, Komik, dll"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0c2f3d]/5 focus:border-[#0c2f3d] transition-all text-gray-900 font-medium"
                    />
                </div>
                <p className="text-[10px] text-gray-400 ml-1 font-medium italic">Slug akan dibuat otomatis (contoh: "Sains Fiksi" → "sains-fiksi")</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full relative group overflow-hidden bg-[#0c2f3d] text-white py-4 rounded-2xl font-bold shadow-xl shadow-[#0c2f3d]/20 hover:shadow-2xl hover:shadow-[#0c2f3d]/30 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="flex items-center justify-center gap-2 relative z-10">
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                    <span>{saving ? 'Proses Simpan...' : 'Tambahkan Sekarang'}</span>
                </div>
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50 p-6">
            <div className="flex gap-3">
                <Sparkles className="text-[#d6a54a] shrink-0" size={20} />
                <p className="text-sm text-amber-900/80 leading-relaxed font-medium">
                    <span className="font-bold text-amber-900">Tips:</span> Gunakan kategori yang spesifik namun mudah dipahami pengunjung agar pencarian buku lebih akurat.
                </p>
            </div>
          </div>
        </motion.div>

        {/* Right Panel: List */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Daftar Kategori</h2>
              <p className="text-sm text-gray-400 font-medium mt-1">Menampilkan semua kategori yang aktif di katalog</p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <Hash size={14} /> Global Taxonomy
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-[#0c2f3d] animate-spin"></div>
                  <BookOpen size={24} className="absolute inset-0 m-auto text-[#0c2f3d]/20" />
              </div>
              <p className="font-bold tracking-wide">Mengambil data kategori...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-24 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-white rounded-full shadow-inner flex items-center justify-center mx-auto mb-6">
                <Tags size={40} className="text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-400">Belum Ada Kategori</h3>
              <p className="text-gray-400 text-sm mt-2">Mulai dengan mengisi form di sebelah kiri</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {categories.map((category, idx) => (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0c2f3d] to-[#1a4a5e] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -m-[2px] blur-[1px]"></div>
                    <div className="relative rounded-2xl border border-gray-100 bg-white p-5 flex items-center justify-between gap-4 group-hover:border-transparent transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors">
                          <Hash size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-white transition-colors">{category.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase group-hover:text-white/60 transition-colors mt-1">Slug: {category.slug}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-3 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 group-hover:hover:bg-white/10 group-hover:hover:text-red-300 transition-all"
                        title="Hapus kategori"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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