/**
 * ============================================================================
 * SupabaseBookingRepo — Implementasi IBookingRepository menggunakan Supabase JS
 * ============================================================================
 *
 * Seluruh akses database melalui Supabase client (PostgREST + Auth).
 * Karena Supabase tidak mendukung true DB transactions dari client-side,
 * operasi multi-tabel (create booking + lock tanggal) dilakukan secara
 * sekuensial dengan penanganan error graceful.
 */

import { supabase } from '../../../services/supabase';
import type { IBookingRepository } from './IBookingRepository';
import type {
  Booking,
  BookingDateLock,
  BookingFilters,
  BookingStats,
  BookingStatus,
  CalendarDay,
  CalendarDayStatus,
  CreateBookingDTO,
  PaginatedResponse,
  ProposeRescheduleDTO,
  ServiceResponse,
  BookingAuditLog,
} from '../types/booking.types';

// Nama tabel di Supabase
const TABLE_BOOKINGS       = 'bookings';
const TABLE_DATE_LOCKS     = 'booking_date_locks';
const TABLE_AUDIT_LOGS     = 'booking_audit_logs';

// Status yang memblokir tanggal di kalender
const BLOCKING_STATUSES: BookingStatus[] = ['pending', 'approved', 'rescheduled'];

/** Hitung jumlah hari di bulan tertentu */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Format tanggal menjadi YYYY-MM-DD */
function toYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Cek apakah tanggal jatuh pada hari Sabtu (6) atau Minggu (0) */
function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr + 'T00:00:00').getDay();
  return day === 0 || day === 6;
}

/** Cek apakah tanggal sudah lewat (sebelum hari ini) */
function isPastDate(dateStr: string): boolean {
  const today = toYMD(new Date());
  return dateStr < today;
}

export class SupabaseBookingRepo implements IBookingRepository {
  // ── Publik ─────────────────────────────────────────────────────────────────

  /**
   * Buat booking baru.
   * Langkah:
   *  1. INSERT ke `bookings`
   *  2. INSERT ke `booking_date_locks` — jika gagal karena unique constraint
   *     (tanggal sudah ada), rollback booking dengan men-delete-nya.
   */
  async create(data: CreateBookingDTO): Promise<ServiceResponse<Booking>> {
    // Step 1: insert booking utama
    const { data: booking, error: bookingError } = await supabase
      .from(TABLE_BOOKINGS)
      .insert({
        nama_lengkap:    data.nama_lengkap,
        whatsapp:        data.whatsapp,
        email:           data.email,
        instansi:        data.instansi ?? null,
        jenis_layanan:   data.jenis_layanan,
        jumlah_dokumen:  data.jumlah_dokumen,
        tanggal_booking: data.tanggal_booking,
        catatan:         data.catatan ?? null,
        status:          'pending',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('[SupabaseBookingRepo] create() — booking insert error:', bookingError);
      return {
        success: false,
        message: 'Gagal menyimpan data booking. Silakan coba lagi.',
      };
    }

    // Step 2: lock tanggal
    const { error: lockError } = await supabase
      .from(TABLE_DATE_LOCKS)
      .insert({
        tanggal:    data.tanggal_booking,
        booking_id: booking.id,
        status:     'pending',
      });

    if (lockError) {
      console.error('[SupabaseBookingRepo] create() — lock insert error:', lockError);

      // Jika unique constraint violation (kode 23505), tanggal sudah terisi
      const isDuplicate =
        lockError.code === '23505' ||
        lockError.message.toLowerCase().includes('unique');

      // Kompensasi: hapus booking yang sudah dibuat
      await supabase.from(TABLE_BOOKINGS).delete().eq('id', booking.id);

      return {
        success: false,
        message: isDuplicate
          ? 'Tanggal yang dipilih sudah tidak tersedia. Silakan pilih tanggal lain.'
          : 'Gagal mengunci tanggal. Silakan coba lagi.',
      };
    }

    return {
      success: true,
      message: 'Booking berhasil dibuat dan menunggu konfirmasi admin.',
      data:    booking as Booking,
    };
  }

  /**
   * Cek ketersediaan tanggal.
   * @returns true jika tanggal masih bebas, false jika sudah diblock
   */
  async checkDateAvailable(date: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(TABLE_DATE_LOCKS)
      .select('id')
      .eq('tanggal', date)
      .in('status', BLOCKING_STATUSES)
      .limit(1);

    if (error) {
      console.error('[SupabaseBookingRepo] checkDateAvailable() error:', error);
      // Anggap tidak tersedia agar aman (fail-safe)
      return false;
    }

    return !data || data.length === 0;
  }

  /**
   * Ambil 1 booking berdasarkan UUID-nya.
   */
  async findById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from(TABLE_BOOKINGS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[SupabaseBookingRepo] findById() error:', error);
      return null;
    }

    return data as Booking;
  }

