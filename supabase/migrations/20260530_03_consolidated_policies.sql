/**
 * ============================================================================
 * CONSOLIDATED SCHEMAS & POLICIES FOR SUPABASE - PART 3: RLS POLICIES & GRANTS
 * File: supabase/migrations/20260530_03_consolidated_policies.sql
 * ============================================================================
 */

BEGIN;

-- ============================================================================
-- CLEANUP OF EXISTING POLICIES
-- ============================================================================
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'admins', 'articles', 'books', 'categories', 'borrows', 'queue',
        'members', 'settings', 'structure', 'schedules', 'achievements',
        'borrow_notification_logs', 'warga_reports', 'audit_logs'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- RLS POLICIES (Safe against missing tables)
-- ============================================================================

-- 1) ADMINS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
    ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "admins_select_own_or_jwt_admin" ON public.admins FOR SELECT TO authenticated
      USING (id = auth.uid() OR lower(COALESCE(email, '')) = lower(COALESCE(auth.jwt() ->> 'email', '')) OR public.is_admin_from_admins());

    CREATE POLICY "admins_insert_super_admin_jwt" ON public.admins FOR INSERT TO authenticated
      WITH CHECK (public.is_super_admin_from_admins());

    CREATE POLICY "admins_update_super_admin_jwt" ON public.admins FOR UPDATE TO authenticated
      USING (public.is_super_admin_from_admins()) WITH CHECK (public.is_super_admin_from_admins());

    CREATE POLICY "admins_delete_super_admin_jwt" ON public.admins FOR DELETE TO authenticated
      USING (public.is_super_admin_from_admins());
  END IF;
END $$;

-- 2) ARTICLES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles') THEN
    ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "articles_public_read" ON public.articles FOR SELECT TO anon, authenticated
      USING (status = 'published' OR created_by = auth.uid()::text OR public.is_admin());

    CREATE POLICY "articles_insert_owner" ON public.articles FOR INSERT TO authenticated
      WITH CHECK (auth.uid()::text IS NOT NULL AND created_by = auth.uid()::text);

    CREATE POLICY "articles_update_owner_or_admin" ON public.articles FOR UPDATE TO authenticated
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

    CREATE POLICY "articles_delete_owner_or_admin" ON public.articles FOR DELETE TO authenticated
      USING (created_by = auth.uid()::text OR public.is_admin());
  END IF;
END $$;

-- 3) BOOKS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'books') THEN
    ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "books_public_read" ON public.books FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "books_admin_all" ON public.books FOR ALL TO authenticated
      USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());
  END IF;
END $$;

-- 4) CATEGORIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "categories_admin_all" ON public.categories FOR ALL TO authenticated
      USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());
  END IF;
END $$;

-- 5) BORROWS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'borrows') THEN
    ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "borrows_read_owner_or_admin" ON public.borrows FOR SELECT TO authenticated
      USING ("memberId" = auth.uid()::text OR public.is_admin());

    CREATE POLICY "borrows_insert_owner_or_admin" ON public.borrows FOR INSERT TO authenticated
      WITH CHECK ("memberId" = auth.uid()::text OR public.is_admin());

    CREATE POLICY "borrows_update_admin_only" ON public.borrows FOR UPDATE TO authenticated
      USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 6) QUEUE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'queue') THEN
    ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "queue_everyone_read" ON public.queue FOR SELECT USING (true);
    CREATE POLICY "queue_insert_owner_or_admin" ON public.queue FOR INSERT TO authenticated
      WITH CHECK ("memberId" = auth.uid()::text OR public.is_admin());
    CREATE POLICY "queue_update_owner_or_admin" ON public.queue FOR UPDATE TO authenticated
      USING ("memberId" = auth.uid()::text OR public.is_admin());
  END IF;
END $$;

-- 7) MEMBERS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'members') THEN
    ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "members_read_owner_or_admin" ON public.members FOR SELECT TO authenticated
      USING (id = auth.uid()::text OR public.is_admin_from_admins());

    CREATE POLICY "members_insert_owner_or_admin" ON public.members FOR INSERT
      WITH CHECK (id = auth.uid()::text OR public.is_admin_from_admins());

    CREATE POLICY "members_update_owner_or_admin" ON public.members FOR UPDATE TO authenticated
      USING (id = auth.uid()::text OR public.is_admin_from_admins())
      WITH CHECK (id = auth.uid()::text OR public.is_admin_from_admins());

    CREATE POLICY "members_delete_owner_or_admin" ON public.members FOR DELETE TO authenticated
      USING (id = auth.uid()::text OR public.is_admin_from_admins());
  END IF;
END $$;

-- 8) SETTINGS, STRUCTURE, SCHEDULES, ACHIEVEMENTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings') THEN
    ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "settings_public_read" ON public.settings FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "settings_admin_all" ON public.settings FOR ALL TO authenticated USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'structure') THEN
    ALTER TABLE public.structure ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "structure_public_read" ON public.structure FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "structure_admin_all" ON public.structure FOR ALL TO authenticated USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'schedules') THEN
    ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "schedules_public_read" ON public.schedules FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "schedules_admin_all" ON public.schedules FOR ALL TO authenticated USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'achievements') THEN
    ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "achievements_public_read" ON public.achievements FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "achievements_admin_all" ON public.achievements FOR ALL TO authenticated USING (public.is_admin_from_admins()) WITH CHECK (public.is_admin_from_admins());
  END IF;
END $$;

-- 9) BORROW NOTIFICATION LOGS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'borrow_notification_logs') THEN
    ALTER TABLE public.borrow_notification_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "borrow_notification_logs_admin_read" ON public.borrow_notification_logs FOR SELECT TO authenticated
      USING (public.is_admin_from_admins());

    CREATE POLICY "borrow_notification_logs_admin_insert" ON public.borrow_notification_logs FOR INSERT TO authenticated
      WITH CHECK (public.is_admin_from_admins());
  END IF;
END $$;

-- 10) WARGA REPORTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'warga_reports') THEN
    ALTER TABLE public.warga_reports ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "warga_reports_public_insert" ON public.warga_reports FOR INSERT TO anon, authenticated
      WITH CHECK (
        char_length(trim(nama)) > 0
        AND char_length(trim(email)) > 0
        AND char_length(trim(telepon)) > 0
        AND char_length(trim(kategori)) > 0
        AND char_length(trim(pesan)) > 0
        AND char_length(trim(alamat)) > 0
      );

    CREATE POLICY "warga_reports_admin_read" ON public.warga_reports FOR SELECT TO authenticated USING (public.is_admin());
    CREATE POLICY "warga_reports_admin_update" ON public.warga_reports FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    CREATE POLICY "warga_reports_admin_delete" ON public.warga_reports FOR DELETE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- 11) AUDIT LOGS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "audit_logs_admin_read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- ============================================================================
-- GRANTS & PERMISSIONS
-- ============================================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

COMMIT;
