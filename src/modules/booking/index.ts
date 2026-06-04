/**
 * ============================================================================
 * BOOKING MODULE — Public API (Barrel Export)
 * ============================================================================
 *
 * Titik masuk utama modul booking. Import dari sini untuk menggunakan
 * komponen atau service di luar modul (misal: App.tsx, AdminLayout).
 *
 * Contoh penggunaan:
 *   import { BookingPage, AdminBookings } from './modules/booking';
 *   import type { Booking, BookingStatus } from './modules/booking';
 */

// ── Pages (Re-export untuk App.tsx) ──────────────────────────────────────────
export { default as BookingPage } from './pages/BookingPage';
export { default as BookingConfirmation } from './pages/BookingConfirmation';
export { default as RescheduleConfirm } from './pages/RescheduleConfirm';
export { default as AdminBookings } from './pages/admin/AdminBookings';

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  Booking,
  BookingStatus,
  BookingDateLock,
  BookingAuditLog,
  CreateBookingDTO,
  UpdateBookingStatusDTO,
  ProposeRescheduleDTO,
  BookingFilters,
  CalendarDay,
  CalendarDayStatus,
  ServiceResponse,
  PaginatedResponse,
  BookingFormState,
  BookingStats,
} from './types/booking.types';

// ── Constants ────────────────────────────────────────────────────────────────
export { JENIS_LAYANAN, JENIS_LAYANAN_DESC } from './constants/jenisLayanan';
export { BOOKING_STATUS_CONFIG, ALLOWED_TRANSITIONS } from './constants/bookingStatus';
export { BK_COLORS, BK_STATUS_COLORS, BK_FONTS, getStatusColor } from './constants/designTokens';

// ── Services (untuk penggunaan di luar modul) ────────────────────────────────
export * as bookingService from './services/bookingService';
export * as bookingExport from './services/exportService';
