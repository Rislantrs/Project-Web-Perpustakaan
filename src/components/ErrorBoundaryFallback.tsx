import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';

export default function ErrorBoundaryFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8b1c24]/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#0c2f3d]/5 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 shadow-inner">
            <AlertTriangle size={40} />
          </div>

          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3 font-serif">Oops, Terjadi Kesalahan</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Aplikasi mengalami kendala teknis yang tidak terduga. Jangan khawatir, data Anda tetap aman.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100 overflow-hidden">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Detail Error:</p>
            <p className="text-xs font-mono text-red-500 break-words line-clamp-3 italic">
              {error instanceof Error ? error.message : String(error || "An unknown error occurred")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetErrorBoundary}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0c2f3d] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#1a4254] transition-all shadow-lg active:scale-95"
            >
              <RefreshCcw size={18} /> Coba Lagi
            </button>
            <a
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 py-3 px-4 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              <Home size={18} /> Beranda
            </a>
          </div>

          <p className="mt-8 text-[10px] text-gray-400 font-medium">
            Jika masalah berlanjut, hubungi admin Disipusda Purwakarta.
          </p>
        </div>
      </div>
    </div>
  );
}
