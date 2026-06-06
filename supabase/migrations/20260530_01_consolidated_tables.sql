/**
 * ============================================================================
 * CONSOLIDATED SCHEMAS & POLICIES FOR SUPABASE - PART 1: TABLES, FUNCTIONS, & CONSTRAINTS
 * File: supabase/migrations/20260530_01_consolidated_tables.sql
 * ============================================================================
 */

BEGIN;

-- ============================================================================
-- HELPER FUNCTIONS (Table-driven & Non-recursive)
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
  -- Cek dari metadata JWT token bawaan Supabase
  IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin'), false) THEN
    RETURN true;
  END IF;

  -- Cek dari tabel public.admins
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
-- TABLE CONSTRAINTS & ALTERATIONS
-- ============================================================================

-- Safe constraints modification for articles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles') THEN
    ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS check_immutable_created_at;
    ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS check_immutable_created_by;

    ALTER TABLE public.articles 
      ALTER COLUMN created_at SET NOT NULL,
      ALTER COLUMN created_by SET NOT NULL;

    ALTER TABLE public.articles 
      ADD CONSTRAINT check_immutable_created_at CHECK (created_at IS NOT NULL);

    ALTER TABLE public.articles 
      ADD CONSTRAINT check_immutable_created_by CHECK (created_by IS NOT NULL AND created_by != '');
  END IF;
END $$;

-- Safe constraints modification for categories
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_type_slug_unique;
    ALTER TABLE public.categories 
      ADD CONSTRAINT categories_type_slug_unique UNIQUE (type, slug);
  END IF;
END $$;

-- ============================================================================
-- NEW TABLES CREATION
-- ============================================================================

-- Table for audit logs
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

COMMIT;
