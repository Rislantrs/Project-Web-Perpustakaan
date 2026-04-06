import { useEffect, useState } from 'react';
import { getArticles, Article } from '../../services/dataService';
import { FileText, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router';

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setArticles(getArticles());
  }, []);

  const stats = [
    { title: 'Total Artikel', value: articles.length, icon: <FileText size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Kategori Aktif', value: new Set(articles.map(a => a.category)).size, icon: <TrendingUp size={24} className="text-green-500" />, bg: 'bg-green-50' },
    { title: 'Kunjungan Halaman', value: '1,204', icon: <Users size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang di Panel Admin Disipusda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-900">Artikel Terbaru</h2>
          <Link to="/admin/articles" className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {articles.slice(0, 5).map(article => (
            <div key={article.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{article.category}</span>
                  <span>{article.date}</span>
                </div>
              </div>
              <Link to={`/admin/articles/edit/${article.id}`} className="text-sm font-medium text-gray-400 hover:text-[#0c2f3d]">Edit</Link>
            </div>
          ))}
          {articles.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">Belum ada artikel.</div>
          )}
        </div>
      </div>
    </div>
  );
}
