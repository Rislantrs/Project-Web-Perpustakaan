/**
 * ============================================================================
 * ApiBookingRepo — Implementasi IBookingRepository menggunakan REST API
 * ============================================================================
 *
 * Digunakan saat VITE_BOOKING_DB_MODE='api' (mode microservice).
 * Seluruh request dikirim ke base URL yang dikonfigurasi via env var.
 *
 * Environment variables yang dibutuhkan:
 *  - VITE_BOOKING_API_URL   : Base URL microservice (e.g., https://api.example.com)
 *  - VITE_BOOKING_API_TOKEN : Bearer token untuk otorisasi
 */

import type { IBookingRepository } from './IBookingRepository';
import type {
  Booking,
  BookingDateLock,
  BookingFilters,
  BookingStats,
  BookingStatus,
  CalendarDay,
  CreateBookingDTO,
  PaginatedResponse,
  ProposeRescheduleDTO,
  ServiceResponse,
} from '../types/booking.types';

/** Base URL REST API dari env variable */
const API_BASE_URL  = import.meta.env.VITE_BOOKING_API_URL  as string;
/** Bearer token otorisasi dari env variable */
const API_TOKEN     = import.meta.env.VITE_BOOKING_API_TOKEN as string;

/**
 * Buat default headers dengan Authorization + Content-Type.
 */
function buildHeaders(): HeadersInit {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${API_TOKEN}`,
  };
}

/**
 * Wrapper fetch yang melempar error jika response bukan 2xx.
 * Response body selalu di-parse sebagai JSON.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (body as { message?: string }).message ??
      `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return body as T;
}

/**
 * Bangun query string dari object params (membuang nilai undefined/null/kosong).
 */
