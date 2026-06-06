/**
 * ============================================================================
 * bookingService.ts — Business Logic Layer Modul Booking
 * ============================================================================
 *
 * Layer ini bertugas:
 *  1. Validasi input sebelum dikirim ke repository
 *  2. Menjembatani komponen React dengan repository (database-agnostic)
 *  3. Menyediakan semua method repository sebagai pass-through export
 *
 * Semua pesan validasi dalam Bahasa Indonesia.
 */

import { getBookingRepository } from '../repository/factory';
import type {
  Booking,
  BookingFilters,
  BookingStats,
  BookingStatus,
  CalendarDay,
  CreateBookingDTO,
  PaginatedResponse,
  ProposeRescheduleDTO,
  ServiceResponse,
  BookingDateLock,
  BookingAuditLog,
} from '../types/booking.types';
import {
  JENIS_LAYANAN,
  MAX_DOKUMEN,
  MIN_DOKUMEN,
  MIN_BOOKING_DAYS_AHEAD,
  MAX_BOOKING_DAYS_AHEAD,
} from '../constants/jenisLayanan';
import { notifyStatusChange, notifyNewBooking } from './notificationService';

// Repository singleton instance
const repo = getBookingRepository();

// ============================================================================
// Validasi Internal
// ============================================================================

/**
 * Format tanggal hari ini sebagai YYYY-MM-DD (lokal, bukan UTC).
 */
function todayLocalYMD(): string {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, '0');
  const d   = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Hitung selisih hari dari hari ini ke tanggal tertentu.
 */
function daysFromToday(dateStr: string): number {
  const today  = new Date(todayLocalYMD() + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Cek apakah tanggal jatuh pada hari Sabtu (6) atau Minggu (0).
 */
function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr + 'T00:00:00').getDay();
  return day === 0 || day === 6;
}

/**
 * Validasi nomor WhatsApp.
 * Format valid: 08xxxxxxxxxx atau +62xxxxxxxxxx (10-15 digit setelah prefix)
 */
function isValidWhatsApp(wa: string): boolean {
  return /^(\+62|08)[0-9]{8,13}$/.test(wa.replace(/[\s-]/g, ''));
}

/**
 * Validasi format email dasar.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validasi seluruh field CreateBookingDTO.
 * @returns Pesan error dalam Bahasa Indonesia (string kosong jika valid)
 */
function validateCreateBookingDTO(data: CreateBookingDTO): string {
  const { nama_lengkap, whatsapp, email, jenis_layanan, jumlah_dokumen, tanggal_booking } = data;

  // --- Nama Lengkap ---
  if (!nama_lengkap || nama_lengkap.trim().length < 2) {
    return 'Nama lengkap harus diisi minimal 2 karakter.';
  }
  if (nama_lengkap.trim().length > 100) {
    return 'Nama lengkap tidak boleh melebihi 100 karakter.';
  }

  // --- WhatsApp ---
  if (!whatsapp || whatsapp.trim() === '') {
    return 'Nomor WhatsApp harus diisi.';
  }
  if (!isValidWhatsApp(whatsapp.trim())) {
    return 'Format nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxxx.';
  }

  // --- Email ---
  if (!email || email.trim() === '') {
    return 'Alamat email harus diisi.';
  }
  if (!isValidEmail(email.trim())) {
    return 'Format alamat email tidak valid.';
  }

  // --- Jenis Layanan ---
  if (!jenis_layanan || jenis_layanan.trim() === '') {
    return 'Jenis layanan harus dipilih.';
  }
  const isValidLayanan = (JENIS_LAYANAN as readonly string[]).includes(jenis_layanan);
  if (!isValidLayanan) {
    return 'Jenis layanan yang dipilih tidak dikenal. Silakan pilih dari daftar yang tersedia.';
  }

  // --- Jumlah Dokumen ---
  const jumlah = Number(jumlah_dokumen);
  if (!Number.isInteger(jumlah) || isNaN(jumlah)) {
    return 'Jumlah dokumen harus berupa angka bulat.';
  }
  if (jumlah < MIN_DOKUMEN) {
    return `Jumlah dokumen minimal ${MIN_DOKUMEN}.`;
  }
  if (jumlah > MAX_DOKUMEN) {
    return `Jumlah dokumen tidak boleh melebihi ${MAX_DOKUMEN.toLocaleString('id-ID')}.`;
  }

  // --- Tanggal Booking ---
  if (!tanggal_booking || tanggal_booking.trim() === '') {
    return 'Tanggal booking harus dipilih.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal_booking)) {
    return 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD.';
  }

  const daysAhead = daysFromToday(tanggal_booking);

  if (daysAhead < MIN_BOOKING_DAYS_AHEAD) {
    return `Tanggal booking harus minimal ${MIN_BOOKING_DAYS_AHEAD} hari ke depan dari hari ini.`;
  }
  if (daysAhead > MAX_BOOKING_DAYS_AHEAD) {
    return `Tanggal booking tidak boleh lebih dari ${MAX_BOOKING_DAYS_AHEAD} hari ke depan.`;
  }
  if (isWeekend(tanggal_booking)) {
    return 'Layanan tidak tersedia pada hari Sabtu dan Minggu. Silakan pilih hari lain.';
  }

  return ''; // semua valid
}