  /**
   * Bangun array CalendarDay untuk keseluruhan bulan.
   * Setiap hari diberi status: available / pending / approved / rescheduled / disabled.
   */
  async getCalendarData(year: number, month: number): Promise<CalendarDay[]> {
    const totalDays  = daysInMonth(year, month);
    const paddedMonth = String(month).padStart(2, '0');

    const fromDate = `${year}-${paddedMonth}-01`;
    const toDate   = `${year}-${paddedMonth}-${String(totalDays).padStart(2, '0')}`;

    // Ambil semua lock di bulan ini
    const { data: locks, error } = await supabase
      .from(TABLE_DATE_LOCKS)
      .select('tanggal, status')
      .gte('tanggal', fromDate)
      .lte('tanggal', toDate);

    if (error) {
      console.error('[SupabaseBookingRepo] getCalendarData() error:', error);
    }

    // Buat map tanggal → status lock
    const lockMap = new Map<string, string>();
    (locks ?? []).forEach((lock) => {
      lockMap.set(lock.tanggal, lock.status as string);
    });

    const calendarDays: CalendarDay[] = [];

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${paddedMonth}-${String(day).padStart(2, '0')}`;
      const weekend = isWeekend(dateStr);
      const past    = isPastDate(dateStr);
      const lockStatus = lockMap.get(dateStr);

      let status: CalendarDayStatus;

      if (weekend || past) {
        status = 'disabled';
      } else if (lockStatus && BLOCKING_STATUSES.includes(lockStatus as BookingStatus)) {
        status = lockStatus as CalendarDayStatus;
      } else {
        status = 'available';
      }

      calendarDays.push({
        date:      dateStr,
        status,
        isWeekend: weekend,
        isPast:    past,
      });
    }

    return calendarDays;
  }

  /**
   * Ambil semua lock di bulan tertentu (untuk render cepat).
   */
  async getLockedDates(year: number, month: number): Promise<BookingDateLock[]> {
    const totalDays   = daysInMonth(year, month);
    const paddedMonth = String(month).padStart(2, '0');
    const fromDate    = `${year}-${paddedMonth}-01`;
    const toDate      = `${year}-${paddedMonth}-${String(totalDays).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from(TABLE_DATE_LOCKS)
      .select('*')
      .gte('tanggal', fromDate)
      .lte('tanggal', toDate);

    if (error) {
      console.error('[SupabaseBookingRepo] getLockedDates() error:', error);
      return [];
    }

    return (data ?? []) as BookingDateLock[];
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  /**
   * Ambil semua booking dengan dukungan filter lengkap + pagination.
   */
  async findAll(filters: BookingFilters): Promise<PaginatedResponse<Booking>> {
    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 10;
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    let query = supabase
      .from(TABLE_BOOKINGS)
      .select('*', { count: 'exact' });

    // Filter status
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Filter rentang tanggal
    if (filters.tanggal_from) {
      query = query.gte('tanggal_booking', filters.tanggal_from);
    }
    if (filters.tanggal_to) {
      query = query.lte('tanggal_booking', filters.tanggal_to);
    }

    // Search — ilike pada nama_lengkap dan email (OR)
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`nama_lengkap.ilike.${term},email.ilike.${term},whatsapp.ilike.${term}`);
    }

    // Pagination + urutan terbaru dulu
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[SupabaseBookingRepo] findAll() error:', error);
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    const total      = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      items:      (data ?? []) as Booking[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update status booking + tulis audit log.
   */
  async updateStatus(
    id: string,
    status: BookingStatus,
    options?: { note?: string; changedBy?: string; jumlah_dokumen?: number }
  ): Promise<ServiceResponse<Booking>> {
    // Ambil status lama untuk audit log
    const existing = await this.findById(id);
    if (!existing) {
      return { success: false, message: 'Booking tidak ditemukan.' };
    }

    // Update status booking
    const updateData: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (options?.jumlah_dokumen !== undefined) {
      updateData.jumlah_dokumen = options.jumlah_dokumen;
    }

    const { data: updated, error: updateError } = await supabase
      .from(TABLE_BOOKINGS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[SupabaseBookingRepo] updateStatus() — update error:', updateError);
      return { success: false, message: 'Gagal memperbarui status booking.' };
    }

    // Update status di date_locks juga (agar kalender konsisten)
    await supabase
      .from(TABLE_DATE_LOCKS)
      .update({ status })
      .eq('booking_id', id);

    // Otomatis catat penyesuaian dokumen di audit log
    let auditNote = options?.note ?? null;
    if (options?.jumlah_dokumen !== undefined && options.jumlah_dokumen !== existing.jumlah_dokumen) {
      const adjustmentMsg = `Penyesuaian jumlah dokumen: ${existing.jumlah_dokumen} -> ${options.jumlah_dokumen}`;
      auditNote = auditNote ? `${adjustmentMsg}. Catatan: ${auditNote}` : adjustmentMsg;
    }

    // Insert audit log (non-critical, jangan block)
    const { error: auditError } = await supabase.from(TABLE_AUDIT_LOGS).insert({
      booking_id:  id,
      old_status:  existing.status,
      new_status:  status,
      changed_by:  options?.changedBy ?? null,
      note:        auditNote,
    });

    if (auditError) {
      console.warn('[SupabaseBookingRepo] updateStatus() — audit log error:', auditError);
    }

    return {
      success: true,
      message: `Status booking berhasil diperbarui menjadi "${status}".`,
      data:    updated as Booking,
    };
  }

  /**
   * Admin mengajukan penjadwalan ulang.
   * - Set status = 'rescheduled'
   * - Set reschedule_date, reschedule_note
   * - Generate reschedule_token (crypto.randomUUID)
   * - Set reschedule_token_expires_at = now + 48 jam
   */
  async proposeReschedule(
    id: string,
    data: ProposeRescheduleDTO,
    changedBy?: string
  ): Promise<ServiceResponse<Booking>> {
    const existing = await this.findById(id);
    if (!existing) {
      return { success: false, message: 'Booking tidak ditemukan.' };
    }

    const token      = crypto.randomUUID();
    const expiresAt  = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data: updated, error } = await supabase
      .from(TABLE_BOOKINGS)
      .update({
        status:                    'rescheduled',
        reschedule_date:           data.reschedule_date,
        reschedule_note:           data.reschedule_note,
        reschedule_token:          token,
        reschedule_token_expires_at: expiresAt,
        updated_at:                new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseBookingRepo] proposeReschedule() error:', error);
      return { success: false, message: 'Gagal mengajukan penjadwalan ulang.' };
    }

    // Update status lock ke rescheduled
    await supabase
      .from(TABLE_DATE_LOCKS)
      .update({ status: 'rescheduled' })
      .eq('booking_id', id);

    // Audit log
    await supabase.from(TABLE_AUDIT_LOGS).insert({
      booking_id:  id,
      old_status:  existing.status,
      new_status:  'rescheduled',
      changed_by:  changedBy ?? null,
      note:        `Usulan jadwal ulang ke ${data.reschedule_date}: ${data.reschedule_note}`,
    });

    return {
      success: true,
      message: 'Usulan penjadwalan ulang berhasil dikirim. Token akan berlaku selama 48 jam.',
      data:    updated as Booking,
    };
  }

  /**
   * Pemohon mengkonfirmasi atau menolak usulan reschedule via token email.
   *
   * - accept: UPDATE status='pending', tanggal_booking = reschedule_date,
   *           hapus reschedule fields, update lock lama ke status lama, tambah lock baru
   * - decline: UPDATE status='cancelled', bersihkan reschedule fields
   */
  async confirmReschedule(
    token: string,
    action: 'accept' | 'decline'
  ): Promise<ServiceResponse<Booking>> {
    if (!token) {
      return { success: false, message: 'Token tidak valid.' };
    }

    // Cari booking dengan token yang masih berlaku
    const { data: booking, error: findError } = await supabase
      .from(TABLE_BOOKINGS)
      .select('*')
      .eq('reschedule_token', token)
      .gt('reschedule_token_expires_at', new Date().toISOString())
      .single();

    if (findError || !booking) {
      return {
        success: false,
        message: 'Token tidak ditemukan atau sudah kedaluwarsa. Silakan hubungi admin.',
      };
    }

    if (action === 'accept') {
      const newDate = booking.reschedule_date as string;

      // Pastikan tanggal baru belum diblok booking lain
      const available = await this.checkDateAvailable(newDate);
      if (!available) {
        return {
          success: false,
          message: 'Tanggal yang diusulkan sudah tidak tersedia. Silakan hubungi admin.',
        };
      }

      // Hapus lock lama
      await supabase.from(TABLE_DATE_LOCKS).delete().eq('booking_id', booking.id);

      // Update booking: set tanggal baru, status pending, bersihkan reschedule fields
      const { data: updated, error: updateError } = await supabase
        .from(TABLE_BOOKINGS)
        .update({
          status:                      'pending',
          tanggal_booking:             newDate,
          reschedule_date:             null,
          reschedule_note:             null,
          reschedule_token:            null,
          reschedule_token_expires_at: null,
          updated_at:                  new Date().toISOString(),
        })
        .eq('id', booking.id)
        .select()
        .single();

      if (updateError) {
        console.error('[SupabaseBookingRepo] confirmReschedule() accept error:', updateError);
        return { success: false, message: 'Gagal mengkonfirmasi jadwal ulang.' };
      }

      // Tambah lock baru untuk tanggal yang sudah dikonfirmasi
      await supabase.from(TABLE_DATE_LOCKS).insert({
        tanggal:    newDate,
        booking_id: booking.id,
        status:     'pending',
      });

      // Audit log
      await supabase.from(TABLE_AUDIT_LOGS).insert({
        booking_id: booking.id,
        old_status: 'rescheduled',
        new_status: 'pending',
        note:       `Pemohon menerima jadwal ulang ke ${newDate}`,
      });

      return {
        success: true,
        message: 'Jadwal ulang berhasil dikonfirmasi. Booking kembali menunggu konfirmasi admin.',
        data:    updated as Booking,
      };
    } else {
      // action === 'decline' → cancel booking
      const { data: updated, error: updateError } = await supabase
        .from(TABLE_BOOKINGS)
        .update({
          status:                      'cancelled',
          reschedule_date:             null,
          reschedule_note:             null,
          reschedule_token:            null,
          reschedule_token_expires_at: null,
          updated_at:                  new Date().toISOString(),
        })
        .eq('id', booking.id)
        .select()
        .single();

      if (updateError) {
        console.error('[SupabaseBookingRepo] confirmReschedule() decline error:', updateError);
        return { success: false, message: 'Gagal membatalkan jadwal ulang.' };
      }

      // Hapus lock karena sudah cancelled
      await supabase.from(TABLE_DATE_LOCKS).delete().eq('booking_id', booking.id);

      // Audit log
      await supabase.from(TABLE_AUDIT_LOGS).insert({
        booking_id: booking.id,
        old_status: 'rescheduled',
        new_status: 'cancelled',
        note:       'Pemohon menolak jadwal ulang yang diusulkan admin.',
      });

      return {
        success: true,
        message: 'Anda telah menolak jadwal ulang. Booking dibatalkan.',
        data:    updated as Booking,
      };
    }
  }

  /**
   * Statistik ringkasan: jumlah booking per status.
   */
  async getStats(): Promise<BookingStats> {
    const { data, error } = await supabase
      .from(TABLE_BOOKINGS)
      .select('status');

    if (error) {
      console.error('[SupabaseBookingRepo] getStats() error:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0, rescheduled: 0, cancelled: 0, completed: 0 };
    }

    const stats: BookingStats = {
      total:       0,
      pending:     0,
      approved:    0,
      rejected:    0,
      rescheduled: 0,
      cancelled:   0,
      completed:   0,
    };

    (data ?? []).forEach((row) => {
      const s = row.status as BookingStatus;
      stats.total++;
      if (s in stats) {
        (stats as Record<string, number>)[s]++;
      }
    });

    return stats;
  }

  /**
   * Ambil semua booking tanpa pagination (untuk export).
   */
  async findAllForExport(
    filters: Omit<BookingFilters, 'page' | 'limit'>
  ): Promise<Booking[]> {
    let query = supabase
      .from(TABLE_BOOKINGS)
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.tanggal_from) {
      query = query.gte('tanggal_booking', filters.tanggal_from);
    }

    if (filters.tanggal_to) {
      query = query.lte('tanggal_booking', filters.tanggal_to);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`nama_lengkap.ilike.${term},email.ilike.${term},whatsapp.ilike.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[SupabaseBookingRepo] findAllForExport() error:', error);
      return [];
    }

    return (data ?? []) as Booking[];
  }

  /**
   * Ambil riwayat audit log untuk satu booking.
   */
  async getAuditLogs(bookingId: string): Promise<BookingAuditLog[]> {
    const { data, error } = await supabase
      .from(TABLE_AUDIT_LOGS)
      .select('*')
      .eq('booking_id', bookingId)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('[SupabaseBookingRepo] getAuditLogs() error:', error);
      return [];
    }

    return (data ?? []) as BookingAuditLog[];
  }
}
