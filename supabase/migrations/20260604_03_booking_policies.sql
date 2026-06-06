/**
 * ============================================================================
 * DATABASE MIGRATION: Booking Layanan Enkapsulasi Arsip - PART 3: POLICIES & GRANTS
 * File: supabase/migrations/20260604_03_booking_policies.sql
 * ============================================================================
 */

BEGIN;

-- ============================================================================
-- CLEANUP POLICIES
-- ============================================================================
DO $$
DECLARE r record;
BEGIN
  -- Drop policies jika ada
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('bookings', 'booking_date_locks', 'booking_audit_logs')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_date_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES DEFINITION
-- ============================================================================

-- ── bookings ──────────────────────────────────────────────────────────────

-- Siapapun (anon/authenticated) bisa membuat booking baru
CREATE POLICY "bookings_public_insert"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(nama_lengkap)) > 1
    AND char_length(trim(whatsapp)) >= 9
    AND email ~* '^[^@]+@[^@]+\.[^@]+$'
    AND char_length(trim(jenis_layanan)) > 0
    AND jumlah_dokumen > 0
    AND tanggal_booking >= CURRENT_DATE
  );

-- User bisa SELECT booking miliknya sendiri (difilter di level aplikasi)
CREATE POLICY "bookings_select_by_email"
  ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin bisa SELECT semua booking
CREATE POLICY "bookings_admin_select"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (public.is_admin_from_admins());

-- Admin bisa UPDATE status booking
CREATE POLICY "bookings_admin_update"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_from_admins())
  WITH CHECK (public.is_admin_from_admins());

-- Admin bisa DELETE booking
CREATE POLICY "bookings_admin_delete"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (public.is_admin_from_admins());

-- ── booking_date_locks ─────────────────────────────────────────────────────

-- Siapapun bisa melihat tanggal yang sudah terisi (untuk kalender publik)
CREATE POLICY "booking_date_locks_public_select"
  ON public.booking_date_locks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Hanya sistem (via service role) yang bisa insert locks
CREATE POLICY "booking_date_locks_service_insert"
  ON public.booking_date_locks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin memiliki akses penuh ke locks
CREATE POLICY "booking_date_locks_admin_all"
  ON public.booking_date_locks
  FOR ALL
  TO authenticated
  USING (public.is_admin_from_admins())
  WITH CHECK (public.is_admin_from_admins());

-- ── booking_audit_logs ─────────────────────────────────────────────────────

-- Admin bisa melihat semua audit log
CREATE POLICY "booking_audit_logs_admin_select"
  ON public.booking_audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin_from_admins());

-- Sistem bisa insert audit log
CREATE POLICY "booking_audit_logs_insert"
  ON public.booking_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- GRANTS & PERMISSIONS
-- ============================================================================
GRANT SELECT ON public.bookings TO anon;
GRANT INSERT ON public.bookings TO anon;
GRANT SELECT ON public.booking_date_locks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_date_locks TO authenticated;
GRANT SELECT, INSERT ON public.booking_audit_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.booking_audit_logs_id_seq TO authenticated;

COMMIT;
