-- BLUEPRINT DATABASE DISIPUSDA PURWAKARTA (OPTIMIZED FOR SYNC)
-- Jalankan kode ini di SQL Editor Supabase jika terjadi Error 400

DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.structure CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.media_assets CASCADE;

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

-- RLS POLICIES (Buka Proteksi untuk Public Setup)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All for Anon" ON public.articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Anon" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Anon" ON public.structure FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Anon" ON public.achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Anon" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
