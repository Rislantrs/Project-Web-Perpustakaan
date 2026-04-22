import { useEffect, useState } from 'react';
import { getArticles, deleteArticle, Article } from '../../services/dataService';
import { getCurrentAdmin } from '../../services/authService';
import { Link } from 'react-router';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function ManageArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadArticles();
    
    // Dengarkan event ketika Supabase selesai menarik data
    window.addEventListener('dbChange', loadArticles);
    return () => window.removeEventListener('dbChange', loadArticles);
  }, []);

  const parseIndoDate = (dateStr: string) => {
    const months: { [key: string]: number } = {
      'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
      'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };
    const parts = dateStr.split(' ');
    if (parts.length !== 3) return new Date();
    return new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
  };

  const loadArticles = () => {
    const all = getArticles();
    const blogArticles = all.filter(a => !['Galeri', 'Video Terkini', 'Media Mewarnai', 'Ppid', 'Zona Integritas'].includes(a.category));
    setArticles(blogArticles);
  };

  const handleDelete = async (id: string) => {
    const admin = getCurrentAdmin();
    if (!admin) { alert('Akses ditolak: Sesi admin tidak valid.'); return; }
    if (window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      await deleteArticle(id, admin.id);
      loadArticles();
    }
  };

  const filteredArticles = articles.filter(a => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const articleDate = parseIndoDate(a.date);
    const isFuture = articleDate > now;

    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory ? a.category === filterCategory : true;
    const matchStatus = filterStatus ? (filterStatus === 'Scheduled' ? isFuture : !isFuture) : true;

    return matchSearch && matchCategory && matchStatus;
  });

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
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari judul artikel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#d6a54a] focus:ring-1 focus:ring-[#d6a54a]"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#d6a54a]"
            >
              <option value="">Semua Kategori</option>
              <option value="Kedinasan">Kedinasan</option>
              <option value="Pojok Carita">Pojok Carita</option>
              <option value="Berita Terkini">Berita Terkini</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#d6a54a]"
            >
              <option value="">Semua Status</option>
              <option value="Published">Terbit</option>
              <option value="Scheduled">Terjadwal</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Judul</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredArticles.map(article => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const isFuture = parseIndoDate(article.date) > now;

                return (
                  <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={article.title}>
                      {article.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isFuture ? (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-medium">
                          Terjadwal
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-medium">
                          Terbit
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{article.date}</td>
                    <td className="px-6 py-4 flex items-center justify-end gap-3 text-gray-400">
                      <Link to={`/admin/articles/edit/${article.id}`} className="hover:text-[#0c2f3d] transition-colors">
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(article.id)} className="hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
