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
}

const STORAGE_KEY = DB_KEYS.ARTICLES;

// 1. Dapatkan artikel (Selalu ambil dari LocalStorage untuk kecepatan, tapi nanti ada fungsi sinkronisasi)
export const getArticles = (): Article[] => {
  return dbGet<Article[]>(STORAGE_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
};

// 2. SINKRONISASI: Ambil data terbaru dari Supabase dan simpan ke Local
export const refreshArticles = async (): Promise<Article[]> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    
    if (data && data.length > 0) {
      dbSave(STORAGE_KEY, data);
      return data;
    }
    
    // Auto-Migration
    const localArticles = getArticles();
    if (localArticles.length > 0) {
      const toInsert = localArticles.map(a => pick(a, [
        'id', 'slug', 'title', 'excerpt', 'category', 'author', 
        'date', 'year', 'readTime', 'img', 'imgPosition', 'createdAt'
      ]));
      await supabase.from('articles').upsert(toInsert);
    }

    return localArticles;
  } catch (err) {
    console.error('Failed to sync with Supabase:', err);
    return getArticles();
  }
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
  return getArticles().find(article => article.slug === slug);
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

    updatedArticle = {
      id: uuidv4(),
      slug: (cleanData.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
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

  // Simpan ke Local
  dbSave(STORAGE_KEY, articles);
  
  // Simpan ke Supabase (Cloud) dengan data bersih
  try {
    const toSave = pick(updatedArticle, [
      'id', 'slug', 'title', 'excerpt', 'category', 'author', 
      'date', 'year', 'readTime', 'img', 'imgPosition', 'createdAt'
    ]);
    await supabase.from('articles').upsert(toSave);
  } catch (err) {
    console.error('Cloud save failed, data kept in local:', err);
  }
};

export const deleteArticle = async (id: string) => {
  const articles = getArticles().filter(a => a.id !== id);
  dbSave(STORAGE_KEY, articles);
  
  try {
    await supabase.from('articles').delete().eq('id', id);
  } catch (err) {
    console.error('Cloud delete failed:', err);
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
