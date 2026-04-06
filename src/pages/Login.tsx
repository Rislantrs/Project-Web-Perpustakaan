import { Link } from 'react-router';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl font-bold text-[#0c2f3d]">Disipusda</Link>
          <p className="text-gray-500 mt-2">Masuk ke layanan Perpustakaan & Kearsipan Online</p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Anggota / Email</label>
            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors" placeholder="Masukkan ID atau Email" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-sm font-medium text-[#d6a54a] hover:underline">Lupa Password?</a>
            </div>
            <input type="password" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0c2f3d] focus:border-[#0c2f3d] outline-none transition-colors" placeholder="••••••••" />
          </div>
          
          <button className="w-full bg-[#0c2f3d] text-white py-3 rounded-lg font-bold hover:bg-[#1a4254] transition-colors shadow-md">
            Masuk
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-600">
          Belum punya kartu anggota? <Link to="/register" className="text-[#0c2f3d] font-bold hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
