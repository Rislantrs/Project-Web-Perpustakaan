import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, CheckCircle, AlertCircle, ArrowLeft, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resetPasswordWithSupabase } from '../services/supabaseAuthService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      return;
    }

    setStatus('loading');
    try {
      const res = await resetPasswordWithSupabase(email);

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
          <p className="text-sm text-gray-500 mt-1">Masukkan email terdaftar untuk mengatur ulang sandi.</p>
          <p className="mt-3 text-xs text-emerald-700 font-semibold">
            Mode produksi Supabase mengirim tautan reset via email.
          </p>
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
                  <CheckCircle size={16} /> {msg}
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

            <button 
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-[#0c2f3d] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#0c2f3d]/20 hover:bg-[#1a4254] transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Memproses...' : 'Kirim Link Reset Password'}
            </button>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Setelah klik link di email, Anda akan diarahkan ke halaman aman di website ini untuk membuat password baru.
            </p>
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
