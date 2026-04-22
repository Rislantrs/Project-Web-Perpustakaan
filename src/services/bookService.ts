// Book Service — Complete book catalog & borrowing system for Disipusda Perpustakaan

export interface Book {
  id: string;
  judul: string;
  penulis: string;
  penerbit: string;
  tahun: number;
  kategori: string;
  isbn: string;
  cover: string;
  sinopsis: string;
  halaman: number;
  bahasa: string;
  stok: number;
  rating: number;
  totalRating: number;
  isRecommended?: boolean;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  memberId: string;
  memberName: string;
  bookTitle: string;
  tanggalPinjam: string;
  tanggalKembali: string;
  batasAmbil: string; // Deadline pengambilan 1x24 jam
  tanggalDikembalikan?: string;
  status: 'menunggu_diambil' | 'dipinjam' | 'dikembalikan' | 'terlambat' | 'batal';
}

export interface QueueRecord {
  id: string;
  bookId: string;
  memberId: string;
  memberName: string;
  bookTitle: string;
  nomorAntrian: number;
  tanggalAntri: string;
  status: 'menunggu' | 'siap' | 'dibatalkan';
}

const BOOKS_KEY = 'disipusda_books';
const BORROWS_KEY = 'disipusda_borrows';
const QUEUE_KEY = 'disipusda_queue';

export const CATEGORIES = [
  'Semua',
  'Fiksi',
  'Non-Fiksi',
  'Sejarah',
  'Sains & Teknologi',
  'Agama & Spiritualitas',
  'Anak-Anak',
  'Sastra Sunda',
  'Referensi',
  'Biografi',
  'Pendidikan',
];

