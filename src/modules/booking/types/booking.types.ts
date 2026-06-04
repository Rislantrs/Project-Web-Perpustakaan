/**
 * ============================================================================
 * BOOKING MODULE — TypeScript Types & Interfaces
 * ============================================================================
 */

// Status booking yang tersedia
export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'rescheduled'
  | 'cancelled'
  | 'completed';

// Model utama booking (sesuai schema DB)
export interface Booking {
  id: string;
  nama_lengkap: string;
  whatsapp: string;
  email: string;
  instansi?: string | null;
  jenis_layanan: string;
  jumlah_dokumen: number;
  tanggal_booking: string;   // format: YYYY-MM-DD
  catatan?: string | null;
  status: BookingStatus;
  reschedule_date?: string | null;
  reschedule_note?: string | null;
  created_at: string;
  updated_at: string;
}

// Lock tanggal di DB (booking_date_locks)
export interface BookingDateLock {
  id: string;
  tanggal: string;           // format: YYYY-MM-DD
  booking_id: string;
  status: string;
  locked_at: string;
}

// Audit log perubahan status
export interface BookingAuditLog {
  id: number;
  booking_id: string;
  old_status?: string | null;
  new_status: string;
  changed_by?: string | null;
  note?: string | null;
  changed_at: string;
}

// DTO untuk membuat booking baru (dari form publik)
export interface CreateBookingDTO {
  nama_lengkap: string;
  whatsapp: string;
  email: string;
  instansi?: string;
  jenis_layanan: string;
  jumlah_dokumen: number;
  tanggal_booking: string;   // YYYY-MM-DD
  catatan?: string;
}

// DTO untuk update status oleh admin
export interface UpdateBookingStatusDTO {
  status: BookingStatus;
  note?: string;
}

// DTO untuk mengajukan jadwal ulang oleh admin
export interface ProposeRescheduleDTO {
  reschedule_date: string;   // YYYY-MM-DD
  reschedule_note: string;
}

// Filter untuk query admin
export interface BookingFilters {
  status?: BookingStatus | 'all';
  tanggal_from?: string;     // YYYY-MM-DD
  tanggal_to?: string;       // YYYY-MM-DD
  search?: string;           // cari by nama/email/WA
  page?: number;
  limit?: number;
}

// Data hari di kalender
export type CalendarDayStatus = 'available' | 'pending' | 'approved' | 'rescheduled' | 'disabled';

export interface CalendarDay {
  date: string;              // YYYY-MM-DD
  status: CalendarDayStatus;
  bookingId?: string;
  isWeekend?: boolean;
  isPast?: boolean;
}

// Response generic dari service layer
export interface ServiceResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

// Response pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// State form booking (untuk useBookingForm hook)
export interface BookingFormState {
  nama_lengkap: string;
  whatsapp: string;
  email: string;
  instansi: string;
  jenis_layanan: string;
  jumlah_dokumen: string;
  catatan: string;
}

export const INITIAL_FORM_STATE: BookingFormState = {
  nama_lengkap: '',
  whatsapp: '',
  email: '',
  instansi: '',
  jenis_layanan: '',
  jumlah_dokumen: '',
  catatan: '',
};

// Statistik untuk dashboard admin
export interface BookingStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  rescheduled: number;
  cancelled: number;
  completed: number;
}
