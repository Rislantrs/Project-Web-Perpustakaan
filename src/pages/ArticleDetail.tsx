import { ChevronLeft, User, Calendar, Clock, Share2, Bookmark, Check } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { getArticleBySlug } from '../services/dataService';
import { supabase } from '../services/supabase';
import { useState, useEffect } from 'react';


export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(getArticleBySlug(slug || ''));
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

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
        } else if (!article) {
          // Fallback lokal jika cloud gagal
          setArticle(getArticleBySlug(slug || ''));
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
      // Hanya ganti kalau kita belum sukses narik dari cloud
      setArticle((prev: any) => prev || getArticleBySlug(slug || ''));
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
              <img 
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

        {/* Content Body */}
        <div 
          className="prose prose-lg md:prose-xl max-w-none prose-p:font-serif prose-p:leading-relaxed prose-p:text-gray-800 prose-headings:font-serif prose-headings:text-[#1a1a1a] prose-a:text-[#d6a54a]"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Footer Article tags */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap gap-2">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer">#{article.category.replace(/\s+/g, '')}</span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer">#Disipusda</span>
        </div>

      </article>
    </div>
  );
}