const defaultBooks: Book[] = [
  // === FIKSI ===
  {
    id: 'bk001', judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', penerbit: 'Bentang Pustaka', tahun: 2005,
    kategori: 'Fiksi', isbn: '978-979-3062-79-4', halaman: 529, bahasa: 'Indonesia', stok: 5, rating: 4.8, totalRating: 324,
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kisah inspiratif tentang perjuangan 10 anak dari keluarga miskin di Belitung yang berjuang untuk mendapatkan pendidikan layak. Novel ini mengajarkan tentang semangat pantang menyerah dan kekuatan mimpi.',
    isRecommended: true,
  },
  {
    id: 'bk002', judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', penerbit: 'Hasta Mitra', tahun: 1980,
    kategori: 'Fiksi', isbn: '978-979-9731-08-0', halaman: 535, bahasa: 'Indonesia', stok: 3, rating: 4.9, totalRating: 512,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Tetralogi Buru pertama yang mengisahkan Minke, seorang pemuda pribumi yang berusaha memperjuangkan kesetaraan di era kolonial Belanda. Sebuah mahakarya sastra Indonesia.',
    isRecommended: true,
  },
  {
    id: 'bk003', judul: 'Cantik Itu Luka', penulis: 'Eka Kurniawan', penerbit: 'Gramedia', tahun: 2002,
    kategori: 'Fiksi', isbn: '978-602-03-2850-0', halaman: 520, bahasa: 'Indonesia', stok: 4, rating: 4.6, totalRating: 189,
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Sebuah novel epik yang menceritakan kehidupan Dewi Ayu, seorang perempuan cantik yang hidup melewati era kolonial, pendudukan Jepang, dan kemerdekaan Indonesia.',
  },
  {
    id: 'bk004', judul: 'Ronggeng Dukuh Paruk', penulis: 'Ahmad Tohari', penerbit: 'Gramedia', tahun: 1982,
    kategori: 'Fiksi', isbn: '978-979-22-4052-8', halaman: 408, bahasa: 'Indonesia', stok: 0, rating: 4.7, totalRating: 256,
    cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Trilogi epik tentang Srintil, seorang ronggeng dari desa terpencil, yang mengisahkan dinamika tradisi, cinta, dan perubahan sosial di pedesaan Jawa.',
    isRecommended: true,
  },
  {
    id: 'bk005', judul: 'Perahu Kertas', penulis: 'Dee Lestari', penerbit: 'Bentang Pustaka', tahun: 2009,
    kategori: 'Fiksi', isbn: '978-602-8811-14-6', halaman: 444, bahasa: 'Indonesia', stok: 6, rating: 4.4, totalRating: 203,
    cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kisah dua anak muda yang memiliki impian besar dalam seni - Kugy yang mencintai dunia menulis dan Keenan yang memiliki bakat melukis luar biasa.',
  },
  {
    id: 'bk006', judul: 'Ayat-Ayat Cinta', penulis: 'Habiburrahman El Shirazy', penerbit: 'Republika', tahun: 2004,
    kategori: 'Fiksi', isbn: '978-979-106-800-7', halaman: 419, bahasa: 'Indonesia', stok: 4, rating: 4.5, totalRating: 387,
    cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Novel religius tentang Fahri, mahasiswa Indonesia di Universitas Al-Azhar, Kairo, yang menghadapi dilema cinta dan iman di negeri orang.',
  },
  // === NON-FIKSI ===
  {
    id: 'bk007', judul: 'Filosofi Teras', penulis: 'Henry Manampiring', penerbit: 'Kompas', tahun: 2018,
    kategori: 'Non-Fiksi', isbn: '978-602-412-498-5', halaman: 346, bahasa: 'Indonesia', stok: 7, rating: 4.7, totalRating: 445,
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Buku filsafat Stoisisme yang dikemas dengan bahasa ringan dan kontekstual untuk kehidupan modern Indonesia. Mengajarkan cara mengelola emosi dan menemukan ketenangan batin.',
    isRecommended: true,
  },
  {
    id: 'bk008', judul: 'Atomic Habits', penulis: 'James Clear', penerbit: 'Gramedia', tahun: 2019,
    kategori: 'Non-Fiksi', isbn: '978-602-06-2603-7', halaman: 352, bahasa: 'Indonesia', stok: 3, rating: 4.8, totalRating: 621,
    cover: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Panduan praktis untuk membangun kebiasaan baik dan menghilangkan kebiasaan buruk. Perubahan kecil yang konsisten akan menghasilkan hasil luar biasa.',
    isRecommended: true,
  },
  {
    id: 'bk009', judul: 'Sapiens: Riwayat Singkat Umat Manusia', penulis: 'Yuval Noah Harari', penerbit: 'Kepustakaan Populer Gramedia', tahun: 2017,
    kategori: 'Non-Fiksi', isbn: '978-602-424-130-9', halaman: 564, bahasa: 'Indonesia', stok: 0, rating: 4.9, totalRating: 378,
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Sebuah eksplorasi mendalam tentang bagaimana Homo sapiens menaklukkan dunia dan membentuk peradaban manusia dari zaman prasejarah hingga era modern.',
  },
  {
    id: 'bk010', judul: 'Sebuah Seni untuk Bersikap Bodo Amat', penulis: 'Mark Manson', penerbit: 'Grasindo', tahun: 2017,
    kategori: 'Non-Fiksi', isbn: '978-602-452-255-8', halaman: 246, bahasa: 'Indonesia', stok: 5, rating: 4.3, totalRating: 298,
    cover: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Pendekatan kontra-intuitif terhadap kehidupan yang baik. Manson menantang pembaca untuk lebih selektif dalam memilih hal-hal yang pantas diperhatikan.',
  },
  // === SEJARAH ===
  {
    id: 'bk011', judul: 'Sejarah Purwakarta: Dari Masa ke Masa', penulis: 'Tim Disipusda', penerbit: 'Disipusda Purwakarta', tahun: 2020,
    kategori: 'Sejarah', isbn: '978-602-0000-01-1', halaman: 420, bahasa: 'Indonesia', stok: 10, rating: 4.6, totalRating: 89,
    cover: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kompilasi lengkap sejarah Kabupaten Purwakarta dari era kerajaan hingga modern. Dilengkapi foto arsip dan dokumentasi peninggalan bersejarah.',
    isRecommended: true,
  },
  {
    id: 'bk012', judul: 'Indonesia Menggugat', penulis: 'Soekarno', penerbit: 'SKP', tahun: 1930,
    kategori: 'Sejarah', isbn: '978-979-411-000-1', halaman: 180, bahasa: 'Indonesia', stok: 2, rating: 4.9, totalRating: 445,
    cover: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Pidato pembelaan Soekarno di hadapan pengadilan kolonial Belanda yang menjadi salah satu dokumen sejarah terpenting pergerakan kemerdekaan Indonesia.',
  },
  {
    id: 'bk013', judul: 'Nusantara: Sejarah Indonesia', penulis: 'Bernard H.M. Vlekke', penerbit: 'Kepustakaan Populer Gramedia', tahun: 2018,
    kategori: 'Sejarah', isbn: '978-602-424-670-0', halaman: 560, bahasa: 'Indonesia', stok: 3, rating: 4.5, totalRating: 167,
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Narasi komprehensif tentang sejarah kepulauan Indonesia dari zaman Hindu-Budha hingga era modern, ditulis oleh sejarawan Belanda yang objektif.',
  },
  {
    id: 'bk014', judul: 'Sejarah Tatar Sunda', penulis: 'Nina Herlina Lubis', penerbit: 'Satya Historika', tahun: 2000,
    kategori: 'Sejarah', isbn: '978-979-8095-05-3', halaman: 392, bahasa: 'Indonesia', stok: 4, rating: 4.4, totalRating: 78,
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kajian mendalam tentang sejarah dan kebudayaan Tatar Sunda dari masa prasejarah hingga era modern, dengan fokus pada aspek sosial dan budaya.',
    isRecommended: true,
  },
  // === SAINS & TEKNOLOGI ===
  {
    id: 'bk015', judul: 'Cosmos', penulis: 'Carl Sagan', penerbit: 'Kepustakaan Populer Gramedia', tahun: 2019,
    kategori: 'Sains & Teknologi', isbn: '978-602-424-770-7', halaman: 432, bahasa: 'Indonesia', stok: 3, rating: 4.8, totalRating: 289,
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Perjalanan epik menjelajahi alam semesta, dari atom terkecil hingga galaksi terjauh. Carl Sagan mengajak pembaca memahami tempat kita di kosmos.',
  },
  {
    id: 'bk016', judul: 'Revolusi Industri 4.0', penulis: 'Klaus Schwab', penerbit: 'Gramedia', tahun: 2019,
    kategori: 'Sains & Teknologi', isbn: '978-602-03-9901-3', halaman: 240, bahasa: 'Indonesia', stok: 4, rating: 4.2, totalRating: 145,
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Analisis mendalam tentang revolusi teknologi keempat yang mengubah cara kita hidup, bekerja, dan berinteraksi satu sama lain.',
  },
  {
    id: 'bk017', judul: 'A Brief History of Time', penulis: 'Stephen Hawking', penerbit: 'Gramedia', tahun: 2017,
    kategori: 'Sains & Teknologi', isbn: '978-602-03-7601-4', halaman: 248, bahasa: 'Indonesia', stok: 2, rating: 4.7, totalRating: 398,
    cover: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Penjelasan yang mudah dipahami tentang kosmologi, lubang hitam, Big Bang, dan misteri waktu dari salah satu fisikawan terhebat sepanjang masa.',
  },
  // === AGAMA & SPIRITUALITAS ===
  {
    id: 'bk018', judul: 'Tafsir Al-Misbah', penulis: 'M. Quraish Shihab', penerbit: 'Lentera Hati', tahun: 2002,
    kategori: 'Agama & Spiritualitas', isbn: '978-979-3612-00-4', halaman: 680, bahasa: 'Indonesia', stok: 5, rating: 4.9, totalRating: 512,
    cover: 'https://images.unsplash.com/photo-1585036156171-384164a8c465?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Tafsir Al-Quran yang komprehensif dan kontekstual, menjelaskan pesan Al-Quran dengan bahasa yang mudah dipahami masyarakat Indonesia modern.',
  },
  {
    id: 'bk019', judul: 'Kitab Sunda Wiwitan', penulis: 'Anis Djatisunda', penerbit: 'Kiblat Buku Utama', tahun: 2015,
    kategori: 'Agama & Spiritualitas', isbn: '978-602-7832-55-1', halaman: 256, bahasa: 'Indonesia', stok: 3, rating: 4.3, totalRating: 67,
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Eksplorasi mendalam tentang kepercayaan asli masyarakat Sunda, tradisi spiritual, dan kearifan lokal yang telah bertahan selama berabad-abad.',
  },
  // === ANAK-ANAK ===
  {
    id: 'bk020', judul: 'Si Kancil yang Cerdik', penulis: 'Tim Penulis Balai Pustaka', penerbit: 'Balai Pustaka', tahun: 2018,
    kategori: 'Anak-Anak', isbn: '978-602-0307-20-5', halaman: 64, bahasa: 'Indonesia', stok: 10, rating: 4.5, totalRating: 234,
    cover: 'https://images.unsplash.com/photo-1629992101753-56d196c8adf7?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kumpulan cerita rakyat Si Kancil yang penuh kecerdikan dan keberanian. Buku bergambar berwarna untuk anak usia 4-8 tahun.',
    isRecommended: true,
  },
  {
    id: 'bk021', judul: 'Ensiklopedia Anak Cerdas', penulis: 'Tim Redaksi', penerbit: 'Erlangga for Kids', tahun: 2020,
    kategori: 'Anak-Anak', isbn: '978-623-266-123-4', halaman: 128, bahasa: 'Indonesia', stok: 8, rating: 4.4, totalRating: 156,
    cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Ensiklopedia bergambar yang mencakup berbagai topik menarik: hewan, tumbuhan, alam semesta, teknologi, dan tubuh manusia untuk anak usia 6-12 tahun.',
  },
  {
    id: 'bk022', judul: 'Dongeng Rakyat Sunda', penulis: 'Ajip Rosidi', penerbit: 'Dunia Pustaka Jaya', tahun: 2016,
    kategori: 'Anak-Anak', isbn: '978-979-419-456-7', halaman: 96, bahasa: 'Indonesia', stok: 6, rating: 4.6, totalRating: 112,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kumpulan dongeng dan legenda dari Tatar Sunda yang penuh nilai moral dan kearifan lokal, diceritakan ulang dengan bahasa yang menarik untuk anak-anak.',
  },
  // === SASTRA SUNDA ===
  {
    id: 'bk023', judul: 'Baruang ka Nu Ngarora', penulis: 'D.K. Ardiwinata', penerbit: 'Balai Pustaka', tahun: 1914,
    kategori: 'Sastra Sunda', isbn: '978-602-0307-88-5', halaman: 168, bahasa: 'Sunda', stok: 4, rating: 4.5, totalRating: 89,
    cover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Novel Sunda pertama yang diterbitkan Balai Pustaka. Mengisahkan kehidupan masyarakat Sunda di awal abad ke-20 dengan penuh kearifan dan kritik sosial.',
  },
  {
    id: 'bk024', judul: 'Mantri Jero', penulis: 'R. Memed Sastrahadiprawira', penerbit: 'Balai Pustaka', tahun: 1928,
    kategori: 'Sastra Sunda', isbn: '978-602-0307-89-2', halaman: 214, bahasa: 'Sunda', stok: 3, rating: 4.4, totalRating: 56,
    cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Roman sejarah yang berlatar belakang kehidupan di lingkungan keraton Sumedang, menggambarkan intrik dan dinamika kekuasaan tradisional Sunda.',
  },
  {
    id: 'bk025', judul: 'Sunda: Sejarah, Budaya, dan Politik', penulis: 'Mikihiro Moriyama', penerbit: 'KPG', tahun: 2013,
    kategori: 'Sastra Sunda', isbn: '978-602-424-001-2', halaman: 328, bahasa: 'Indonesia', stok: 3, rating: 4.3, totalRating: 94,
    cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kajian akademis tentang identitas dan kebudayaan Sunda serta perkembangan sastra Sunda sejak era kolonial hingga pasca-kemerdekaan.',
  },
  // === REFERENSI ===
  {
    id: 'bk026', judul: 'Kamus Besar Bahasa Indonesia (KBBI)', penulis: 'Tim Penyusun KBBI', penerbit: 'Badan Bahasa', tahun: 2016,
    kategori: 'Referensi', isbn: '978-979-069-222-5', halaman: 1800, bahasa: 'Indonesia', stok: 8, rating: 4.8, totalRating: 678,
    cover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kamus resmi bahasa Indonesia edisi kelima dengan lebih dari 127.000 entri kata. Referensi wajib untuk pelajar, mahasiswa, dan profesional.',
  },
  {
    id: 'bk027', judul: 'Kamus Basa Sunda', penulis: 'R.R. Hardjadibrata', penerbit: 'Kiblat Buku Utama', tahun: 2003,
    kategori: 'Referensi', isbn: '978-979-3997-01-8', halaman: 820, bahasa: 'Sunda', stok: 5, rating: 4.6, totalRating: 123,
    cover: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kamus bahasa Sunda yang komprehensif dengan terjemahan ke bahasa Indonesia dan Inggris. Dilengkapi contoh penggunaan kata dalam kalimat.',
  },
  // === BIOGRAFI ===
  {
    id: 'bk028', judul: 'Bung Karno: Penyambung Lidah Rakyat', penulis: 'Cindy Adams', penerbit: 'Media Pressindo', tahun: 2014,
    kategori: 'Biografi', isbn: '978-979-788-411-3', halaman: 448, bahasa: 'Indonesia', stok: 3, rating: 4.7, totalRating: 345,
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Autobiografi Presiden pertama Indonesia yang diceritakan langsung oleh Soekarno kepada jurnalis Amerika, Cindy Adams. Penuh kisah perjuangan dan visi kebangsaan.',
  },
  {
    id: 'bk029', judul: 'Habibie & Ainun', penulis: 'B.J. Habibie', penerbit: 'THC Mandiri', tahun: 2010,
    kategori: 'Biografi', isbn: '978-602-98381-0-1', halaman: 321, bahasa: 'Indonesia', stok: 4, rating: 4.8, totalRating: 567,
    cover: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kisah cinta sejati antara B.J. Habibie dan Hasri Ainun Besari yang melampaui ruang dan waktu. Sebuah memoir yang menyentuh hati tentang dedikasi dan cinta abadi.',
    isRecommended: true,
  },
  // === PENDIDIKAN ===
  {
    id: 'bk030', judul: 'Pendidikan Karakter', penulis: 'Thomas Lickona', penerbit: 'Bumi Aksara', tahun: 2015,
    kategori: 'Pendidikan', isbn: '978-602-217-901-3', halaman: 400, bahasa: 'Indonesia', stok: 5, rating: 4.4, totalRating: 178,
    cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Panduan komprehensif tentang pendidikan karakter yang mencakup teori dan praktik untuk membentuk generasi berintegritas dan berbudi luhur.',
  },
  {
    id: 'bk031', judul: 'Merdeka Belajar', penulis: 'Ki Hadjar Dewantara', penerbit: 'Majelis Luhur Persatuan Taman Siswa', tahun: 2013,
    kategori: 'Pendidikan', isbn: '978-979-8139-02-6', halaman: 312, bahasa: 'Indonesia', stok: 6, rating: 4.7, totalRating: 234,
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kumpulan pemikiran Bapak Pendidikan Indonesia tentang filosofi pendidikan yang memerdekakan. Relevan dengan gerakan Merdeka Belajar saat ini.',
  },
  // More books to fill catalog
  {
    id: 'bk032', judul: 'Negeri 5 Menara', penulis: 'Ahmad Fuadi', penerbit: 'Gramedia', tahun: 2009,
    kategori: 'Fiksi', isbn: '978-979-22-4630-8', halaman: 424, bahasa: 'Indonesia', stok: 4, rating: 4.6, totalRating: 312,
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Kisah nyata tentang 6 santri dari pesantren PM Gontor yang bermimpi besar dan berhasil mewujudkannya di kancah internasional. Man Jadda Wajada!',
  },
  {
    id: 'bk033', judul: 'Supernova: Ksatria, Puteri, dan Bintang Jatuh', penulis: 'Dee Lestari', penerbit: 'Truedee Books', tahun: 2001,
    kategori: 'Fiksi', isbn: '978-979-97-6840-6', halaman: 308, bahasa: 'Indonesia', stok: 3, rating: 4.5, totalRating: 276,
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Novel sains-fiksi pertama Dee Lestari yang memadukan fisika kuantum, spiritualitas, dan cinta dalam narasi yang memukau dan mind-bending.',
  },
  {
    id: 'bk034', judul: 'Pulang', penulis: 'Tere Liye', penerbit: 'Republika', tahun: 2015,
    kategori: 'Fiksi', isbn: '978-602-0820-45-3', halaman: 400, bahasa: 'Indonesia', stok: 5, rating: 4.6, totalRating: 423,
    cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Novel tentang perjalanan pulang Bujang ke kampung halamannya di Sumatera setelah bertahun-tahun merantau. Penuh intrik, misteri keluarga, dan emosi mendalam.',
  },
  {
    id: 'bk035', judul: 'Laut Bercerita', penulis: 'Leila S. Chudori', penerbit: 'Kepustakaan Populer Gramedia', tahun: 2017,
    kategori: 'Fiksi', isbn: '978-602-424-560-4', halaman: 394, bahasa: 'Indonesia', stok: 0, rating: 4.8, totalRating: 289,
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Novel tentang aktivis mahasiswa yang hilang pada era Orde Baru. Sebuah kisah gelap dari sejarah Indonesia yang dituturkan dengan penuh keberanian.',
  },
  {
    id: 'bk036', judul: 'Psikologi Positif', penulis: 'Martin E.P. Seligman', penerbit: 'Mizan', tahun: 2019,
    kategori: 'Non-Fiksi', isbn: '978-602-441-112-9', halaman: 368, bahasa: 'Indonesia', stok: 4, rating: 4.3, totalRating: 167,
    cover: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Panduan ilmiah untuk mencapai kebahagiaan sejati melalui kekuatan karakter, relasi positif, dan makna hidup. Fondasi gerakan psikologi positif.',
  },
  {
    id: 'bk037', judul: 'Sejarah Indonesia Modern', penulis: 'M.C. Ricklefs', penerbit: 'Serambi', tahun: 2008,
    kategori: 'Sejarah', isbn: '978-979-1490-99-4', halaman: 688, bahasa: 'Indonesia', stok: 3, rating: 4.5, totalRating: 198,
    cover: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Karya klasik sejarah Indonesia yang mencakup periode sejak kedatangan Islam hingga era reformasi. Referensi utama untuk studi sejarah Indonesia.',
  },
  {
    id: 'bk038', judul: 'Pramoedya: Kisah Pengarang Terbuang', penulis: 'Eka Kurniawan', penerbit: 'KPG', tahun: 2019,
    kategori: 'Biografi', isbn: '978-602-424-880-3', halaman: 268, bahasa: 'Indonesia', stok: 3, rating: 4.6, totalRating: 134,
    cover: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Biografi Pramoedya Ananta Toer yang mengisahkan kehidupan sastrawan besar Indonesia dari masa kecil hingga pengasingan di Pulau Buru.',
  },
  {
    id: 'bk039', judul: 'Teknologi Informasi untuk Perpustakaan', penulis: 'Sulistyo-Basuki', penerbit: 'Universitas Terbuka', tahun: 2020,
    kategori: 'Sains & Teknologi', isbn: '978-602-329-901-6', halaman: 280, bahasa: 'Indonesia', stok: 6, rating: 4.1, totalRating: 67,
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Panduan penerapan teknologi informasi dalam manajemen perpustakaan modern. Mencakup sistem otomasi, digitalisasi koleksi, dan layanan digital.',
  },
  {
    id: 'bk040', judul: 'Sang Pemimpi', penulis: 'Andrea Hirata', penerbit: 'Bentang Pustaka', tahun: 2006,
    kategori: 'Fiksi', isbn: '978-979-3062-85-5', halaman: 292, bahasa: 'Indonesia', stok: 5, rating: 4.5, totalRating: 267,
    cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop',
    sinopsis: 'Sekuel Laskar Pelangi yang mengisahkan petualangan Ikal dan Arai mengejar mimpi mereka hingga ke Eropa. Penuh humor dan makna kehidupan.',
  },
];

