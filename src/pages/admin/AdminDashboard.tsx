import { useEffect, useState } from 'react';
import { getArticles, Article } from '../../services/dataService';
import { getBooks, getAllBorrows, BorrowRecord } from '../../services/bookService';
import { getMembers } from '../../services/authService';
import { refreshMembersFromSupabase } from '../../services/supabaseAuthService';
import { FileText, TrendingUp, Users, BookOpen, Clock, History as LucideHistory } from 'lucide-react';
import { Link } from 'react-router';

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [booksCount, setBooksCount] = useState(0);
  const [activeBorrows, setActiveBorrows] = useState(0);
  const [pendingPickups, setPendingPickups] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [recentBorrows, setRecentBorrows] = useState<BorrowRecord[]>([]);

  useEffect(() => {
    const run = async () => {
      setArticles(getArticles());
      setBooksCount(getBooks().length);
      const borrows = getAllBorrows();
      setActiveBorrows(borrows.filter(b => b.status === 'dipinjam').length);
      setPendingPickups(borrows.filter(b => b.status === 'menunggu_diambil').length);
      const members = await refreshMembersFromSupabase();
      setMembersCount((members || getMembers()).length);
      setRecentBorrows(borrows.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5));
    };
    void run();
  }, []);

  const stats = [
    { title: 'Total Artikel', value: articles.length, icon: <FileText size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Total Pembaca', value: articles.reduce((acc, curr) => acc + (curr.views || 0), 0), icon: <TrendingUp size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
    { title: 'Peminjaman Aktif', value: activeBorrows, icon: <LucideHistory size={24} className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { title: 'Total Anggota', value: membersCount, icon: <Users size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang di Panel Admin Disipusda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2"><FileText size={20} className="text-gray-400" /> Artikel Terbaru</h2>
            <Link to="/admin/articles" className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</Link>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {articles.slice(0, 5).map(article => (
              <div key={article.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{article.title}</h4>
                  <div className="flex gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span className="text-[#0c2f3d]">{article.category}</span>
                    <span>{article.date}</span>
                  </div>
                </div>
                <Link to={`/admin/articles/edit/${article.id}`} className="text-xs font-bold text-gray-300 hover:text-[#0c2f3d] uppercase tracking-wider">Edit</Link>
              </div>
            ))}
            {articles.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500 text-sm italic">Belum ada artikel.</div>
            )}
          </div>
        </div>

        {/* Most Viewed Articles */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2"><TrendingUp size={20} className="text-orange-400" /> Artikel Terpopuler</h2>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Berdasarkan Views</span>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {articles.sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map(article => (
              <div key={article.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{article.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{article.category}</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                  <TrendingUp size={14} className="text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">{article.views || 0}</span>
                </div>
              </div>
            ))}
            {articles.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500 text-sm italic">Belum ada statistik tersedia.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
