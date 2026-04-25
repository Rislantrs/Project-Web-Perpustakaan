import { dbSave, DB_KEYS } from './db';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeObject } from '../utils/security';
import { supabase } from './supabase';
import { uploadDataUrlImage } from './storageService';

export type CategoryType = 'books';

export const ARTICLE_EDITOR_CATEGORIES = [
  'Berita Terkini',
  'Pojok Carita',
  'Kedinasan',
  'Media Mewarnai',
  'Perpus Keliling',
  'Serba-serbi Purwakarta',
  'Edukasi',
  'Statistik',
] as const;

export const ARTICLE_CATEGORIES = [
  ...ARTICLE_EDITOR_CATEGORIES,
  'Galeri',
  'Galeri Perpus Keliling',
  'Video Terkini',
] as const;

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  createdAt?: string;
}

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

const ARTICLE_LIST_COLUMNS = 'id, slug, title, excerpt, category, author, date, year, readTime, img, imgPosition, createdAt';
const failedArticleImageMigrationIds = new Set<string>();

const STORAGE_KEY = DB_KEYS.ARTICLES;
const CATEGORY_STORAGE_KEY = DB_KEYS.CATEGORIES;
const DEFAULT_BOOK_CATEGORIES: Category[] = [
  { id: 'cat-book-1', name: 'Fiksi', slug: 'fiksi', type: 'books' },
  { id: 'cat-book-2', name: 'Non-Fiksi', slug: 'non-fiksi', type: 'books' },
  { id: 'cat-book-3', name: 'Sejarah', slug: 'sejarah', type: 'books' },
  { id: 'cat-book-4', name: 'Sains & Teknologi', slug: 'sains-teknologi', type: 'books' },
  { id: 'cat-book-5', name: 'Agama & Spiritualitas', slug: 'agama-spiritualitas', type: 'books' },
  { id: 'cat-book-6', name: 'Anak-Anak', slug: 'anak-anak', type: 'books' },
  { id: 'cat-book-7', name: 'Sastra Sunda', slug: 'sastra-sunda', type: 'books' },
  { id: 'cat-book-8', name: 'Referensi', slug: 'referensi', type: 'books' },
  { id: 'cat-book-9', name: 'Biografi', slug: 'biografi', type: 'books' },
  { id: 'cat-book-10', name: 'Pendidikan', slug: 'pendidikan', type: 'books' },
];

// 1. Dapatkan artikel (Cache lokal ringan untuk load instan)
let memoryCache: Article[] = [];
try {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed && Array.isArray(parsed)) memoryCache = parsed;
  }
} catch (e) {
  console.warn('Failed to parse cached articles');
}

let categoryCache: Category[] = [];
try {
  const cachedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
  if (cachedCategories) {
    const parsed = JSON.parse(cachedCategories);
    if (parsed && Array.isArray(parsed)) categoryCache = parsed;
  }
} catch (e) {
  console.warn('Failed to parse cached categories');
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const seedCategories = (): Category[] => [...DEFAULT_BOOK_CATEGORIES];

const normalizeCategory = (row: Partial<Category>): Category => ({
  id: row.id || '',
  name: row.name || '',
  slug: row.slug || '',
  type: 'books',
  createdAt: row.createdAt,
});

export const getCategories = (_type: CategoryType = 'books'): Category[] => {
  const source = categoryCache.length > 0 ? categoryCache : seedCategories();
  return [...source].sort((a, b) => a.name.localeCompare(b.name, 'id'));
};

export const refreshCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'books')
      .order('name', { ascending: true });

    if (error) throw error;

    if (data) {
      categoryCache = (data as Category[]).map(normalizeCategory);
      try {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categoryCache));
      } catch (err) {
        console.warn('Failed to cache categories', err);
      }
      return categoryCache;
    }
  } catch (err) {
    console.error('Failed to sync categories:', err);
  }

  return getCategories();
};