const generateBorrowId = (): string => {
  return 'BR-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
};

// Initialize books in localStorage
const initBooks = (): Book[] => {
  const data = localStorage.getItem(BOOKS_KEY);
  if (!data) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(defaultBooks));
    return defaultBooks;
  }
  return JSON.parse(data);
};

// === CATALOG FUNCTIONS ===

export const getBooks = (): Book[] => {
  return initBooks();
};

export const getBookById = (id: string): Book | undefined => {
  return getBooks().find(b => b.id === id);
};

export const getRecommendedBooks = (): Book[] => {
  return getBooks().filter(b => b.isRecommended);
};

export const searchBooks = (query: string): Book[] => {
  const q = query.toLowerCase().trim();
  if (!q) return getBooks();
  return getBooks().filter(b =>
    b.judul.toLowerCase().includes(q) ||
    b.penulis.toLowerCase().includes(q) ||
    b.penerbit.toLowerCase().includes(q) ||
    b.isbn.includes(q) ||
    b.kategori.toLowerCase().includes(q)
  );
};

export const getBooksByCategory = (kategori: string): Book[] => {
  if (kategori === 'Semua') return getBooks();
  return getBooks().filter(b => b.kategori === kategori);
};

export const filterBooks = (options: {
  kategori?: string;
  query?: string;
  bahasa?: string;
  tahunMin?: number;
  tahunMax?: number;
  tersedia?: boolean;
}): Book[] => {
  let books = getBooks();

  if (options.query) {
    const q = options.query.toLowerCase().trim();
    books = books.filter(b =>
      b.judul.toLowerCase().includes(q) ||
      b.penulis.toLowerCase().includes(q) ||
      b.isbn.includes(q)
    );
  }

  if (options.kategori && options.kategori !== 'Semua') {
    books = books.filter(b => b.kategori === options.kategori);
  }

  if (options.bahasa) {
    books = books.filter(b => b.bahasa === options.bahasa);
  }

  if (options.tahunMin) {
    books = books.filter(b => b.tahun >= options.tahunMin!);
  }

  if (options.tahunMax) {
    books = books.filter(b => b.tahun <= options.tahunMax!);
  }

  if (options.tersedia) {
    books = books.filter(b => b.stok > 0);
  }

  return books;
};

