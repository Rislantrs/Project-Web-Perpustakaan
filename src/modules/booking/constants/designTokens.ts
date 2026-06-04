/**
 * ============================================================================
 * 🎨 DESIGN TOKENS — MODUL BOOKING ENKAPSULASI ARSIP
 * ============================================================================
 *
 * File ini adalah sumber kebenaran tunggal untuk semua warna, font, dan
 * spacing yang digunakan oleh modul Booking Enkapsulasi Arsip.
 *
 * PRINSIP DESAIN:
 * - Modul ini memiliki identitas visual TERPISAH dari website utama Disipusda.
 * - Tujuannya agar modul bisa berdiri mandiri (microservice) tanpa bergantung
 *   pada CSS global website utama.
 * - Gunakan token di bawah, bukan hardcode hex langsung di komponen.
 *
 * CARA PAKAI DI KOMPONEN:
 *   import { BK_COLORS, BK_STATUS_COLORS } from '../constants/designTokens';
 *   style={{ backgroundColor: BK_COLORS.primary }}
 *
 * ============================================================================
 */

// ============================================================================
// 📌 REFERENSI: PALET WARNA WEBSITE UTAMA DISIPUSDA
// (dari: src/styles/tailwind.css & src/config/siteConfig.ts)
//
// ⚠️  INI HANYA REFERENSI — jangan diaktifkan kecuali ingin menyamakan
//     tampilan modul booking dengan website utama secara sengaja.
//
// -- CSS Variable Asli di tailwind.css --
// --color-brand-primary:     #0c2f3d  → Biru gelap (header, footer, tombol utama)
// --color-brand-secondary:   #1f3e4e  → Biru muda (elemen sekunder)
// --color-brand-accent:      #d6a54a  → Emas (aksen, garis bawah, hover)
// --color-brand-light:       #f8f9fa  → Abu-abu terang (background body)
// --color-danger-rgb:        #8b1c24  → Merah tua (pesan error)
// --color-ink-rgb:           #1a1a1a  → Hitam tinta (teks utama)
//
// -- Font Website Utama --
// --font-sans:       'Inter', sans-serif         → Body text (300/400/500/600/700)
// --font-serif:      'Playfair Display', serif   → Heading H1/H2/H3 (italic)
// --font-sundanese:  'Noto Sans Sundanese'       → Aksara Sunda (dekorasi)
//
// -- Jika ingin pakai warna website utama, uncomment dan ganti nilai di bawah:
//
// export const BK_COLORS = {
//   primary:   '#0c2f3d',  // sama dengan brand-primary website utama
//   secondary: '#1f3e4e',  // sama dengan brand-secondary website utama
//   accent:    '#d6a54a',  // sama dengan brand-accent (emas) website utama
//   surface:   '#f8f9fa',  // sama dengan brand-light website utama
//   border:    '#e2e8f0',
//   text:      '#1a1a1a',
//   textMuted: '#64748b',
// } as const;
// ============================================================================

// ============================================================================
// 🔷 PALET AKTIF: MODUL BOOKING (Netral Navy — berbeda dari website utama)
// ============================================================================

/**
 * Warna utama modul booking.
 * Menggunakan navy #1e3a5f (bukan #0c2f3d website utama) agar terasa
 * berbeda secara visual namun tetap dalam spektrum warna pemerintahan.
 */
export const BK_COLORS = {
  /** Biru navy tua — tombol utama, header section, aksen kuat */
  primary:       '#1e3a5f',

  /** Biru medium — hover state, link, elemen interaktif sekunder */
  secondary:     '#2d6a9f',

  /** Biru cerah — fokus input, highlight aktif, badge info */
  accent:        '#3b82f6',

  /** Latar belakang form — lebih sejuk dari putih, tidak seputih #f8f9fa */
  surface:       '#f4f7fb',

  /** Background putih bersih — untuk card, modal */
  surfaceWhite:  '#ffffff',

  /** Border input & divider — abu-abu slate */
  border:        '#cbd5e1',

  /** Border fokus — saat user aktif di input */
  borderFocus:   '#3b82f6',

  /** Teks utama — hampir hitam, lebih lembut dari pure black */
  text:          '#1e293b',

  /** Teks sekunder — placeholder, label kecil, caption */
  textMuted:     '#64748b',

  /** Teks di atas background gelap (primary/secondary) */
  textOnDark:    '#ffffff',

  /** Teks aksen di atas background gelap */
  textAccentOnDark: '#93c5fd',
} as const;

// ============================================================================
// 🚦 WARNA STATUS BOOKING (Kalender & Badge)
// ============================================================================

