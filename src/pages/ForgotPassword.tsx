import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, Mail, Lock, CheckCircle, AlertCircle, ArrowLeft, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resetPassword } from '../services/authService';
import { AUTH_PROVIDER } from '../services/backendConfig';
import { resetPasswordWithSupabase } from '../services/supabaseAuthService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [nik, setNik] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (AUTH_PROVIDER === 'supabase') {
      if (!email) return;
    } else if (!email || !nik || !newPassword || !confirmPassword) {
      return;
    }

    if (AUTH_PROVIDER !== 'supabase' && newPassword !== confirmPassword) {
      setMsg('Sandi konfirmasi tidak cocok.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const res = AUTH_PROVIDER === 'supabase'
        ? await resetPasswordWithSupabase(email)
        : resetPassword(email, nik, newPassword);

      setMsg(res.message);
      if (res.success) {
        setStatus('success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setMsg('Gagal memproses reset password.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#d6a54a] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-[#d6a54a]/20">
            <Key size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Lupa Kata Sandi</h1>
          <p className="text-sm text-gray-500 mt-1">Masukkan data terdaftar untuk mengatur ulang sandi.</p>
          {AUTH_PROVIDER === 'supabase' && (
            <p className="mt-3 text-xs text-emerald-700 font-semibold">
              Mode Supabase aktif, reset password dikirim via email.
            </p>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100">
                  <AlertCircle size={16} /> {msg}
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-emerald-100">
                  <CheckCircle size={16} /> {msg} Mengalihkan...
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Terdaftar</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0c2f3d] transition-colors" />
                <input 
                  required value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="email@gmail.com" 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">NIK (Masked)</label>
              <div className="relative group">
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0c2f3d] transition-colors" />
                <input 
                  required={AUTH_PROVIDER !== 'supabase'} value={nik} onChange={e => setNik(e.target.value)}
                  type="text" placeholder="****************7406" 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none transition-all font-mono" 
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 px-1">Gunakan format NIK yang muncul di Profil (dengan bintang).</p>
              {AUTH_PROVIDER === 'supabase' && (
                <p className="text-[10px] text-emerald-700 mt-1 px-1">Field NIK tidak dipakai untuk mode Supabase.</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Sandi Baru</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0c2f3d] transition-colors" />
                <input 
                  required={AUTH_PROVIDER !== 'supabase'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  type="password" placeholder="Minimal 6 karakter" minLength={6}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Konfirmasi Sandi Baru</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0c2f3d] transition-colors" />
                <input 
                  required={AUTH_PROVIDER !== 'supabase'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  type="password" placeholder="Ulangi sandi baru" 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none transition-all" 
                />
              </div>
            </div>

            <button 
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-[#0c2f3d] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#0c2f3d]/20 hover:bg-[#1a4254] transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Memproses...' : 'Ubah Kata Sandi'}
            </button>
          </form>
        </motion.div>

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#0c2f3d] transition-colors">
            <ArrowLeft size={14} /> Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
