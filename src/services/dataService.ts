import { v4 as uuidv4 } from 'uuid';

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
  img: string; // Base64 or URL
  content: string; // HTML content from Rich Text Editor
  createdAt: number;
}

const STORAGE_KEY = 'disipusda_articles';

// Initialize with some default data if empty
const initData = () => {
  const existingStr = localStorage.getItem(STORAGE_KEY);
  if (!existingStr) {
    const defaultArticles: Article[] = [
      {
        id: uuidv4(),
        slug: 'pembinaan-kearsipan-desa-2024',
        title: 'Pembinaan Kearsipan Desa Secara Daring 2024',
        excerpt: 'Pemerintah desa adalah salah satu entitas pemerintahan yang memiliki tanggung jawab besar. Kegiatan ini bertujuan memastikan tata kelola arsip desa menjadi lebih baik menuju tata pemerintahan yang transparan.',
        category: 'Kedinasan',
        author: 'Desi Hendriyani, STP, MP',
        date: '12 Maret 2024',
        year: '2024',
        readTime: '4 min read',
        img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800',
        content: '<p>Pemerintah desa adalah salah satu entitas pemerintahan yang memiliki tanggung jawab besar. Kegiatan ini bertujuan memastikan tata kelola arsip desa menjadi lebih baik menuju tata pemerintahan yang transparan. Kearsipan merujuk pada segala sesuatu yang berhubungan dengan penciptaan, pemeliharaan, dan penyusutan arsip.</p>',
        createdAt: Date.now()
      },
      {
        id: uuidv4(),
        slug: 'merawat-ingatan-melalui-bale',
        title: 'Merawat Ingatan Melalui Bale',
        excerpt: 'Sebuah catatan dari Pojok Carita mengenai pentingnya melestarikan peninggalan masa lalu melalui literasi dan dokumentasi.',
        category: 'Pojok Carita',
        author: 'Tim Kreatif Perpus',
        date: '10 Februari 2024',
        year: '2024',
        readTime: '3 min read',
        img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800',
        content: '<p>Sebuah catatan dari Pojok Carita mengenai pentingnya melestarikan peninggalan masa lalu melalui literasi dan dokumentasi. Melalui Bale, kita dapat mengajarkan nilai-nilai lokal kepada generasi penerus.</p>',
        createdAt: Date.now() - 100000
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultArticles));
    return defaultArticles;
  }
  return JSON.parse(existingStr) as Article[];
};

export const getArticles = (): Article[] => {
  return initData().sort((a, b) => b.createdAt - a.createdAt);
};

export const getArticleBySlug = (slug: string): Article | undefined => {
  const articles = getArticles();
  return articles.find(a => a.slug === slug);
};

export const saveArticle = (articleContent: Partial<Article>) => {
  const articles = getArticles();
  
  // Format Date if new
  const now = new Date();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  if (articleContent.id) {
    // Update
    const idx = articles.findIndex(a => a.id === articleContent.id);
    if (idx !== -1) {
      articles[idx] = { ...articles[idx], ...articleContent } as Article;
    }
  } else {
    // Create
    const titleSlug = (articleContent.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newArticle: Article = {
      id: uuidv4(),
      slug: `${titleSlug}-${Math.floor(Math.random() * 1000)}`,
      title: articleContent.title || '',
      excerpt: articleContent.excerpt || '',
      category: articleContent.category || 'Berita Terkini',
      author: articleContent.author || 'Admin',
      date: articleContent.date || `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      year: articleContent.year || String(now.getFullYear()),
      readTime: articleContent.readTime || '3 min read',
      img: articleContent.img || 'https://via.placeholder.com/800x400?text=No+Image',
      content: articleContent.content || '',
      createdAt: Date.now(),
    };
    articles.push(newArticle);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
};

export const deleteArticle = (id: string) => {
  let articles = getArticles();
  articles = articles.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
};

// Handle file base64 convert for localstorage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