/**
 * Warna per status booking.
 * Digunakan di: kalender interaktif, badge tabel admin, notifikasi.
 *
 * Mapping visual:
 *   🟢 Hijau     = tersedia (boleh dipilih)
 *   🟡 Kuning    = pending (sudah ada booking, menunggu admin)
 *   🔴 Merah     = approved/terkunci (tidak bisa dipilih)
 *   🟣 Ungu      = rescheduled (sedang dijadwal ulang)
 *   ⚫ Abu-abu   = rejected / cancelled
 *   🔵 Biru tua  = completed (selesai)
 *   ○  Abu terang = nonaktif (hari libur, Minggu, masa lalu)
 */
export const BK_STATUS_COLORS = {
  available: {
    bg:     '#dcfce7',   // hijau muda
    text:   '#15803d',   // hijau tua
    dot:    '#16a34a',   // dot kalender
    border: '#86efac',
    label:  'Tersedia',
  },
  pending: {
    bg:     '#fef9c3',   // kuning muda
    text:   '#92400e',   // kuning tua
    dot:    '#d97706',   // dot kalender
    border: '#fde68a',
    label:  'Pending',
  },
  approved: {
    bg:     '#fee2e2',   // merah muda
    text:   '#991b1b',   // merah tua
    dot:    '#dc2626',   // dot kalender
    border: '#fca5a5',
    label:  'Disetujui',
  },
  rejected: {
    bg:     '#f3f4f6',   // abu-abu muda
    text:   '#374151',   // abu-abu tua
    dot:    '#6b7280',   // dot kalender
    border: '#d1d5db',
    label:  'Ditolak',
  },
  rescheduled: {
    bg:     '#ede9fe',   // ungu muda
    text:   '#5b21b6',   // ungu tua
    dot:    '#7c3aed',   // dot kalender
    border: '#c4b5fd',
    label:  'Dijadwal Ulang',
  },
  cancelled: {
    bg:     '#f9fafb',   // abu sangat terang
    text:   '#9ca3af',   // abu-abu
    dot:    '#d1d5db',   // dot kalender
    border: '#e5e7eb',
    label:  'Dibatalkan',
  },
  completed: {
    bg:     '#dbeafe',   // biru muda
    text:   '#1e40af',   // biru tua
    dot:    '#0369a1',   // dot kalender
    border: '#93c5fd',
    label:  'Selesai',
  },
  disabled: {
    bg:     '#f1f5f9',   // nonaktif (Minggu/libur/masa lalu)
    text:   '#cbd5e1',
    dot:    '#e2e8f0',
    border: '#e2e8f0',
    label:  '',
  },
} as const;

// ============================================================================
// 🔤 FONT
// ============================================================================

/**
 * Font modul booking.
 *
 * Catatan:
 * - Inter: sama dengan website utama → konsistensi keterbacaan, tidak perlu
 *   load font tambahan jika dipakai dalam mode monolith.
 * - Plus Jakarta Sans: hanya dipakai untuk heading modul booking agar
 *   terasa BERBEDA dari Playfair Display (serif) website utama yang lebih
 *   klasik/elegan. Plus Jakarta Sans lebih modern dan government-friendly.
 *
 * Jika ingin menyamakan heading dengan website utama, ganti BK_FONTS.display
 * ke 'Playfair Display, serif' (uncomment baris di bawah).
 */
export const BK_FONTS = {
  /** Body text — sama dengan website utama (Inter) */
  sans:    "'Inter', sans-serif",

  /**
   * Heading modul booking — Plus Jakarta Sans (berbeda dari Playfair Display)
   * Uncomment baris di bawah jika ingin samakan dengan heading website utama:
   * display: "'Playfair Display', serif",
   */
  display: "'Plus Jakarta Sans', 'Inter', sans-serif",

  /**
   * Monospace — untuk ID booking, kode referensi
   */
  mono:    "'JetBrains Mono', 'Courier New', monospace",
} as const;

// ============================================================================
// 📐 SPACING & RADIUS
// ============================================================================

export const BK_RADIUS = {
  sm:   '0.375rem',   // 6px  — badge, tag kecil
  md:   '0.5rem',     // 8px  — input, button
  lg:   '0.75rem',    // 12px — card
  xl:   '1rem',       // 16px — modal, panel besar
  full: '9999px',     // pill — badge status
} as const;

export const BK_SHADOW = {
  sm:  '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md:  '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  lg:  '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  xl:  '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
} as const;

// ============================================================================
// 🔁 TYPE HELPERS
// ============================================================================

export type BookingStatus = keyof typeof BK_STATUS_COLORS;
export type BkColor = keyof typeof BK_COLORS;

/** Helper: ambil warna berdasarkan status string */
export const getStatusColor = (status: string) => {
  return BK_STATUS_COLORS[status as BookingStatus] ?? BK_STATUS_COLORS.disabled;
};
