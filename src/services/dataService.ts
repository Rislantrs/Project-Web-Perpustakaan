import { dbGet, dbSave, DB_KEYS } from './db';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeObject } from '../utils/security';
import { supabase } from './supabase';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  year: string;
  readTime: string;
  img: string;
  imgPosition?: string;
  content: string;
  createdAt: number;
  views?: number;
}

const STORAGE_KEY = DB_KEYS.ARTICLES;

// 1. Dapatkan artikel (Hanya memori lokal sementara, murni sinkron dengan Cloud)
let memoryCache: Article[] = [];

export const getArticles = (): Article[] => {
  return memoryCache.sort((a, b) => b.createdAt - a.createdAt);
};

// 2. SINKRONISASI murni dari Cloud (Tanpa simpan 30MB ke LocalStorage Browser)
export const refreshArticles = async (): Promise<Article[]> => {
  try {
    // 🧹 Bersihkan LocalStorage dari beban Base64 "monster" masa lalu (yang bikin ngelag/error)!
    localStorage.removeItem(STORAGE_KEY);

    // JANGAN ambil kolom "content" karena bisa puluhan Megabyte (bikin timeout)
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, category, author, date, year, readTime, img, imgPosition, createdAt')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    
    if (data) {
      memoryCache = data as Article[];
      // Beri tahu halaman agar me-render ulang dengan data Supabase 100% terbaru
      window.dispatchEvent(new CustomEvent('dbChange', { detail: { key: STORAGE_KEY } }));
      return memoryCache;
    }
  } catch (err) {
    console.error('Failed to sync with Supabase:', err);
  }
  return memoryCache;
};

// Helper to filter object keys
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}

export const getArticleBySlug = (slug: string): Article | undefined => {
  const matches = getArticles().filter(article => article.slug === slug);
  if (matches.length === 0) return undefined;
  if (matches.length > 1) {
    // SMART RESOLUTION: Jika ada duplikat slug, prioritaskan yang isinya paling panjang
    return matches.reduce((prev, current) => 
      (prev.content || '').length > (current.content || '').length ? prev : current
    );
  }
  return matches[0];
};

export const saveArticle = async (articleData: Partial<Article>) => {
  const articles = getArticles();
  const cleanData = sanitizeObject(articleData);
  let updatedArticle: Article;
  
  if (cleanData.id) {
    const index = articles.findIndex(a => a.id === cleanData.id);
    if (index !== -1) {
      articles[index] = { ...articles[index], ...cleanData } as Article;
      updatedArticle = articles[index];
    } else {
      updatedArticle = cleanData as Article;
    }
  } else {
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const now = new Date();
    const todayStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    
    const finalDate = cleanData.date || todayStr;
    const yearFromDate = finalDate.split(' ').pop() || now.getFullYear().toString();
    const newId = uuidv4();
    
    // Batasi panjang slug asal (Max 150 karakter) agar tidak merusak index database (Error 500)
    const baseSlug = (cleanData.title || '')
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
      .substring(0, 150);

    updatedArticle = {
      id: newId,
      slug: `${baseSlug}-${newId.substring(0, 6)}`,
      title: cleanData.title || 'Tanpa Judul',
      excerpt: cleanData.excerpt || '',
      category: cleanData.category || 'Umum',
      author: cleanData.author || 'Admin',
      date: finalDate,
      year: yearFromDate,
      readTime: '3 min read',
      img: cleanData.img || '',
      imgPosition: cleanData.imgPosition || 'center',
      content: cleanData.content || '',
      createdAt: Date.now(),
    };
    articles.push(updatedArticle);
  }

  // Simpan array lokal ke memori saja tanpa menyentuh LocalStorage
  memoryCache = articles;
  window.dispatchEvent(new CustomEvent('dbChange', { detail: { key: STORAGE_KEY } }));
  
  // Simpan ke Supabase (Cloud) dengan data bersih

  // Kita petakan satu-satu biar bener-bener masuk ke kolom yang tepat
  const toSave = {
    id: updatedArticle.id,
    slug: updatedArticle.slug,
    title: updatedArticle.title,
    excerpt: updatedArticle.excerpt,
    category: updatedArticle.category,
    author: updatedArticle.author,
    date: updatedArticle.date,
    year: updatedArticle.year,
    readTime: updatedArticle.readTime,
    img: updatedArticle.img,
    imgPosition: updatedArticle.imgPosition,
    createdAt: updatedArticle.createdAt,
    content: updatedArticle.content
  };
  
  const { error } = await supabase.from('articles').upsert(toSave);
  if (error) {
    console.error('Cloud save failed:', error);
    throw new Error('Gagal menyimpan ke Cloud: ' + error.message);
  }
};

export const deleteArticle = async (id: string) => {
  memoryCache = getArticles().filter(a => a.id !== id);
  window.dispatchEvent(new CustomEvent('dbChange', { detail: { key: STORAGE_KEY } }));
  
  try {
    await supabase.from('articles').delete().eq('id', id);
  } catch (err) {
    console.error('Cloud delete failed:', err);
  }
};

export const incrementArticleViews = async (id: string) => {
  // Update lokal
  const article = memoryCache.find(a => a.id === id);
  if (article) {
    article.views = (article.views || 0) + 1;
    // Debounce/Throttling dispatch agar tidak terlalu boros render
    window.dispatchEvent(new CustomEvent('dbChange', { detail: { key: STORAGE_KEY } }));
    
    // Update Cloud
    try {
      await supabase.rpc('increment_article_views', { article_id: id });
    } catch (err) {
      // Jika RPC belum terpasang, coba upsert biasa (kurang atomik tapi aman sebagai fallback)
      await supabase.from('articles').update({ views: article.views }).eq('id', id);
    }
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // --- AUTO COMPRESSION LOGIC ---
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // Resize agar tidak terlalu besar
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Simpan dengan kualitas 0.7 (Format WebP agar super ringan)
        const compressedBase64 = canvas.toDataURL('image/webp', 0.7);
        resolve(compressedBase64);
      };
    };
    reader.onerror = error => reject(error);
  });
};
