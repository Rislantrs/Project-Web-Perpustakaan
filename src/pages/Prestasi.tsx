import { ChevronRight, Award, Star, Trophy, Search, X } from 'lucide-react';
import libHero from '../assets/image/lib-hero.webp';
import libTeam from '../assets/image/lib-team.webp';
import libIndoor from '../assets/image/lib-indoor.webp';

import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAchievements, syncAchievements, type Achievement } from '../services/settingsService';

// Data fallback disiapkan jika sumber data utama belum tersedia.
// Digunakan saat data prestasi dari pengaturan belum tersedia.
const prestasiList = [
  {
    id: 1,
    title: 'Layanan Perpustakaan Terbaik Se-Jawa Barat',
    year: '2023',
    description: 'Penghargaan atas dedikasi dalam meningkatkan kualitas pelayanan perpustakaan bagi masyarakat.',
    img: libHero
  },
  {
    id: 2,
    title: 'Inovasi Kearsipan Digital Nasional',
    year: '2023',
    description: 'Pengakuan atas keberhasilan transformasi sistem kearsipan konvensional menjadi digital yang efisien.',
    img: libIndoor
  },
  {
    id: 3,
    title: 'Pegiat Literasi Purwakarta',
    year: '2022',
    description: 'Apresiasi atas upaya konsisten dalam menggerakkan minat baca di seluruh wilayah Purwakarta.',
    img: libTeam
  }
];

export default function Prestasi() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('Semua');
  const [selectedItem, setSelectedItem] = useState<Achievement | null>(null);
  
  useEffect(() => {
    const data = getAchievements();
    setItems(data);

    // Sinkronisasi data dari Supabase dilakukan di latar belakang.
    syncAchievements().then((cloudData) => {
      if (cloudData && cloudData.length > 0) {
        setItems(cloudData);
      }
    });
  }, []);

  const displayList = items.length > 0 ? items : prestasiList.map((d, i) => ({
    id: i.toString(),
    title: d.title,
    year: d.year,
    description: d.description,
    img: d.img
  }));

  // Urutkan data secara default berdasarkan tahun terbaru.
  const sortedDisplayList = [...displayList].sort((a, b) => b.year.localeCompare(a.year));

  // Bangun daftar tahun unik secara dinamis dari data prestasi.
  const years = ['Semua', ...Array.from(new Set(sortedDisplayList.map(item => item.year))).sort((a, b) => b.localeCompare(a))];

  // Terapkan filter berdasarkan tahun dan kata kunci pencarian.
  const filteredItems = sortedDisplayList.filter(item => {
    const matchesYear = selectedYear === 'Semua' || item.year === selectedYear;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesYear && matchesSearch;
  });

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigasi jejak halaman */}
        <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#0c2f3d]">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <span>Profil</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#0c2f3d] font-medium">Prestasi</span>
        </div>

        {/* Bagian header halaman */}
        <div className="text-center mb-12">
          <Award size={48} className="mx-auto text-[#d6a54a] mb-6 animate-pulse" />
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#0c2f3d] mb-4">Prestasi & Penghargaan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg pt-4 border-t border-gray-200 font-medium">
            Bukti nyata dedikasi kami dalam mewujudkan pelayanan kearsipan dan perpustakaan terbaik bagi masyarakat Purwakarta dan Indonesia.
          </p>
        </div>

        {/* Bagian pencarian dan filter */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 flex flex-col sm:flex-row gap-3">
            
            {/* Input pencarian */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari prestasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c2f3d]/15 focus:border-[#0c2f3d] transition-all font-semibold text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selector Filter Tahun */}
            <div className="sm:w-48">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#0c2f3d]/15 focus:border-[#0c2f3d] transition-all cursor-pointer"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year === 'Semua' ? 'Semua Tahun' : year}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Grid daftar prestasi */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100/80 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:border-[#d6a54a]/30 hover:-translate-y-2 cursor-pointer"
              >
                {/* Sisi gambar prestasi */}
                <div className="w-full aspect-[4/3] overflow-hidden relative bg-gray-50 flex items-center justify-center">
                  {item.img ? (
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                      <Trophy size={48} className="transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#0c2f3d] px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm border border-gray-100">
                    <Star size={12} fill="#d6a54a" className="text-[#d6a54a]" /> {item.year}
                  </div>
                </div>
                
                {/* Sisi teks prestasi */}
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-[9px] font-bold text-[#d6a54a] uppercase tracking-[0.2em] mb-2">Disipusda Achievement</p>
                  <h2 className="font-serif text-lg font-bold text-[#0c2f3d] mb-3 leading-snug line-clamp-2 group-hover:text-[#d6a54a] transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed text-xs font-medium line-clamp-3 mb-4 flex-grow">
                    {item.description}
                  </p>
                  <div className="flex items-center text-xs font-bold text-[#0c2f3d] group-hover:text-[#d6a54a] transition-colors mt-auto pt-2 border-t border-gray-50">
                    Lihat Detail <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tampilan saat data kosong */
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md mx-auto">
            <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0c2f3d] mb-1">Tidak Ada Hasil</h3>
            <p className="text-gray-500 text-sm px-6">
              Tidak ada prestasi yang cocok dengan kata kunci pencarian atau filter tahun Anda.
            </p>
          </div>
        )}

      </div>

      {/* Modal detail lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          {/* Klik latar untuk menutup modal */}
          <div className="absolute inset-0" onClick={() => setSelectedItem(null)} />

          {/* Kontainer modal */}
          <div className="relative bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Tombol tutup modal */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2.5 bg-white/95 hover:bg-white text-gray-500 hover:text-gray-800 rounded-full shadow-md z-20 transition-all border border-gray-150"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Bagian gambar */}
            <div className="w-full aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden">
              {selectedItem.img ? (
                <img src={selectedItem.img} alt={selectedItem.title} className="w-full h-full object-contain" />
              ) : (
                <Trophy size={64} className="text-white/20" />
              )}
              <div className="absolute bottom-4 left-4 bg-[#0c2f3d] text-[#d6a54a] px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md border border-white/10">
                <Star size={12} fill="currentColor" /> {selectedItem.year}
              </div>
            </div>

            {/* Konten deskripsi */}
            <div className="p-6 md:p-8 overflow-y-auto flex-grow">
              <p className="text-[10px] font-bold text-[#d6a54a] uppercase tracking-[0.2em] mb-2">Disipusda Achievement</p>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#0c2f3d] mb-4 leading-tight">
                {selectedItem.title}
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

