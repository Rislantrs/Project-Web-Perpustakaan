BEGIN;

-- =====================================================
-- HARD RESET RLS (drop all old policies regardless names)
-- =====================================================
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'admins',
        'articles',
        'books',
        'categories',
        'borrows',
        'queue',
        'members',
        'settings',
        'structure',
        'schedules',
        'achievements'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

-- Cleanup old helper functions that often cause recursion leftovers.
DROP FUNCTION IF EXISTS public.is_admin_from_table();
DROP FUNCTION IF EXISTS public.is_super_admin_from_table();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.is_admin_fix();
DROP FUNCTION IF EXISTS public.is_admin_final();
DROP FUNCTION IF EXISTS public.is_admin_from_admins();
DROP FUNCTION IF EXISTS public.is_super_admin_from_admins();

-- =====================================================
-- Helper functions (table-driven, non-recursive)
-- =====================================================
-- Design note:
-- - The admins table policy below NEVER calls these functions.
-- - Therefore, these functions can safely read public.admins without recursion loops.

CREATE OR REPLACE FUNCTION public.is_admin_from_admins()
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
    WHERE (
      a.id = auth.uid()
      OR lower(COALESCE(a.email, '')) = lower(COALESCE(auth.jwt() ->> 'email', ''))
    )
      AND COALESCE(a.role, '') IN ('admin', 'super_admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_from_admins()
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
    WHERE (
      a.id = auth.uid()
      OR lower(COALESCE(a.email, '')) = lower(COALESCE(auth.jwt() ->> 'email', ''))
    )
      AND COALESCE(a.role, '') = 'super_admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin_from_admins() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin_from_admins() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_from_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin_from_admins() TO authenticated;

-- =====================================================
-- 1) ADMINS (no helper call here => no recursion root)
-- =====================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_select_own_or_jwt_admin"
ON public.admins
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR lower(COALESCE(email, '')) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  OR public.is_admin_from_admins()
);

CREATE POLICY "admins_insert_super_admin_jwt"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin_from_admins());

CREATE POLICY "admins_update_super_admin_jwt"
ON public.admins
FOR UPDATE
TO authenticated
USING (public.is_super_admin_from_admins())
WITH CHECK (public.is_super_admin_from_admins());

CREATE POLICY "admins_delete_super_admin_jwt"
ON public.admins
FOR DELETE
TO authenticated
USING (public.is_super_admin_from_admins());

-- =====================================================
-- 2) ARTICLES
-- =====================================================
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles_public_read"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "articles_admin_all"
ON public.articles
FOR ALL
TO authenticated
USING (public.is_admin_from_admins())
WITH CHECK (public.is_admin_from_admins());

-- =====================================================
-- 3) BOOKS
-- =====================================================
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books_public_read"
ON public.books
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "books_admin_all"
ON public.books
FOR ALL
TO authenticated
USING (public.is_admin_from_admins())
WITH CHECK (public.is_admin_from_admins());

-- =====================================================
-- 4) CATEGORIES
-- =====================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "categories_admin_all"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin_from_admins())
WITH CHECK (public.is_admin_from_admins());

-- =====================================================
-- 5) BORROWS
-- =====================================================
ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "borrows_read_owner_or_admin"
ON public.borrows
FOR SELECT
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
);

CREATE POLICY "borrows_insert_owner_or_admin"
ON public.borrows
FOR INSERT
TO authenticated
WITH CHECK (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
);

CREATE POLICY "borrows_update_owner_or_admin"
ON public.borrows
FOR UPDATE
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
)
WITH CHECK (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
);

-- =====================================================
-- 6) QUEUE
-- =====================================================
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "queue_read_owner_or_admin"
ON public.queue
FOR SELECT
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
);

CREATE POLICY "queue_insert_owner_or_admin"
ON public.queue
FOR INSERT
TO authenticated
WITH CHECK (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
);

CREATE POLICY "queue_update_owner_or_admin"
ON public.queue
FOR UPDATE
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
)
WITH CHECK (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
);

-- =====================================================
-- 7) MEMBERS
-- =====================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_read_owner_or_admin"
ON public.members
FOR SELECT
TO authenticated
USING (
  id = auth.uid()::text
  OR public.is_admin_from_admins()
);

CREATE POLICY "members_update_owner_or_admin"
ON public.members
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()::text
  OR public.is_admin_from_admins()
)
WITH CHECK (
  id = auth.uid()::text
  OR public.is_admin_from_admins()
);

CREATE POLICY "members_delete_owner_or_admin"
ON public.members
FOR DELETE
TO authenticated
USING (
  id = auth.uid()::text
  OR public.is_admin_from_admins()
);

-- =====================================================
-- 8) SETTINGS, STRUCTURE, SCHEDULES, ACHIEVEMENTS
-- =====================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read"
ON public.settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "settings_admin_all"
ON public.settings
FOR ALL
TO authenticated
USING (public.is_admin_from_admins())
WITH CHECK (public.is_admin_from_admins());

CREATE POLICY "structure_public_read"
ON public.structure
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "structure_admin_all"
ON public.structure
FOR ALL
TO authenticated
USING (public.is_admin_from_admins())
WITH CHECK (public.is_admin_from_admins());

CREATE POLICY "schedules_public_read"
ON public.schedules
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "schedules_admin_all"
ON public.schedules
FOR ALL
TO authenticated
USING (public.is_admin_from_admins())
WITH CHECK (public.is_admin_from_admins());

CREATE POLICY "achievements_public_read"
ON public.achievements
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "achievements_admin_all"
ON public.achievements
FOR ALL
TO authenticated
USING (public.is_admin_from_admins())
WITH CHECK (public.is_admin_from_admins());

-- =====================================================
-- 9) GRANTS
-- =====================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

COMMIT;
