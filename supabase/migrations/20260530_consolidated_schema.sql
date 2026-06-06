-- ============================================================================
-- CONSOLIDATED SCHEMAS & POLICIES FOR SUPABASE (DISIPUSDA PURWAKARTA)
-- File: supabase/migrations/20260530_consolidated_schema.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: REMOVE PRE-EXISTING POLICIES & HELPER FUNCTIONS
-- ============================================================================
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
        'achievements',
        'borrow_notification_logs',
        'warga_reports',
        'audit_logs'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.is_admin_from_table() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin_from_table() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_fix() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_final() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_from_admins() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin_from_admins() CASCADE;

-- ============================================================================
-- PART 2: HELPER FUNCTIONS (Table-driven & Non-recursive)
-- ============================================================================
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  -- Cara A: Cek dari metadata JWT token bawaan Supabase
  IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin'), false) THEN
    RETURN true;
  END IF;

  -- Cara B: Cek dari tabel public.admins (jika tabelnya sudah ada)
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins'
  ) THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.admins a
      WHERE (
        a.id = auth.uid()
        OR lower(COALESCE(a.email, '')) = lower(COALESCE(auth.jwt() ->> 'email', ''))
      )
        AND COALESCE(a.role, '') IN ('admin', 'super_admin')
    );
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin_from_admins() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin_from_admins() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_from_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin_from_admins() TO authenticated;

-- ============================================================================
-- PART 3: TABLE MODIFICATIONS & TRIGGERS (ARTICLES IMMUTABILITY & AUDITING)
-- ============================================================================

-- Constraints for articles
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS check_immutable_created_at;
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS check_immutable_created_by;

ALTER TABLE public.articles 
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE public.articles 
  ADD CONSTRAINT check_immutable_created_at CHECK (created_at IS NOT NULL);

ALTER TABLE public.articles 
  ADD CONSTRAINT check_immutable_created_by CHECK (created_by IS NOT NULL AND created_by != '');

-- Trigger: Auto-set updated_at & updated_by
CREATE OR REPLACE FUNCTION public.update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.updated_by IS NULL THEN
    NEW.updated_by = auth.uid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_articles_updated_at();

-- Trigger: Auto-set published_at when status changes to 'published'
CREATE OR REPLACE FUNCTION public.set_published_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    NEW.published_at = now();
  ELSIF NEW.status != 'published' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_published_timestamp ON public.articles;
CREATE TRIGGER trigger_set_published_timestamp
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_published_timestamp();

-- Audit logging table and trigger
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

CREATE OR REPLACE FUNCTION public.audit_articles_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, record_id, operation, user_id, new_values)
    VALUES ('articles', NEW.id, 'INSERT', auth.uid()::text, row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, operation, user_id, old_values, new_values)
    VALUES ('articles', NEW.id, 'UPDATE', auth.uid()::text, row_to_json(OLD), row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, operation, user_id, old_values)
    VALUES ('articles', OLD.id, 'DELETE', auth.uid()::text, row_to_json(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_articles_changes ON public.articles;
CREATE TRIGGER trigger_audit_articles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_articles_changes();

-- ============================================================================
-- PART 4: CATEGORIES SLUG CONSTRAINT
-- ============================================================================
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_type_slug_unique;
ALTER TABLE public.categories 
  ADD CONSTRAINT categories_type_slug_unique UNIQUE (type, slug);

-- ============================================================================
-- PART 5: NEW TABLES (BORROW NOTIFICATION LOGS & WARGA REPORTS)
-- ============================================================================

-- Table for borrow notification logs
CREATE TABLE IF NOT EXISTS public.borrow_notification_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  borrow_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT borrow_notification_logs_notification_type_check 
    CHECK (notification_type IN ('pickup_6h', 'due_h2', 'overdue_daily'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_borrow_notification_once_per_day
  ON public.borrow_notification_logs (borrow_id, notification_type, notification_date);

CREATE INDEX IF NOT EXISTS idx_borrow_notification_member_date
  ON public.borrow_notification_logs (member_id, notification_date DESC);

-- Table for Lapor Warga reports
CREATE TABLE IF NOT EXISTS public.warga_reports (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  telepon TEXT NOT NULL,
  kategori TEXT NOT NULL,
  pesan TEXT NOT NULL,
  alamat TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Baru',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warga_reports_created_at
  ON public.warga_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_warga_reports_status
  ON public.warga_reports (status);

-- ============================================================================
-- PART 6: ROW-LEVEL SECURITY (RLS) POLICIES ENFORCEMENT
-- ============================================================================

-- Enable RLS across all relevant tables
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
ALTER TABLE public.borrow_notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warga_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1) ADMINS
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

-- 2) ARTICLES
CREATE POLICY "articles_public_read"
  ON public.articles
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR created_by = auth.uid()::text OR public.is_admin());

CREATE POLICY "articles_insert_owner"
  ON public.articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text IS NOT NULL AND created_by = auth.uid()::text);

CREATE POLICY "articles_update_owner_or_admin"
  ON public.articles
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid()::text OR public.is_admin())
  WITH CHECK (
    created_at = OLD.created_at
    AND created_by = OLD.created_by
    AND (
      published_at = OLD.published_at
      OR (NEW.status = 'published' AND OLD.status != 'published')
      OR (NEW.status != 'published' AND OLD.status = 'published')
    )
  );

