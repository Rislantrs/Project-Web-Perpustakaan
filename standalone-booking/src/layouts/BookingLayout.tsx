import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Phone, Mail, Instagram, Shield, LogOut } from 'lucide-react';
import { BOOKING_CONFIG } from '../config/bookingConfig';
import { getCurrentAdmin, logoutAdmin, isAdminLoggedIn, type Admin } from '../services/authService';

interface BookingLayoutProps {
  children?: React.ReactNode;
}

export default function BookingLayout({ children }: BookingLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const brand = BOOKING_CONFIG.BRAND;
  const mainWebUrl = BOOKING_CONFIG.MAIN_WEBSITE_URL;
  const footerInfo = BOOKING_CONFIG.FOOTER;

  useEffect(() => {
    setAdmin(getCurrentAdmin());
  }, [location]);

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdmin(null);
    navigate('/admin');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-gray-800">
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          {/* Logo & Branding */}
          <a href={mainWebUrl} className="flex items-center gap-3 group">
            <img src={brand.LOGO} alt="Logo" className="h-12 w-auto object-contain" />
            <div className="hidden sm:block">
              <span className="font-serif text-lg font-bold text-[#0c2f3d] group-hover:text-[#d6a54a] transition-colors">
                {brand.NAME}
              </span>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                {brand.SLOGAN}
              </p>
            </div>
          </a>

          {/* Action Navigation */}
          <div className="flex items-center gap-3">
            {/* Admin Dashboard indicators */}
            {admin ? (
              <div className="flex items-center gap-2">
                <Link to="/admin/bookings" className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-xl hover:bg-gray-100 border border-gray-200 flex items-center gap-1.5">
                  <Shield size={14} className="text-[#d6a54a]" /> Panel Admin
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Logout Admin"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              location.pathname.startsWith('/admin') ? null : (
                <Link to="/admin" className="text-xs font-semibold text-gray-400 hover:text-[#0c2f3d]">
                  Portal Petugas
                </Link>
              )
            )}

            {/* Tombol Kembali ke Web Utama */}
            <a
              href={mainWebUrl}
              className="inline-flex items-center gap-2 bg-[#0c2f3d] hover:bg-[#1a4254] text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-[#0c2f3d]/10 hover:shadow-lg"
            >
              <ArrowLeft size={14} />
              Kembali ke Web Utama
            </a>
          </div>

        </div>
      </nav>

      {/* --- CONTENT CONTAINER --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0c2f3d] text-white py-12 border-t-4 border-[#d6a54a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Col 1: Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={brand.LOGO_ALT} alt="Logo" className="h-10 w-auto" />
              <h4 className="font-serif text-lg font-bold">{brand.NAME}</h4>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-md">
              {brand.SLOGAN}. Penyediaan layanan pemeliharaan arsip secara online agar dokumen penting Anda tetap terjaga keutuhannya.
            </p>
          </div>

          {/* Col 2: Hubungi Kami */}
          <div className="space-y-4">
            <h5 className="font-bold text-sm text-[#d6a54a] uppercase tracking-wider">Hubungi Kami</h5>
            <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
              {footerInfo.ADDRESS}
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Phone size={16} className="text-[#d6a54a]" />
                <span>{footerInfo.TELEPHONE}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Mail size={16} className="text-[#d6a54a]" />
                <span>{footerInfo.EMAIL}</span>
              </div>
              <a
                href={footerInfo.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-[#d6a54a] transition-colors"
              >
                <Instagram size={16} />
                <span>@disipusdapwk</span>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-white/10 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {brand.NAME}. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>
    </div>
  );
}
