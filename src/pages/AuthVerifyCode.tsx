import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ShieldCheck, Mail, KeyRound, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { consumeAuthCallbackFromLink, verifySignupOtp, resendSignupVerification } from '../services/supabaseAuthService';

export default function AuthVerifyCode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [accessDenied, setAccessDenied] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cooldownKey = useMemo(
    () => `verify_resend_until_${(email || 'unknown').toLowerCase().trim()}`,
    [email],
  );

  useEffect(() => {
    const allow = sessionStorage.getItem('allow_auth_verify');
    const allowAt = Number(sessionStorage.getItem('allow_auth_verify_at') || '0');
    const withinWindow = Date.now() - allowAt < 30 * 60 * 1000;
    if (allow !== '1' || !withinWindow) {
      setAccessDenied(true);
      return;
    }

    const until = Number(localStorage.getItem(cooldownKey) || '0');
    const now = Date.now();
    setResendCooldown(Math.max(0, Math.ceil((until - now) / 1000)));
  }, [cooldownKey]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const show = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      show('error', 'Email dan kode/link verifikasi wajib diisi.');
      return;
    }

    setLoading(true);
    const result = /^https?:\/\//i.test(code)
      ? await consumeAuthCallbackFromLink(code)
      : await verifySignupOtp(email, code);
    setLoading(false);

    show(result.success ? 'success' : 'error', result.message);
    if (result.success) {
      sessionStorage.removeItem('allow_auth_verify');
      sessionStorage.removeItem('allow_auth_verify_at');
      setTimeout(() => navigate('/login?verified=1'), 1000);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    if (!email) {
      show('error', 'Isi email terlebih dahulu untuk kirim ulang verifikasi.');
      return;
    }

    setResendLoading(true);
    const result = await resendSignupVerification(email);
    setResendLoading(false);
    show(result.success ? 'success' : 'error', result.message);

    if (result.success) {
      const until = Date.now() + 60_000;
      localStorage.setItem(cooldownKey, String(until));
      setResendCooldown(60);
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
          <AlertCircle size={42} className="mx-auto text-amber-600 mb-3" />
          <h1 className="text-xl font-bold text-gray-900">Akses Verifikasi Dibatasi</h1>
          <p className="text-sm text-gray-600 mt-2">Halaman ini hanya muncul dari alur daftar/login. Silakan mulai dari login atau daftar dulu.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-lg bg-[#0c2f3d] text-white text-sm font-semibold hover:bg-[#1a4254]">Ke Login</Link>
            <Link to="/register" className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">Ke Daftar</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0c2f3d] text-white flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Manual (Opsional)</h1>
          <p className="text-sm text-gray-500 mt-1">Normalnya cukup klik link verifikasi di email. Halaman ini dipakai jika link gagal terbuka otomatis.</p>
        </div>

        {toast && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium border ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} className="inline mr-2" /> : <AlertCircle size={16} className="inline mr-2" />}
            {toast.message}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none"
                placeholder="email@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kode Verifikasi / Link Verifikasi</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\s+/g, ''))}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d]/20 focus:border-[#0c2f3d] outline-none"
                placeholder="contoh: 123456 atau https://..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#0c2f3d] text-white font-semibold hover:bg-[#1a4254] transition-colors disabled:opacity-60"
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi Sekarang'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading || resendCooldown > 0}
          className="w-full mt-3 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60"
        >
          <Send size={16} /> {resendLoading ? 'Mengirim ulang...' : resendCooldown > 0 ? `Kirim Ulang dalam ${resendCooldown} detik` : 'Kirim Ulang Email Verifikasi'}
        </button>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-[#0c2f3d] hover:underline font-semibold">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