// === BOOK CRUD (Admin) ===

const generateBookId = (): string =>
  'bk' + Date.now().toString(36) + Math.random().toString(36).substr(2, 3);

export const addBook = (data: Omit<Book, 'id'>, requestedByAdminId?: string): { success: boolean; message: string; book?: Book } => {
  // === BACKEND VALIDATION: Must be admin ===
  if (!requestedByAdminId) return { success: false, message: 'Akses ditolak: Hanya admin yang dapat menambah buku.' };
  if (!data.judul?.trim()) return { success: false, message: 'Judul buku tidak boleh kosong.' };
  if (!data.penulis?.trim()) return { success: false, message: 'Nama penulis tidak boleh kosong.' };
  if (data.stok < 0) return { success: false, message: 'Stok tidak boleh negatif.' };
  const books = getBooks();
  const newBook: Book = { id: generateBookId(), ...data };
  books.push(newBook);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  return { success: true, message: `Buku "${newBook.judul}" berhasil ditambahkan.`, book: newBook };
};

export const updateBook = (id: string, updates: Partial<Book>, requestedByAdminId?: string): { success: boolean; message: string } => {
  // === BACKEND VALIDATION: Must be admin ===
  if (!requestedByAdminId) return { success: false, message: 'Akses ditolak: Hanya admin yang dapat mengubah data buku.' };
  if (updates.stok !== undefined && updates.stok < 0) return { success: false, message: 'Stok tidak boleh negatif.' };
  const books = getBooks();
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return { success: false, message: 'Buku tidak ditemukan.' };
  // Block tampering the book ID itself
  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  books[idx] = { ...books[idx], ...safeUpdates };
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  return { success: true, message: 'Buku berhasil diperbarui.' };
};

