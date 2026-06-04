/**
 * ============================================================================
 * notificationService.ts — Layanan Notifikasi Booking via Supabase Edge Functions
 * ============================================================================
 *
 * Memanggil Edge Functions Supabase untuk mengirim notifikasi:
 *  - Email kepada pemohon (via SMTP yang dikonfigurasi di Edge Function)
 *  - Notifikasi ke admin (opsional, dikonfigurasi di sisi Edge Function)
 *
 * Edge Functions yang dibutuhkan di Supabase:
 *  - booking-notification      : notifikasi booking baru
 *  - booking-status-change     : notifikasi perubahan status
 */

import { supabase } from '../../../services/supabase';
import type { ServiceResponse } from '../types/booking.types';

/**
 * Kirim notifikasi booking baru ke admin dan pemohon.
 *
 * Memanggil Edge Function: `booking-notification`
 * Payload: { booking_id }
 *
 * @param bookingId UUID booking yang baru dibuat
 */
export async function notifyNewBooking(bookingId: string): Promise<ServiceResponse> {
  try {
    const { error } = await supabase.functions.invoke('booking-notification', {
      body: { booking_id: bookingId },
    });

    if (error) {
      console.error('[notificationService] notifyNewBooking() error:', error);
      return {
        success: false,
        message: 'Booking berhasil dibuat, tetapi notifikasi gagal dikirim. Tim kami akan tetap memproses booking Anda.',
      };
    }

    return {
      success: true,
      message: 'Notifikasi booking baru berhasil dikirim.',
    };
  } catch (err) {
    // Notifikasi bersifat non-critical — jangan gagalkan flow utama
    console.error('[notificationService] notifyNewBooking() exception:', err);
    return {
      success: false,
      message: 'Notifikasi tidak dapat dikirim saat ini.',
    };
  }
}

/**
 * Kirim notifikasi perubahan status booking ke pemohon.
 *
 * Memanggil Edge Function: `booking-status-change`
 * Payload: { booking_id, status }
 *
 * @param bookingId UUID booking yang statusnya berubah
 * @param status    Status baru (misal: 'approved', 'rejected', 'rescheduled')
 */
export async function notifyStatusChange(
  bookingId: string,
  status: string
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase.functions.invoke('booking-status-change', {
      body: { booking_id: bookingId, status },
    });

    if (error) {
      console.error('[notificationService] notifyStatusChange() error:', error);
      return {
        success: false,
        message: 'Status berhasil diperbarui, tetapi notifikasi email gagal dikirim.',
      };
    }

    return {
      success: true,
      message: `Notifikasi perubahan status ke "${status}" berhasil dikirim ke pemohon.`,
    };
  } catch (err) {
    console.error('[notificationService] notifyStatusChange() exception:', err);
    return {
      success: false,
      message: 'Notifikasi tidak dapat dikirim saat ini.',
    };
  }
}