CREATE POLICY "articles_delete_owner_or_admin"
  ON public.articles
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid()::text OR public.is_admin());

-- 3) BOOKS
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

-- 4) CATEGORIES
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

-- 5) BORROWS
CREATE POLICY "borrows_read_owner_or_admin"
  ON public.borrows
  FOR SELECT
  TO authenticated
  USING (
    "memberId" = auth.uid()::text
    OR public.is_admin()
  );

CREATE POLICY "borrows_insert_owner_or_admin"
  ON public.borrows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "memberId" = auth.uid()::text
    OR public.is_admin()
  );

CREATE POLICY "borrows_update_admin_only"
  ON public.borrows
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6) QUEUE
CREATE POLICY "queue_everyone_read"
  ON public.queue
  FOR SELECT
  USING (true);

CREATE POLICY "queue_insert_owner_or_admin"
  ON public.queue
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "memberId" = auth.uid()::text
    OR public.is_admin()
  );

CREATE POLICY "queue_update_owner_or_admin"
  ON public.queue
  FOR UPDATE
  TO authenticated
  USING (
    "memberId" = auth.uid()::text
    OR public.is_admin()
  );

-- 7) MEMBERS
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

-- 8) SETTINGS, STRUCTURE, SCHEDULES, ACHIEVEMENTS
CREATE POLICY "settings_public_read" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings_admin_all" ON public.settings FOR ALL TO authenticated USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());

CREATE POLICY "structure_public_read" ON public.structure FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "structure_admin_all" ON public.structure FOR ALL TO authenticated USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());

CREATE POLICY "schedules_public_read" ON public.schedules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "schedules_admin_all" ON public.schedules FOR ALL TO authenticated USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());

CREATE POLICY "achievements_public_read" ON public.achievements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "achievements_admin_all" ON public.achievements FOR ALL TO authenticated USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());

-- 9) BORROW NOTIFICATION LOGS
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

-- 10) WARGA REPORTS
CREATE POLICY "warga_reports_public_insert"
  ON public.warga_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(nama)) > 0
    AND char_length(trim(email)) > 0
    AND char_length(trim(telepon)) > 0
    AND char_length(trim(kategori)) > 0
    AND char_length(trim(pesan)) > 0
    AND char_length(trim(alamat)) > 0
  );

CREATE POLICY "warga_reports_admin_read"
  ON public.warga_reports
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "warga_reports_admin_update"
  ON public.warga_reports
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "warga_reports_admin_delete"
  ON public.warga_reports
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 11) AUDIT LOGS
CREATE POLICY "audit_logs_admin_read"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- PART 7: GRANTS & PERMISSIONS
-- ============================================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

COMMIT;
