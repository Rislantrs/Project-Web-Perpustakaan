import { Link, useNavigate, useLocation } from 'react-router';
import { useState, useEffect, useMemo } from 'react';
import { LogIn, CheckCircle, AlertCircle, Eye, EyeOff, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { login } from '../services/authService';
import { dbGet, DB_KEYS } from '../services/db';
import { AUTH_PROVIDER } from '../services/backendConfig';
import { loginWithSupabase } from '../services/supabaseAuthService';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Dynamic Stats Logic
  const stats = useMemo(() => {
    const books = dbGet<any[]>(DB_KEYS.BOOKS, []);
    const categories = new Set(books.map(b => b.category).filter(Boolean));
    return {
      totalBooks: books.length || 0,
      totalCategories: categories.size || 0
    };
  }, []);
  
  /* 
     PROFESSIONAL CAPTCHA INTEGRATION (API BASED):
     ----------------------------------------------
     To use Google reCAPTCHA, import the library and add the component here:
     import ReCAPTCHA from "react-google-recaptcha";
     const [captchaToken, setCaptchaToken] = useState(null);
     
     In the form:
     <ReCAPTCHA sitekey="YOUR_SITE_KEY" onChange={token => setCaptchaToken(token)} />
  */

  // Show registration success message if redirected from register
  useEffect(() => {
    const state = location.state as { registeredMessage?: string } | null;
    if (state?.registeredMessage) {
      setToast({ show: true, message: state.registeredMessage, type: 'success' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
    // Clear the state
      window.history.replaceState({}, document.title);
    }

    // Check remembered email
    const saved = localStorage.getItem('remembered_user_id');
    if (saved) {
      setEmailOrId(saved);
      setRememberMe(true);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOrId || !password) {
      setToast({ show: true, message: 'Harap isi semua field.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = AUTH_PROVIDER === 'supabase'
        ? await loginWithSupabase(emailOrId, password)
        : login(emailOrId, password);
      
      if (result.success) {
        if (rememberMe) localStorage.setItem('remembered_user_id', emailOrId);
        else localStorage.removeItem('remembered_user_id');
        
        // Immediate redirection
        window.location.href = '/perpustakaan';
      } else {
        setToast({ show: true, message: result.message, type: 'error' });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Gagal menghubungi database lokal.', type: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border max-w-lg"
            style={{
              background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
              borderColor: toast.type === 'success' ? '#6ee7b7' : '#fca5a5',
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={20} className="text-emerald-600 shrink-0" /> : <AlertCircle size={20} className="text-red-600 shrink-0" />}
            <span className={`text-sm font-medium ${toast.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop"
          alt="Perpustakaan"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b1c24]/90 via-[#8b1c24]/80 to-[#0c2f3d]/70"></div>
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/30">
            <BookOpen size={28} />
          </div>
          <h2 className="font-serif text-4xl font-bold mb-6 leading-tight">
            Selamat Datang <br />Kembali di <span className="text-[#d6a54a]">Disipusda</span>
          </h2>
          <p className="text-gray-200 text-lg leading-relaxed max-w-md">
            Masuk ke akun Anda untuk mengakses katalog buku, meminjam buku secara online, dan melihat riwayat peminjaman.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
              <p className="text-2xl font-bold text-[#d6a54a]">{stats.totalBooks}{stats.totalBooks > 0 ? '+' : ''}</p>
              <p className="text-xs text-gray-300 mt-1">Koleksi Buku</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
              <p className="text-2xl font-bold text-[#d6a54a]">{stats.totalCategories || 0}</p>
              <p className="text-xs text-gray-300 mt-1">Kategori</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
              <p className="text-2xl font-bold text-[#d6a54a]">24/7</p>
              <p className="text-xs text-gray-300 mt-1">Akses Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <Link to="/" className="font-serif text-3xl font-bold text-[#0c2f3d] hover:text-[#8b1c24] transition-colors">Disipusda</Link>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mt-4">Masuk ke Akun Anda</h1>
            <p className="text-gray-500 mt-1">Akses layanan Perpustakaan & Kearsipan Online</p>
            {AUTH_PROVIDER === 'supabase' && (
              <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Mode demo Supabase aktif
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Anggota / Email</label>
              <input
                type="text"
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white"
                placeholder="Masukkan ID atau Email"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-[#d6a54a] hover:underline">Lupa Password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0c2f3d] focus:ring-[#0c2f3d]"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Ingat Saya</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0c2f3d] text-white py-3.5 rounded-xl font-bold hover:bg-[#1a4254] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} /> Masuk
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-600">
            Belum punya kartu anggota? <Link to="/register" className="text-[#0c2f3d] font-bold hover:underline">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