export const deleteBook = (id: string, requestedByAdminId?: string): { success: boolean; message: string } => {
  // === BACKEND VALIDATION: Must be admin ===
  if (!requestedByAdminId) return { success: false, message: 'Akses ditolak: Hanya admin yang dapat menghapus buku.' };
  const books = getBooks().filter(b => b.id !== id);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  return { success: true, message: 'Buku berhasil dihapus.' };
};

export const getAllBorrows = (): BorrowRecord[] => getBorrows();

// === BORROW FUNCTIONS ===

// getBorrows is now defined at the bottom with auto-cancel logic

export const getMemberBorrows = (memberId: string): BorrowRecord[] => {
  return getBorrows().filter(b => b.memberId === memberId);
};

export const getActiveBorrows = (memberId: string): BorrowRecord[] => {
  return getMemberBorrows(memberId).filter(b => b.status === 'dipinjam');
};

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const formatDate = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
const formatDateTime = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export const borrowBook = (bookId: string, memberId: string, _memberNameFromFrontend: string): { success: boolean; message: string } => {
  // === SECURITY: Re-fetch member name from DB — never trust Frontend-supplied data ===
  const membersRaw = localStorage.getItem('disipusda_members');
  const members: Array<{ id: string; namaLengkap: string }> = membersRaw ? JSON.parse(membersRaw) : [];
  const verifiedMember = members.find(m => m.id === memberId);
  if (!verifiedMember) return { success: false, message: 'Anggota tidak ditemukan atau sesi tidak valid.' };
  const memberName = verifiedMember.namaLengkap; // Use DB name, not the frontend-supplied one

  const book = getBookById(bookId);
  if (!book) return { success: false, message: 'Buku tidak ditemukan.' };
  if (book.stok <= 0) return { success: false, message: 'Stok buku habis. Anda bisa mendaftar antrian untuk buku ini.' };

  // Check if already borrowing this book
  const activeBorrows = getActiveBorrows(memberId);
  if (activeBorrows.find(b => b.bookId === bookId)) {
    return { success: false, message: 'Anda sudah meminjam buku ini. Kembalikan terlebih dahulu.' };
  }

  // Max 3 borrow at a time
  if (activeBorrows.length >= 3) {
    return { success: false, message: 'Maksimal peminjaman 3 buku. Silakan kembalikan buku terlebih dahulu.' };
  }

  const now = new Date();
  const returnDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 hari masa pinjam
  const pickupDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1x24 jam batas ambil

  const record: BorrowRecord = {
    id: generateBorrowId(),
    bookId,
    memberId,
    memberName,
    bookTitle: book.judul,
    tanggalPinjam: formatDate(now),
    tanggalKembali: formatDate(returnDate),
    batasAmbil: formatDateTime(pickupDeadline),
    status: 'menunggu_diambil',
  };

  // Decrease stock
  const books = getBooks();
  const bookIdx = books.findIndex(b => b.id === bookId);
  if (bookIdx !== -1) {
    books[bookIdx].stok -= 1;
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  }

  // Remove from queue if exists
  const queues = getQueues();
  const queueIdx = queues.findIndex(q => q.bookId === bookId && q.memberId === memberId && q.status === 'menunggu');
  if (queueIdx !== -1) {
    queues[queueIdx].status = 'dibatalkan';
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queues));
  }

  const borrows = getBorrows();
  borrows.push(record);
  localStorage.setItem(BORROWS_KEY, JSON.stringify(borrows));

  return {
    success: true,
    message: `Buku "${book.judul}" berhasil dipinjam!\n⏰ Ambil sebelum: ${formatDateTime(pickupDeadline)}\n📅 Batas pengembalian: ${formatDate(returnDate)} (7 hari)`
  };
};

