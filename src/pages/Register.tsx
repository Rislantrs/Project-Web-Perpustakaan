import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { UserPlus, CheckCircle, AlertCircle, Eye, EyeOff, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { register } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaLengkap: '',
    nik: '',
    email: '',
    password: '',
    alamat: '',
    telepon: '',
    jenisKelamin: 'L' as 'L' | 'P',
    tanggalLahir: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!formData.namaLengkap || !formData.nik || !formData.email || !formData.password) {
      setToast({ show: true, message: 'Harap isi semua field yang wajib diisi.', type: 'error' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      return;
    }

    if (formData.password.length < 6) {
      setToast({ show: true, message: 'Password minimal 6 karakter.', type: 'error' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      const result = register(formData);
      setToast({ show: true, message: result.message, type: result.success ? 'success' : 'error' });

      if (result.success) {
        setTimeout(() => {
          navigate('/login', { state: { registeredMessage: result.message } });
        }, 2000);
      } else {
        setIsSubmitting(false);
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border max-w-lg"
            style={{
              background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
              borderColor: toast.type === 'success' ? '#6ee7b7' : '#fca5a5',
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={20} className="text-emerald-600 shrink-0" /> : <AlertCircle size={20} className="text-red-600 shrink-0" />}
            <span className={`text-sm font-medium ${toast.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop"
          alt="Perpustakaan"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c2f3d]/90 via-[#0c2f3d]/80 to-[#8b1c24]/70"></div>
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/30">
            <BookOpen size={28} />
          </div>
          <h2 className="font-serif text-4xl font-bold mb-6 leading-tight">
            Bergabung dengan <br /><span className="text-[#d6a54a]">Disipusda</span> Purwakarta
          </h2>
          <p className="text-gray-200 text-lg leading-relaxed max-w-md mb-10">
            Daftar sebagai anggota perpustakaan dan nikmati akses penuh ke ribuan koleksi buku secara online. Pinjam buku dari mana saja, kapan saja.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d6a54a] flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-sm">Akses katalog buku lengkap secara online</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d6a54a] flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-sm">Pinjam buku dari rumah, kembalikan di perpustakaan</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d6a54a] flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-sm">Dapatkan nomor anggota otomatis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-lg w-full">
          <div className="mb-8">
            <Link to="/" className="font-serif text-3xl font-bold text-[#0c2f3d] hover:text-[#8b1c24] transition-colors">Disipusda</Link>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mt-4">Daftar Anggota Baru</h1>
            <p className="text-gray-500 mt-1">Buat kartu keanggotaan perpustakaan secara online</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white"
                  placeholder="Sesuai KTP/KIA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK <span className="text-red-500">*</span></label>
                <input
                  type="text" name="nik" value={formData.nik} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white"
                  placeholder="Nomor Induk Kependudukan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white"
                  placeholder="alamat@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input
                  type="tel" name="telepon" value={formData.telepon} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                <select
                  name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <input
                type="text" name="alamat" value={formData.alamat} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white"
                placeholder="Alamat lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors bg-white pr-12"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0c2f3d] text-white py-3.5 rounded-xl font-bold hover:bg-[#1a4254] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus size={18} /> Daftar Sekarang
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Sudah terdaftar? <Link to="/login" className="text-[#0c2f3d] font-bold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
