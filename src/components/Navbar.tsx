import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { User, ChevronDown, Menu, X, LogOut, History, BookOpen, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, isLoggedIn, logout, getInitials, isAdminLoggedIn, type Member } from '../services/authService';

const navLinks = [
  { name: 'Beranda', path: '/' },
  { 
    name: 'Profil', 
    path: '#',
    subLinks: [
      { name: 'Sejarah', path: '/profil/sejarah' },
      { name: 'Struktur Organisasi', path: '/profil/struktur' },
      { name: 'Prestasi', path: '/profil/prestasi' }
    ]
  },
  { 
    name: 'Layanan', 
    path: '#',
    subLinks: [
      { name: 'Katalog Buku', path: '/perpustakaan' },
      { name: 'Kearsipan', path: '/kearsipan' },
      { name: 'Bale Panyawangan', path: '/bale-panyawangan' }
    ]
  },
  { name: 'Pojok Carita', path: '/artikel?kategori=Pojok Carita' },
  { name: 'Berita Terkini', path: '/artikel?kategori=Berita Terkini' },
  { 
    name: 'Artikel', 
    path: '#',
    subLinks: [
      { name: 'Media Mewarnai', path: '/artikel?kategori=Media Mewarnai' },
      { name: 'Perpustakaan Keliling', path: '/artikel?kategori=Perpustakaan Keliling' },
      { name: 'Galeri', path: '/artikel?kategori=Galeri' },
      { name: 'Video Terkini', path: '/artikel?kategori=Video Terkini' },
      { name: 'Serba-Serbi Purwakarta', path: '/artikel?kategori=Serba-Serbi' },
      { name: 'Edukasi', path: '/artikel?kategori=Edukasi' },
      { name: 'Kedinasan', path: '/artikel?kategori=Kedinasan' },
      { name: 'Statistik', path: '/artikel?kategori=Statistik' }
    ]
  },
  { 
    name: 'Lain-Lain', 
    path: '#',
    subLinks: [
      { name: 'Galeri Perpustakaan Keliling', path: '/artikel?kategori=Galeri' },
      { name: 'Pabukon', path: '/artikel?kategori=Pabukon' },
      { name: 'GALENDO', path: '/galendo' },
      { name: 'PPID', path: '/ppid' },
      { name: 'Zona Integritas', path: '/zona-integritas' }
    ]
  },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [user, setUser] = useState<Member | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Refresh user state on route change
  useEffect(() => {
    setUser(getCurrentUser());
    setIsAdmin(isAdminLoggedIn());
    setShowUserDropdown(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowUserDropdown(false);
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-serif text-2xl font-bold text-[#0c2f3d]">
              Disipusda
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.subLinks ? (
                  <div className="flex items-center space-x-1 cursor-pointer py-4 group">
                    <span className={`text-sm font-medium hover:text-[#d6a54a] transition-colors ${
                      location.pathname.startsWith(link.path) || link.subLinks.some(sub => location.pathname === sub.path) 
                      ? 'text-[#d6a54a] border-b-2 border-[#d6a54a]' : 'text-gray-700'
                    }`}>
                      {link.name}
                    </span>
                    <ChevronDown size={14} className="text-gray-500 group-hover:text-[#d6a54a]" />
                    
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                      {link.subLinks.map(subLink => (
                        <Link key={subLink.name} to={subLink.path} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0c2f3d]">
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link 
                    to={link.path} 
                    className={`py-4 text-sm font-medium hover:text-[#d6a54a] transition-colors ${
                      location.pathname === link.path ? 'text-[#d6a54a] border-b-2 border-[#d6a54a]' : 'text-gray-700'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-[#1f3e4e] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0c2f3d] transition-colors shadow-sm">
              Laporan Warga
            </button>

            {user ? (
              /* Logged-in User Avatar & Dropdown */
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm border-2 border-white ring-2 ring-gray-200 group-hover:ring-[#d6a54a] transition-all"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {getInitials(user.namaLengkap)}
                  </div>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 shadow-2xl rounded-xl py-2 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-sm text-[#1a1a1a] truncate">{user.namaLengkap}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <p className="text-xs text-[#d6a54a] font-semibold mt-1">{user.nomorAnggota}</p>
                      </div>

                      <Link
                        to="/profil"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0c2f3d] transition-colors"
                      >
                        <User size={16} className="text-gray-400" /> Profil Saya
                      </Link>
                      <Link
                        to="/perpustakaan"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0c2f3d] transition-colors"
                      >
                        <BookOpen size={16} className="text-gray-400" /> Katalog Buku
                      </Link>
                      <Link
                        to="/riwayat-pinjaman"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0c2f3d] transition-colors"
                      >
                        <History size={16} className="text-gray-400" /> Riwayat Pinjaman
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-colors font-bold"
                        >
                          <Shield size={16} className="text-blue-500" /> Panel Admin
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                        >
                          <LogOut size={16} /> Keluar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Login Button */
              <Link to="/login" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#0c2f3d] hover:text-white transition-colors cursor-pointer border border-gray-200 shadow-sm">
                <User size={18} />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:text-gray-900">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-1 overflow-hidden"
          >
            {/* User Info on Mobile */}
            {user && (
              <div className="px-3 py-3 mb-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {getInitials(user.namaLengkap)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1a1a1a]">{user.namaLengkap}</p>
                    <p className="text-xs text-[#d6a54a] font-semibold">{user.nomorAnggota}</p>
                  </div>
                </div>
              </div>
            )}

            {navLinks.map((item) => (
              <div key={item.name}>
                <Link to={item.path} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#d6a54a] hover:bg-gray-50 rounded-md">
                  {item.name}
                </Link>
                {item.subLinks && (
                  <div className="pl-6 space-y-1">
                    {item.subLinks.map(sub => (
                      <Link key={sub.name} to={sub.path} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-500 hover:text-[#d6a54a]">
                        -- {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 flex flex-col space-y-2 px-3">
               <button className="bg-[#1f3e4e] text-white px-4 py-2 rounded text-sm font-medium w-full text-center">
                  Laporan Warga
               </button>
               {user ? (
                 <>
                   <Link to="/profil" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm font-medium w-full flex justify-center items-center gap-2">
                     <User size={16} /> Profil Saya
                   </Link>
                   <Link to="/riwayat-pinjaman" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm font-medium w-full flex justify-center items-center gap-2">
                     <History size={16} /> Riwayat Pinjaman
                   </Link>
                   <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-50 text-red-600 text-sm font-medium w-full flex justify-center items-center gap-2 border border-red-200">
                     <LogOut size={16} /> Keluar
                   </button>
                 </>
               ) : (
                 <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm font-medium w-full flex justify-center items-center gap-2">
                   <User size={16} /> Login Akun
                 </Link>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
