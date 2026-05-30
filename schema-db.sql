-- Database schema only.
-- This file defines tables, constraints, indexes, and seed data.
-- It intentionally does NOT include RLS policies or security helpers.

BEGIN;

-- =====================================================
-- CORE CONTENT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  author TEXT,
  date TEXT,
  year TEXT,
  "readTime" TEXT,
  img TEXT,
  "imgPosition" TEXT,
  "createdAt" BIGINT,
  views BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_year ON public.articles (year);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles ("createdAt");

CREATE TABLE IF NOT EXISTS public.settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.structure (
  id TEXT PRIMARY KEY,
  name TEXT,
  position TEXT,
  level INTEGER,
  "parentId" TEXT,
  category TEXT,
  img TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_structure_category ON public.structure (category);
CREATE INDEX IF NOT EXISTS idx_structure_parent_id ON public.structure ("parentId");

CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT,
  year TEXT,
  description TEXT,
  img TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_achievements_year ON public.achievements (year);

CREATE TABLE IF NOT EXISTS public.schedules (
  id TEXT PRIMARY KEY,
  day TEXT,
  hours TEXT,
  note TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedules_day ON public.schedules (day);

-- =====================================================
-- CATALOG TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY,
  judul TEXT,
  penulis TEXT,
  penerbit TEXT,
  tahun INTEGER,
  kategori TEXT,
  isbn TEXT,
  cover TEXT,
  sinopsis TEXT,
  halaman INTEGER,
  bahasa TEXT,
  stok INTEGER,
  rating NUMERIC,
  "totalRating" INTEGER,
  "isRecommended" BOOLEAN,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_books_kategori ON public.books (kategori);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON public.books (isbn);

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('books')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT categories_type_slug_unique UNIQUE (type, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories (type);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);

CREATE TABLE IF NOT EXISTS public.borrows (
  id TEXT PRIMARY KEY,
  "bookId" TEXT,
  "memberId" TEXT,
  "memberName" TEXT,
  "bookTitle" TEXT,
  "tanggalPinjam" TEXT,
  "tanggalKembali" TEXT,
  "batasAmbil" TEXT,
  "tanggalDikembalikan" TEXT,
  status TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_borrows_member_id ON public.borrows ("memberId");
CREATE INDEX IF NOT EXISTS idx_borrows_book_id ON public.borrows ("bookId");
CREATE INDEX IF NOT EXISTS idx_borrows_status ON public.borrows (status);

CREATE TABLE IF NOT EXISTS public.queue (
  id TEXT PRIMARY KEY,
  "bookId" TEXT,
  "memberId" TEXT,
  "memberName" TEXT,
  "bookTitle" TEXT,
  "nomorAntrian" INTEGER,
  "tanggalAntri" TEXT,
  status TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_queue_member_id ON public.queue ("memberId");
CREATE INDEX IF NOT EXISTS idx_queue_book_id ON public.queue ("bookId");
CREATE INDEX IF NOT EXISTS idx_queue_status ON public.queue (status);

CREATE TABLE IF NOT EXISTS public.members (
  id TEXT PRIMARY KEY,
  nomor_anggota TEXT,
  nama_lengkap TEXT,
  nik_masked TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  alamat TEXT,
  telepon TEXT,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')),
  tanggal_lahir TEXT,
  tanggal_daftar TEXT,
  avatar_color TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_members_email ON public.members (email);
CREATE INDEX IF NOT EXISTS idx_members_nomor_anggota ON public.members (nomor_anggota);

CREATE TABLE IF NOT EXISTS public.admins (
  id TEXT PRIMARY KEY,
  nama_lengkap TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')),
  tanggal_dibuat TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins (email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins (role);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs (record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS public.borrow_notification_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  borrow_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('pickup_h1', 'due_h2', 'overdue_daily')),
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_borrow_notification_once_per_day
  ON public.borrow_notification_logs (borrow_id, notification_type, notification_date);

CREATE INDEX IF NOT EXISTS idx_borrow_notification_member_date
  ON public.borrow_notification_logs (member_id, notification_date DESC);

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO public.categories (id, name, slug, type) VALUES
('cat-book-1', 'Fiksi', 'fiksi', 'books'),
('cat-book-2', 'Non-Fiksi', 'non-fiksi', 'books'),
('cat-book-3', 'Sejarah', 'sejarah', 'books'),
('cat-book-4', 'Sains & Teknologi', 'sains-teknologi', 'books'),
('cat-book-5', 'Agama & Spiritualitas', 'agama-spiritualitas', 'books'),
('cat-book-6', 'Anak-Anak', 'anak-anak', 'books'),
('cat-book-7', 'Sastra Sunda', 'sastra-sunda', 'books'),
('cat-book-8', 'Referensi', 'referensi', 'books'),
('cat-book-9', 'Biografi', 'biografi', 'books'),
('cat-book-10', 'Pendidikan', 'pendidikan', 'books')
ON CONFLICT (type, slug) DO NOTHING;

INSERT INTO public.books (id, judul, penulis, penerbit, tahun, kategori, isbn, halaman, bahasa, stok, rating, "totalRating", cover, sinopsis, "isRecommended") VALUES
('bk001', 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, 'Fiksi', '978-979-3062-79-4', 529, 'Indonesia', 5, 4.8, 324, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop', 'Kisah inspiratif tentang perjuangan 10 anak dari keluarga miskin di Belitung yang berjuang untuk mendapatkan pendidikan layak. Novel ini mengajarkan tentang semangat pantang menyerah dan kekuatan mimpi.', true),
('bk002', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, 'Fiksi', '978-979-9731-08-0', 535, 'Indonesia', 3, 4.9, 512, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop', 'Tetralogi Buru pertama yang mengisahkan Minke, seorang pemuda pribumi yang berusaha memperjuangkan kesetaraan di era kolonial Belanda. Sebuah mahakarya sastra Indonesia.', true),
('bk003', 'Cantik Itu Luka', 'Eka Kurniawan', 'Gramedia', 2002, 'Fiksi', '978-602-03-2850-0', 520, 'Indonesia', 4, 4.6, 189, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop', 'Sebuah novel epik yang menceritakan kehidupan Dewi Ayu, seorang perempuan cantik yang hidup melewati era kolonial, pendudukan Jepang, dan kemerdekaan Indonesia.', false),
('bk004', 'Ronggeng Dukuh Paruk', 'Ahmad Tohari', 'Gramedia', 1982, 'Fiksi', '978-979-22-4052-8', 408, 'Indonesia', 0, 4.7, 256, 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=400&auto=format&fit=crop', 'Trilogi epik tentang Srintil, seorang ronggeng dari desa terpencil, yang mengisahkan dinamika tradisi, cinta, dan perubahan sosial di pedesaan Jawa.', true),
('bk005', 'Perahu Kertas', 'Dee Lestari', 'Bentang Pustaka', 2009, 'Fiksi', '978-602-8811-14-6', 444, 'Indonesia', 6, 4.4, 203, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop', 'Kisah dua anak muda yang memiliki impian besar dalam seni - Kugy yang mencintai dunia menulis dan Keenan yang memiliki bakat melukis luar biasa.', false),
('bk006', 'Ayat-Ayat Cinta', 'Habiburrahman El Shirazy', 'Republika', 2004, 'Fiksi', '978-979-106-800-7', 419, 'Indonesia', 4, 4.5, 387, 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=400&auto=format&fit=crop', 'Novel religius tentang Fahri, mahasiswa Indonesia di Universitas Al-Azhar, Kairo, yang menghadapi dilema cinta dan iman di negeri orang.', false),
('bk007', 'Filosofi Teras', 'Henry Manampiring', 'Kompas', 2018, 'Non-Fiksi', '978-602-412-498-5', 346, 'Indonesia', 7, 4.7, 445, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop', 'Buku filsafat Stoisisme yang dikemas dengan bahasa ringan dan kontekstual untuk kehidupan modern Indonesia. Mengajarkan cara mengelola emosi dan menemukan ketenangan batin.', true),
('bk008', 'Atomic Habits', 'James Clear', 'Gramedia', 2019, 'Non-Fiksi', '978-602-06-2603-7', 352, 'Indonesia', 3, 4.8, 621, 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=400&auto=format&fit=crop', 'Panduan praktis untuk membangun kebiasaan baik dan menghilangkan kebiasaan buruk. Perubahan kecil yang konsisten akan menghasilkan hasil luar biasa.', true),
('bk011', 'Sejarah Purwakarta: Dari Masa ke Masa', 'Tim Disipusda', 'Disipusda Purwakarta', 2020, 'Sejarah', '978-602-0000-01-1', 420, 'Indonesia', 10, 4.6, 89, 'https://images.unsplash.com/photo-1461360370896-922624d12a74?q=80&w=400&auto=format&fit=crop', 'Kompilasi lengkap sejarah Kabupaten Purwakarta dari era kerajaan hingga modern. Dilengkapi foto arsip dan dokumentasi peninggalan bersejarah.', true),
('bk029', 'Habibie & Ainun', 'B.J. Habibie', 'THC Mandiri', 2010, 'Biografi', '978-602-98381-0-1', 321, 'Indonesia', 4, 4.8, 567, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=400&auto=format&fit=crop', 'Kisah cinta sejati antara B.J. Habibie dan Hasri Ainun Besari yang melampaui ruang dan waktu. Sebuah memoir yang menyentuh hati tentang dedikasi dan cinta abadi.', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
