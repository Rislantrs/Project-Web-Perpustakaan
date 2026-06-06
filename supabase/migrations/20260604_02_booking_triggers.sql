/**
 * ============================================================================
 * DATABASE MIGRATION: Booking Layanan Enkapsulasi Arsip - PART 2: TRIGGERS & FUNCTIONS
 * File: supabase/migrations/20260604_02_booking_triggers.sql
 * ============================================================================
 */

BEGIN;

-- ============================================================================
-- CLEANUP TRIGGERS & FUNCTIONS
-- ============================================================================
DO $$
BEGIN
  -- Drop triggers jika tabel bookings sudah ada
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_bookings_updated_at ON public.bookings';
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_sync_booking_lock_status ON public.bookings';
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.update_bookings_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.sync_booking_lock_status() CASCADE;

-- ============================================================================
-- TRIGGERS & PROCEDURAL LOGIC
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

COMMIT;
