import { ChevronLeft, User, Calendar, Clock, Share2, Bookmark, Check, X, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useParams } from 'react-router';
import { getArticleBySlug, incrementArticleViews } from '../services/dataService';
import { supabase } from '../services/supabase';
import { useState, useEffect, useMemo } from 'react';
import SafeImage from '../components/SafeImage';


export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(getArticleBySlug(slug || ''));
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [lightboxData, setLightboxData] = useState<{title: string, images: string[], currentIndex: number} | null>(null);

  const isGalleryType = article && ['Galeri', 'Galeri Perpus Keliling'].includes(article.category);
  const galleryImages = useMemo(() => {
    if (!isGalleryType || !article?.content) return [];
    try {
      const parsed = JSON.parse(article.content);
      return Array.isArray(parsed) ? [article.img, ...parsed] : [article.img];
    } catch {
      return [article.img];
    }
  }, [article, isGalleryType]);

  // Ambil data utuh (beserta Content) langsung dari Cloud!
  useEffect(() => {
    const fetchFullArticle = async () => {
      setIsLoadingContent(true);
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .single();
          
        if (data && !error) {
          setArticle(data);
          // Increment views setelah data full berhasil di-load
          incrementArticleViews(data.id);
        } else if (!article) {
          // Fallback lokal jika cloud gagal
          const localArticle = getArticleBySlug(slug || '');
          setArticle(localArticle);
          if (localArticle) incrementArticleViews(localArticle.id);
        }
      } catch (err) {
        console.error("Gagal mendapatkan artikel full:", err);
      } finally {
        setIsLoadingContent(false);
      }
    };
    
    if (slug) fetchFullArticle();
  }, [slug]);

  // Subscribe to database changes
  useEffect(() => {
    const handleDbChange = () => {
      const updated = getArticleBySlug(slug || '');
      if (updated) setArticle((prev: any) => ({ ...prev, views: updated.views }));
    };
    window.addEventListener('dbChange', handleDbChange);
    return () => window.removeEventListener('dbChange', handleDbChange);
  }, [slug]);

  useEffect(() => {
    if (article) {
      const saved = JSON.parse(localStorage.getItem('disipusda_bookmarks') || '[]');
      setIsBookmarked(saved.includes(article.id));
    }
  }, [article]);

  const toggleBookmark = () => {
    if (!article) return;
    const saved = JSON.parse(localStorage.getItem('disipusda_bookmarks') || '[]');
    let newList;
    if (isBookmarked) {
      newList = saved.filter((id: string) => id !== article.id);
    } else {
      newList = [...saved, article.id];
    }
    localStorage.setItem('disipusda_bookmarks', JSON.stringify(newList));
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (!article) return;
    const shareData = {
      title: article.title,
      text: `Baca artikel menarik: ${article.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus(true);
        setTimeout(() => setShareStatus(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (!article) {
    return (
      <div className="bg-white min-h-screen pt-32 pb-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Artikel tidak ditemukan</h1>
        <Link to="/artikel" className="text-blue-500 hover:underline">Kembali ke daftar artikel</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      {/* Container for Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <div className="mb-10">
          <Link to="/artikel" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0c2f3d]">
            <ChevronLeft size={16} className="mr-1" /> Kembali ke Artikel
          </Link>
        </div>

        {/* Title Block */}
        <header className="mb-10 text-center md:text-left">
          <div className="mb-4">
            <span className="text-[#d6a54a] font-bold text-xs uppercase tracking-widest bg-[#d6a54a]/10 px-3 py-1 rounded-full">
              {article.category}
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] leading-tight mb-6">
            {article.title}
          </h1>
          
          <div className="flex flex-col md:flex-row items-center justify-between border-y border-gray-100 py-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                <User size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm">{article.author}</p>
                <div className="flex items-center text-xs text-gray-500 gap-2 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button 
                 onClick={handleShare}
                 className={`p-3 rounded-full transition-all flex items-center gap-2 text-sm font-bold ${
                   shareStatus ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400 hover:bg-[#0c2f3d]/5 hover:text-[#0c2f3d]'
                 }`}
               >
                 {shareStatus ? <Check size={18} /> : <Share2 size={18} />}
                 <span className="hidden md:inline">{shareStatus ? 'Link Disalin' : 'Share'}</span>
               </button>
               
               <button 
                 onClick={toggleBookmark}
                 className={`p-3 rounded-full transition-all flex items-center gap-2 text-sm font-bold ${
                   isBookmarked ? 'bg-[#d6a54a]/10 text-[#d6a54a]' : 'bg-gray-50 text-gray-400 hover:bg-[#0c2f3d]/5 hover:text-[#0c2f3d]'
                 }`}
               >
                 <Bookmark size={18} className={isBookmarked ? 'fill-current' : ''} />
                 <span className="hidden md:inline">{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
               </button>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <figure className="mb-12">
          <div className="w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
            {article.img ? (
              <SafeImage 
                src={article.img} 
                alt={article.title} 
                className="w-full h-full object-cover"
                style={{ objectPosition: article.imgPosition || 'center' }}
              />
            ) : (
               <div className="text-gray-400">Gambar tidak tersedia</div>
            )}
          </div>
        </figure>

        {/* Content Body / Gallery Grid */}
        {isGalleryType ? (
          <div className="mt-8">
            <h3 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-6">Koleksi Foto ({galleryImages.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {galleryImages.map((src: string, i: number) => (
                 <div 
                   key={i} 
                   onClick={() => setLightboxData({ title: article.title, images: galleryImages, currentIndex: i })}
                   className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
                 >
                   <SafeImage src={src} alt={`${article.title} - ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 backdrop-blur-sm text-[#0c2f3d] px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Lihat Penuh</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        ) : (
          <div 
            className="prose prose-lg md:prose-xl max-w-none prose-p:font-serif prose-p:leading-relaxed prose-p:text-gray-800 prose-headings:font-serif prose-headings:text-[#1a1a1a] prose-a:text-[#d6a54a]"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        {/* Footer Article tags */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap gap-2">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer">#{article.category.replace(/\s+/g, '')}</span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer">#Disipusda</span>
        </div>

      </article>

      {/* Lightbox Slider */}
      <AnimatePresence>
        {lightboxData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center bg-black/95 backdrop-blur-md p-4 md:p-10 overflow-hidden pt-20"
            onClick={() => setLightboxData(null)}
          >
            <button 
              className="fixed top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all z-[110]"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxData(null);
              }}
            >
              <X size={28} />
            </button>

            <div 
              className="relative w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxData.images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxData(prev => prev ? {
                        ...prev,
                        currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                      } : null);
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxData(prev => prev ? {
                        ...prev,
                        currentIndex: (prev.currentIndex + 1) % prev.images.length
                      } : null);
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}

              <motion.div 
                key={lightboxData.currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative max-w-5xl w-full h-[75vh] flex flex-col items-center justify-center p-4"
              >
                <SafeImage 
                  src={lightboxData.images[lightboxData.currentIndex]} 
                  alt={lightboxData.title} 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                />
              </motion.div>
              
              <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center gap-2 mt-4">
                 <h3 className="font-bold text-lg text-white text-center">{lightboxData.title}</h3>
                 
                 {lightboxData.images.length > 1 && (
                   <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-xs">
                      {lightboxData.images.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === lightboxData.currentIndex ? 'bg-[#d6a54a] w-4' : 'bg-white/30'}`} />
                      ))}
                   </div>
                 )}

                 <a 
                   href={lightboxData.images[lightboxData.currentIndex]} 
                   download={`${lightboxData.title}-${lightboxData.currentIndex + 1}.jpg`}
                   target="_blank"
                   rel="noreferrer"
                   className="mt-2 flex items-center gap-2 bg-[#d6a54a] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#c09440] transition-transform hover:scale-105 shadow-lg"
                 >
                   <Download size={20} /> Unduh Gambar
                 </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