function buildQueryString(params: Record<string, string | number | undefined | null>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

export class ApiBookingRepo implements IBookingRepository {
  // ── Publik ─────────────────────────────────────────────────────────────────

  /**
   * POST /api/bookings
   */
  async create(data: CreateBookingDTO): Promise<ServiceResponse<Booking>> {
    try {
      const result = await apiFetch<ServiceResponse<Booking>>('/api/bookings', {
        method: 'POST',
        body:   JSON.stringify(data),
      });
      return result;
    } catch (err) {
      console.error('[ApiBookingRepo] create() error:', err);
      return {
        success: false,
        message: (err as Error).message || 'Gagal menghubungi server booking.',
      };
    }
  }

  /**
   * GET /api/bookings/check-date?date=YYYY-MM-DD
   */
  async checkDateAvailable(date: string): Promise<boolean> {
    try {
      const result = await apiFetch<{ available: boolean }>(
        `/api/bookings/check-date?date=${encodeURIComponent(date)}`
      );
      return result.available === true;
    } catch (err) {
      console.error('[ApiBookingRepo] checkDateAvailable() error:', err);
      return false; // fail-safe: anggap tidak tersedia
    }
  }

  /**
   * GET /api/bookings/:id
   */
  async findById(id: string): Promise<Booking | null> {
    try {
      const result = await apiFetch<{ data: Booking }>(`/api/bookings/${encodeURIComponent(id)}`);
      return result.data ?? null;
    } catch (err) {
      console.error('[ApiBookingRepo] findById() error:', err);
      return null;
    }
  }

  /**
   * GET /api/bookings/calendar?year=&month=
   */
  async getCalendarData(year: number, month: number): Promise<CalendarDay[]> {
    try {
      const qs     = buildQueryString({ year, month });
      const result = await apiFetch<{ data: CalendarDay[] }>(`/api/bookings/calendar${qs}`);
      return result.data ?? [];
    } catch (err) {
      console.error('[ApiBookingRepo] getCalendarData() error:', err);
      return [];
    }
  }

  /**
   * GET /api/bookings/locked-dates?year=&month=
   */
  async getLockedDates(year: number, month: number): Promise<BookingDateLock[]> {
    try {
      const qs     = buildQueryString({ year, month });
      const result = await apiFetch<{ data: BookingDateLock[] }>(`/api/bookings/locked-dates${qs}`);
      return result.data ?? [];
    } catch (err) {
      console.error('[ApiBookingRepo] getLockedDates() error:', err);
      return [];
    }
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  /**
   * GET /api/bookings?status=&page=&limit=&search=&tanggal_from=&tanggal_to=
   */
  async findAll(filters: BookingFilters): Promise<PaginatedResponse<Booking>> {
    try {
      const qs = buildQueryString({
        status:       filters.status,
        page:         filters.page,
        limit:        filters.limit,
        search:       filters.search,
        tanggal_from: filters.tanggal_from,
        tanggal_to:   filters.tanggal_to,
      });

      const result = await apiFetch<PaginatedResponse<Booking>>(`/api/bookings${qs}`);
      return result;
    } catch (err) {
      console.error('[ApiBookingRepo] findAll() error:', err);
      return {
        items:      [],
        total:      0,
        page:       filters.page  ?? 1,
        limit:      filters.limit ?? 10,
        totalPages: 0,
      };
    }
  }

  /**
   * PATCH /api/bookings/:id/status
   * Body: { status, note?, changedBy? }
   */
  async updateStatus(
    id: string,
    status: BookingStatus,
    options?: { note?: string; changedBy?: string }
  ): Promise<ServiceResponse<Booking>> {
    try {
      const result = await apiFetch<ServiceResponse<Booking>>(
        `/api/bookings/${encodeURIComponent(id)}/status`,
        {
          method: 'PATCH',
          body:   JSON.stringify({
            status,
            note:      options?.note,
            changedBy: options?.changedBy,
          }),
        }
      );
      return result;
    } catch (err) {
      console.error('[ApiBookingRepo] updateStatus() error:', err);
      return {
        success: false,
        message: (err as Error).message || 'Gagal memperbarui status booking.',
      };
    }
  }

  /**
   * PATCH /api/bookings/:id/reschedule
   * Body: { reschedule_date, reschedule_note, changedBy? }
   */
  async proposeReschedule(
    id: string,
    data: ProposeRescheduleDTO,
    changedBy?: string
  ): Promise<ServiceResponse<Booking>> {
    try {
      const result = await apiFetch<ServiceResponse<Booking>>(
        `/api/bookings/${encodeURIComponent(id)}/reschedule`,
        {
          method: 'PATCH',
          body:   JSON.stringify({ ...data, changedBy }),
        }
      );
      return result;
    } catch (err) {
      console.error('[ApiBookingRepo] proposeReschedule() error:', err);
      return {
        success: false,
        message: (err as Error).message || 'Gagal mengajukan penjadwalan ulang.',
      };
    }
  }

  /**
   * POST /api/bookings/reschedule/confirm
   * Body: { token, action }
   */
  async confirmReschedule(
    token: string,
    action: 'accept' | 'decline'
  ): Promise<ServiceResponse<Booking>> {
    try {
      const result = await apiFetch<ServiceResponse<Booking>>(
        '/api/bookings/reschedule/confirm',
        {
          method: 'POST',
          body:   JSON.stringify({ token, action }),
        }
      );
      return result;
    } catch (err) {
      console.error('[ApiBookingRepo] confirmReschedule() error:', err);
      return {
        success: false,
        message: (err as Error).message || 'Gagal mengkonfirmasi penjadwalan ulang.',
      };
    }
  }

  /**
   * GET /api/bookings/stats
   */
  async getStats(): Promise<BookingStats> {
    try {
      const result = await apiFetch<{ data: BookingStats }>('/api/bookings/stats');
      return result.data ?? { total: 0, pending: 0, approved: 0, rejected: 0, rescheduled: 0, cancelled: 0, completed: 0 };
    } catch (err) {
      console.error('[ApiBookingRepo] getStats() error:', err);
      return { total: 0, pending: 0, approved: 0, rejected: 0, rescheduled: 0, cancelled: 0, completed: 0 };
    }
  }

  /**
   * GET /api/bookings/export?status=&search=&tanggal_from=&tanggal_to=
   */
  async findAllForExport(
    filters: Omit<BookingFilters, 'page' | 'limit'>
  ): Promise<Booking[]> {
    try {
      const qs = buildQueryString({
        status:       filters.status,
        search:       filters.search,
        tanggal_from: filters.tanggal_from,
        tanggal_to:   filters.tanggal_to,
      });

      const result = await apiFetch<{ data: Booking[] }>(`/api/bookings/export${qs}`);
      return result.data ?? [];
    } catch (err) {
      console.error('[ApiBookingRepo] findAllForExport() error:', err);
      return [];
    }
  }
}
