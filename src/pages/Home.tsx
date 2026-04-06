import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, MapPin, Clock, ExternalLink, Archive, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getArticles, Article } from '../services/dataService';

const bgImages = [
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
];

export default function Home() {
  const [currentBg, setCurrentBg] = useState(0);
  const [isSundanese, setIsSundanese] = useState(false);
  const [news, setNews] = useState<Article[]>([]);

  useEffect(() => {
    setNews(getArticles().slice(0, 5));
    const bgInterval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    
    const fontInterval = setInterval(() => {
      setIsSundanese((prev) => !prev);
    }, 3000);

    return () => {
      clearInterval(bgInterval);
      clearInterval(fontInterval);
    };
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center bg-white overflow-hidden">
        {/* Background Image - Right half */}
        <div className="absolute right-0 top-0 w-full lg:w-3/5 h-full z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:via-white/50 z-10"></div>
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentBg}
              src={bgImages[currentBg]} 
              className="absolute w-full h-full object-cover object-right"
              alt="Library Books"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <p className="text-[#d6a54a] font-bold text-sm tracking-widest uppercase mb-4">Identitas Daerah</p>
            <div className="h-[180px] mb-6 flex items-center overflow-visible">
               <AnimatePresence mode="wait">
                 {!isSundanese ? (
                   <motion.h1 
                     key="ind"
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.4 }}
                     className="font-serif text-5xl lg:text-6xl font-bold text-[#0c2f3d] leading-tight"
                   >
                     Disipusda <br/><span className="text-[#1f3e4e]">Purwakarta</span>
                   </motion.h1>
                 ) : (
                   <motion.h1 
                     key="sun"
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.4 }}
                     className="sundanese-text text-5xl lg:text-5xl xl:text-6xl font-bold text-[#d6a54a] leading-normal pb-2 mt-4"
                   >
                     ᮓᮤᮞᮤᮕᮥᮞ᮪ᮓ <br/><span className="text-[#c09440] text-4xl lg:text-5xl">ᮕᮥᮁᮝᮊᮁᮒ</span>
                   </motion.h1>
                 )}
               </AnimatePresence>
            </div>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Instansi Pemerintah yang mengelola kearsipan & perpustakaan. Rumah bagi museum <span className="text-[#0c2f3d] font-semibold italic">Bale Panyawangan Diorama</span>, tempat sejarah bertemu masa depan.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[#0c2f3d] text-white px-8 py-3 rounded-md font-medium hover:bg-[#15465c] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                Jelajahi Arsip
              </button>
              <Link to="/profil/sejarah">
                <button className="bg-transparent border-2 border-[#0c2f3d] text-[#0c2f3d] px-8 py-3 rounded-md font-medium hover:bg-[#0c2f3d] hover:text-white transition-all">
                  Tentang Kami
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Berita Terkini Section */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-[#d6a54a] font-bold text-xs tracking-widest uppercase mb-2">Edisi Digital</p>
              <h2 className="font-serif text-4xl font-bold text-[#0c2f3d]">Berita Terkini</h2>
            </div>
            <a href="#" className="hidden sm:flex items-center text-sm font-semibold text-[#0c2f3d] hover:text-[#d6a54a] transition-colors gap-1 border-b border-transparent hover:border-[#d6a54a]">
              Lihat Semua Berita <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Featured Article */}
            <div className="lg:col-span-7 group cursor-pointer relative rounded-2xl overflow-hidden card-elevated h-[500px]">
              {news[0] ? (
                <Link to={`/artikel/${news[0].slug}`} className="block h-full relative">
                  <img 
                    src={news[0].img} 
                    alt={news[0].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c2f3d] via-[#0c2f3d]/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[#d6a54a] text-white text-xs font-bold px-3 py-1 rounded">EKSKLUSIF</span>
                      <span className="text-gray-300 text-sm">{news[0].date} • Oleh {news[0].author}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-[#d6a54a] transition-colors leading-tight line-clamp-2">
                      {news[0].title}
                    </h3>
                    <div className="flex justify-between items-center text-white border-t border-white/20 pt-4 mt-6">
                      <span className="text-sm font-medium tracking-wider">BACA SELENGKAPNYA</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 rounded-xl">
                  Memuat berita...
                </div>
              )}
            </div>

            {/* List of articles */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {news.slice(1).map((article, idx) => (
                <Link to={`/artikel/${article.slug}`} key={idx} className="card-elevated p-5 rounded-xl group cursor-pointer flex gap-4 flex-1">
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`text-xs font-bold ${article.category === 'Pojok Carita' ? 'text-blue-600' : 'text-emerald-600'}`}>{article.category.toUpperCase()}</span>
                       <span className="text-gray-400 text-xs">{article.date}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 leading-snug group-hover:text-[#d6a54a] transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#0c2f3d] group-hover:text-white group-hover:border-[#0c2f3d] transition-colors">
                      <ArrowRight size={16} className="-rotate-45" />
                    </div>
                  </div>
                </Link>
              ))}
              
              {news.length <= 1 && (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Belum ada berita lainnya.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Akses Layanan Kami */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-12 text-center sm:text-left">Akses Langsung Layanan Kami</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Layanan 1 */}
            <a href="#" className="card-elevated rounded-2xl p-8 flex flex-col group h-[420px] relative overflow-hidden block">
               <h3 className="font-bold text-xl text-[#0c2f3d] mb-4">Urusan Kearsipan</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow z-10">
                 Berdasarkan peraturan Daerah kabupaten Purwakarta Nomor 11 tahun 2008 tentang Pembentukan Lembaga Teknis Daerah maka ditetapkannya Kantor Arsip Daerah...
               </p>
               <div className="w-12 h-12 rounded-full border-2 border-[#0c2f3d] flex items-center justify-center text-[#0c2f3d] group-hover:bg-[#0c2f3d] group-hover:text-white transition-colors z-10 absolute bottom-8 left-8">
                 <ArrowRight size={20} />
               </div>
               <img src="https://images.unsplash.com/photo-1544396821-4dd40b938ad3?q=80&w=600" alt="Arsip" className="absolute -bottom-10 -right-10 w-64 h-48 object-cover rounded-tl-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
            </a>

            {/* Layanan 2 */}
            <Link to="/perpustakaan" className="card-elevated rounded-2xl p-8 flex flex-col group h-[420px] relative overflow-hidden block">
               <h3 className="font-bold text-xl text-[#0c2f3d] mb-4">Urusan Perpustakaan</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow z-10">
                 Keberadaan perpustakaan daerah di Kabupaten Purwakarta telah dimulai sejak tahun 1953 dengan keputusan Kepala JAPERNAS Kementrian Pendidikan...
               </p>
               <div className="w-12 h-12 rounded-full border-2 border-[#0c2f3d] flex items-center justify-center text-[#0c2f3d] group-hover:bg-[#0c2f3d] group-hover:text-white transition-colors z-10 absolute bottom-8 left-8">
                 <ArrowRight size={20} />
               </div>
               <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600" alt="Perpustakaan" className="absolute -bottom-10 -right-10 w-64 h-48 object-cover rounded-tl-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
            </Link>

            {/* Layanan 3 */}
            <a href="#" className="card-elevated rounded-2xl p-8 flex flex-col group h-[420px] relative overflow-hidden block">
               <h3 className="font-bold text-xl text-[#0c2f3d] mb-4">Bale Panyawangan Diorama</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow z-10">
                 Bale Panyawangan Diorama Purwakarta merupakan ungkapan sejarah Purwakarta dan perkembangan dari masa ke masa yang ditampilkan melalui perpaduan arsip, seni, dan teknologi.
               </p>
               <div className="w-12 h-12 rounded-full border-2 border-[#0c2f3d] flex items-center justify-center text-[#0c2f3d] group-hover:bg-[#0c2f3d] group-hover:text-white transition-colors z-10 absolute bottom-8 left-8">
                 <ArrowRight size={20} />
               </div>
               <img src="https://images.unsplash.com/photo-1541703082531-fa953187c71e?q=80&w=600" alt="Diorama" className="absolute -bottom-10 -right-10 w-64 h-48 object-cover rounded-tl-[100px] opacity-60 group-hover:scale-110 transition-transform duration-500" />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Quote & Events */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Quote Block */}
            <div className="lg:col-span-2 card-elevated rounded-2xl overflow-hidden relative min-h-[400px]">
              <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Library Background" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#0c2f3d]/80"></div>
              <div className="absolute inset-0 p-10 flex flex-col justify-center text-white">
                <span className="bg-[#d6a54a] text-[#0c2f3d] text-xs font-bold px-3 py-1 rounded w-fit mb-6">FEATURED COLUMN</span>
                <h3 className="font-serif text-4xl lg:text-5xl font-bold mb-6 italic leading-tight">Keajaiban di Balik Rak Buku</h3>
                <p className="text-gray-200 text-lg leading-relaxed max-w-xl">
                  Membaca bukan sekadar memindai kata; ia adalah sebuah perjalanan melintasi waktu. Di sini, setiap halaman yang terbuka adalah gerbang menuju dunia yang belum pernah Anda jamah sebelumnya...
                </p>
                <div className="mt-8 flex items-center gap-6">
                  <button className="bg-white text-[#0c2f3d] px-6 py-2 rounded font-bold hover:bg-gray-100 transition-colors shadow">
                    Baca Selengkapnya
                  </button>
                  <span className="text-sm font-medium text-gray-300">5 menit membaca</span>
                </div>
              </div>
            </div>

            {/* Events Map/List */}
            <div className="lg:col-span-1 flex flex-col">
              <h3 className="font-serif text-2xl text-[#0c2f3d] mb-6 font-bold">Jadwal Mendatang</h3>
              <div className="space-y-4 flex-grow">
                {[
                  { date: '15 Okt, 2024', time: '09:00 - 15:00 WIB', title: 'Alun-Alun Kota', loc: 'Sisi Timur, Dekat Menara Pandang' },
                  { date: '17 Okt, 2024', time: '10:00 - 17:00 WIB', title: 'Taman Budaya', loc: 'Area Parkir Utara' },
                  { date: '20 Okt, 2024', time: '08:00 - 14:00 WIB', title: 'Kampus Merdeka', loc: 'Halaman Gedung Rektorat' }
                ].map((event, idx) => (
                  <div key={idx} className="bg-[#1f3e4e] text-white p-5 rounded-xl border border-[#0c2f3d] hover:border-[#d6a54a] transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 text-[#d6a54a] font-medium text-sm">
                        <Calendar size={14} /> <span>{event.date}</span>
                      </div>
                      {idx === 0 && <span className="bg-[#0c2f3d] text-white text-[10px] px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">HARI INI</span>}
                    </div>
                    <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                    <div className="space-y-1 text-gray-400 text-xs">
                      <div className="flex items-center gap-2 bg-white/5 w-fit px-2 py-1 rounded">
                        <Clock size={12} /> {event.time}
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1">
                        <MapPin size={12} className="text-[#d6a54a]" /> {event.loc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-[#0c2f3d] font-semibold text-sm hover:text-[#d6a54a] transition-colors flex items-center justify-center gap-2 py-2">
                Lihat Seluruh Jadwal <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Integrations: SIKN & Pameran Virtual */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-[#0c2f3d]">Jelajah Literasi & Arsip Digital Terpadu</h2>
            <div className="w-20 h-1 bg-[#d6a54a] mx-auto mt-4 mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lebih dekat dengan sejarah purwakarta dan peninggalan nasional langsung dari genggaman Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Pameran Virtual Card */}
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl h-[400px]">
               <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1200" alt="Pameran Virtual" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0c2f3d] via-[#0c2f3d]/60 to-transparent opacity-90 transition-opacity duration-300"></div>
               
               <div className="absolute inset-0 p-10 flex flex-col justify-end">
                 <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/30 text-white">
                   <Globe size={32} />
                 </div>
                 <h3 className="font-serif text-3xl font-bold text-white mb-3">Pameran Virtual 360°</h3>
                 <p className="text-gray-200 mb-8 max-w-md line-clamp-3">
                   Eksplorasi virtual ke berbagai sudut Bale Panyawangan Diorama Purwakarta seolah-olah Anda berada tepat di sana. Temukan arsip sejarah dengan visualisasi menakjubkan.
                 </p>
                 <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#d6a54a] text-white px-6 py-3 rounded-lg font-bold w-fit hover:bg-[#c09440] transition-colors">
                   Mulai Tur Virtual <ExternalLink size={18} />
                 </a>
               </div>
            </div>

            {/* SIKN/JIKN Card */}
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl h-[400px]">
               <img src="https://images.unsplash.com/photo-1455853659719-4b521eebc76d?auto=format&fit=crop&q=80&w=1200" alt="Arsip Nasional SIKN JIKN" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#5a3b21] via-[#5a3b21]/70 to-transparent opacity-90 transition-opacity duration-300"></div>
               
               <div className="absolute inset-0 p-10 flex flex-col justify-end">
                 <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/30 text-white">
                   <Archive size={32} />
                 </div>
                 <h3 className="font-serif text-3xl font-bold text-white mb-3">Simpul Jaringan SIKN & JIKN</h3>
                 <p className="text-gray-200 mb-8 max-w-md line-clamp-3">
                   Akses jutaan khazanah arsip sebagai bukti pertanggungjawaban memori kolektif bangsa melalui Sistem Informasi Kearsipan Nasional (SIKN) dan JIKN Terintegrasi.
                 </p>
                 <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-[#5a3b21] px-6 py-3 rounded-lg font-bold w-fit hover:bg-gray-100 transition-colors">
                   Telusuri Arsip Nasional <ExternalLink size={18} />
                 </a>
               </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
