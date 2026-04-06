import { Link } from 'react-router';

export default function Register() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-8 mb-8">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl font-bold text-[#0c2f3d]">Daftar Anggota</Link>
          <p className="text-gray-500 mt-2">Buat kartu keanggotaan perpustakaan secara online</p>
        </div>
        
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors" placeholder="Sesuai KTP/KIA" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors" placeholder="Nomor Induk Kependudukan" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors" placeholder="alamat@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors" placeholder="••••••••" />
          </div>
          
          <div className="pt-4">
            <button className="w-full bg-[#0c2f3d] text-white py-3 rounded-lg font-bold hover:bg-[#1a4254] transition-colors shadow-md">
              Daftar Sekarang
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Sudah terdaftar? <Link to="/login" className="text-[#0c2f3d] font-bold hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
