import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { consumeAuthCallbackUrl, verifyAuthCallbackTokenHash } from '../services/supabaseAuthService';

const getCallbackParams = () => {
  // Parser callback URL untuk 2 mode Supabase:
  // query params dan hash fragment.
  const url = new URL(window.location.href);
  const query = url.searchParams;
  const hash = new URLSearchParams((url.hash || '').replace(/^#/, ''));

  const tokenHash = query.get('token_hash') || hash.get('token_hash') || '';
  const typeRaw = (query.get('type') || hash.get('type') || '').toLowerCase();
  const type = typeRaw === 'signup' || typeRaw === 'magiclink' ? typeRaw : '';

  return {
    tokenHash,
    type,
  };
};

export default function AuthCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<{ status: 'loading' | 'success' | 'error'; message: string }>({
    status: 'loading',
    message: 'Memproses autentikasi dari email...',
  });

  useEffect(() => {
    const process = async () => {
      const { tokenHash, type } = getCallbackParams();

      // Explicit OTP callback flow for email verification links (signup/magiclink).
      const result = tokenHash && type
        ? await verifyAuthCallbackTokenHash(tokenHash, type)
        : await consumeAuthCallbackUrl();

      if (!result.success) {
        // Jika callback gagal, aktifkan fallback verifikasi manual (OTP input).
        sessionStorage.setItem('allow_auth_verify', '1');
        sessionStorage.setItem('allow_auth_verify_at', String(Date.now()));
        setState({ status: 'error', message: result.message });
        return;
      }

      if (result.type === 'recovery') {
        setState({ status: 'success', message: 'Verifikasi reset berhasil. Silakan buat password baru.' });
        setTimeout(() => navigate('/auth/update-password'), 1000);
        return;
      }

      if (result.type === 'magiclink') {
        setState({ status: 'success', message: 'Autentikasi berhasil. Anda akan diarahkan ke dashboard.' });
        setTimeout(() => navigate('/perpustakaan'), 1000);
        return;
      }

      setState({ status: 'success', message: 'Email berhasil diverifikasi. Anda bisa login sekarang.' });
      setTimeout(() => navigate('/login?verified=1'), 1200);
    };

    process();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
        {state.status === 'loading' && (
          <>
            <Loader2 size={36} className="mx-auto text-[#0c2f3d] animate-spin mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Memproses Autentikasi</h1>
            <p className="text-sm text-gray-500">{state.message}</p>
          </>
        )}

        {state.status === 'success' && (
          <>
            <CheckCircle2 size={40} className="mx-auto text-emerald-600 mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Berhasil</h1>
            <p className="text-sm text-gray-600">{state.message}</p>
          </>
        )}

        {state.status === 'error' && (
          <>
            <AlertCircle size={40} className="mx-auto text-red-600 mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Autentikasi Gagal</h1>
            <p className="text-sm text-gray-600 mb-6">{state.message}</p>
            <div className="flex gap-3 justify-center">
              <Link to="/auth/verify" className="px-4 py-2 rounded-lg bg-[#0c2f3d] text-white text-sm font-semibold hover:bg-[#1a4254]">Verifikasi Kode</Link>
              <Link to="/login" className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">Kembali Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
