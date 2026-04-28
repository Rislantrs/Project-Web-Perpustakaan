BEGIN;

-- =====================================================
-- 0) Helper function: cek admin dari tabel public.admins
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin_from_table()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admins a
    WHERE a.id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_from_table()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admins a
    WHERE a.id = auth.uid()
      AND COALESCE(a.role, '') = 'super_admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_from_table() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin_from_table() TO authenticated;

-- =====================================================
-- 1) ADMINS
-- =====================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read own/admin" ON public.admins;
CREATE POLICY "Admins read own/admin"
ON public.admins
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR public.is_admin_from_table()
);

DROP POLICY IF EXISTS "Super admins insert admins" ON public.admins;
CREATE POLICY "Super admins insert admins"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin_from_table());

DROP POLICY IF EXISTS "Super admins update admins" ON public.admins;
CREATE POLICY "Super admins update admins"
ON public.admins
FOR UPDATE
TO authenticated
USING (public.is_super_admin_from_table())
WITH CHECK (public.is_super_admin_from_table());

-- =====================================================
-- 2) ARTICLES
-- =====================================================
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read articles anon" ON public.articles;
CREATE POLICY "Public read articles anon"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin manage articles" ON public.articles;
CREATE POLICY "Admin manage articles"
ON public.articles
FOR ALL
TO authenticated
USING (public.is_admin_from_table())
WITH CHECK (public.is_admin_from_table());

-- =====================================================
-- 3) BOOKS
-- =====================================================
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read books anon" ON public.books;
CREATE POLICY "Public read books anon"
ON public.books
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin manage books" ON public.books;
CREATE POLICY "Admin manage books"
ON public.books
FOR ALL
TO authenticated
USING (public.is_admin_from_table())
WITH CHECK (public.is_admin_from_table());

-- =====================================================
-- 4) CATEGORIES
-- =====================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories anon" ON public.categories;
CREATE POLICY "Public read categories anon"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin_from_table())
WITH CHECK (public.is_admin_from_table());

-- =====================================================
-- 5) BORROWS
-- =====================================================
ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Borrows owner or admin read" ON public.borrows;
CREATE POLICY "Borrows owner or admin read"
ON public.borrows
FOR SELECT
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_table()
);

DROP POLICY IF EXISTS "Borrows owner or admin update" ON public.borrows;
CREATE POLICY "Borrows owner or admin update"
ON public.borrows
FOR UPDATE
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_table()
)
WITH CHECK (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_table()
);

-- =====================================================
-- 6) QUEUE
-- =====================================================
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Queue owner or admin read" ON public.queue;
CREATE POLICY "Queue owner or admin read"
ON public.queue
FOR SELECT
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_table()
);

DROP POLICY IF EXISTS "Queue owner or admin update" ON public.queue;
CREATE POLICY "Queue owner or admin update"
ON public.queue
FOR UPDATE
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_table()
)
WITH CHECK (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_table()
);

-- =====================================================
-- 7) MEMBERS
-- =====================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members owner or admin read" ON public.members;
CREATE POLICY "Members owner or admin read"
ON public.members
FOR SELECT
TO authenticated
USING (
  id = auth.uid()::text
  OR public.is_admin_from_table()
);

DROP POLICY IF EXISTS "Members owner or admin update" ON public.members;
CREATE POLICY "Members owner or admin update"
ON public.members
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()::text
  OR public.is_admin_from_table()
)
WITH CHECK (
  id = auth.uid()::text
  OR public.is_admin_from_table()
);

-- =====================================================
-- 8) SETTINGS, STRUCTURE, SCHEDULES, ACHIEVEMENTS
-- =====================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Settings
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin manage settings" ON public.settings;
CREATE POLICY "Admin manage settings" ON public.settings FOR ALL TO authenticated USING (public.is_admin_from_table());

-- Structure
DROP POLICY IF EXISTS "Public read structure" ON public.structure;
CREATE POLICY "Public read structure" ON public.structure FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin manage structure" ON public.structure;
CREATE POLICY "Admin manage structure" ON public.structure FOR ALL TO authenticated USING (public.is_admin_from_table());

-- Schedules
DROP POLICY IF EXISTS "Public read schedules" ON public.schedules;
CREATE POLICY "Public read schedules" ON public.schedules FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin manage schedules" ON public.schedules;
CREATE POLICY "Admin manage schedules" ON public.schedules FOR ALL TO authenticated USING (public.is_admin_from_table());

-- Achievements
DROP POLICY IF EXISTS "Public read achievements" ON public.achievements;
CREATE POLICY "Public read achievements" ON public.achievements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin manage achievements" ON public.achievements;
CREATE POLICY "Admin manage achievements" ON public.achievements FOR ALL TO authenticated USING (public.is_admin_from_table());

-- =====================================================
-- 9) GRANTS
-- =====================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

COMMIT;
