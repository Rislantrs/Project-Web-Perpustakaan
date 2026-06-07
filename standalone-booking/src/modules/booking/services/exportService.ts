/**
 * ============================================================================
 * exportService.ts — Ekspor Data Booking ke Excel dan PDF
 * ============================================================================
 *
 * Menggunakan dynamic import agar library xlsx dan jspdf tidak masuk
 * main bundle — hanya di-load saat pengguna benar-benar mengklik ekspor.
 *
 * Library yang dibutuhkan (install jika belum):
 *   npm install xlsx jspdf jspdf-autotable
 *
 * Format nama file default:
 *   - Excel: booking-enkapsulasi-arsip-YYYY-MM-DD.xlsx
 *   - PDF:   booking-enkapsulasi-arsip-YYYY-MM-DD.pdf
 */

import type { Booking } from '../types/booking.types';
import { getStatusLabel } from '../constants/bookingStatus';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format tanggal ISO 8601 menjadi format lokal Indonesia.
 * Contoh: "2024-01-15" → "15 Januari 2024"
 */
function formatTanggal(isoDate: string | null | undefined): string {
  if (!isoDate) return '-';
  try {
    return new Date(isoDate).toLocaleDateString('id-ID', {
      day:   '2-digit',
      month: 'long',
      year:  'numeric',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Format datetime ISO 8601 menjadi format lokal Indonesia dengan jam.
 */
function formatDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return '-';
  try {
    return new Date(isoDate).toLocaleString('id-ID', {
      day:    '2-digit',
      month:  'long',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Nama file default berdasarkan tanggal hari ini.
 */
function defaultFilename(ext: 'xlsx' | 'pdf'): string {
  const today = new Date().toISOString().split('T')[0];
  return `booking-enkapsulasi-arsip-${today}.${ext}`;
}

/** Header kolom tabel */
const TABLE_HEADERS = [
  'No',
  'Nama Lengkap',
  'WhatsApp',
  'Email',
  'Instansi',
  'Jenis Layanan',
  'Jumlah Dokumen',
  'Tanggal Booking',
  'Status',
  'Catatan',
  'Tanggal Dibuat',
];

/**
 * Konversi array Booking ke array baris tabel.
 */
function bookingsToRows(bookings: Booking[]): string[][] {
  return bookings.map((b, index) => [
    String(index + 1),
    b.nama_lengkap,
    b.whatsapp,
    b.email,
    b.instansi ?? '-',
    b.jenis_layanan,
    String(b.jumlah_dokumen),
    formatTanggal(b.tanggal_booking),
    getStatusLabel(b.status),
    b.catatan ?? '-',
    formatDateTime(b.created_at),
  ]);
}

// ============================================================================
// Export ke Excel (XLSX)
// ============================================================================

/**
 * Export data booking ke file Excel (.xlsx).
 *
 * Fitur:
 *  - Auto-width kolom berdasarkan konten terpanjang
 *  - Dynamic import agar tidak membebani bundle utama
 *  - Label status dalam Bahasa Indonesia
 *
 * @param bookings  Array data booking yang akan diekspor
 * @param filename  Nama file output (opsional)
 */
export async function exportToExcel(
  bookings: Booking[],
  filename?: string
): Promise<void> {
  // Dynamic import — hanya load saat dipanggil
  const XLSX = await import('xlsx');

  const rows   = bookingsToRows(bookings);
  const wsData = [TABLE_HEADERS, ...rows];

  // Buat worksheet dari array of arrays
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Hitung auto-width: lebar kolom = max(header, max konten row) + 2 padding
  const colWidths = TABLE_HEADERS.map((header, colIdx) => {
    const maxContentWidth = rows.reduce((max, row) => {
      const cellLen = (row[colIdx] ?? '').length;
      return Math.max(max, cellLen);
    }, header.length);
    return { wch: maxContentWidth + 2 };
  });
  ws['!cols'] = colWidths;

  // Buat workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Booking');

  // Trigger download
  XLSX.writeFile(wb, filename ?? defaultFilename('xlsx'));
}

// ============================================================================
// Export ke PDF
// ============================================================================

/**
 * Export data booking ke file PDF menggunakan jsPDF + autoTable.
 *
 * Struktur dokumen:
 *  - Header: 'Laporan Booking Layanan Enkapsulasi Arsip'
 *  - Sub-header: 'Dinas Perpustakaan dan Kearsipan Daerah Purwakarta'
 *  - Tanggal cetak + jumlah data
 *  - Tabel data booking (landscape A4)
 *  - Nomor halaman di footer setiap halaman
 *
 * @param bookings  Array data booking yang akan diekspor
 * @param filename  Nama file output (opsional)
 */
export async function exportToPDF(
  bookings: Booking[],
  filename?: string
): Promise<void> {
  // Dynamic imports
  const { default: jsPDF }     = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: 'landscape',
    unit:        'mm',
    format:      'a4',
  });

  const pageWidth  = doc.internal.pageSize.getWidth();
  const marginLeft = 14;

  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day:     '2-digit',
    month:   'long',
    year:    'numeric',
  });

  // --- Judul Laporan ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(
    'Laporan Booking Layanan Enkapsulasi Arsip',
    pageWidth / 2,
    16,
    { align: 'center' }
  );

  // --- Sub-header: Instansi ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    'Dinas Perpustakaan dan Kearsipan Daerah Purwakarta',
    pageWidth / 2,
    22,
    { align: 'center' }
  );

  // --- Garis tipis pemisah ---
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, 26, pageWidth - marginLeft, 26);

  // --- Info cetak ---
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Dicetak pada: ${tanggalCetak}`, marginLeft, 31);
  doc.text(
    `Total data: ${bookings.length} booking`,
    pageWidth - marginLeft,
    31,
    { align: 'right' }
  );
  doc.setTextColor(0, 0, 0);

  // --- Tabel ---
  const rows = bookingsToRows(bookings);

  autoTable(doc, {
    head:   [TABLE_HEADERS],
    body:   rows,
    startY: 35,
    margin: { left: marginLeft, right: marginLeft },
    styles: {
      fontSize:    7,
      cellPadding: 2,
      overflow:    'linebreak',
    },
    headStyles: {
      fillColor: [30, 58, 95],     // BK_COLORS.primary (#1e3a5f)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign:    'center',
    },
    alternateRowStyles: {
      fillColor: [244, 247, 251],  // BK_COLORS.surface (#f4f7fb)
    },
    columnStyles: {
      0:  { halign: 'center', cellWidth: 8  },  // No
      6:  { halign: 'right',  cellWidth: 18 },  // Jumlah Dokumen
      7:  { halign: 'center', cellWidth: 25 },  // Tanggal Booking
      8:  { halign: 'center', cellWidth: 22 },  // Status
      10: { halign: 'center', cellWidth: 30 },  // Tanggal Dibuat
    },
    // Footer: nomor halaman setiap halaman
    didDrawPage: (hookData) => {
      const totalPages = (
        doc as jsPDF & { internal: { getNumberOfPages: () => number } }
      ).internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Halaman ${hookData.pageNumber} dari ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
      doc.setTextColor(0, 0, 0);
    },
  });

  // Trigger download
  doc.save(filename ?? defaultFilename('pdf'));
}