// ============================================================================
// Service Methods — Business Logic
// ============================================================================

/**
 * Buat booking baru dengan validasi input lengkap.
 *
 * Alur:
 *  1. Sanitasi whitespace
 *  2. Validasi semua field (pesan error Bahasa Indonesia)
 *  3. Cek ketersediaan tanggal (double-check)
 *  4. Panggil repo.create()
 */
export async function createBooking(
  data: CreateBookingDTO
): Promise<ServiceResponse<Booking>> {
  // Sanitasi input
  const sanitized: CreateBookingDTO = {
    ...data,
    nama_lengkap:  data.nama_lengkap.trim(),
    whatsapp:      data.whatsapp.trim().replace(/[\s-]/g, ''),
    email:         data.email.trim().toLowerCase(),
    jenis_layanan: data.jenis_layanan.trim(),
    instansi:      data.instansi?.trim() || undefined,
    catatan:       data.catatan?.trim() || undefined,
  };

  // Validasi
  const validationError = validateCreateBookingDTO(sanitized);
  if (validationError) {
    return { success: false, message: validationError };
  }

  // Double-check ketersediaan tanggal
  const isAvailable = await repo.checkDateAvailable(sanitized.tanggal_booking);
  if (!isAvailable) {
    return {
      success: false,
      message: 'Tanggal yang dipilih sudah tidak tersedia. Silakan pilih tanggal lain.',
    };
  }

  return repo.create(sanitized);
}

// ============================================================================
// Pass-Through Exports — Repository Methods
// ============================================================================

/** Cek apakah tanggal masih tersedia */
export const checkDateAvailable = (date: string): Promise<boolean> =>
  repo.checkDateAvailable(date);

/** Ambil satu booking berdasarkan ID */
export const findById = (id: string): Promise<Booking | null> =>
  repo.findById(id);

/** Ambil data kalender satu bulan */
export const getCalendarData = (year: number, month: number): Promise<CalendarDay[]> =>
  repo.getCalendarData(year, month);

/** Ambil semua lock tanggal satu bulan */
export const getLockedDates = (year: number, month: number): Promise<BookingDateLock[]> =>
  repo.getLockedDates(year, month);

/** Ambil semua booking dengan filter + pagination */
export const findAll = (filters: BookingFilters): Promise<PaginatedResponse<Booking>> =>
  repo.findAll(filters);

/** Update status booking (admin) */
export async function updateStatus(
  id: string,
  status: BookingStatus,
  options?: { note?: string; changedBy?: string }
): Promise<ServiceResponse<Booking>> {
  const res = await repo.updateStatus(id, status, options);
  if (res.success && res.data) {
    notifyStatusChange(id, status, options?.note).catch(console.warn);
  }
  return res;
}

/** Ajukan jadwal ulang (admin) */
export async function proposeReschedule(
  id: string,
  data: ProposeRescheduleDTO,
  changedBy?: string
): Promise<ServiceResponse<Booking>> {
  const res = await repo.proposeReschedule(id, data, changedBy);
  if (res.success && res.data) {
    notifyStatusChange(id, 'rescheduled', data.reschedule_note).catch(console.warn);
  }
  return res;
}

/** Konfirmasi jadwal ulang oleh pemohon via token */
export async function confirmReschedule(
  token: string,
  action: 'accept' | 'decline'
): Promise<ServiceResponse<Booking>> {
  const res = await repo.confirmReschedule(token, action);
  if (res.success && res.data) {
    if (action === 'accept') {
      notifyNewBooking(res.data.id).catch(console.warn);
    } else {
      notifyStatusChange(res.data.id, 'cancelled').catch(console.warn);
    }
  }
  return res;
}

/** Ambil statistik ringkasan */
export const getStats = (): Promise<BookingStats> =>
  repo.getStats();

/** Ambil semua booking tanpa pagination (untuk export) */
export const findAllForExport = (
  filters: Omit<BookingFilters, 'page' | 'limit'>
): Promise<Booking[]> =>
  repo.findAllForExport(filters);

/** Ambil riwayat audit log untuk satu booking */
export const getAuditLogs = (bookingId: string): Promise<BookingAuditLog[]> =>
  repo.getAuditLogs(bookingId);

// ── Aliases for AdminBookings.tsx ─────────────────────────────────────────────
export const getBookings = findAll;
export const getBookingStats = getStats;
export const updateBookingStatus = updateStatus;
export const getAllBookingsForExport = findAllForExport;