export const getPendingBorrows = (): BorrowRecord[] => {
  return getBorrows().filter(b => b.status === 'menunggu_diambil');
};

export const confirmPickup = (borrowId: string): { success: boolean; message: string } => {
  const borrows = getBorrows();
  const idx = borrows.findIndex(b => b.id === borrowId);
  if (idx === -1) return { success: false, message: 'Data peminjaman tidak ditemukan.' };

  if (borrows[idx].status !== 'menunggu_diambil') {
    return { success: false, message: 'Status peminjaman bukan menunggu pengambilan.' };
  }

  borrows[idx].status = 'dipinjam';
  localStorage.setItem(BORROWS_KEY, JSON.stringify(borrows));

  return { success: true, message: 'Pengambilan buku berhasil dikonfirmasi!' };
};

export const returnBook = (borrowId: string, requestedByMemberId?: string): { success: boolean; message: string } => {
  const borrows = getBorrows();
  const idx = borrows.findIndex(b => b.id === borrowId);
  if (idx === -1) return { success: false, message: 'Data peminjaman tidak ditemukan.' };

  // === BACKEND VALIDATION: Verify ownership — the member can only return their own book ===
  if (requestedByMemberId && borrows[idx].memberId !== requestedByMemberId) {
    return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin untuk mengembalikan buku orang lain.' };
  }

  // Verify status is actually borrowed (not already returned or cancelled)
  if (borrows[idx].status !== 'dipinjam') {
    return { success: false, message: 'Buku ini tidak sedang dalam status dipinjam.' };
  }

  const now = new Date();
  borrows[idx].status = 'dikembalikan';
  borrows[idx].tanggalDikembalikan = formatDate(now);

  // Restore stock
  const books = getBooks();
  const bookIdx = books.findIndex(b => b.id === borrows[idx].bookId);
  if (bookIdx !== -1) {
    books[bookIdx].stok += 1;
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  }

  localStorage.setItem(BORROWS_KEY, JSON.stringify(borrows));

  // Check if someone is waiting in queue
  const queues = getQueues();
  const nextInQueue = queues
    .filter(q => q.bookId === borrows[idx].bookId && q.status === 'menunggu')
    .sort((a, b) => a.nomorAntrian - b.nomorAntrian)[0];

  let extraMsg = '';
  if (nextInQueue) {
    extraMsg = ' Buku ini akan diberikan kepada antrian berikutnya.';
  }

  return { success: true, message: `Buku berhasil dikembalikan!${extraMsg}` };
};