export const addCategory = async (data: { name: string; type: CategoryType; slug?: string }, requestedByAdminId?: string): Promise<{ success: boolean; message: string; category?: Category }> => {
  if (!requestedByAdminId) return { success: false, message: 'Akses ditolak: Hanya admin yang dapat menambah kategori.' };
  if (data.type !== 'books') return { success: false, message: 'Kategori dinamis hanya tersedia untuk katalog buku.' };

  const name = data.name.trim();
  if (!name) return { success: false, message: 'Nama kategori tidak boleh kosong.' };

  const slug = slugify(data.slug || name);
  const existing = getCategories('books').find(category => category.slug === slug || category.name.toLowerCase() === name.toLowerCase());
  if (existing) return { success: false, message: 'Kategori dengan nama yang sama sudah ada.' };

  const category: Category = {
    id: `cat-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name,
    slug,
    type: 'books',
    createdAt: new Date().toISOString(),
  };

  const nextCategories = [...getCategories('books'), category];
  categoryCache = nextCategories;
  dbSave(CATEGORY_STORAGE_KEY, nextCategories);

  try {
    const { error } = await supabase.from('categories').upsert(category);
    if (error) throw error;
    return { success: true, message: 'Kategori berhasil ditambahkan.', category };
  } catch (err: any) {
    return { success: false, message: 'Gagal sinkron kategori ke Cloud: ' + err.message };
  }
};

export const deleteCategory = async (id: string, requestedByAdminId?: string): Promise<{ success: boolean; message: string }> => {
  if (!requestedByAdminId) return { success: false, message: 'Akses ditolak: Hanya admin yang dapat menghapus kategori.' };

  const nextCategories = getCategories().filter(category => category.id !== id);
  categoryCache = nextCategories;
  dbSave(CATEGORY_STORAGE_KEY, nextCategories);

  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Kategori berhasil dihapus.' };
  } catch (err: any) {
    return { success: false, message: 'Gagal menghapus kategori di Cloud: ' + err.message };
  }
};

export const getArticles = (): Article[] => {
  return memoryCache.sort((a, b) => b.createdAt - a.createdAt);
};

export interface ArticleListQueryOptions {
  from?: number;
  to?: number;
  category?: string;
  year?: string;
  search?: string;
}

const isBase64Image = (value?: string) => !!value && value.startsWith('data:image/');

const migrateArticleImageIfNeeded = async (article: Article): Promise<Article> => {
  if (!isBase64Image(article.img) || failedArticleImageMigrationIds.has(article.id)) {
    return article;
  }

  try {
    const url = await uploadDataUrlImage(article.img, { bucket: 'articles', folder: 'article-covers' });
    const { error } = await supabase.from('articles').update({ img: url }).eq('id', article.id);
    if (error) throw error;
    return { ...article, img: url };
  } catch (err) {
    console.error(`Migrasi gambar article gagal untuk id ${article.id}:`, err);
    failedArticleImageMigrationIds.add(article.id);
    return article;
  }
};

const migrateArticleImageBatch = async (rows: Article[]): Promise<Article[]> => {
  const migrated: Article[] = [];
  for (const row of rows) {
    migrated.push(await migrateArticleImageIfNeeded(row));
  }
  return migrated;
};

const applyArticleListFilters = (
  query: any,
  options: ArticleListQueryOptions = {}
) => {
  const { category, year, search } = options;

  if (category && category !== 'Semua Kategori') {
    query = query.eq('category', category);
  }

  if (year) {
    query = query.eq('year', year);
  }

  const q = search?.trim();
  if (q) {
    const escaped = q.replace(/,/g, ' ');
    query = query.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%,category.ilike.%${escaped}%`);
  }

  return query;
};

export const fetchArticlesPage = async (options: ArticleListQueryOptions = {}): Promise<Article[]> => {
  const from = options.from ?? 0;
  const to = options.to ?? 9;

  let query = supabase
    .from('articles')
    .select(ARTICLE_LIST_COLUMNS)
    .order('createdAt', { ascending: false })
    .range(from, to);

  query = applyArticleListFilters(query, options);

  const { data, error } = await query;
  if (error) throw error;
  return migrateArticleImageBatch((data || []) as Article[]);
};

// 2. SINKRONISASI murni dari Cloud (Tanpa simpan 30MB ke LocalStorage Browser)
export const refreshArticles = async (): Promise<Article[]> => {
  try {
    // Jangan hapus cache lama di sini agar UI tidak berkedip kosong saat memuat
    // localStorage.removeItem(STORAGE_KEY);

    // JANGAN ambil kolom "content" karena bisa puluhan Megabyte (bikin timeout)
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_LIST_COLUMNS)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    if (data) {
      memoryCache = await migrateArticleImageBatch(data as Article[]);
      // Simpan versi ringan (tanpa content/base64) ke LocalStorage untuk load instan berikutnya
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
      } catch (e) {
        console.warn('Cache too large to save', e);
      }

      // Beri tahu halaman agar me-render ulang dengan data Supabase 100% terbaru
      window.dispatchEvent(new CustomEvent('dbChange', { detail: { key: STORAGE_KEY } }));
      return memoryCache;
    }
  } catch (err) {
    console.error('Failed to sync with Supabase:', err);
  }
  return memoryCache;
};

