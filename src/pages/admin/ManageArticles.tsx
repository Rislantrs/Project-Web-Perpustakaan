import { useEffect, useState } from 'react';
import { getArticles, deleteArticle, Article } from '../../services/dataService';
import { Link } from 'react-router';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function ManageArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    const all = getArticles();
    const blogArticles = all.filter(a => !['Galeri', 'Video Terkini', 'Media Mewarnai'].includes(a.category));
    setArticles(blogArticles);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      deleteArticle(id);
      loadArticles();
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Artikel</h1>
          <p className="text-gray-500 mt-1">Daftar semua artikel Publik, Pojok Carita, dan Kedinasan.</p>
        </div>
        <Link 
          to="/admin/articles/new" 
          className="flex items-center gap-2 bg-[#0c2f3d] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#164153] transition-colors"
        >
          <Plus size={18} /> Tulis Baru
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari artikel..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#d6a54a] focus:ring-1 focus:ring-[#d6a54a]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Judul</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Penulis</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredArticles.map(article => (
                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={article.title}>
                    {article.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{article.author}</td>
                  <td className="px-6 py-4">{article.date}</td>
                  <td className="px-6 py-4 flex items-center justify-end gap-3 text-gray-400">
                    <Link to={`/admin/articles/edit/${article.id}`} className="hover:text-blue-600 transition-colors">
                      <Edit2 size={16} />
                    </Link>
                    <button onClick={() => handleDelete(article.id)} className="hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Tidak ada artikel yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
