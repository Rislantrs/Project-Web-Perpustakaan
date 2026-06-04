/**
 * ============================================================================
 * factory.ts — Repository Factory untuk Modul Booking
 * ============================================================================
 *
 * Memilih implementasi repository yang tepat berdasarkan env variable:
 *   VITE_BOOKING_DB_MODE=supabase  → SupabaseBookingRepo (default)
 *   VITE_BOOKING_DB_MODE=api       → ApiBookingRepo (microservice)
 *
 * Penggunaan:
 *   import { getBookingRepository } from './factory';
 *   const repo = getBookingRepository();
 *   await repo.create(data);
 */

import type { IBookingRepository } from './IBookingRepository';
import { SupabaseBookingRepo }     from './SupabaseBookingRepo';
import { ApiBookingRepo }          from './ApiBookingRepo';

/** Mode database yang aktif */
type BookingDbMode = 'supabase' | 'api';

/** Singleton — repository instance di-cache setelah pertama kali dibuat */
let repoInstance: IBookingRepository | null = null;

/**
 * Ambil instance repository booking sesuai konfigurasi env.
 *
 * @returns Implementasi IBookingRepository yang sesuai mode
 */
export function getBookingRepository(): IBookingRepository {
  if (repoInstance) return repoInstance;

  const mode = (import.meta.env.VITE_BOOKING_DB_MODE as BookingDbMode | undefined) ?? 'supabase';

  switch (mode) {
    case 'api':
      repoInstance = new ApiBookingRepo();
      break;

    case 'supabase':
    default:
      repoInstance = new SupabaseBookingRepo();
      break;
  }

  return repoInstance;
}

/**
 * Reset singleton — berguna untuk testing atau hot-reload.
 * Tidak perlu dipanggil di production.
 */
export function resetBookingRepository(): void {
  repoInstance = null;
}

// Export tipe untuk kemudahan import
export type { IBookingRepository };
