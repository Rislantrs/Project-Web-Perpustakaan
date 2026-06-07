import type { BookingStatus } from '../types/booking.types';
import { BK_STATUS_COLORS } from './designTokens';

// ============================================================================
// Status Config (label, warna badge, icon text, urutan)
// ============================================================================

export interface StatusConfig {
  label: string;
  labelShort: string;
  description: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  emoji: string;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  pending: {
    label: 'Menunggu Konfirmasi',
    labelShort: 'Pending',
    description: 'Booking telah diterima dan menunggu konfirmasi dari admin.',
    emoji: '⏳',
    ...BK_STATUS_COLORS.pending,
  },
  approved: {
    label: 'Disetujui',
    labelShort: 'Approved',
    description: 'Booking telah disetujui. Hadir sesuai tanggal yang ditentukan.',
    emoji: '✅',
    ...BK_STATUS_COLORS.approved,
  },
  rejected: {
    label: 'Ditolak',
    labelShort: 'Rejected',
    description: 'Booking tidak dapat diproses. Silakan hubungi admin untuk informasi lebih lanjut.',
    emoji: '❌',
    ...BK_STATUS_COLORS.rejected,
  },
  rescheduled: {
    label: 'Dijadwal Ulang',
    labelShort: 'Rescheduled',
    description: 'Admin mengusulkan tanggal baru. Periksa email Anda untuk konfirmasi.',
    emoji: '📅',
    ...BK_STATUS_COLORS.rescheduled,
  },
  cancelled: {
    label: 'Dibatalkan',
    labelShort: 'Cancelled',
    description: 'Booking telah dibatalkan.',
    emoji: '🚫',
    ...BK_STATUS_COLORS.cancelled,
  },
  completed: {
    label: 'Selesai',
    labelShort: 'Completed',
    description: 'Layanan enkapsulasi arsip telah selesai dilaksanakan.',
    emoji: '✔',
    ...BK_STATUS_COLORS.completed,
  },
};

// Urutan status yang bisa dipilih admin dari status saat ini
export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending:      ['approved', 'rejected', 'rescheduled', 'cancelled'],
  approved:     ['completed', 'cancelled'],
  rejected:     [],
  rescheduled:  ['cancelled'],  // admin bisa cancel jika user tidak merespons
  cancelled:    [],
  completed:    [],
};

// Status yang "memblokir" tanggal (tidak bisa dipilih di kalender)
export const DATE_BLOCKING_STATUSES: BookingStatus[] = ['pending', 'approved', 'rescheduled'];

// Helper: apakah transisi status valid?
export const isValidTransition = (from: BookingStatus, to: BookingStatus): boolean => {
  return ALLOWED_TRANSITIONS[from].includes(to);
};

// Helper: label singkat untuk badge
export const getStatusLabel = (status: BookingStatus): string =>
  BOOKING_STATUS_CONFIG[status]?.label ?? status;

// Helper: warna badge untuk tabel
export const getStatusBadgeClass = (status: BookingStatus): string => {
  const cfg = BOOKING_STATUS_CONFIG[status];
  if (!cfg) return '';
  return `background-color: ${cfg.bg}; color: ${cfg.text}; border-color: ${cfg.border}`;
};
