import { useState, useEffect } from 'react';
import { getArticles, saveArticle, deleteArticle, Article } from '../../services/dataService';
import { Plus, Edit2, Trash2, Search, X, Loader2, Link as LinkIcon, FileText } from 'lucide-react';

export default function ManagePpid() {
  const [ppidDocs, setPpidDocs] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subCategory, setSubCategory] = useState('Umum'); // Disimpan di 'excerpt'
  const [url, setUrl] = useState(''); // Disimpan di 'content'
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDocs();
    window.addEventListener('dbChange', loadDocs);
    return () => window.removeEventListener('dbChange', loadDocs);
  }, []);

  const loadDocs = () => {
    const all = getArticles();
    const filtered = all.filter(a => a.category === 'Ppid');
    setPpidDocs(filtered);
  };

  const filteredDocs = ppidDocs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setSubCategory('Umum');
    setUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (doc: Article) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setSubCategory(doc.excerpt || 'Umum');
    setUrl(doc.img || ''); // Baca URL dari field img
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await saveArticle({
        id: editingId || undefined,
        title,
        category: 'Ppid',
        excerpt: subCategory,
        img: url, // Simpan URL GDrive/PDF di field img (biar tidak hilang pas refresh)
        date: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(false);
      loadDocs();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan dokumen PPID.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (window.confirm(`Yakin ingin menghapus dokumen "${titleStr}"?`)) {
      await deleteArticle(id);
      loadDocs();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2 font-serif">Kelola Dokumen PPID</h1>
          <p className="text-gray-500">Kelola akses dokumen publik dan tautan Google Drive.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#0c2f3d] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#15465c] transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Tambah Dokumen
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari dokumen PPID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0c2f3d]/20"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Judul Dokumen</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Tautan/URL</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-sm max-w-sm truncate">{doc.title}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-xs font-bold text-[#d6a54a] bg-[#d6a54a]/10 px-2 py-1 rounded tracking-widest">{doc.excerpt || 'Umum'}</span>
                  </td>
                  <td className="px-6 py-4">
                     {doc.img ? (
                         <a href={doc.img} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm max-w-[200px] truncate">
                             <LinkIcon size={14} className="shrink-0" /> {doc.img}
                         </a>
                     ) : (
                         <span className="text-gray-400 text-sm italic">- Kosong -</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(doc.id, doc.title)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <FileText size={32} className="mx-auto text-gray-300 mb-3" />
                    Belum ada dokumen PPID yang ditambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">{editingId ? 'Edit Dokumen' : 'Tambah Dokumen Baru'}</h3>
              <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Judul Dokumen</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Rencana Strategis (RENSTRA) Tahun 2025"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0c2f3d] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kategori PPID</label>
                <select 
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0c2f3d] focus:bg-white transition-colors"
                >
                  <option value="LAKIP">LAKIP</option>
                  <option value="RENJA">RENJA</option>
                  <option value="PK">PK</option>
                  <option value="RENSTRA">RENSTRA</option>
                  <option value="SK">SK</option>
                  <option value="SOP">SOP</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tautan URL (Google Drive / Lainnya)</label>
                <input 
                  type="url" 
                  required
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0c2f3d] focus:bg-white transition-colors"
                />
                <p className="text-xs text-gray-400 mt-2">
                  * Unggah file PDF Anda ke Google Drive, lalu salin "Link Berbagi (View)" ke sini.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-[#0c2f3d] text-white rounded-xl font-bold hover:bg-[#15465c] transition-colors flex justify-center items-center gap-2">
                  {isSaving ? <><Loader2 size={18} className="animate-spin"/> Menyimpan</> : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
