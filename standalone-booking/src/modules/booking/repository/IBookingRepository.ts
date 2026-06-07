import type {
  Booking,
  BookingDateLock,
  BookingFilters,
  BookingStatus,
  CalendarDay,
  CreateBookingDTO,
  PaginatedResponse,
  ProposeRescheduleDTO,
  ServiceResponse,
  BookingStats,
  BookingAuditLog,
} from '../types/booking.types';

/**
 * ============================================================================
 * IBookingRepository — Interface kontrak repository (Database-Agnostic)
 * ============================================================================
 *
 * Semua implementasi database (Supabase, REST API, PostgreSQL, dsb)
 * WAJIB mengimplementasikan interface ini.
 *
 * Keuntungan:
 * - Frontend tidak perlu tahu database apa yang dipakai
 * - Mudah diganti saat pindah ke microservice
 * - Mudah di-mock untuk unit testing
 */
export interface IBookingRepository {
  // ── Publik ────────────────────────────────────────────────────────────────

  /**
   * Buat booking baru + lock tanggal secara atomic.
   * Throws error jika tanggal sudah terisi (unique constraint violation).
   */
  create(data: CreateBookingDTO): Promise<ServiceResponse<Booking>>;

  /**
   * Cek apakah tanggal tertentu masih tersedia untuk booking.
   * @returns true jika tersedia, false jika sudah dibooked
   */
  checkDateAvailable(date: string): Promise<boolean>;

  /**
   * Ambil data 1 booking berdasarkan ID.
   */
  findById(id: string): Promise<Booking | null>;

  /**
   * Ambil data ketersediaan tanggal dalam rentang bulan tertentu.
   * Digunakan oleh kalender interaktif (akses publik).
   */
  getCalendarData(year: number, month: number): Promise<CalendarDay[]>;

  /**
   * Ambil semua tanggal yang sudah dilock (untuk render kalender cepat).
   */
  getLockedDates(year: number, month: number): Promise<BookingDateLock[]>;

  // ── Admin ────────────────────────────────────────────────────────────────

  /**
   * Ambil semua booking dengan filter & pagination (admin only).
   */
  findAll(filters: BookingFilters): Promise<PaginatedResponse<Booking>>;

  /**
   * Update status booking (admin only).
   * Otomatis insert ke booking_audit_logs.
   */
  updateStatus(
    id: string,
    status: BookingStatus,
    options?: { note?: string; changedBy?: string; jumlah_dokumen?: number }
  ): Promise<ServiceResponse<Booking>>;

  /**
   * Admin mengajukan jadwal ulang ke pemohon.
   * Mengubah status ke 'rescheduled' + set reschedule_date + kirim email.
   */
  proposeReschedule(
    id: string,
    data: ProposeRescheduleDTO,
    changedBy?: string
  ): Promise<ServiceResponse<Booking>>;

  /**
   * User mengkonfirmasi/menolak usulan jadwal ulang dari admin via link email.
   */
  confirmReschedule(
    token: string,
    action: 'accept' | 'decline'
  ): Promise<ServiceResponse<Booking>>;

  /**
   * Ambil statistik booking (jumlah per status) untuk dashboard admin.
   */
  getStats(): Promise<BookingStats>;

  /**
   * Ambil semua booking tanpa pagination (untuk export Excel/PDF).
   */
  findAllForExport(filters: Omit<BookingFilters, 'page' | 'limit'>): Promise<Booking[]>;

  /**
   * Ambil riwayat audit log untuk satu booking.
   */
  getAuditLogs(bookingId: string): Promise<BookingAuditLog[]>;
}
