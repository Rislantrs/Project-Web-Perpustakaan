import { ChevronRight, Award, Star, Trophy, ChevronLeft, X } from 'lucide-react';
import libHero from '../assets/image/lib-hero.webp';
import libTeam from '../assets/image/lib-team.webp';
import libIndoor from '../assets/image/lib-indoor.webp';

import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAchievements, syncAchievements, type Achievement } from '../services/settingsService';

// HARDCODE FALLBACK DATA:
// dipakai jika data prestasi dari settings belum tersedia.
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
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Achievement | null>(null);
  
  useEffect(() => {
    const data = getAchievements();
    setItems(data);

    // Sinkronisasi data dari Supabase di latar belakang
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

  // 3 prestasi teratas untuk 3D Spotlight Carousel
  const featuredItems = displayList.slice(0, 3);

  // Kelompokkan semua prestasi berdasarkan tahun untuk bagian bawah
  const achievementsByYear: { [year: string]: Achievement[] } = {};
  displayList.forEach(item => {
    if (!achievementsByYear[item.year]) {
      achievementsByYear[item.year] = [];
    }
    achievementsByYear[item.year].push(item);
  });
  const sortedYears = Object.keys(achievementsByYear).sort((a, b) => b.localeCompare(a));

  const handleNextFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFeaturedIndex((prev) => (prev + 1) % featuredItems.length);
  };

  const handlePrevFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFeaturedIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  // Logika posisi kartu 3D
  const get3DCardStyle = (index: number) => {
    const total = featuredItems.length;
    if (total === 0) return {};
    
    const diff = index - activeFeaturedIndex;
    let position = diff;
    if (diff === -2) position = 1;
    if (diff === 2) position = -1;

    if (position === 0) {
      return {
        transform: 'translateX(0) scale(1)',
        zIndex: 30,
        opacity: 1,
        pointerEvents: 'auto' as const
      };
    } else if (position === 1 || (position === -2 && total === 3)) {
      return {
        transform: 'translateX(28%) scale(0.88) rotate(2deg)',
        zIndex: 20,
        opacity: 0.5,
        pointerEvents: 'auto' as const
      };
    } else {
      return {
        transform: 'translateX(-28%) scale(0.88) rotate(-2deg)',
        zIndex: 20,
        opacity: 0.5,
        pointerEvents: 'auto' as const
      };
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24 overflow-x-hidden">
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
        <div className="text-center mb-10">
          <Award size={44} className="mx-auto text-[#d6a54a] mb-4" />
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-[#0c2f3d] mb-3">Prestasi & Penghargaan</h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base font-medium">
            Dedikasi berkelanjutan untuk pelayanan kearsipan dan perpustakaan daerah di Purwakarta.
          </p>
        </div>

        {/* 3D Spotlight Stack Section */}
        {featuredItems.length > 0 && (
          <div className="mb-16">
            <h2 className="text-center text-xs font-bold text-[#d6a54a] uppercase tracking-[0.25em] mb-6">
              Sorotan Utama
            </h2>
            <div className="relative h-[420px] sm:h-[340px] md:h-[360px] w-full max-w-3xl mx-auto flex items-center justify-center overflow-visible">
              
              {/* Navigation buttons */}
              {featuredItems.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevFeatured}
                    className="absolute left-1 sm:left-4 z-40 p-3 bg-white/95 hover:bg-white text-gray-700 hover:text-black rounded-full shadow-lg transition-all border border-gray-100 hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={handleNextFeatured}
                    className="absolute right-1 sm:right-4 z-40 p-3 bg-white/95 hover:bg-white text-gray-700 hover:text-black rounded-full shadow-lg transition-all border border-gray-100 hover:scale-105 active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Cards stack */}
              {featuredItems.map((item, index) => {
                const isActive = index === activeFeaturedIndex;
                return (
                  <div
                    key={item.id}
                    style={get3DCardStyle(index)}
                    onClick={() => isActive ? setSelectedItem(item) : setActiveFeaturedIndex(index)}
                    className="absolute w-[82%] sm:w-[70%] h-full bg-white rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden transition-all duration-500 flex flex-col sm:flex-row cursor-pointer"
                  >
                    {/* Image / Trophy left side */}
                    <div className="w-full sm:w-[45%] h-[42%] sm:h-full overflow-hidden relative bg-gray-50 flex items-center justify-center shrink-0">
                      {item.img ? (
                        <img 
                          src={item.img} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                          <Trophy size={48} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#0c2f3d] px-3 py-1 rounded-xl font-bold text-[10px] flex items-center gap-1 shadow-sm border border-gray-100">
                        <Star size={10} fill="#d6a54a" className="text-[#d6a54a]" /> {item.year}
                      </div>
                    </div>

                    {/* Content right side */}
                    <div className="w-full sm:w-[55%] p-5 sm:p-7 flex flex-col justify-center overflow-hidden">
                      <span className="text-[8px] font-bold text-[#d6a54a] uppercase tracking-[0.2em] mb-2 block">
                        Featured Highlight
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#0c2f3d] mb-3 leading-snug line-clamp-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed font-medium line-clamp-3 sm:line-clamp-4">
                        {item.description}
                      </p>
                      {isActive && (
                        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-xs font-bold text-[#0c2f3d] group hover:text-[#d6a54a] transition-colors">
                          Lihat Selengkapnya <ChevronRight size={14} className="ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-[1px] bg-gray-200/80 w-full mb-12"></div>

        {/* Yearly Horizontal Rails */}
        <div>
          <h2 className="text-xs font-bold text-[#d6a54a] uppercase tracking-[0.25em] mb-8 text-center sm:text-left">
            Arsip Penghargaan per Tahun
          </h2>
          
          <div className="space-y-12">
            {sortedYears.map((year) => {
              const yearItems = achievementsByYear[year];
              return (
                <div key={year} className="relative">
                  {/* Section Title */}
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="h-5 w-1 bg-[#d6a54a] rounded-full"></div>
                    <h3 className="text-lg font-serif font-bold text-[#0c2f3d]">{year}</h3>
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
                      {yearItems.length}
                    </span>
                  </div>

                  {/* Horizontal Scroll Rail */}
                  <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-3 scroll-smooth">
                    <div className="flex gap-5 mx-auto px-4">
                      {yearItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className="w-[260px] sm:w-[280px] shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100/60 flex flex-col snap-start cursor-pointer transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Image Frame */}
                          <div className="w-full aspect-[16/10] overflow-hidden relative bg-gray-50 flex items-center justify-center">
                            {item.img ? (
                              <img 
                                src={item.img} 
                                alt={item.title} 
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                <Trophy size={32} />
                              </div>
                            )}
                          </div>

                          {/* Title & Desc */}
                          <div className="p-4 flex flex-col flex-grow">
                            <h4 className="font-serif text-sm font-bold text-[#0c2f3d] line-clamp-2 leading-snug mb-2 hover:text-[#d6a54a] transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-gray-400 text-[11px] leading-relaxed font-medium line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal Lightbox Detail */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedItem(null)} />

          <div className="relative bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-500 hover:text-gray-800 rounded-full shadow-md z-20 transition-all border border-gray-100"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image section */}
            <div className="w-full aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden">
              {selectedItem.img ? (
                <img src={selectedItem.img} alt={selectedItem.title} className="w-full h-full object-contain" />
              ) : (
                <Trophy size={64} className="text-white/20" />
              )}
              <div className="absolute bottom-3 left-3 bg-[#0c2f3d] text-[#d6a54a] px-3.5 py-1 rounded-xl font-bold text-[10px] flex items-center gap-1 shadow-md border border-white/10">
                <Star size={10} fill="currentColor" /> {selectedItem.year}
              </div>
            </div>

            {/* Description content */}
            <div className="p-5 md:p-6 overflow-y-auto flex-grow">
              <p className="text-[9px] font-bold text-[#d6a54a] uppercase tracking-[0.2em] mb-1.5">
                Disipusda Achievement
              </p>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#0c2f3d] mb-3 leading-snug">
                {selectedItem.title}
              </h2>
              <p className="text-gray-500 leading-relaxed text-xs sm:text-sm font-medium whitespace-pre-line">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

