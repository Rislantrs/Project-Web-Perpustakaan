import { Link, useSearchParams } from 'react-router';
import { ChevronRight, Calendar, User, Search, Filter, ChevronLeft, X, Download, Image as ImageIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getArticles, Article } from '../services/dataService';

const ITEMS_PER_PAGE = 6;

export default function BlogList() {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('kategori') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedYear, setSelectedYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);
  
  useEffect(() => {
    setArticles(getArticles());
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get('kategori') || '');
    setCurrentPage(1);
  }, [searchParams]);

  const [lightboxImg, setLightboxImg] = useState<{src: string, title: string} | null>(null);

  const isGridMode = ['Media Mewarnai', 'Galeri', 'Video Terkini'].includes(selectedCategory || urlCategory);

  const parseIndoDate = (dateStr: string) => {
    const months: {[key: string]: number} = {
      'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
      'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };
    const parts = dateStr.split(' ');
    if (parts.length !== 3) return new Date();
    return new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
  };

  const filteredArticles = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return articles.filter(article => {
      const articleDate = parseIndoDate(article.date);
      if (articleDate > now) return false;

      const matchSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory ? article.category === selectedCategory : (urlCategory ? article.category === urlCategory : true);
      const matchYear = selectedYear ? article.year === selectedYear : true;
      return matchSearch && matchCategory && matchYear;
    });
  }, [articles, searchQuery, selectedCategory, urlCategory, selectedYear]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentCategoryDisplay = selectedCategory || urlCategory || 'Ruang Literasi & Berita';

  const ArticleImage = ({ src, alt, className, position }: { src?: string, alt: string, className?: string, position?: string }) => {
    const [isError, setIsError] = useState(false);
    
    if (!src || isError) {
      return (
        <div className={`bg-gray-50 flex flex-col items-center justify-center p-6 text-center border-b border-gray-100 ${className}`}>
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-3">
             <ImageIcon size={24} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 line-clamp-2 leading-tight">
            {alt}
          </span>
        </div>
      );
    }

    return (
      <img 
        src={src} 
        alt={alt} 
        onError={() => setIsError(true)}
        className={className} 
        style={{ objectPosition: position || 'center' }}
      />
    );
  };

  return (
    <div className="bg-[#fcfdfd] min-h-screen pt-12 pb-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center text-sm text-gray-500 mb-10">
          <Link to="/" className="hover:text-[#0c2f3d]">Beranda</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#0c2f3d] font-medium">{currentCategoryDisplay}</span>
        </div>

        <div className="border-b border-gray-200 pb-8 mb-8">
          <h1 className="font-serif text-5xl font-bold text-[#1a1a1a] mb-4">
            {currentCategoryDisplay}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl font-serif">
            {isGridMode 
              ? 'Koleksi visual, dokumentasi video, dan lembar mewarnai yang dapat Anda nikmati secara interaktif.'
              : 'Jelajahi tulisan terbaru, sudut pandang kearsipan, hingga warta kedinasan dalam gaya bercerita yang renyah.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari judul..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d6a54a] focus:ring-1 focus:ring-[#d6a54a]"
            />
          </div>

          <div className="flex gap-4">
            <select 
              value={selectedCategory || urlCategory} 
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#d6a54a] text-gray-700"
            >
              <option value="">Semua Kategori</option>
              <option value="Kedinasan">Kedinasan</option>
              <option value="Pojok Carita">Pojok Carita</option>
              <option value="Media Mewarnai">Media Mewarnai</option>
              <option value="Perpustakaan Keliling">Perpus Keliling</option>
            </select>

            <select 
              value={selectedYear} 
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#d6a54a] text-gray-700 w-32"
            >
              <option value="">Tahun</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        {paginatedArticles.length > 0 ? (
          <div className={isGridMode ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-16 max-w-5xl mx-auto"}>
            {paginatedArticles.map((article, index) => {
              if (isGridMode) {
                return (
                  <div 
                    key={article.id || index} 
                    onClick={() => {
                      if (article.category === 'Media Mewarnai' || article.category === 'Galeri') {
                        setLightboxImg({ src: article.img, title: article.title });
                      } else {
                        window.location.href = `/artikel/${article.slug}`;
                      }
                    }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col h-full"
                  >
                    <div className="w-full aspect-square overflow-hidden relative">
                      <ArticleImage 
                         src={article.img} 
                         alt={article.title} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         position={article.imgPosition}
                      />
                      {(article.category === 'Media Mewarnai' || article.category === 'Galeri') && !!article.img && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-xs">
                          Lihat Penuh
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="font-bold text-[#1a1a1a] text-sm md:text-base leading-tight mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-xs text-gray-500 mt-auto">{article.date}</p>
                    </div>
                  </div>
                );
              }

              return (
                <article key={article.id || index} className="flex flex-col md:flex-row gap-8 group">
                  <Link to={`/artikel/${article.slug}`} className="w-full md:w-[40%] block overflow-hidden rounded-xl h-64 md:h-80 shadow-sm transition-all group-hover:shadow-md">
                    <ArticleImage 
                       src={article.img} 
                       alt={article.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                       position={article.imgPosition}
                    />
                  </Link>

                  <div className="w-full md:w-[60%] flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[#0c2f3d] font-bold text-xs uppercase tracking-widest bg-[#0c2f3d]/10 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                    
                    <Link to={`/artikel/${article.slug}`}>
                      <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] leading-snug mb-3 group-hover:text-[#d6a54a] transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-600 text-lg leading-relaxed mb-6 font-serif line-clamp-3 text-justify">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 gap-4 mt-auto">
                      <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        <User size={16} /> <span>{article.author}</span>
                      </div>
                      <span className="hidden md:inline">•</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} /> <span>{article.date}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Filter className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada hasil ditemukan</h3>
            <p className="text-gray-500">Coba sesuaikan filter pencarian Anda.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-20 flex justify-center items-center gap-2">
             <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-[#0c2f3d] text-[#0c2f3d] hover:bg-[#0c2f3d] hover:text-white'} transition-colors`}>
               <ChevronLeft size={20} />
             </button>

             {Array.from({ length: totalPages }).map((_, i) => (
               <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 rounded-lg font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#0c2f3d] text-white' : 'text-[#0c2f3d] hover:bg-gray-100'}`}>
                 {i + 1}
               </button>
             ))}

             <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-[#0c2f3d] text-[#0c2f3d] hover:bg-[#0c2f3d] hover:text-white'} transition-colors`}>
               <ChevronRight size={20} />
             </button>
          </div>
        )}

      </div>

      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10"
            onClick={() => setLightboxImg(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black p-2 rounded-full transition-all"
              onClick={() => setLightboxImg(null)}
            >
              <X size={28} />
            </button>

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-4xl max-h-[85vh] flex flex-col items-center bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full bg-gray-100 flex items-center justify-center overflow-auto max-h-[70vh]">
                <img 
                  src={lightboxImg.src} 
                  alt={lightboxImg.title} 
                  className="max-w-full h-auto object-contain" 
                />
              </div>
              
              <div className="w-full bg-white p-6 flex items-center justify-between border-t border-gray-100">
                <h3 className="font-bold text-xl text-[#0c2f3d]">{lightboxImg.title}</h3>
                <a 
                  href={lightboxImg.src} 
                  download={`${lightboxImg.title}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-[#d6a54a] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#c09440] transition-colors shadow-sm"
                >
                  <Download size={18} /> Unduh Gambar
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
