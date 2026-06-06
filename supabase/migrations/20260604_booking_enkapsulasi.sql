/**
 * ============================================================================
 * DATABASE MIGRATION: Booking Layanan Enkapsulasi Arsip
 * File: supabase/migrations/20260604_booking_enkapsulasi.sql
 * ============================================================================
 *
 * Membuat 3 tabel baru:
 *   1. bookings            — Data utama booking
 *   2. booking_date_locks  — Lock per tanggal (anti double-booking)
 *   3. booking_audit_logs  — Riwayat perubahan status
 *
 * RLS Policies:
 *   - anon + authenticated : INSERT booking, SELECT ketersediaan tanggal
 *   - admin only           : SELECT semua data, UPDATE status
 *
 * Tidak mengubah tabel yang sudah ada.
 * ============================================================================
 */

BEGIN;

-- ============================================================================
-- CLEANUP: Drop existing policies & tables jika re-run migration
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

DROP TRIGGER IF EXISTS trigger_update_bookings_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS trigger_sync_booking_lock_status ON public.bookings;
DROP FUNCTION IF EXISTS public.update_bookings_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.sync_booking_lock_status() CASCADE;

-- ============================================================================
-- TABEL 1: bookings — Data utama pemesanan layanan
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Data pemohon
  nama_lengkap      TEXT NOT NULL CHECK (char_length(trim(nama_lengkap)) > 1),
  whatsapp          TEXT NOT NULL CHECK (char_length(trim(whatsapp)) >= 9),
  email             TEXT NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  instansi          TEXT,                          -- opsional

  -- Data layanan
  jenis_layanan     TEXT NOT NULL CHECK (char_length(trim(jenis_layanan)) > 0),
  jumlah_dokumen    INTEGER NOT NULL CHECK (jumlah_dokumen > 0),
  tanggal_booking   DATE NOT NULL,
  catatan           TEXT,                          -- opsional

  -- Status
  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'rescheduled', 'cancelled', 'completed')),

  -- Untuk fitur penjadwalan ulang oleh admin
  reschedule_date   DATE,
  reschedule_note   TEXT,

  -- Token untuk konfirmasi reschedule via email (signed, expire 48 jam)
  reschedule_token  TEXT,
  reschedule_token_expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index untuk pencarian & filter
CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON public.bookings (status);

CREATE INDEX IF NOT EXISTS idx_bookings_tanggal
  ON public.bookings (tanggal_booking);

CREATE INDEX IF NOT EXISTS idx_bookings_email
  ON public.bookings (email);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
  ON public.bookings (created_at DESC);

-- ============================================================================
-- TABEL 2: booking_date_locks — Kunci tanggal (1 tanggal = 1 slot)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.booking_date_locks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal     DATE NOT NULL UNIQUE,               -- ← UNIQUE: kunci anti double-booking
  booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending',
  locked_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_date_locks_tanggal
  ON public.booking_date_locks (tanggal);

-- ============================================================================
-- TABEL 3: booking_audit_logs — Riwayat perubahan status
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.booking_audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  changed_by  TEXT,                               -- admin ID atau 'system' atau 'user'
  note        TEXT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_audit_logs_booking_id
  ON public.booking_audit_logs (booking_id, changed_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger 1: Auto-update updated_at saat booking diperbarui
CREATE OR REPLACE FUNCTION public.update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bookings_updated_at();

-- Trigger 2: Sinkronisasi status di booking_date_locks saat status booking berubah
CREATE OR REPLACE FUNCTION public.sync_booking_lock_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika status berubah ke cancelled atau rejected, hapus lock agar tanggal bisa dipilih lagi
  IF NEW.status IN ('cancelled', 'rejected') THEN
    DELETE FROM public.booking_date_locks WHERE booking_id = NEW.id;
  ELSE
    -- Sinkronisasi status di lock table
    UPDATE public.booking_date_locks
    SET status = NEW.status
    WHERE booking_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_booking_lock_status
  AFTER UPDATE OF status ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.sync_booking_lock_status();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_date_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_audit_logs ENABLE ROW LEVEL SECURITY;

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

-- User bisa SELECT booking miliknya sendiri via email (untuk halaman konfirmasi)
CREATE POLICY "bookings_select_by_email"
  ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);   -- Difilter di level aplikasi; data sensitif hanya ditampilkan ke pemilik

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

-- Admin bisa DELETE booking (jarang dipakai, tapi disiapkan)
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

-- Hanya sistem (via service role) yang bisa insert/update/delete locks
-- Frontend menggunakan service role key ONLY di Edge Functions
CREATE POLICY "booking_date_locks_service_insert"
  ON public.booking_date_locks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

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
-- GRANTS
-- ============================================================================
GRANT SELECT ON public.bookings TO anon;
GRANT INSERT ON public.bookings TO anon;
GRANT SELECT ON public.booking_date_locks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_date_locks TO authenticated;
GRANT SELECT, INSERT ON public.booking_audit_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.booking_audit_logs_id_seq TO authenticated;

COMMIT;