// === QUEUE FUNCTIONS ===

export const getQueues = (): QueueRecord[] => {
  const data = localStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getBookQueue = (bookId: string): QueueRecord[] => {
  return getQueues()
    .filter(q => q.bookId === bookId && q.status === 'menunggu')
    .sort((a, b) => a.nomorAntrian - b.nomorAntrian);
};

export const getMemberQueues = (memberId: string): QueueRecord[] => {
  return getQueues().filter(q => q.memberId === memberId && q.status === 'menunggu');
};

export const getQueuePosition = (bookId: string, memberId: string): number | null => {
  const queue = getBookQueue(bookId);
  const idx = queue.findIndex(q => q.memberId === memberId);
  return idx !== -1 ? idx + 1 : null;
};

export const joinQueue = (bookId: string, memberId: string, _memberNameFromFrontend: string): { success: boolean; message: string; nomorAntrian?: number } => {
  // === SECURITY: Re-fetch member name from DB — never trust Frontend-supplied data ===
  const membersRaw = localStorage.getItem('disipusda_members');
  const members: Array<{ id: string; namaLengkap: string }> = membersRaw ? JSON.parse(membersRaw) : [];
  const verifiedMember = members.find(m => m.id === memberId);
  if (!verifiedMember) return { success: false, message: 'Anggota tidak ditemukan atau sesi tidak valid.' };
  const memberName = verifiedMember.namaLengkap;

  const book = getBookById(bookId);
  if (!book) return { success: false, message: 'Buku tidak ditemukan.' };

  // Check if already in queue
  const existingQueue = getBookQueue(bookId);
  if (existingQueue.find(q => q.memberId === memberId)) {
    const pos = getQueuePosition(bookId, memberId);
    return { success: false, message: `Anda sudah terdaftar di antrian buku ini. Posisi antrian: #${pos}` };
  }

  // Check if already borrowing this book
  const activeBorrows = getActiveBorrows(memberId);
  if (activeBorrows.find(b => b.bookId === bookId)) {
    return { success: false, message: 'Anda sudah meminjam buku ini.' };
  }

  const now = new Date();
  const nomorAntrian = existingQueue.length + 1;

  const queueRecord: QueueRecord = {
    id: 'Q-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    bookId,
    memberId,
    memberName,
    bookTitle: book.judul,
    nomorAntrian,
    tanggalAntri: formatDateTime(now),
    status: 'menunggu',
  };

  const queues = getQueues();
  queues.push(queueRecord);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queues));

  return {
    success: true,
    message: `Berhasil mendaftar antrian buku "${book.judul}"! Nomor antrian Anda: #${nomorAntrian}. Anda akan diberitahu saat buku tersedia.`,
    nomorAntrian,
  };
};

