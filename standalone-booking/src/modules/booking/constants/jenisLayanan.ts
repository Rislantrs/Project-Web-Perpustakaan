/**
 * Daftar jenis layanan enkapsulasi arsip yang tersedia.
 * Ditampilkan sebagai dropdown di form booking publik.
 *
 * Untuk menambah/mengurangi layanan, edit array JENIS_LAYANAN di bawah.
 */
export const JENIS_LAYANAN = [
  'Enkapsulasi Dokumen Sejarah',
  'Enkapsulasi Arsip Kertas',
  'Enkapsulasi Arsip Foto / Gambar',
  'Enkapsulasi Arsip Pita / Kaset',
  'Enkapsulasi Arsip Digital',
  'Enkapsulasi Naskah Kuno',
  'Konsultasi Preservasi Arsip',
  'Lainnya (sebutkan di catatan)',
] as const;

export type JenisLayanan = (typeof JENIS_LAYANAN)[number];

// Label deskripsi singkat per jenis (opsional, untuk tooltip/info)
export const JENIS_LAYANAN_DESC: Record<string, string> = {
  'Enkapsulasi Dokumen Sejarah':
    'Pelindungan dokumen bersejarah menggunakan bahan polyester atau plastik bebas asam.',
  'Enkapsulasi Arsip Kertas':
    'Enkapsulasi arsip kertas biasa agar terlindung dari debu, air, dan serangga.',
  'Enkapsulasi Arsip Foto / Gambar':
    'Perlindungan foto dan gambar dari degradasi warna dan kerusakan fisik.',
  'Enkapsulasi Arsip Pita / Kaset':
    'Preservasi arsip media magnetik seperti pita audio/video dan kaset.',
  'Enkapsulasi Arsip Digital':
    'Konversi dan pelindungan arsip digital ke format standar preservasi jangka panjang.',
  'Enkapsulasi Naskah Kuno':
    'Penanganan khusus naskah kuno (manuskrip) dengan bahan bebas asam.',
  'Konsultasi Preservasi Arsip':
    'Sesi konsultasi dengan tenaga ahli mengenai metode preservasi dan enkapsulasi arsip Anda.',
  'Lainnya (sebutkan di catatan)':
    'Kebutuhan enkapsulasi lain yang belum tercantum. Jelaskan di kolom catatan.',
};

// Hari minimum booking ke depan (dalam hari kerja)
export const MIN_BOOKING_DAYS_AHEAD = 1;

// Hari maksimum booking ke depan (dalam hari kalender)
export const MAX_BOOKING_DAYS_AHEAD = 90;

// Hari yang tidak tersedia (0 = Minggu, 6 = Sabtu)
export const DISABLED_WEEKDAYS = [0]; // Hanya Minggu

// Maksimum dokumen per booking
export const MAX_DOKUMEN = 10000;
export const MIN_DOKUMEN = 1;
