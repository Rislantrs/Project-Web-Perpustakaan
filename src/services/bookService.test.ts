import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchBooks, filterBooks, type Book } from './bookService';

// Mock localStorage for Node environment
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Mock data
const mockBooks: Book[] = [
  {
    id: '1',
    judul: 'Laskar Pelangi',
    penulis: 'Andrea Hirata',
    penerbit: 'Bentang Pustaka',
    tahun: 2005,
    kategori: 'Fiksi',
    isbn: '978-602-8811-46-8',
    cover: '',
    sinopsis: '',
    halaman: 500,
    bahasa: 'Indonesia',
    stok: 5,
    rating: 4.8,
    totalRating: 100,
  },
  {
    id: '2',
    judul: 'Bumi Manusia',
    penulis: 'Pramoedya Ananta Toer',
    penerbit: 'Hasta Mitra',
    tahun: 1980,
    kategori: 'Sejarah',
    isbn: '978-979-97312-3-4',
    cover: '',
    sinopsis: '',
    halaman: 535,
    bahasa: 'Indonesia',
    stok: 2,
    rating: 4.9,
    totalRating: 250,
  },
  {
    id: '3',
    judul: "Harry Potter and the Sorcerer's Stone",
    penulis: 'J.K. Rowling',
    penerbit: 'Scholastic',
    tahun: 1997,
    kategori: 'Fantasi',
    isbn: '978-0590353403',
    cover: '',
    sinopsis: '',
    halaman: 309,
    bahasa: 'Inggris',
    stok: 0,
    rating: 4.7,
    totalRating: 500,
  }
];


describe('bookService - Katalog dan Pencarian', () => {
  
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('disipusda_books', JSON.stringify(mockBooks));
  });

  it('seharusnya mengembalikan semua buku saat mencari dengan teks kosong', () => {
    const results = searchBooks('');
    expect(results).toHaveLength(3);
  });

  it('seharusnya menemukan buku berdasarkan judul', () => {
    const results = searchBooks('Pelangi');
    expect(results).toHaveLength(1);
    expect(results[0].judul).toBe('Laskar Pelangi');
  });

  it('seharusnya menemukan buku berdasarkan penulis', () => {
    const results = searchBooks('Pramoedya');
    expect(results).toHaveLength(1);
    expect(results[0].penulis).toBe('Pramoedya Ananta Toer');
  });

  it('seharusnya mengembalikan array kosong jika tidak ada yang cocok', () => {
    const results = searchBooks('BukuTidakAda123');
    expect(results).toHaveLength(0);
  });

  describe('filterBooks', () => {
    it('seharusnya memfilter berdasarkan kategori', () => {
      const results = filterBooks({ kategori: 'Sejarah' });
      expect(results).toHaveLength(1);
      expect(results[0].judul).toBe('Bumi Manusia');
    });

    it('seharusnya memfilter berdasarkan bahasa', () => {
      const results = filterBooks({ bahasa: 'Inggris' });
      expect(results).toHaveLength(1);
      expect(results[0].judul).toBe("Harry Potter and the Sorcerer's Stone");
    });

    it('seharusnya memfilter berdasarkan status ketersediaan (stok > 0)', () => {
      const results = filterBooks({ tersedia: true });
      expect(results).toHaveLength(2); // Harry Potter stok 0, tidak ikut
      const hasHarryPotter = results.some(b => b.id === '3');
      expect(hasHarryPotter).toBe(false);
    });

    it('seharusnya memfilter kombinasi kategori dan bahasa', () => {
      const results = filterBooks({ kategori: 'Fiksi', bahasa: 'Indonesia' });
      expect(results).toHaveLength(1);
      expect(results[0].judul).toBe('Laskar Pelangi');
    });
  });
});