export const cancelQueue = (queueId: string, requestedByMemberId?: string): { success: boolean; message: string } => {
  const queues = getQueues();
  const idx = queues.findIndex(q => q.id === queueId);
  if (idx === -1) return { success: false, message: 'Data antrian tidak ditemukan.' };

  // === BACKEND VALIDATION: Only the queue owner can cancel their spot ===
  if (requestedByMemberId && queues[idx].memberId !== requestedByMemberId) {
    return { success: false, message: 'Akses ditolak: Anda hanya dapat membatalkan antrian milik Anda sendiri.' };
  }

  queues[idx].status = 'dibatalkan';
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queues));

  return { success: true, message: 'Antrian berhasil dibatalkan.' };
};

/**
 * AUTOMATIC LOGIC: Cancel borrows that are not picked up within 24 hours.
 * This runs locally on the user's browser whenever they access borrowing lists.
 */
export const checkAndCancelOverdueBorrows = () => {
  const borrowsRaw = localStorage.getItem(BORROWS_KEY);
  const booksRaw = localStorage.getItem(BOOKS_KEY);
  
  if (!borrowsRaw || !booksRaw) return;
  
  const borrows = JSON.parse(borrowsRaw) as BorrowRecord[];
  const books = JSON.parse(booksRaw) as Book[];
  let changed = false;
  const now = new Date();

  const updatedBorrows = borrows.map(record => {
    // Only check records that are waiting for pickup
    if (record.status === 'menunggu_diambil') {
      const deadline = new Date(record.batasAmbil);
      if (now > deadline) {
        // Mark as cancelled (failed to pickup)
        record.status = 'batal';
        changed = true;
        
        // Return stock to book
        const bookIdx = books.findIndex(b => b.id === record.bookId);
        if (bookIdx !== -1) {
          books[bookIdx].stok += 1;
        }
      }
    }
    return record;
  });

  if (changed) {
    localStorage.setItem(BORROWS_KEY, JSON.stringify(updatedBorrows));
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  }
};

// Hook into getBorrows logic
export const getBorrows = (): BorrowRecord[] => {
  checkAndCancelOverdueBorrows();
  const data = localStorage.getItem(BORROWS_KEY);
  return data ? JSON.parse(data) : [];
};

// === WISHLIST FUNCTIONS ===

const WISHLIST_KEY = 'disipusda_wishlist';

export interface WishlistRecord {
  memberId: string;
  bookId: string;
}

export const getWishlists = (): WishlistRecord[] => {
  const data = localStorage.getItem(WISHLIST_KEY);
  return data ? JSON.parse(data) : [];
};

export const toggleWishlist = (bookId: string, memberId: string): { success: boolean; isAdded: boolean; message: string } => {
  const wishlists = getWishlists();
  const existingIdx = wishlists.findIndex(w => w.bookId === bookId && w.memberId === memberId);
  
  if (existingIdx !== -1) {
    // Remove
    wishlists.splice(existingIdx, 1);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
    return { success: true, isAdded: false, message: 'Dihapus dari Wishlist.' };
  } else {
    // Add
    wishlists.push({ bookId, memberId });
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
    return { success: true, isAdded: true, message: 'Ditambahkan ke Wishlist!' };
  }
};

export const getMemberWishlist = (memberId: string): Book[] => {
  const wishlists = getWishlists().filter(w => w.memberId === memberId);
  const books = getBooks();
  return wishlists.map(w => books.find(b => b.id === w.bookId)).filter(b => b !== undefined) as Book[];
};

export const isInWishlist = (bookId: string, memberId: string): boolean => {
  const wishlists = getWishlists();
  return wishlists.some(w => w.bookId === bookId && w.memberId === memberId);
};

// === RATING FUNCTION ===

export const rateBook = (bookId: string, memberId: string, newRating: number): { success: boolean; message: string } => {
  // === VALIDASI BACKEND (Security Best Practice) ===
  // Kita tidak boleh percaya frontend begitu saja. Cek database apakah user ini benar-benar sudah mengembalikan buku ini.
  const borrows = getMemberBorrows(memberId);
  const hasReturned = borrows.some(b => b.bookId === bookId && b.status === 'dikembalikan');
  
  if (!hasReturned) {
    return { success: false, message: 'Keamanan: Anda hanya boleh memberi rating untuk buku yang sudah Anda kembalikan.' };
  }

  const books = getBooks();
  const idx = books.findIndex(b => b.id === bookId);
  if (idx === -1) return { success: false, message: 'Buku tidak ditemukan.' };

  const book = books[idx];
  // Calculate new average rating
  const currentTotal = book.totalRating || 0;
  const currentAvg = book.rating || 5; // Default to 5 if undefined
  
  const newTotal = currentTotal + 1;
  // Formula: ((oldAvg * oldTotal) + newRating) / newTotal
  const newAvg = ((currentAvg * currentTotal) + newRating) / newTotal;
  
  books[idx].rating = Number(newAvg.toFixed(1));
  books[idx].totalRating = newTotal;
  
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  return { success: true, message: 'Terima kasih atas penilaian Anda!' };
};
