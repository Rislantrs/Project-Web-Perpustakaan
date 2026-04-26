import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Save, ArrowLeft, Image as ImageIcon, BookOpen } from 'lucide-react';
import { getBookById, addBook, updateBook, type Book } from '../../services/bookService';
import { getCurrentAdmin } from '../../services/authService';
import { motion } from 'motion/react';
import SafeImage from '../../components/SafeImage';
import { getCategories, refreshCategories, type Category } from '../../services/dataService';

type BookForm = Omit<Book, 'id'>;

const emptyForm: BookForm = {
  judul: '', penulis: '', penerbit: '', tahun: new Date().getFullYear(),
  kategori: 'Fiksi', isbn: '', halaman: 0, bahasa: 'Indonesia',
  stok: 1, rating: 4.0, totalRating: 0, cover: '', sinopsis: '', isRecommended: false,
};

export default function BookEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<BookForm>(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      // Refresh kategori supaya form selalu pakai daftar terbaru.
      await refreshCategories();
      setCategories(getCategories('books'));
    };

    loadCategories();

    const onDbChange = (event: Event) => {
      // Reaksi selektif saat key kategori berubah.
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (!detail?.key || detail.key === 'disipusda_categories') {
        setCategories(getCategories('books'));
      }
    };

    window.addEventListener('dbChange', onDbChange);

    if (isEdit && id) {
      // Mode edit: hydrate form dari buku existing.
      const book = getBookById(id);
      if (book) {
        const { id: _, ...rest } = book;
        setForm(rest);
      }
    }

    return () => window.removeEventListener('dbChange', onDbChange);
  }, [id]);

  const update = (field: keyof BookForm, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Validasi ringan di client sebelum submit ke service.
    if (!form.judul.trim()) return setError('Judul buku wajib diisi.');
    if (!form.penulis.trim()) return setError('Penulis wajib diisi.');
    if (!form.cover.trim()) return setError('URL cover wajib diisi.');

    const admin = getCurrentAdmin();
    if (!admin) return setError('Akses ditolak: sesi admin tidak valid.');

    setLoading(true);
    try {
      const result = await (isEdit && id ? updateBook(id, form, admin.id) : addBook(form, admin.id));
      if (result.success) { 
        navigate('/admin/books'); 
      } else { 
        setError(result.message); 
        setLoading(false); 
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data.');
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none transition-all bg-white";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/books')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Buku' : 'Tambah Buku Baru'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isEdit ? 'Perbarui informasi buku di katalog' : 'Tambahkan buku baru ke koleksi perpustakaan'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Preview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><ImageIcon size={18} /> Cover Buku</h2>
          <div className="flex gap-6 items-start">
            <div className="w-24 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
              {form.cover ? (
                <SafeImage src={form.cover} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={24} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <label className={labelCls}>URL Gambar Cover</label>
              <input className={inputCls} placeholder="https://..." value={form.cover} onChange={e => update('cover', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1.5">Gunakan URL dari Unsplash atau layanan gambar lainnya</p>
            </div>
          </div>
        </div>

        {/* Info Utama */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Informasi Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Judul Buku *</label>
              <input className={inputCls} placeholder="Contoh: Laskar Pelangi" value={form.judul} onChange={e => update('judul', e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Penulis *</label>
              <input className={inputCls} placeholder="Nama penulis" value={form.penulis} onChange={e => update('penulis', e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Penerbit</label>
              <input className={inputCls} placeholder="Nama penerbit" value={form.penerbit} onChange={e => update('penerbit', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Kategori</label>
              <select className={inputCls} value={form.kategori} onChange={e => update('kategori', e.target.value)}>
                {categories.length === 0 ? (
                  <option value="Fiksi">Fiksi</option>
                ) : categories.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Bahasa</label>
              <select className={inputCls} value={form.bahasa} onChange={e => update('bahasa', e.target.value)}>
                {/* HARDCODE OPTION LIST: daftar bahasa default untuk form buku. */}
                {['Indonesia', 'Inggris', 'Arab', 'Jepang', 'Sunda'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tahun Terbit</label>
              <input type="number" className={inputCls} min={1900} max={2100} value={form.tahun} onChange={e => update('tahun', parseInt(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>Jumlah Halaman</label>
              <input type="number" className={inputCls} min={1} value={form.halaman} onChange={e => update('halaman', parseInt(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>ISBN</label>
              <input className={inputCls} placeholder="978-xxx-xxx-xxx-x" value={form.isbn} onChange={e => update('isbn', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Stok</label>
              <input type="number" className={inputCls} min={0} value={form.stok} onChange={e => update('stok', parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Sinopsis */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Sinopsis</h2>
          <textarea
            className={`${inputCls} resize-none`} rows={4}
            placeholder="Tulis sinopsis buku di sini..."
            value={form.sinopsis} onChange={e => update('sinopsis', e.target.value)}
          />
          <div className="flex items-center gap-3 mt-4">
            <input type="checkbox" id="recommended" checked={!!form.isRecommended} onChange={e => update('isRecommended', e.target.checked)} className="w-4 h-4 accent-[#d6a54a]" />
            <label htmlFor="recommended" className="text-sm text-gray-700 font-medium">Tampilkan di bagian <span className="text-[#d6a54a] font-semibold">Rekomendasi</span></label>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Rating</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Rating (0–5)</label>
              <input type="number" className={inputCls} min={0} max={5} step={0.1} value={form.rating} onChange={e => update('rating', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>Total Ulasan</label>
              <input type="number" className={inputCls} min={0} value={form.totalRating} onChange={e => update('totalRating', parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
            ⚠️ {error}
          </motion.div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => navigate('/admin/books')} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-[#0c2f3d] text-white text-sm font-semibold hover:bg-[#1a4254] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
            <Save size={16} />
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Buku'}
          </button>
        </div>
      </form>
    </div>
  );
}
