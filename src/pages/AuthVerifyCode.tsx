import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ShieldCheck, Mail, KeyRound, CheckCircle2, AlertCircle, Send, ArrowLeft, Sparkles } from 'lucide-react';
import { verifySignupOtp, resendSignupVerification } from '../services/supabaseAuthService';

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
      show('error', 'Email dan kode OTP wajib diisi.');
      return;
    }

    if (!/^\d{6,8}$/.test(code)) {
      show('error', 'Kode OTP harus berupa 6 sampai 8 digit angka.');
      return;
    }

    setLoading(true);
    const result = await verifySignupOtp(email, code);
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
      <div className="min-h-screen bg-[#0a1f2c] bg-[radial-gradient(circle_at_top,_rgba(214,165,74,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(26,66,84,0.55),_transparent_45%)] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 text-center text-white">
          <AlertCircle size={42} className="mx-auto text-amber-600 mb-3" />
          <h1 className="text-xl font-bold">Akses Verifikasi Dibatasi</h1>
          <p className="text-sm text-slate-200 mt-2">Halaman ini hanya muncul dari alur daftar/login. Silakan mulai dari login atau daftar dulu.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-lg bg-[#0c2f3d] text-white text-sm font-semibold hover:bg-[#1a4254]">Ke Login</Link>
            <Link to="/register" className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10">Ke Daftar</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#091e2a] bg-[radial-gradient(circle_at_10%_20%,_rgba(214,165,74,0.2),_transparent_30%),radial-gradient(circle_at_80%_0%,_rgba(12,47,61,0.7),_transparent_35%),radial-gradient(circle_at_90%_80%,_rgba(139,28,36,0.22),_transparent_40%)] px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-[2rem] border border-white/20 bg-white/12 backdrop-blur-2xl shadow-[0_24px_64px_rgba(1,8,18,0.5)] p-6 md:p-10 text-white">
          <div className="flex items-center justify-between gap-3 mb-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-slate-200 hover:text-white">
              <ArrowLeft size={14} /> Kembali
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d6a54a]/50 bg-[#d6a54a]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f5d59a]">
              <Sparkles size={12} /> Secure Verification
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d6a54a] to-[#b47f22] text-[#072433] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldCheck size={26} />
          </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Verifikasi Email Akun</h1>
            <p className="text-sm text-slate-200 mt-2">
              Masukkan kode OTP dari email untuk aktivasi manual. Anda juga bisa klik link di email untuk verifikasi otomatis.
            </p>
          </div>

          {toast && (
            <div className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium border ${toast.type === 'success' ? 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100' : 'border-red-300/40 bg-red-500/20 text-red-100'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={16} className="inline mr-2" /> : <AlertCircle size={16} className="inline mr-2" />}
              {toast.message}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-white/25 bg-white/10 text-white placeholder:text-slate-300 focus:ring-2 focus:ring-[#d6a54a]/50 focus:border-[#d6a54a] outline-none"
                  placeholder="email@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">Kode OTP</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D+/g, '').slice(0, 8))}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-white/25 bg-white/10 text-white tracking-[0.45em] text-center font-semibold placeholder:text-slate-300 focus:ring-2 focus:ring-[#d6a54a]/50 focus:border-[#d6a54a] outline-none"
                  placeholder="123456"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d6a54a] to-[#c48e2b] text-[#06212f] font-bold hover:brightness-105 transition-all disabled:opacity-60 shadow-lg"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>
          </form>

          <div className="mt-4 rounded-2xl border border-white/20 bg-white/8 p-4">
            <p className="text-sm text-slate-100 font-semibold">Alternatif cepat:</p>
            <p className="text-xs text-slate-300 mt-1">
              Buka email Anda, lalu klik tombol/link verifikasi. Sistem akan memproses otomatis melalui halaman callback.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-white/25 bg-white/10 text-slate-100 font-semibold hover:bg-white/15 disabled:opacity-60"
          >
            <Send size={16} /> {resendLoading ? 'Mengirim ulang...' : resendCooldown > 0 ? `Kirim Ulang dalam ${resendCooldown} detik` : 'Kirim Ulang Email'}
          </button>

          <p className="mt-4 text-center text-xs text-slate-300">
            Belum menerima email? Cek folder spam/promotions lalu kirim ulang setelah cooldown selesai.
          </p>
        </div>
      </div>
    </div>
  );
}
