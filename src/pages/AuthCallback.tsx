import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { consumeAuthCallbackUrl, verifyAuthCallbackTokenHash, syncUserSession } from '../services/supabaseAuthService';
import { isLoggedIn } from '../services/authService';
import { supabase } from '../services/supabase';

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
    message: 'Memproses autentikasi...',
  });

  useEffect(() => {
    let active = true;

    const process = async () => {
      // 1. Cek sesi aktif Supabase terlebih dahulu (mencegah double-exchange di Strict Mode)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const syncResult = await syncUserSession(session.user);
          if (active) {
            setState({ status: 'success', message: 'Masuk berhasil. Mengarahkan Anda...' });
            setTimeout(() => {
              if (active) navigate(syncResult.type === 'admin' ? '/admin' : '/katalog');
            }, 1000);
          }
          return;
        }
      } catch (err) {
        console.warn('Gagal memverifikasi sesi aktif:', err);
      }

      // 2. Jika tidak ada sesi aktif, baru lakukan penukaran token/code
      const { tokenHash, type } = getCallbackParams();

      try {
        const result = tokenHash && type
          ? await verifyAuthCallbackTokenHash(tokenHash, type)
          : await consumeAuthCallbackUrl();

        if (!active) return;

        if (!result.success) {
          // Jika penukaran gagal, cek kembali sesi aktif (untuk kasus berhasil di thread sebelah)
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const syncResult = await syncUserSession(session.user);
            setState({ status: 'success', message: 'Masuk berhasil. Mengarahkan Anda...' });
            setTimeout(() => {
              if (active) navigate(syncResult.type === 'admin' ? '/admin' : '/katalog');
            }, 1000);
            return;
          }

          sessionStorage.setItem('allow_auth_verify', '1');
          sessionStorage.setItem('allow_auth_verify_at', String(Date.now()));
          setState({ status: 'error', message: result.message });
          return;
        }

        // 3. Arahkan berdasarkan tipe sesi hasil penukaran token/code
        if (sessionStorage.getItem('disipusda_current_admin') || result.type === 'admin') {
          setState({ status: 'success', message: 'Masuk sebagai Admin berhasil. Mengarahkan Anda...' });
          setTimeout(() => { if (active) navigate('/admin'); }, 1000);
          return;
        }

        if (isLoggedIn() || result.type === 'member') {
          setState({ status: 'success', message: 'Masuk berhasil. Mengarahkan Anda...' });
          setTimeout(() => { if (active) navigate('/katalog'); }, 1000);
          return;
        }

        if (result.type === 'recovery') {
          setState({ status: 'success', message: 'Verifikasi reset berhasil. Silakan buat password baru.' });
          setTimeout(() => { if (active) navigate('/auth/update-password'); }, 1000);
          return;
        }

        if (result.type === 'magiclink') {
          setState({ status: 'success', message: 'Autentikasi berhasil. Anda akan diarahkan ke dashboard.' });
          setTimeout(() => { if (active) navigate('/katalog'); }, 1000);
          return;
        }

        setState({ status: 'success', message: 'Email berhasil diverifikasi. Anda bisa login sekarang.' });
        setTimeout(() => { if (active) navigate('/login?verified=1'); }, 1200);
      } catch (err: any) {
        if (active) {
          setState({ status: 'error', message: err?.message || 'Terjadi kesalahan saat memproses login.' });
        }
      }
    };

    // Arahkan jika sesi admin/member terdeteksi di cache lokal
    if (sessionStorage.getItem('disipusda_current_admin')) {
      setState({ status: 'success', message: 'Masuk sebagai Admin berhasil. Mengarahkan Anda...' });
      setTimeout(() => { if (active) navigate('/admin'); }, 1000);
    } else if (isLoggedIn()) {
      setState({ status: 'success', message: 'Masuk berhasil. Mengarahkan Anda...' });
      setTimeout(() => { if (active) navigate('/katalog'); }, 1000);
    } else {
      process();
    }

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
        {state.status === 'loading' && (
          <>
            <Loader2 size={36} className="mx-auto text-brand-primary animate-spin mb-4" />
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
              <Link to="/auth/verify" className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-dark">Verifikasi Kode</Link>
              <Link to="/login" className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">Kembali Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
