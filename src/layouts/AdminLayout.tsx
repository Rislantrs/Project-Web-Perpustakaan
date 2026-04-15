import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, FileText, Settings, LogOut, FilePlus, ChevronLeft, Image as ImageIcon, BookOpen, Shield, History as LucideHistory, Users, MessageSquare, Clock, Network } from 'lucide-react';
import { logoutAdmin, isAdminLoggedIn } from '../services/authService';
import { useEffect } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/login-admin');
    }
  }, [navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Konfirmasi Ambil', path: '/admin/borrows', icon: <LucideHistory size={20} /> },
    { name: 'Kelola Buku', path: '/admin/books', icon: <BookOpen size={20} /> },
    { name: 'Kelola Member', path: '/admin/members', icon: <Users size={20} /> },
    { name: 'Semua Artikel', path: '/admin/articles', icon: <FileText size={20} /> },
    { name: 'Tulis Artikel', path: '/admin/articles/new', icon: <FilePlus size={20} /> },
    { name: 'Kelola Media', path: '/admin/media', icon: <ImageIcon size={20} /> },
    { name: 'Struktur & Prestasi', path: '/admin/structure', icon: <Network size={20} /> },
    { name: 'Jadwal Layanan', path: '/admin/schedules', icon: <Clock size={20} /> },
    { name: 'Laporan Warga', path: '/admin/reports', icon: <MessageSquare size={20} /> },
    { name: 'Pengaturan', path: '/admin/settings', icon: <Settings size={20} /> },
    { name: 'Manajemen Admin', path: '/admin/admins', icon: <Shield size={20} /> },
  ];


  const handleLogout = () => { logoutAdmin(); navigate('/'); };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hide-scrollbar">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h1 className="font-bold text-xl text-[#0c2f3d]">Perpus<span className="text-[#d6a54a]">Admin</span></h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (location.pathname.startsWith('/admin/articles') && item.path === '/admin/articles' && location.pathname !== '/admin/articles/new');
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#0c2f3d]/5 text-[#0c2f3d]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <Link 
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors mb-2"
          >
            <ChevronLeft size={18} />
            Kembali ke Web
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="p-8 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
