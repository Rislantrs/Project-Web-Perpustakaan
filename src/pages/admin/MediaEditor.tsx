import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { saveArticle, Article, getArticles } from '../../services/dataService';
import { getCurrentAdmin } from '../../services/authService';
import { Image as ImageIcon, Save, ArrowLeft, Video, PenTool, Trash2, Truck } from 'lucide-react';
import { uploadImage } from '../../services/storageService';

export default function MediaEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Galeri');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      // Mode edit: hydrate form dari article/media yang sudah ada.
      const allArgs = getArticles();
      const article = allArgs.find(a => a.id === id);
      if (article) {
        setTitle(article.title);
        setCategory(article.category);
        setDescription(article.excerpt);
        setMediaFile(article.img);
        
        // Load gallery images if any
        if (['Galeri', 'Galeri Perpus Keliling'].includes(article.category) && article.content) {
            try {
                const parsed = JSON.parse(article.content);
                if (Array.isArray(parsed)) setGalleryImages(parsed);
            } catch (e) { /* not a json array */ }
        }

        // If it's a video
        if (article.category === 'Video Terkini' && article.content) {
            // Very simple extraction
            const match = article.content.match(/href="([^"]+)"/);
            if (match) setVideoUrl(match[1]);
        }
      }
    }
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Judul tidak boleh kosong");
      return;
    }
    
    // Format content bergantung tipe media:
    // - video: simpan link html sederhana
    // - galeri: simpan array URL dalam JSON string
    let finalContent = '';
    if (category === 'Video Terkini' && videoUrl) {
        finalContent = `<p>Tautan Video: <a href="${videoUrl}" target="_blank">${videoUrl}</a></p>`;
    } else if (['Galeri', 'Galeri Perpus Keliling'].includes(category) && galleryImages.length > 0) {
        finalContent = JSON.stringify(galleryImages);
    }
    
    setIsUploading(true);
    try {
      const admin = getCurrentAdmin();
      if (!admin) {
        alert("Akses ditolak: Sesi admin tidak valid");
        setIsUploading(false);
        return;
      }

      await saveArticle({
        id: id,
        title,
        category,
        excerpt: description,
        // HARDCODE FALLBACK: dipakai jika cover kosong.
        img: mediaFile || 'https://via.placeholder.com/800x400?text=No+Media',
        content: finalContent,
        date: new Date().toISOString().split('T')[0]
      }, admin.id);
      navigate('/admin/media');
    } finally {
      setIsUploading(false);
    }
  };

  const addGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        // Upload paralel agar batch gallery cepat selesai.
        const uploadedUrls = await Promise.all(files.map(f => uploadImage(f)));
        setGalleryImages(prev => [...prev, ...uploadedUrls]);
      } catch (err) {
        console.error('Gagal upload galeri:', err);
        alert('Upload gambar gagal. Pastikan bucket Supabase Storage sudah aktif.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const changeMediaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setMediaFile(imageUrl);
      } catch (err) {
        console.error('Gagal upload cover media:', err);
        alert('Upload gambar gagal. Pastikan bucket Supabase Storage sudah aktif.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <button 
          onClick={() => navigate('/admin/media')}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#0c2f3d] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#164153] shadow-sm transition-all hover:shadow"
        >
          <Save size={16} /> Simpan Media
        </button>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Unggah Berita Visual / Media</h2>

        {/* Categori Selector */}
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Jenis Media</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button 
                    onClick={() => setCategory('Galeri')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Galeri' ? 'border-[#0c2f3d] bg-[#0c2f3d]/5 text-[#0c2f3d]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                >
                    <ImageIcon size={28} className="mb-2" />
                    <span className="font-semibold text-sm text-center">Galeri Foto</span>
                </button>
                <button 
                    onClick={() => setCategory('Galeri Perpus Keliling')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Galeri Perpus Keliling' ? 'border-[#0c2f3d] bg-[#0c2f3d]/5 text-[#0c2f3d]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                >
                    <Truck size={28} className="mb-2" />
                    <span className="font-semibold text-sm text-center">Galeri Perpusling</span>
                </button>
                <button 
                    onClick={() => setCategory('Video Terkini')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Video Terkini' ? 'border-[#0c2f3d] bg-[#0c2f3d]/5 text-[#0c2f3d]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                >
                    <Video size={28} className="mb-2" />
                    <span className="font-semibold text-sm text-center">Video Terkini</span>
                </button>
            </div>
        </div>

        {/* Title */}
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Judul Media</label>
            <input 
              type="text" 
              placeholder="Contoh: Keseruan Perpusling di Desa..." 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d6a54a] focus:ring-1 focus:ring-[#d6a54a]"
            />
        </div>

        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Singkat</label>
            <textarea 
              rows={3}
              placeholder="Jelaskan isi gambar/video ini..." 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d6a54a] focus:ring-1 focus:ring-[#d6a54a] resize-none"
            />
        </div>

        {category === 'Video Terkini' && (
            <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <label className="block text-sm font-bold text-[#0c2f3d] mb-2">Tautan Video (YouTube / GDrive)</label>
                <div className="flex gap-2">
                    <input 
                    type="url" 
                    placeholder="https://youtube.com/..." 
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-[#0c2f3d]"
                    />
                </div>
            </div>
        )}

        {/* Upload File */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unggah Berkas {category === 'Video Terkini' ? '(Thumbnail Video)' : '(Foto/Gambar B&W)'}
          </label>
          {mediaFile ? (
            <div className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100 border border-gray-200">
              <img src={mediaFile} alt="Cover" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-gray-50">
                  Ganti Berkas
                  <input type="file" accept="image/*" className="hidden" onChange={changeMediaFile} />
                </label>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <ImageIcon className="text-gray-400 mb-3" size={36} />
              <span className="text-sm font-medium text-gray-600">Klik untuk menjelajah file (Cover)</span>
              <span className="text-xs text-gray-400 mt-1">Mendukung JPG, PNG (Max 5MB)</span>
              <input type="file" accept="image/*" className="hidden" onChange={changeMediaFile} />
            </label>
          )}
        </div>

        {/* Gallery Multi-Upload Section */}
        {['Galeri', 'Galeri Perpus Keliling'].includes(category) && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-gray-900">Koleksi Foto Album</h4>
                <p className="text-xs text-gray-500">Foto-foto tambahan yang akan muncul di galeri slider.</p>
              </div>
              <label className="cursor-pointer bg-[#0c2f3d]/5 text-[#0c2f3d] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#0c2f3d]/10 transition-colors">
                + Tambah Foto
                <input type="file" multiple accept="image/*" className="hidden" onChange={addGalleryFiles} />
              </label>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {galleryImages.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
                  <img src={src} className="w-full h-full object-cover" alt="Gallery item" />
                  <button 
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {galleryImages.length === 0 && (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs italic">
                  Belum ada foto tambahan. Klik tombol di atas untuk menambah koleksi.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#0c2f3d]/20 border-t-[#0c2f3d] rounded-full animate-spin"></div>
            <span className="font-bold text-gray-700">Memproses Media...</span>
          </div>
        </div>
      )}
    </div>
  );
}
