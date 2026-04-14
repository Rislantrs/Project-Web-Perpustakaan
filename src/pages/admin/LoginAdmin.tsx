import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Shield, Mail, Lock, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loginAdmin, isAdminLoggedIn } from '../../services/authService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // If already logged in, go to dashboard
    if (isAdminLoggedIn()) {
      navigate('/admin');
    }

    // Check localStorage for remembered credentials
    const savedEmail = localStorage.getItem('remembered_admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    setTimeout(() => {
      const result = loginAdmin(email, password);
      if (result.success) {
        setStatus('success');
        if (rememberMe) {
          localStorage.setItem('remembered_admin_email', email);
        } else {
          localStorage.removeItem('remembered_admin_email');
        }
        setTimeout(() => navigate('/admin'), 1000);
      } else {
        setStatus('error');
        setErrorMsg(result.message);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo and Greeting */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0c2f3d] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-[#0c2f3d]/20">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Admin Area</h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-bold">Disipusda Purwakarta</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100">
                  <AlertCircle size={16} /> {errorMsg}
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-emerald-100">
                  <CheckCircle size={16} /> Login Berhasil! Mengalihkan...
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Institusi</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0c2f3d] transition-colors" />
                <input 
                  required value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="email@disipusda.go.id" 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Kata Sandi</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0c2f3d] transition-colors" />
                <input 
                  required value={password} onChange={e => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"} placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none transition-all" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <input 
                    type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    className="appearance-none w-full h-full border-2 border-gray-200 rounded-md checked:bg-[#0c2f3d] checked:border-[#0c2f3d] transition-all cursor-pointer" 
                  />
                  {rememberMe && <CheckCircle size={12} className="absolute text-white pointer-events-none" />}
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">Ingat Saya</span>
              </label>
            </div>

            <button 
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-[#0c2f3d] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#0c2f3d]/20 hover:bg-[#1a4254] hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Otentikasi...' : 'Masuk Dashboard'}
            </button>
          </form>
        </motion.div>

        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#0c2f3d] transition-colors">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
