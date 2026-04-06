import { Book, LibrarySquare, UserPlus, Search } from 'lucide-react';
import { Link } from 'react-router';

export default function Perpustakaan() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      
      {/* Hero Header specialized for Library section (Independent Style - Maroon) */}
      <section className="bg-[#8b1c24] py-20 text-center border-b-8 border-[#0c2f3d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000" className="w-full h-full object-cover" alt="bg" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
           <p className="text-[#e2b769] font-bold tracking-widest uppercase mb-4 text-sm">DIVISI LAYANAN</p>
           <h1 className="font-serif text-white text-5xl lg:text-6xl font-bold mb-6">Perpustakaan Digital</h1>
           <p className="text-gray-200 text-lg max-w-2xl mx-auto leading-relaxed">
             Pusat literatur dan arsip bersejarah. Jelajahi jutaan koleksi buku secara daring atau berkunjung ke fasilitas ruang baca modern kami.
           </p>
        </div>
      </section>

      {/* Main Actions (The Blocks like NYC Library) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border-b-4 border-[#8b1c24]">
            <Search className="text-[#8b1c24] mb-6" size={36} />
            <h3 className="font-bold text-2xl text-[#1a1a1a] mb-2">Katalog Buku</h3>
            <p className="text-sm text-gray-500 mb-6">Cari buku, jurnal, dan dokumen koleksi kami secara instan.</p>
            <button className="text-[#8b1c24] font-bold text-sm tracking-wide hover:text-[#0c2f3d] transition-colors border-b-2 border-transparent hover:border-[#0c2f3d]">
              CARI SEKARANG
            </button>
          </div>

          <div className="bg-[#6b5840] p-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border-b-4 border-[#8b1c24]">
            <UserPlus className="text-white mb-6" size={36} />
            <h3 className="font-bold text-2xl text-white mb-2">Daftar Anggota</h3>
            <p className="text-sm text-gray-200 mb-6">Gabung sekarang dan nikmati akses penuh fasilitas perpustakaan.</p>
            <Link to="/register" className="text-white font-bold text-sm tracking-wide hover:opacity-80 transition-opacity border-b-2 border-transparent hover:border-white block w-fit">
              DAFTAR ONLINE
            </Link>
          </div>

          <div className="bg-[#0f6063] p-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border-b-4 border-[#8b1c24]">
            <Book className="text-white mb-6" size={36} />
            <h3 className="font-bold text-2xl text-white mb-2">Pinjam Buku</h3>
            <p className="text-sm text-gray-200 mb-6">Reservasi peminjaman buku kapan saja bagi Anda yang merupakan anggota aktif.</p>
            <Link to="/login" className="text-white font-bold text-sm tracking-wide hover:opacity-80 transition-opacity border-b-2 border-transparent hover:border-white block w-fit">
              PINJAM SEKARANG
            </Link>
          </div>

          <div className="bg-[#8b1c24] p-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border-b-4 border-black/20">
            <LibrarySquare className="text-white mb-6" size={36} />
            <h3 className="font-bold text-2xl text-white mb-2">Fasilitas Perpus</h3>
            <p className="text-sm text-gray-200 mb-6">Area baca super nyaman, koneksi nirkabel, dan zona khusus eksplorasi literasi bagi anak.</p>
            <button className="text-white font-bold text-sm tracking-wide hover:opacity-80 transition-opacity border-b-2 border-transparent hover:border-white w-fit">
              LIHAT FASILITAS
            </button>
          </div>

        </div>
      </section>

      {/* Featured Collections / Books */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex justify-between items-end mb-10 border-b pb-4">
          <div>
            <p className="text-[#8b1c24] font-bold text-xs tracking-widest uppercase mb-1">Kurator Memilih</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a1a]">Buku Rekomendasi</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {/* Dummy Books */}
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer block">
              <div className="h-56 bg-gray-200 relative overflow-hidden">
                <img 
                  src={`https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&ixlib=rb-4.0.3&auto=format&fit=crop`} 
                  alt="Book Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors rounded">Pinjam</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-[#8b1c24] font-bold mb-1 tracking-wider">LITERASI KITA</p>
                <h4 className="font-bold text-[#1a1a1a] text-sm mb-1 leading-tight line-clamp-2">Cahaya di Antara Kegelapan Sejarah</h4>
                <p className="text-xs text-gray-500">Penulis Nama Indonesia</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sejarah Perpustakaan Terintegrasi */}
      <section className="bg-white py-24 border-t border-gray-100" id="sejarah">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl font-bold text-[#1a1a1a] mb-6">Sejarah Perpustakaan Daerah Kabupaten Purwakarta</h2>
            <p className="text-lg text-gray-600 font-medium italic">
              Membangun Budaya Baca di Seluruh Lapisan Masyarakat Kabupaten Purwakarta
            </p>
          </div>

          <div className="space-y-20">
            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative h-80 rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1541123437800-141315fc38c0?auto=format&fit=crop&q=80&w=1000" alt="Bangunan Lama" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="font-serif text-3xl font-bold text-[#8b1c24] mb-4">Masa Awal Berdiri (1953)</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Keberadaan perpustakaan daerah di Kabupaten Purwakarta telah dimulai sejak tahun 1953 dengan keputusan Kepala JAPERNAS Kementrian Pendidikan, Pengajaran dan Kebudayaan tanggal 26 Nopember 1953 tentang Peraturan Penyelenggaraan Perpustakaan Rakyat Jabatan Pendidikan Masyarakat.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-1 lg:order-1">
                <h3 className="font-serif text-3xl font-bold text-[#8b1c24] mb-4">Perkembangan Status</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                  <p>
                    Pada tahun 1990 TPM/C berubah status menjadi Unit Pelaksana Teknis Daerah (UPTD) Perpustakaan dengan ditetapkannya Peraturan Daerah Kabupaten Purwakarta No. 6 tahun 1990.
                  </p>
                  <p>
                    Pada tahun 2000 UPTD Perpustakaan kembali berubah status menjadi Kantor Perpustakaan Daerah Kabupaten Purwakarta sesuai dengan Surat Keputusan Bupati Purwakarta No. 4 Tahun 2000. Sejak Tahun 2017, statusnya resmi bertransformasi menjadi <strong className="text-[#1a1a1a]">Dinas Kearsipan dan Perpustakaan</strong> yang melayani kemajuan era digital secara inklusif.
                  </p>
                </div>
              </div>
              <div className="order-2 lg:order-2 relative h-80 rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1497604401993-f2e922e5cb0a?auto=format&fit=crop&q=80&w=1000" alt="Gedung Baru" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Quote Block */}
            <div className="bg-[#1f3e4e] p-10 md:p-16 rounded-3xl text-center relative overflow-hidden mt-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <blockquote className="relative z-10 font-serif text-2xl md:text-4xl text-white italic mb-6 leading-tight max-w-4xl mx-auto">
                "Perpustakaan Digital Pertama di Jawa Barat. Mengubah wajah kearsipan dan budaya literasi menjadi sesuatu yang membanggakan."
              </blockquote>
              <div className="relative z-10">
                <div className="w-12 h-1 bg-[#d6a54a] mx-auto mb-4"></div>
                <p className="font-bold text-[#d6a54a] uppercase tracking-widest text-sm">Media Indonesia</p>
                <p className="text-sm text-gray-400">Edisi 14 Februari 2019</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
