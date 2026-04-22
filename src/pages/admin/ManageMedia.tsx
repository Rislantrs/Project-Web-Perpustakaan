import { useState, useEffect } from 'react';
import { getArticles, deleteArticle, Article } from '../../services/dataService';
import { getCurrentAdmin } from '../../services/authService';
import { Link } from 'react-router';
import { Plus, Image as ImageIcon, Video, PenTool, Trash2, Edit2, Truck } from 'lucide-react';

export default function ManageMedia() {
  const [media, setMedia] = useState<Article[]>([]);
  const [filter, setFilter] = useState('Semua');

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = () => {
    const all = getArticles();
    // Filter out only the Media categories
    const filtered = all.filter(a => ['Galeri', 'Galeri Perpus Keliling', 'Video Terkini', 'Media Mewarnai'].includes(a.category));
    setMedia(filtered);
  };

  const handleDelete = async (id: string) => {
    const admin = getCurrentAdmin();
    if (!admin) { alert('Akses ditolak: Sesi admin tidak valid.'); return; }
    if (window.confirm('Hapus media ini?')) {
      await deleteArticle(id, admin.id);
      loadMedia();
    }
  };

  const getIcon = (category: string) => {
      switch(category) {
          case 'Galeri': return <ImageIcon size={18} className="text-blue-500" />;
          case 'Galeri Perpus Keliling': return <Truck size={18} className="text-green-500" />;
          case 'Video Terkini': return <Video size={18} className="text-red-500" />;
          case 'Media Mewarnai': return <PenTool size={18} className="text-purple-500" />;
          default: return <ImageIcon size={18} />;
      }
  };

  const displayedMedia = filter === 'Semua' ? media : media.filter(item => item.category === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Media Visual</h1>
          <p className="text-gray-500 mt-1">Daftar Galeri, Video, dan Media Mewarnai.</p>
        </div>
        <Link 
          to="/admin/media/new" 
          className="flex items-center gap-2 bg-[#0c2f3d] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#164153] transition-colors"
        >
          <Plus size={18} /> Tambah Media
        </Link>
      </div>

      <div className="flex justify-end mb-6">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d]"
        >
          <option value="Semua">Tampilkan Semua</option>
          <option value="Galeri">Galeri</option>
          <option value="Galeri Perpus Keliling">Galeri Perpus Keliling</option>
          <option value="Video Terkini">Video Terkini</option>
          <option value="Media Mewarnai">Media Mewarnai</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedMedia.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
                  <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                      <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="cover" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-bold text-gray-700">
                          {getIcon(item.category)}
                          {item.category}
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/admin/media/edit/${item.id}`} className="bg-white p-2 rounded-lg text-gray-700 hover:text-blue-600 shadow-sm"><Edit2 size={14} /></Link>
                          <button onClick={() => handleDelete(item.id)} className="bg-white p-2 rounded-lg text-gray-700 hover:text-red-600 shadow-sm"><Trash2 size={14} /></button>
                      </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                      <h4 className="font-bold text-gray-900 line-clamp-2 mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500 mb-3">{item.date}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-auto">{item.excerpt}</p>
                  </div>
              </div>
          ))}
      </div>

      {media.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 border-dashed py-16 text-center text-gray-500">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-1">Belum ada media</p>
              <p className="text-sm">Silakan tambah Galeri atau Video baru.</p>
          </div>
      )}
    </div>
  );
}
