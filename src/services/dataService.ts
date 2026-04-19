import { dbGet, dbSave, DB_KEYS } from './db';
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
  img: string;
  imgPosition?: string;
  content: string;
  createdAt: number;
}

const STORAGE_KEY = DB_KEYS.ARTICLES;

export const getArticles = (): Article[] => {
  return dbGet<Article[]>(STORAGE_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
};

export const getArticleBySlug = (slug: string): Article | undefined => {
  return getArticles().find(article => article.slug === slug);
};

export const saveArticle = (articleData: Partial<Article>) => {
  const articles = getArticles();
  
  if (articleData.id) {
    const index = articles.findIndex(a => a.id === articleData.id);
    if (index !== -1) {
      articles[index] = { ...articles[index], ...articleData } as Article;
    }
  } else {
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const now = new Date();
    // Default today string if none provided
    const todayStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    
    const finalDate = articleData.date || todayStr;
    const yearFromDate = finalDate.split(' ').pop() || now.getFullYear().toString();

    const newArticle: Article = {
      id: uuidv4(),
      slug: (articleData.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      title: articleData.title || 'Tanpa Judul',
      excerpt: articleData.excerpt || '',
      category: articleData.category || 'Umum',
      author: articleData.author || 'Admin',
      date: finalDate,
      year: yearFromDate,
      readTime: '3 min read',
      img: articleData.img || '',
      imgPosition: articleData.imgPosition || 'center',
      content: articleData.content || '',
      createdAt: Date.now(),
    };
    articles.push(newArticle);
  }

  dbSave(STORAGE_KEY, articles);
};

export const deleteArticle = (id: string) => {
  const articles = getArticles().filter(a => a.id !== id);
  dbSave(STORAGE_KEY, articles);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
