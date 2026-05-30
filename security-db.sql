-- Security only.
-- This file defines RLS policies, helper functions, auth sync, grants, and safe admin bootstrap.
-- It is designed to preserve public access to articles, catalog metadata, and shared site content.

BEGIN;

-- =====================================================
-- CLEANUP OLD POLICIES / HELPERS
-- =====================================================

DO $$
DECLARE
  p record;
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
        'achievements',
        'audit_logs',
        'borrow_notification_logs'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS trg_sync_member_from_auth ON auth.users;
DROP FUNCTION IF EXISTS public.sync_member_from_auth();
DROP FUNCTION IF EXISTS public.is_admin_from_admins();
DROP FUNCTION IF EXISTS public.is_super_admin_from_admins();
DROP FUNCTION IF EXISTS public.is_admin();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.is_admin_from_admins();
$$;

REVOKE ALL ON FUNCTION public.is_admin_from_admins() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin_from_admins() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_from_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin_from_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =====================================================
-- SAFE ADMIN BOOTSTRAP
-- =====================================================

INSERT INTO public.admins (
  id,
  nama_lengkap,
  email,
  password_hash,
  role,
  tanggal_dibuat,
  avatar_color
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Super Admin',
  'admin@disipusda.go.id',
  '$2a$10$wR.lXz.vXWzJvXw.X.w.X.w.X.w.X.w.X.w.X.w.X.w.X.w.X.w.X',
  'super_admin',
  '14 April 2024',
  '#0c2f3d'
)
ON CONFLICT (email) DO UPDATE SET
  nama_lengkap = EXCLUDED.nama_lengkap,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  tanggal_dibuat = EXCLUDED.tanggal_dibuat,
  avatar_color = EXCLUDED.avatar_color,
  updated_at = now();

-- =====================================================
-- AUTH -> MEMBERS SYNC
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_member_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_notification_logs ENABLE ROW LEVEL SECURITY;

-- ADMINS
CREATE POLICY "admins_select_own_or_admin"
ON public.admins
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR lower(COALESCE(email, '')) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  OR public.is_admin_from_admins()
);

CREATE POLICY "admins_insert_super_admin"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin_from_admins());

CREATE POLICY "admins_update_super_admin"
ON public.admins
FOR UPDATE
TO authenticated
USING (public.is_super_admin_from_admins())
WITH CHECK (public.is_super_admin_from_admins());

CREATE POLICY "admins_delete_super_admin"
ON public.admins
FOR DELETE
TO authenticated
USING (public.is_super_admin_from_admins());

-- ARTICLES
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

-- BOOKS
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

-- CATEGORIES
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

-- BORROWS
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

CREATE POLICY "borrows_delete_owner_or_admin"
ON public.borrows
FOR DELETE
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
);

-- QUEUE
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

CREATE POLICY "queue_delete_owner_or_admin"
ON public.queue
FOR DELETE
TO authenticated
USING (
  "memberId" = auth.uid()::text
  OR public.is_admin_from_admins()
);

-- MEMBERS
CREATE POLICY "members_read_owner_or_admin"
ON public.members
FOR SELECT
TO authenticated
USING (
  id = auth.uid()::text
  OR public.is_admin_from_admins()
);

CREATE POLICY "members_insert_owner_or_admin"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (
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

-- SETTINGS / STRUCTURE / SCHEDULES / ACHIEVEMENTS
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

-- AUDIT LOGS
CREATE POLICY "audit_logs_admin_read"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin_from_admins());

-- BORROW NOTIFICATION LOGS
CREATE POLICY "borrow_notification_logs_admin_read"
ON public.borrow_notification_logs
FOR SELECT
TO authenticated
USING (public.is_admin_from_admins());

CREATE POLICY "borrow_notification_logs_admin_insert"
ON public.borrow_notification_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_from_admins());

-- =====================================================
-- GRANTS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.books TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT SELECT ON public.structure TO anon, authenticated;
GRANT SELECT ON public.schedules TO anon, authenticated;
GRANT SELECT ON public.achievements TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.borrows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queue TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admins TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.borrow_notification_logs TO authenticated;

COMMIT;
