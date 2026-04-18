import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { saveArticle, fileToBase64, Article, getArticles } from '../../services/dataService';
import { Image as ImageIcon, Save, ArrowLeft, Video, PenTool } from 'lucide-react';

export default function MediaEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Galeri');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (id) {
      const allArgs = getArticles();
      const article = allArgs.find(a => a.id === id);
      if (article) {
        setTitle(article.title);
        setCategory(article.category);
        setDescription(article.excerpt);
        setMediaFile(article.img);
        
        // If it's a video, we might have saved the link in 'content' previously or as part of excerpt.
        // For simplicity, let's just extract from content if it starts with http
        if (article.category === 'Video Terkini' && article.content) {
            // Very simple extraction
            const match = article.content.match(/href="([^"]+)"/);
            if (match) setVideoUrl(match[1]);
        }
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Judul tidak boleh kosong");
      return;
    }
    
    let finalContent = '';
    if (category === 'Video Terkini' && videoUrl) {
        finalContent = `<p>Tautan Video: <a href="${videoUrl}" target="_blank">${videoUrl}</a></p>`;
    }
    
    saveArticle({
      id: id,
      title,
      category,
      excerpt: description,
      img: mediaFile || 'https://via.placeholder.com/800x400?text=No+Media',
      content: finalContent, // Skip Tiptap entirely
    });
    
    navigate('/admin/media');
  };

  const changeMediaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setMediaFile(base64);
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
            <div className="grid grid-cols-3 gap-4">
                <button 
                    onClick={() => setCategory('Galeri')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Galeri' ? 'border-[#0c2f3d] bg-[#0c2f3d]/5 text-[#0c2f3d]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                >
                    <ImageIcon size={28} className="mb-2" />
                    <span className="font-semibold text-sm">Galeri Foto</span>
                </button>
                <button 
                    onClick={() => setCategory('Video Terkini')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Video Terkini' ? 'border-[#0c2f3d] bg-[#0c2f3d]/5 text-[#0c2f3d]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                >
                    <Video size={28} className="mb-2" />
                    <span className="font-semibold text-sm">Video Terkini</span>
                </button>
                <button 
                    onClick={() => setCategory('Media Mewarnai')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Media Mewarnai' ? 'border-[#0c2f3d] bg-[#0c2f3d]/5 text-[#0c2f3d]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                >
                    <PenTool size={28} className="mb-2" />
                    <span className="font-semibold text-sm">Media Mewarnai</span>
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
              {mediaFile.startsWith('data:application/pdf') ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-600 font-bold p-10">
                   <PenTool size={48} className="mb-4" />
                   <span>File PDF Terpilih</span>
                   <p className="text-xs font-normal text-gray-500 mt-2">Disediakan untuk diunduh & diprint</p>
                </div>
              ) : (
                <img src={mediaFile} alt="Cover" className="w-full h-full object-contain" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-gray-50">
                  Ganti Berkas
                  <input type="file" accept={category === 'Media Mewarnai' ? ".jpg,.jpeg,.png,.pdf" : "image/*"} className="hidden" onChange={changeMediaFile} />
                </label>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <ImageIcon className="text-gray-400 mb-3" size={36} />
              <span className="text-sm font-medium text-gray-600">Klik untuk menjelajah file dari komputer Anda</span>
              <span className="text-xs text-gray-400 mt-1">Mendukung JPG, PNG, PDF (Silakan upload PDF untuk Print)</span>
              <input type="file" accept={category === 'Media Mewarnai' ? ".jpg,.jpeg,.png,.pdf" : "image/*"} className="hidden" onChange={changeMediaFile} />
            </label>
          )}
        </div>

      </div>
    </div>
  );
}
