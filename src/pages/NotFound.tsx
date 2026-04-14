import { Link, useLocation } from 'react-router';
import { Home, ArrowLeft, AlertCircle, ShieldAlert, Ghost, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorPageProps {
  code?: 404 | 500 | 403;
  title?: string;
  message?: string;
}

export default function ErrorPage({ code = 404, title, message }: ErrorPageProps) {
  const location = useLocation();
  
  // Dynamic content based on error code
  const errorData = {
    404: {
      icon: <Ghost size={64} className="text-[#d6a54a]" />,
      title: title || 'Halaman Hilang dari Rak',
      message: message || `Maaf, halaman "${location.pathname}" tidak dapat kami temukan di perpustakaan digital kami.`,
      label: '404 - Not Found'
    },
    500: {
      icon: <AlertCircle size={64} className="text-red-500" />,
      title: title || 'Gangguan Sistem',
      message: message || 'Kami mengalami masalah internal saat memproses permintaan Anda. Tim kami sedang menanganinya.',
      label: '500 - Server Error'
    },
    403: {
      icon: <ShieldAlert size={64} className="text-[#0c2f3d]" />,
      title: title || 'Akses Terbatas',
      message: message || 'Maaf, Anda tidak memiliki izin untuk mengakses area terlarang ini.',
      label: '403 - Forbidden'
    }
  };

  const currentVariant = errorData[code] || errorData[404];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-white">
      <div className="relative max-w-2xl w-full text-center">
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#d6a54a]/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 -translate-x-1/2 w-48 h-48 bg-[#0c2f3d]/5 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Status Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8 shadow-sm">
            {currentVariant.label}
          </div>

          {/* Icon Section */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
               <div className="absolute inset-0 bg-white/20 blur-xl"></div>
               <motion.div
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               >
                 {currentVariant.icon}
               </motion.div>
            </div>
          </div>

          {/* Text Content */}
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#0c2f3d] mb-6 leading-tight">
            {currentVariant.title}
          </h1>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-lg mx-auto mb-12 font-medium">
            {currentVariant.message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="group flex items-center gap-3 bg-[#0c2f3d] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-[#0c2f3d]/20 hover:bg-[#164153] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" /> 
              Kembali ke Beranda
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-3 bg-white text-gray-700 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all hover:border-gray-200"
            >
              <ArrowLeft size={18} /> Halaman Sebelumnya
            </button>
          </div>

          {/* Quick Search Help */}
          <div className="mt-16 pt-8 border-t border-gray-50">
             <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-4">Mungkin Anda mencari ini?</p>
             <div className="flex flex-wrap justify-center gap-3">
                {['Katalog Buku', 'Berita Resmi', 'Profil Dinas', 'Pojok Carita'].map(tag => (
                  <Link 
                    key={tag} 
                    to={tag === 'Katalog Buku' ? '/perpustakaan' : '/artikel'}
                    className="text-xs font-bold text-gray-500 hover:text-[#d6a54a] transition-colors bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-[#d6a54a]/5"
                  >
                    #{tag}
                  </Link>
                ))}
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
