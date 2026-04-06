import { ChevronRight, Award, Star } from 'lucide-react';
import { Link } from 'react-router';

// Dummy data for achievements
const prestasiList = [
  {
    year: '2023',
    title: 'Penghargaan Simpul Jaringan Terbaik Nasional',
    issuer: 'Arsip Nasional Republik Indonesia (ANRI)',
    desc: 'Disipusda Purwakarta berhasil meraih peringkat pertama tingkat nasional dalam pengelolaan Jaringan Informasi Kearsipan Nasional (JIKN).',
    img: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800'
  },
  {
    year: '2022',
    title: 'Inovasi Pelayanan Publik Terbaik Jabar',
    issuer: 'Pemerintah Provinsi Jawa Barat',
    desc: 'Bale Panyawangan Diorama dianugerahi sebagai destinasi inovasi literasi sejarah digital terbaik se-Jawa Barat.',
    img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800'
  },
  {
    year: '2021',
    title: 'Akreditasi A untuk Perpustakaan Daerah',
    issuer: 'Perpustakaan Nasional RI',
    desc: 'Meraih nilai standar kesesuaian fasilitas dan manajemen tertinggi, membuktikan dedikasi tanpa batas untuk ruang baca publik.',
    img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800'
  }
];

export default function Prestasi() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#0c2f3d]">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <span>Profil</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#0c2f3d] font-medium">Prestasi</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <Award size={48} className="mx-auto text-[#d6a54a] mb-6" />
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#0c2f3d] mb-4">Prestasi & Penghargaan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg pt-4 border-t border-gray-200">
            Bukti nyata dedikasi kami dalam mewujudkan pelayanan kearsipan dan perpustakaan terbaik bagi masyarakat Purwakarta dan Indonesia.
          </p>
        </div>

        {/* List of Awards */}
        <div className="space-y-12">
          {prestasiList.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row group transition-transform hover:-translate-y-1">
              {/* Image side */}
              <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                 <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 <div className="absolute top-4 left-4 bg-[#0c2f3d] text-[#d6a54a] px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg z-10">
                   <Star size={18} fill="currentColor" /> {item.year}
                 </div>
              </div>
              
              {/* Text side */}
              <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                 <p className="text-sm font-bold text-[#d6a54a] uppercase tracking-widest mb-2">{item.issuer}</p>
                 <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0c2f3d] mb-4 leading-tight">
                   {item.title}
                 </h2>
                 <p className="text-gray-600 leading-relaxed text-lg">
                   {item.desc}
                 </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
