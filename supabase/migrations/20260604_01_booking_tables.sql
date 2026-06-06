/**
 * ============================================================================
 * DATABASE MIGRATION: Booking Layanan Enkapsulasi Arsip - PART 1: TABLES
 * File: supabase/migrations/20260604_01_booking_tables.sql
 * ============================================================================
 */

BEGIN;

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

COMMIT;