export const refreshLatestArticles = async (limit: number = 10): Promise<Article[]> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_LIST_COLUMNS)
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) throw error;

    if (data) {
      memoryCache = await migrateArticleImageBatch(data as Article[]);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
      } catch (e) {
        console.warn('Cache too large to save', e);
      }

      window.dispatchEvent(new CustomEvent('dbChange', { detail: { key: STORAGE_KEY } }));
      return memoryCache;
    }
  } catch (err) {
    console.error('Failed to sync latest articles:', err);
  }

  return memoryCache;
};

export const refreshHomeArticles = async (): Promise<Article[]> => {
  try {
    // Ambil 5 Berita dan 5 Cerita secara paralel (Lebih cepat & hemat)
    const [newsRes, storiesRes] = await Promise.all([
      supabase.from('articles').select(ARTICLE_LIST_COLUMNS).eq('category', 'Berita Terkini').order('createdAt', { ascending: false }).limit(5),
      supabase.from('articles').select(ARTICLE_LIST_COLUMNS).eq('category', 'Pojok Carita').order('createdAt', { ascending: false }).limit(5)
    ]);

    const allData = [...(newsRes.data || []), ...(storiesRes.data || [])];
    
    if (allData.length > 0) {
      // Merge dengan data lama di memory (agar tidak hilang kategori lain)
      const existingIds = new Set(allData.map(a => a.id));
      const otherArticles = memoryCache.filter(a => !existingIds.has(a.id));
      
      memoryCache = await migrateArticleImageBatch([...allData, ...otherArticles] as Article[]);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
      } catch (e) {
        console.warn('Cache too large to save', e);
      }

      window.dispatchEvent(new CustomEvent('dbChange', { detail: { key: STORAGE_KEY } }));
      return memoryCache;
    }
  } catch (err) {
    console.error('Failed to sync home articles:', err);
  }
  return memoryCache;
};

export const migrateLegacyArticleImages = async () => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, img')
      .like('img', 'data:image/%');

    if (error || !data || data.length === 0) return;

    for (const row of data) {
      const local = memoryCache.find(a => a.id === row.id);
      const article = {
        id: row.id,
        slug: local?.slug || '',
        title: local?.title || '',
        excerpt: local?.excerpt || '',
        category: local?.category || '',
        author: local?.author || '',
        date: local?.date || '',
        year: local?.year || '',
        readTime: local?.readTime || '',
        img: row.img || '',
        imgPosition: local?.imgPosition,
        content: local?.content || '',
        createdAt: local?.createdAt || Date.now(),
        views: local?.views,
      } as Article;
      await migrateArticleImageIfNeeded(article);
    }
  } catch (err) {
    console.error('Migrasi gambar artikel legacy gagal:', err);
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

export const saveArticle = async (articleData: Partial<Article>, requestedByAdminId?: string) => {
  // === BACKEND VALIDATION: Admin-only operation ===
  if (!requestedByAdminId) throw new Error('Akses ditolak: Hanya admin yang dapat menyimpan artikel.');
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
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
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

  // Update local memoryCache dan persist ke LocalStorage agar tidak hilang saat refresh (Instant UI)
  memoryCache = articles;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache.map(a => ({ ...a, content: undefined }))));
  } catch (e) {
    console.warn('Failed to update local cache', e);
  }
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

export const deleteArticle = async (id: string, requestedByAdminId?: string) => {
  // === BACKEND VALIDATION: Admin-only operation ===
  if (!requestedByAdminId) throw new Error('Akses ditolak: Hanya admin yang dapat menghapus artikel.');
  // Update local memoryCache dan persist ke LocalStorage
  memoryCache = getArticles().filter(a => a.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache.map(a => ({ ...a, content: undefined }))));
  } catch (e) {
    console.warn('Failed to update local cache after delete', e);
  }
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
