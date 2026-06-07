import logoUtama from '../assets/logo/logoDisispuda.webp';
import logoAlternatif from '../assets/logo/logo_perpus.webp';

/**
 * ============================================================================
 * 🌟 FILE KONFIGURASI STANDALONE BOOKING 🌟
 * ============================================================================
 * 
 * Gunakan file ini untuk mengatur nama instansi, logo, kontak footer, 
 * dan URL tombol "Kembali ke Website Utama" secara terpusat.
 */

export const BOOKING_CONFIG = {
  // 1. BRANDING & IDENTITAS
  BRAND: {
    NAME: 'Disipusda Purwakarta',
    SHORT_NAME: 'Disipusda',
    SLOGAN: 'Layanan Booking Enkapsulasi & Pemeliharaan Arsip',
    LOGO: logoUtama,
    LOGO_ALT: logoAlternatif,
  },

  // 2. NAVIGASI BALIK (MAIN WEBSITE REDIRECT)
  // Alamat URL website utama WordPress Anda untuk tombol "Kembali"
  MAIN_WEBSITE_URL: import.meta.env.VITE_MAIN_WEBSITE_URL || 'https://web-utama-wordpress.com',

  // 3. KONTAK FOOTER (Tampil di bagian bawah)
  FOOTER: {
    ADDRESS: 'Jl. Veteran No. 1, Komplek Perum Griya Asri, Ciseureuh, Purwakarta, Jawa Barat 41118',
    TELEPHONE: '+62 812-3456-7890',
    EMAIL: 'arsip@disipusda.purwakarta.go.id',
    INSTAGRAM: 'https://www.instagram.com/disipusdapwk/',
  },

  // 4. SETTING DATABASE & API
  DB_MODE: import.meta.env.VITE_BOOKING_DB_MODE || 'supabase', // 'supabase' atau 'api'
  ENABLE_BOOKING: import.meta.env.VITE_ENABLE_BOOKING !== 'false',
};
