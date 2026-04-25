import { Link, useSearchParams } from 'react-router';
import { ChevronRight, Calendar, User, Search, Filter, X, Download, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchArticlesPageWithCount, Article, ARTICLE_CATEGORIES } from '../services/dataService';



export default function BlogList() {
  const PAGE_SIZE = 10;
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('kategori') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);

  // Search Debouncing: Tunggu 300ms sebelum mulai menyaring data
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [selectedYear, setSelectedYear] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    setSelectedCategory(searchParams.get('kategori') || '');
  }, [searchParams]);

  const [lightboxImg, setLightboxImg] = useState<{src: string, title: string} | null>(null);

  const isGridMode = ['Media Mewarnai', 'Galeri', 'Galeri Perpus Keliling', 'Video Terkini'].includes(selectedCategory || urlCategory);

  const activeCategory = useMemo(() => {
    const category = selectedCategory || urlCategory;
    return category === 'Semua Kategori' ? '' : category;
  }, [selectedCategory, urlCategory]);

  const loadArticlesPage = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const result = await fetchArticlesPageWithCount({
        from,
        to,
        category: activeCategory || undefined,
        year: selectedYear || undefined,
        search: debouncedSearchQuery || undefined,
      });

      setArticles(result.items);
      setTotalArticles(result.total);
    } catch (error) {
      console.error('Failed to fetch paginated articles:', error);
      setArticles([]);
      setTotalArticles(0);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, selectedYear, debouncedSearchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedYear, debouncedSearchQuery]);

  useEffect(() => {
    loadArticlesPage(currentPage);
  }, [loadArticlesPage, currentPage]);

  useEffect(() => {
    const onDbChange = () => {
      loadArticlesPage(currentPage);
    };
    window.addEventListener('dbChange', onDbChange);
    return () => window.removeEventListener('dbChange', onDbChange);
  }, [loadArticlesPage, currentPage]);

  // Ambil daftar tahun unik dari semua artikel untuk filter
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    if (!articles) return [];
    articles.forEach(a => {
      if (a && a.year) years.add(a.year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [articles]);

  const filteredArticles = articles;
  const totalPages = Math.max(1, Math.ceil(totalArticles / PAGE_SIZE));

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: Array<number | '...'> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('...');
    for (let page = start; page <= end; page += 1) pages.push(page);
    if (end < totalPages - 1) pages.push('...');

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

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
        loading="lazy"
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
              onChange={(e) => { setSearchQuery(e.target.value); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d6a54a] focus:ring-1 focus:ring-[#d6a54a]"
            />
          </div>

          <div className="flex gap-4">
            <select 
              value={selectedCategory || urlCategory} 
              onChange={(e) => { setSelectedCategory(e.target.value); }}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#d6a54a] text-gray-700"
            >
              <option value="Semua Kategori">Semua Kategori</option>
              {ARTICLE_CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select 
              value={selectedYear} 
              onChange={(e) => { setSelectedYear(e.target.value); }}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#d6a54a] text-gray-700 w-32"
            >
              <option value="">Tahun</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && filteredArticles.length === 0 ? (
          <div className={isGridMode ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-16 max-w-5xl mx-auto"}>
            {Array.from({ length: isGridMode ? 8 : 4 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className={isGridMode ? 'aspect-square bg-gray-100' : 'h-64 md:h-80 bg-gray-100'} />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-4/5 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className={isGridMode ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-16 max-w-5xl mx-auto"}>
            {filteredArticles.map((article, index) => {
              if (isGridMode) {
                return (
                  <div 
                    key={article.id || index} 
                    onClick={(e) => {
                      if (article.category === 'Media Mewarnai') {
                        e.preventDefault();
                        setLightboxImg({ src: article.img, title: article.title });
                      }
                    }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col h-full"
                  >
                    <Link to={`/artikel/${article.slug}`} className="flex flex-col h-full">
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
                    </Link>
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

        {filteredArticles.length > 0 && totalPages > 1 && (
          <div className="mt-14 rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:px-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-600">
                Halaman <span className="font-bold text-[#0c2f3d]">{currentPage}</span> dari <span className="font-bold text-[#0c2f3d]">{totalPages}</span>
                <span className="text-gray-400"> • </span>
                <span>{totalArticles} artikel</span>
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 min-w-10 px-3 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-[#0c2f3d] hover:text-white hover:border-[#0c2f3d] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {visiblePages.map((page, index) => (
                  page === '...'
                    ? <span key={`ellipsis-${index}`} className="w-10 text-center text-gray-400">...</span>
                    : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-10 min-w-10 px-3 rounded-xl text-sm font-bold transition-colors ${currentPage === page
                          ? 'bg-[#0c2f3d] text-white shadow-md'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    )
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 min-w-10 px-3 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-[#0c2f3d] hover:text-white hover:border-[#0c2f3d] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center bg-black/90 backdrop-blur-sm p-4 md:p-10 overflow-y-auto pt-20"
            onClick={() => setLightboxImg(null)}
          >
            <button 
              className="fixed top-6 right-6 text-white bg-black/50 hover:bg-black p-2.5 rounded-full transition-all z-[110]"
              onClick={() => setLightboxImg(null)}
            >
              <X size={28} />
            </button>

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-4xl w-full flex flex-col items-center bg-white rounded-xl overflow-hidden shadow-2xl mb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full bg-gray-100 flex items-center justify-center overflow-auto max-h-[70vh]">
                <img 
                  src={lightboxImg.src} 
                  alt={lightboxImg.title} 
                  className="max-w-full h-auto object-contain" 
                />
              </div>
              
              <div className="w-full bg-white p-5 flex items-center justify-between border-t border-gray-100">
                 <h3 className="font-bold text-lg text-[#0c2f3d]">{lightboxImg.title}</h3>
                 <a 
                   href={lightboxImg.src} 
                   download={`${lightboxImg.title}.jpg`}
                   target="_blank"
                   rel="noreferrer"
                   className="flex items-center gap-2 bg-[#d6a54a] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#c09440] transition-colors"
                 >
                   <Download size={18} /> Unduh
                 </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
