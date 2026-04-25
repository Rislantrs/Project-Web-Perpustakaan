import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { updatePasswordAfterRecovery } from '../services/supabaseAuthService';

export default function AuthUpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const show = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      show('error', 'Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      show('error', 'Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    const result = await updatePasswordAfterRecovery(password);
    setLoading(false);

    show(result.success ? 'success' : 'error', result.message);
    if (result.success) setTimeout(() => navigate('/login?reset=1'), 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#d6a54a] text-white flex items-center justify-center mx-auto mb-3">
            <Lock size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Atur Password Baru</h1>
          <p className="text-sm text-gray-500 mt-1">Buat password baru untuk akun Anda.</p>
        </div>

        {toast && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium border ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} className="inline mr-2" /> : <AlertCircle size={16} className="inline mr-2" />}
            {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Password Baru</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none"
              placeholder="Ulangi password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#0c2f3d] text-white font-semibold hover:bg-[#1a4254] transition-colors disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-[#0c2f3d] hover:underline font-semibold">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
