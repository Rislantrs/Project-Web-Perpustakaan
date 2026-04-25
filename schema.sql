-- BLUEPRINT DATABASE DISIPUSDA PURWAKARTA (OPTIMIZED FOR SYNC)
-- Jalankan kode ini di SQL Editor Supabase jika terjadi Error 400

DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.structure CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.media_assets CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.books CASCADE;
DROP TABLE IF EXISTS public.borrows CASCADE;
DROP TABLE IF EXISTS public.queue CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;

-- Tabel Artikel (Matching with Article Interface)
CREATE TABLE public.articles (
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
    "createdAt" BIGINT
);

-- Tabel Settings (Flexible JSON Storage)
CREATE TABLE public.settings (
    id BIGSERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel Struktur
CREATE TABLE public.structure (
    id TEXT PRIMARY KEY,
    name TEXT,
    position TEXT,
    level INTEGER,
    "parentId" TEXT,
    category TEXT,
    img TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel Prestasi
CREATE TABLE public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT,
    year TEXT,
    description TEXT,
    img TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel Jadwal
CREATE TABLE public.schedules (
    id TEXT PRIMARY KEY,
    day TEXT,
    hours TEXT,
    note TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabel Buku
CREATE TABLE public.books (
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
    "isRecommended" BOOLEAN
);

-- Tabel Kategori Terpadu
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('books')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT categories_type_slug_key UNIQUE (type, slug)
);

-- Tabel Peminjaman
CREATE TABLE public.borrows (
    id TEXT PRIMARY KEY,
    "bookId" TEXT,
    "memberId" TEXT,
    "memberName" TEXT,
    "bookTitle" TEXT,
    "tanggalPinjam" TEXT,
    "tanggalKembali" TEXT,
    "batasAmbil" TEXT,
    "tanggalDikembalikan" TEXT,
    status TEXT
);

-- Tabel Antrian
CREATE TABLE public.queue (
    id TEXT PRIMARY KEY,
    "bookId" TEXT,
    "memberId" TEXT,
    "memberName" TEXT,
    "bookTitle" TEXT,
    "nomorAntrian" INTEGER,
    "tanggalAntri" TEXT,
    status TEXT
);

-- Tabel Member Directory (sinkron dengan Supabase Auth)
CREATE TABLE public.members (
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

-- RLS POLICIES (Buka Proteksi untuk Public Setup)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Allow All for Anon" ON public.books;
DROP POLICY IF EXISTS "Allow All for Anon" ON public.borrows;
DROP POLICY IF EXISTS "Allow All for Anon" ON public.queue;

DROP POLICY IF EXISTS "Public can read books" ON public.books;
DROP POLICY IF EXISTS "Admin can write books" ON public.books;
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can write categories" ON public.categories;
DROP POLICY IF EXISTS "Borrow owner/admin can read" ON public.borrows;
DROP POLICY IF EXISTS "Borrow owner/admin can insert" ON public.borrows;
DROP POLICY IF EXISTS "Borrow owner/admin can update" ON public.borrows;
DROP POLICY IF EXISTS "Queue owner/admin can read" ON public.queue;
DROP POLICY IF EXISTS "Queue owner/admin can insert" ON public.queue;
DROP POLICY IF EXISTS "Queue owner/admin can update" ON public.queue;
DROP POLICY IF EXISTS "Public can read members" ON public.members;
DROP POLICY IF EXISTS "Admin can manage members" ON public.members;
DROP POLICY IF EXISTS "Member can read own profile" ON public.members;
DROP POLICY IF EXISTS "Member can update own profile" ON public.members;

-- Helper admin claim (app_metadata.role: admin/super_admin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'), false);
$$;

-- Buku: publik boleh baca, hanya admin boleh tulis
CREATE POLICY "Public can read books"
ON public.books
FOR SELECT
USING (true);

CREATE POLICY "Admin can write books"
ON public.books
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Categories: publik boleh baca, hanya admin boleh tulis
CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Admin can write categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Borrows: user hanya lihat data miliknya sendiri, admin boleh semua
CREATE POLICY "Borrow owner/admin can read"
ON public.borrows
FOR SELECT
TO authenticated
USING (public.is_admin() OR "memberId" = auth.uid()::text);

CREATE POLICY "Borrow owner/admin can insert"
ON public.borrows
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() OR "memberId" = auth.uid()::text);

CREATE POLICY "Borrow owner/admin can update"
ON public.borrows
FOR UPDATE
TO authenticated
USING (public.is_admin() OR "memberId" = auth.uid()::text)
WITH CHECK (public.is_admin() OR "memberId" = auth.uid()::text);

-- Queue: user hanya akses antriannya sendiri, admin boleh semua
CREATE POLICY "Queue owner/admin can read"
ON public.queue
FOR SELECT
TO authenticated
USING (public.is_admin() OR "memberId" = auth.uid()::text);

CREATE POLICY "Queue owner/admin can insert"
ON public.queue
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() OR "memberId" = auth.uid()::text);

CREATE POLICY "Queue owner/admin can update"
ON public.queue
FOR UPDATE
TO authenticated
USING (public.is_admin() OR "memberId" = auth.uid()::text)
WITH CHECK (public.is_admin() OR "memberId" = auth.uid()::text);

-- Members: admin akses penuh, member hanya profil sendiri
CREATE POLICY "Public can read members"
ON public.members
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage members"
ON public.members
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Member can read own profile"
ON public.members
FOR SELECT
TO authenticated
USING (id = auth.uid()::text);

CREATE POLICY "Member can update own profile"
ON public.members
FOR UPDATE
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- Trigger sync auth.users -> public.members
CREATE OR REPLACE FUNCTION public.sync_member_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_meta jsonb;
    v_email text;
    v_name text;
    v_nik_masked text;
    v_tel text;
    v_alamat text;
    v_jk text;
    v_lahir text;
    v_tanggal text;
BEGIN
    v_meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    v_email := lower(COALESCE(NEW.email, ''));
    v_name := COALESCE(v_meta ->> 'namaLengkap', split_part(v_email, '@', 1));
    v_nik_masked := COALESCE(v_meta ->> 'nik_masked', v_meta ->> 'nik', '************');
    v_tel := regexp_replace(COALESCE(v_meta ->> 'telepon', ''), '[^0-9]', '', 'g');
    v_alamat := COALESCE(v_meta ->> 'alamat', '');
    v_jk := CASE WHEN (v_meta ->> 'jenisKelamin') IN ('L', 'P') THEN (v_meta ->> 'jenisKelamin') ELSE 'L' END;
    v_lahir := COALESCE(v_meta ->> 'tanggalLahir', '');
    v_tanggal := to_char(COALESCE(NEW.created_at, now()), 'DD FMMonth YYYY');

    INSERT INTO public.members (
        id,
        nomor_anggota,
        nama_lengkap,
        nik_masked,
        email,
        password,
        alamat,
        telepon,
        jenis_kelamin,
        tanggal_lahir,
        tanggal_daftar,
        avatar_color,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id::text,
        CONCAT('PWK-', EXTRACT(YEAR FROM now())::int, '-', lpad((floor(random() * 9000) + 1000)::text, 4, '0')),
        v_name,
        v_nik_masked,
        v_email,
        'managed-by-supabase-auth',
        v_alamat,
        v_tel,
        v_jk,
        v_lahir,
        v_tanggal,
        '#0c2f3d',
        true,
        COALESCE(NEW.created_at, now()),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nama_lengkap = COALESCE(NULLIF(EXCLUDED.nama_lengkap, ''), public.members.nama_lengkap),
        nik_masked = COALESCE(NULLIF(EXCLUDED.nik_masked, ''), public.members.nik_masked),
        alamat = COALESCE(NULLIF(EXCLUDED.alamat, ''), public.members.alamat),
        telepon = COALESCE(NULLIF(EXCLUDED.telepon, ''), public.members.telepon),
        jenis_kelamin = COALESCE(NULLIF(EXCLUDED.jenis_kelamin, ''), public.members.jenis_kelamin),
        tanggal_lahir = COALESCE(NULLIF(EXCLUDED.tanggal_lahir, ''), public.members.tanggal_lahir),
        is_active = true,
        updated_at = now();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_member_from_auth ON auth.users;
CREATE TRIGGER trg_sync_member_from_auth
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_member_from_auth();

-- Backfill user auth lama ke public.members
INSERT INTO public.members (
    id,
    nomor_anggota,
    nama_lengkap,
    nik_masked,
    email,
    password,
    alamat,
    telepon,
    jenis_kelamin,
    tanggal_lahir,
    tanggal_daftar,
    avatar_color,
    is_active,
    created_at,
    updated_at
)
SELECT
    u.id::text,
    CONCAT('PWK-', EXTRACT(YEAR FROM COALESCE(u.created_at, now()))::int, '-', lpad((floor(random() * 9000) + 1000)::text, 4, '0')),
    COALESCE(u.raw_user_meta_data ->> 'namaLengkap', split_part(lower(COALESCE(u.email, '')), '@', 1)),
    COALESCE(u.raw_user_meta_data ->> 'nik_masked', u.raw_user_meta_data ->> 'nik', '************'),
    lower(COALESCE(u.email, '')),
    'managed-by-supabase-auth',
    COALESCE(u.raw_user_meta_data ->> 'alamat', ''),
    regexp_replace(COALESCE(u.raw_user_meta_data ->> 'telepon', ''), '[^0-9]', '', 'g'),
    CASE WHEN (u.raw_user_meta_data ->> 'jenisKelamin') IN ('L', 'P') THEN (u.raw_user_meta_data ->> 'jenisKelamin') ELSE 'L' END,
    COALESCE(u.raw_user_meta_data ->> 'tanggalLahir', ''),
    to_char(COALESCE(u.created_at, now()), 'DD FMMonth YYYY'),
    '#0c2f3d',
    true,
    COALESCE(u.created_at, now()),
    now()
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ENABLE REALTIME (Jalankan ini agar Fitur Auto-Update tanpa refresh aktif!)
-- Pastikan tabel ini sudah masuk ke publication 'supabase_realtime' di Dashboard Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE articles;
ALTER PUBLICATION supabase_realtime ADD TABLE books;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE borrows;
ALTER PUBLICATION supabase_realtime ADD TABLE queue;
ALTER PUBLICATION supabase_realtime ADD TABLE schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE members;
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
-- 3. Seed Data (Initial Catalog)
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
('bk029', 'Habibie & Ainun', 'B.J. Habibie', 'THC Mandiri', 2010, 'Biografi', '978-602-98381-0-1', 321, 'Indonesia', 4, 4.8, 567, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=400&auto=format&fit=crop', 'Kisah cinta sejati antara B.J. Habibie dan Hasri Ainun Besari yang melampaui ruang dan waktu. Sebuah memoir yang menyentuh hati tentang dedikasi dan cinta abadi.', true);
ON CONFLICT (id) DO NOTHING;

