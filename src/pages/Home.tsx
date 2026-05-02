import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, MapPin, Clock, ExternalLink, Archive, Globe, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getArticles, Article } from '../services/dataService';
import { getSchedules, Schedule } from '../services/settingsService';

// Import Assets for Service Cards
import gedungArsip from '../assets/layanan/kearsipan/Gedung_Arsip.webp';
import perpustakaanImg from '../assets/layanan/perpustakaan/mohHatta.webp';
import dioramaImg from '../assets/layanan/dioramaPurwakarta/image-1.webp';
import siknImg from '../assets/home/sikn_jikn_network.png';
import virtualImg from '../assets/home/pameran_virtual.png';


import libHero from '../assets/image/lib-hero.webp';
import libIndoor from '../assets/image/lib-indoor.webp';
import libRoom from '../assets/image/lib-room.webp';

// HARDCODE ASSET FALLBACK:
// dipakai untuk hero rotator jika konten dinamis tidak tersedia.
const bgImages = [
  libHero,
  libIndoor,
  libRoom
];


export default function Home() {
  const [currentBg, setCurrentBg] = useState(0);
  const [isSundanese, setIsSundanese] = useState(false);
  const [news, setNews] = useState<Article[]>([]);
  const [stories, setStories] = useState<Article[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeNewsIdx, setActiveNewsIdx] = useState(0);
  const [activeCultureIdx, setActiveCultureIdx] = useState(0);

  useEffect(() => {
    let currentNewsCount = 0;

    const fetchData = () => {
      // Ambil data sinkron dari cache/service untuk render homepage cepat.
      const articles = getArticles();

      // 1. BERITA TERKINI FILTER
      const newsArticles = articles
        .filter(a => a.category === 'Berita Terkini')
        .sort((a, b) => b.createdAt - a.createdAt);

      setNews(newsArticles);
      currentNewsCount = Math.min(newsArticles.length, 5);

      // 2. POJOK CARITA FILTER
      const storyArticles = articles
        .filter(a => a.category === 'Pojok Carita')
        .sort((a, b) => b.createdAt - a.createdAt);
      setStories(storyArticles.slice(0, 5));

      setSchedules(getSchedules().slice(0, 3));
    };

    fetchData();

    // Sync Data changes from other tabs or same tab Admin
    const handleStorageChange = () => fetchData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dbChange', handleStorageChange);

    const bgInterval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);

    const fontInterval = setInterval(() => {
      setIsSundanese((prev) => !prev);
    }, 3000);

    const newsInterval = setInterval(() => {
      setActiveNewsIdx((prev) => {
        const nextLimit = Math.min(currentNewsCount, 5);
        return nextLimit > 0 ? (prev + 1) % nextLimit : 0;
      });
    }, 6000);

    const cultureInterval = setInterval(() => {
      setActiveCultureIdx((prev) => {
        const limit = stories.length > 0 ? stories.length : 0;
        return limit > 0 ? (prev + 1) % limit : 0;
      });
    }, 7000);

    return () => {
      clearInterval(bgInterval);
      clearInterval(fontInterval);
      clearInterval(newsInterval);
      clearInterval(cultureInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dbChange', handleStorageChange);
    };

  }, []);

  const nextNews = (e: React.MouseEvent) => {
    e.preventDefault();
    const limit = Math.min(news.length, 5);
    if (limit > 0) setActiveNewsIdx((prev) => (prev + 1) % limit);
  };

  const prevNews = (e: React.MouseEvent) => {
    e.preventDefault();
    const limit = Math.min(news.length, 5);
    if (limit > 0) setActiveNewsIdx((prev) => (prev - 1 + limit) % limit);
  };

  const nextCulture = () => {
    if (stories.length > 0) setActiveCultureIdx((prev) => (prev + 1) % stories.length);
  };

  const prevCulture = () => {
    if (stories.length > 0) setActiveCultureIdx((prev) => (prev - 1 + stories.length) % stories.length);
  };
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden py-20 lg:py-0">
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

        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <p className="text-[#8f671d] font-bold text-sm tracking-widest uppercase mb-4">Identitas Daerah</p>
            <div className="h-[180px] mb-6 flex items-center overflow-visible">
              <AnimatePresence mode="wait">
                {!isSundanese ? (
                  <motion.h1
                    key="ind"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="font-serif text-5xl lg:text-6xl font-bold text-[#0c2f3d] leading-tight"
                  >
                    Disipusda <br /><span className="text-[#1f3e4e]">Purwakarta</span>
                  </motion.h1>
                ) : (
                  <motion.h1
                    key="sun"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="sundanese-text text-5xl lg:text-5xl xl:text-6xl font-bold text-[#d6a54a] leading-normal pb-2 mt-4"
                  >
                    ᮓᮤᮞᮤᮕᮥᮞ᮪ᮓ <br /><span className="text-[#c09440] text-4xl lg:text-5xl">ᮕᮥᮁᮝᮊᮁᮒ</span>
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Instansi Pemerintah yang mengelola kearsipan & perpustakaan. Rumah bagi museum <span className="text-[#0c2f3d] font-semibold italic">Bale Panyawangan Diorama</span>, tempat sejarah bertemu masa depan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Berita Terkini Section */}
      <section className="py-24 bg-[#fcfafc]">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-[#8f671d] font-bold text-xs tracking-widest uppercase mb-2">Edisi Digital</p>
              <h2 className="font-serif text-4xl font-bold text-[#0c2f3d]">Berita Terkini</h2>
            </div>
            <a href="/artikel?kategori=Berita Terkini" className="hidden sm:flex items-center text-sm font-semibold text-[#0c2f3d] hover:text-[#d6a54a] transition-colors gap-1 border-b border-transparent hover:border-[#d6a54a]">
              Lihat Semua Berita <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Featured Article (Auto Sliding) */}
            <div className="lg:col-span-7 group cursor-pointer relative rounded-2xl overflow-hidden shadow-lg h-[500px]">
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between z-20 pointer-events-none">
                <button onClick={prevNews} aria-label="Berita sebelumnya" className="pointer-events-auto bg-black/30 hover:bg-[#d6a54a] text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#d6a54a]">
                  <ArrowRight size={20} className="rotate-180" />
                </button>
                <button onClick={nextNews} aria-label="Berita selanjutnya" className="pointer-events-auto bg-black/30 hover:bg-[#d6a54a] text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#d6a54a]">
                  <ArrowRight size={20} />
                </button>
              </div>
              <AnimatePresence mode="wait">
                {news[activeNewsIdx] ? (
                  <motion.div
                    key={news[activeNewsIdx].id}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <Link to={`/artikel/${news[activeNewsIdx].slug}`} className="block h-full relative overflow-hidden bg-[#0c2f3d]">
                      {news[activeNewsIdx].img ? (
                        <img
                          src={news[activeNewsIdx].img}
                          alt={news[activeNewsIdx].title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        /* Premium Fallback Design - displayed only if truly no image */
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0c2f3d] via-[#1a4254] to-[#1f3e4e]">
                          <div className="flex flex-col items-center gap-4 text-white/10 group-hover:text-white/20 transition-colors">
                            <BookOpen size={160} strokeWidth={1} />
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c2f3d] via-[#0c2f3d]/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-[#d6a54a] text-white text-[10px] font-black px-3 py-1 rounded tracking-widest">HIGHLIGHT</span>
                          <span className="text-gray-300 text-sm font-medium">{news[activeNewsIdx].date}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-[#d6a54a] transition-colors leading-tight line-clamp-2">
                          {news[activeNewsIdx].title}
                        </h3>
                        <div className="flex justify-between items-center text-white border-t border-white/10 pt-4 mt-6">
                          <span className="text-xs font-bold tracking-[0.2em] flex items-center gap-2">
                            BACA SELENGKAPNYA <ArrowRight size={14} />
                          </span>
                          <div className="flex gap-1.5">
                            {news.slice(0, Math.min(news.length, 5)).map((_, i) => (
                              <div key={i} className={`h-1 rounded-full transition-all ${i === activeNewsIdx ? 'w-6 bg-[#d6a54a]' : 'w-2 bg-white/30'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl border-2 border-dashed border-gray-100">
                    Memuat berita terbaru...
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4 h-[500px]">
              {news.length > 0 ? (
                news.filter((_, idx) => idx !== activeNewsIdx).slice(0, 4).map((article) => (
                  <Link to={`/artikel/${article.slug}`} key={article.id} className="bg-[#f3f5f8] p-5 rounded-2xl group cursor-pointer flex gap-4 flex-1 border border-gray-200/50 hover:shadow-md transition-all overflow-hidden shadow-sm">
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-[#8f671d] uppercase tracking-widest">{article.category}</span>
                        <span className="text-gray-400 text-[10px] font-medium uppercase">{article.date}</span>
                      </div>
                      <h4 className="font-bold text-gray-800 leading-tight group-hover:text-[#0c2f3d] transition-colors line-clamp-2 text-sm md:text-base">
                        {article.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-center shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#0c2f3d] group-hover:text-white transition-all transform group-hover:rotate-45">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300 text-sm font-medium italic">
                  Tidak ada berita tersedia.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Akses Layanan Kami */}
      <section className="py-24 bg-[#fcfafc] border-t border-gray-100">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-[#0c2f3d] mb-4">Akses Langsung Layanan Kami</h2>
            <div className="w-20 h-1 bg-[#d6a54a] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Layanan 1: Kearsipan */}
            <Link to="/kearsipan" className="bg-[#f3f5f8] border border-gray-200/50 rounded-2xl p-8 flex flex-col group h-[420px] relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-sm">
              <h3 className="font-bold text-xl text-[#0c2f3d] mb-4">Urusan Kearsipan</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow z-10 font-medium">
                Penyusunan kebijakan, pembinaan, dan pengelolaan arsip daerah untuk mewujudkan tata kelola dokumen yang tertib, aman, dan sistematis.
              </p>
              <div className="w-12 h-12 rounded-full border-2 border-[#0c2f3d] flex items-center justify-center text-[#0c2f3d] group-hover:bg-[#0c2f3d] group-hover:text-white transition-colors z-10 absolute bottom-8 left-8">
                <ArrowRight size={20} />
              </div>
              <img src={gedungArsip} alt="Arsip" loading="lazy" className="absolute -bottom-4 -right-4 w-72 h-44 object-cover rounded-tl-[60px] opacity-100 group-hover:scale-110 group-hover:brightness-110 transition-all duration-500 shadow-inner" />
            </Link>

            {/* Layanan 2: Perpustakaan */}
            <Link to="/perpustakaan" className="bg-[#f3f5f8] border border-gray-200/50 rounded-2xl p-8 flex flex-col group h-[420px] relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-sm">
              <h3 className="font-bold text-xl text-[#0c2f3d] mb-4">Urusan Perpustakaan</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow z-10 font-medium">
                Pengembangan budaya baca dan pengelolaan perpustakaan daerah yang modern sebagai pusat literasi dan edukasi masyarakat Purwakarta.
              </p>
              <div className="w-12 h-12 rounded-full border-2 border-[#0c2f3d] flex items-center justify-center text-[#0c2f3d] group-hover:bg-[#0c2f3d] group-hover:text-white transition-colors z-10 absolute bottom-8 left-8">
                <ArrowRight size={20} />
              </div>
              <img src={perpustakaanImg} alt="Perpustakaan" loading="lazy" className="absolute -bottom-4 -right-4 w-72 h-44 object-cover object-top rounded-tl-[60px] opacity-100 group-hover:scale-110 group-hover:brightness-110 transition-all duration-500 shadow-inner" />
            </Link>

            {/* Layanan 3: Diorama */}
            <Link to="/bale-panyawangan" className="bg-[#f3f5f8] border border-gray-200/50 rounded-2xl p-8 flex flex-col group h-[420px] relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-sm">
              <h3 className="font-bold text-xl text-[#0c2f3d] mb-4">Bale Panyawangan Diorama</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow z-10 font-medium">
                Pusat edukasi sejarah digital Purwakarta yang menyajikan rekaman masa lalu melalui perpaduan teknologi multimedia, seni, dan arsip.
              </p>
              <div className="w-12 h-12 rounded-full border-2 border-[#0c2f3d] flex items-center justify-center text-[#0c2f3d] group-hover:bg-[#0c2f3d] group-hover:text-white transition-colors z-10 absolute bottom-8 left-8">
                <ArrowRight size={20} />
              </div>
              <img src={dioramaImg} alt="Diorama" loading="lazy" className="absolute -bottom-4 -right-4 w-72 h-44 object-cover rounded-tl-[60px] opacity-100 group-hover:scale-110 group-hover:brightness-110 transition-all duration-500 shadow-inner" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Quote & Events */}
      <section className="py-24 bg-[#fcfafc] border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Headings Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-8 items-end">
            <div className="lg:col-span-2 flex items-center justify-between group">
              <h3 className="font-serif text-3xl sm:text-4xl text-[#0c2f3d] font-bold">Pojok Carita</h3>
              <Link to="/artikel?kategori=Pojok Carita" className="text-sm font-bold text-[#8f671d] flex items-center gap-2 hover:gap-3 transition-all">
                Lihat Semua <ArrowRight size={16} />
              </Link>
            </div>
            <div className="lg:col-span-1 hidden lg:block">
              <h3 className="font-serif text-2xl text-[#0c2f3d] font-bold">Jadwal Mendatang</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Story */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Quote Block */}
              <div className="card-elevated rounded-2xl overflow-hidden relative min-h-[480px] flex group bg-[#0c2f3d] shadow-2xl">
              {/* Navigation arrows - Only show if more than 1 story */}
              {stories.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={prevCulture} aria-label="Cerita sebelumnya" className="pointer-events-auto bg-black/40 hover:bg-[#d6a54a] text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-md">
                    <ArrowRight size={20} className="rotate-180" />
                  </button>
                  <button onClick={nextCulture} aria-label="Cerita selanjutnya" className="pointer-events-auto bg-black/40 hover:bg-[#d6a54a] text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-md">
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {stories.length > 0 ? (
                  <motion.div
                    key={stories[activeCultureIdx]?.id || 'empty'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <motion.img
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 8, ease: "easeOut" }}
                      src={stories[activeCultureIdx]?.img || libIndoor}
                      alt="Pojok Carita"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]"
                      style={{ objectPosition: stories[activeCultureIdx]?.imgPosition || 'center' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c2f3d] via-[#0c2f3d]/80 sm:via-[#0c2f3d]/40 to-transparent"></div>

                    <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white z-20">
                      <motion.span
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-[#d6a54a] text-[#0c2f3d] text-[10px] font-black px-3 py-1 rounded-md w-fit mb-4 uppercase tracking-widest shadow-md"
                      >
                        POJOK CARITA
                      </motion.span>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                        className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-snug sm:leading-tight line-clamp-2"
                      >
                        {stories[activeCultureIdx]?.title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-gray-200 text-sm sm:text-base leading-relaxed max-w-2xl mb-6 sm:mb-8 line-clamp-3"
                      >
                        {stories[activeCultureIdx]?.excerpt}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/20 pt-5 sm:pt-6 gap-4 sm:gap-0"
                      >
                        <Link to={`/artikel/${stories[activeCultureIdx]?.slug}`} className="bg-transparent border border-white text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-white hover:text-[#0c2f3d] transition-all shadow-sm w-full sm:w-auto text-center">
                          Baca Cerita Selengkapnya
                        </Link>
                        <span className="text-[10px] sm:text-xs font-bold tracking-[0.1em] text-gray-400 sm:text-gray-300 uppercase italic">Terbit: {stories[activeCultureIdx]?.date}</span>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white/50 bg-[#0c2f3d]">
                    <BookOpen size={64} className="mb-4 opacity-20" />
                    <p className="font-serif italic">Menyusun koleksi Pojok Carita...</p>
                    </div>
                )}
              </AnimatePresence>

              {/* Slider indicators */}
              {stories.length > 1 && (
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-1.5 z-20 bg-black/20 px-2 py-1.5 rounded-full backdrop-blur-sm">
                  {stories.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeCultureIdx ? 'w-6 bg-[#d6a54a]' : 'w-2 bg-white/60 hover:bg-white'}`} />
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Events Map/List (Dynamic - Restored Dark Theme) */}
            <div className="lg:col-span-1 flex flex-col h-full">
              <div className="space-y-4 flex-grow overflow-y-auto pr-2 hide-scrollbar max-h-[420px]">
                {schedules.length > 0 ? (
                  schedules.map((event, idx) => (
                    <div key={event.id} className="bg-[#1f3e4e] text-white p-5 rounded-xl border border-[#0c2f3d] hover:border-[#d6a54a] transition-all cursor-pointer group shadow-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-[#d6a54a] font-medium text-xs">
                          <Calendar size={14} /> <span>{event.day}</span>
                        </div>
                        {idx === 0 && <span className="bg-[#0c2f3d] text-white text-[10px] px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">TERDEKAT</span>}
                      </div>
                      <h4 className="font-bold text-lg mb-3 group-hover:text-[#d6a54a] transition-colors">{event.note || 'Layanan Disipusda'}</h4>
                      <div className="space-y-2 text-gray-400 text-xs">
                        <div className="flex items-center gap-2 bg-white/5 w-fit px-2 py-1.5 rounded-lg border border-white/5 shadow-inner">
                          <Clock size={12} className="text-[#d6a54a]" /> <span className="text-gray-200 font-medium">{event.hours}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-xs text-gray-400 font-medium italic">Belum ada jadwal operasional diatur.</p>
                  </div>
                )}
              </div>
              <Link to="/jadwal" className="mt-6 text-sm font-semibold text-[#0c2f3d] hover:text-[#d6a54a] transition-colors flex items-center justify-center gap-2 py-2">
                Lihat Seluruh Jadwal <ArrowRight size={16} />
              </Link>
            </div>


          </div>
        </div>
      </section>

      {/* Modern Integrations: SIKN & Pameran Virtual */}
      <section className="py-24 bg-[#fcfafc] border-t border-gray-100">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
              <img src={virtualImg} alt="Pameran Virtual" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c2f3d] via-[#0c2f3d]/60 to-transparent opacity-90 transition-opacity duration-300"></div>

              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/30 text-white">
                  <Globe size={32} />
                </div>
                <h3 className="font-serif text-3xl font-bold text-white mb-3">Pameran Virtual 360°</h3>
                <p className="text-gray-200 mb-8 max-w-md line-clamp-3">
                  Eksplorasi virtual ke berbagai sudut Bale Panyawangan Diorama Purwakarta seolah-olah Anda berada tepat di sana. Temukan arsip sejarah dengan visualisasi menakjubkan.
                </p>
                <a href="https://jikn.anri.go.id/pameran-virtual" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#d6a54a] text-white px-6 py-3 rounded-lg font-bold w-fit hover:bg-[#c09440] transition-colors">
                  Mulai Tur Virtual <ExternalLink size={18} />
                </a>
              </div>
            </div>

            {/* SIKN/JIKN Card */}
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl h-[400px]">
              <img src={siknImg} alt="Arsip Nasional SIKN JIKN" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#5a3b21] via-[#5a3b21]/70 to-transparent opacity-90 transition-opacity duration-300"></div>

              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/30 text-white">
                  <Archive size={32} />
                </div>
                <h3 className="font-serif text-3xl font-bold text-white mb-3">Simpul Jaringan SIKN & JIKN</h3>
                <p className="text-gray-200 mb-8 max-w-md line-clamp-3">
                  Akses jutaan khazanah arsip sebagai bukti pertanggungjawaban memori kolektif bangsa melalui Sistem Informasi Kearsipan Nasional (SIKN) dan JIKN Terintegrasi.
                </p>
                <a href="https://jikn.anri.go.id/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-[#5a3b21] px-6 py-3 rounded-lg font-bold w-fit hover:bg-gray-100 transition-colors">
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
