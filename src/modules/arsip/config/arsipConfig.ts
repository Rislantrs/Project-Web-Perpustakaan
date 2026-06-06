/**
 * ============================================================================
 * ⚙️ KONFIGURASI MODUL CARI ARSIP (arsipConfig.ts)
 * ============================================================================
 *
 * File konfigurasi mandiri untuk modul "Cari Arsip" yang mengimplementasikan
 * pola Smart Search Redirect / Deep Linking ke portal JIKN (Jaringan Informasi
 * Kearsipan Nasional) yang dikelola oleh ANRI (Arsip Nasional RI).
 *
 * Arsitektur: Microservice-lite / Modul Mandiri
 * - Modul ini TIDAK bergantung pada Supabase atau database internal.
 * - Semua data yang dikirim hanya berupa query string ke URL eksternal JIKN.
 * - Tidak ada data pengguna yang disimpan di server manapun.
 *
 * Cara kerja:
 *   1. Pengguna memasukkan kata kunci di kolom pencarian.
 *   2. Modul merangkai URL JIKN dengan parameter pencarian + filter instansi Purwakarta.
 *   3. Browser membuka halaman hasil pencarian JIKN langsung (deep link).
 */

export const ARSIP_CONFIG = {
  // --------------------------------------------------------------------------
  // 1. IDENTITAS MODUL
  // --------------------------------------------------------------------------
  MODULE: {
    NAME: 'Cari Arsip Purwakarta',
    DESCRIPTION:
      'Telusuri koleksi arsip digital Kabupaten Purwakarta melalui portal resmi JIKN (Jaringan Informasi Kearsipan Nasional) yang dikelola ANRI.',
    VERSION: '1.0.0',
    ROUTE: '/cari-arsip',
  },

  // --------------------------------------------------------------------------
  // 2. KONFIGURASI JIKN (TARGET LAYANAN EKSTERNAL)
  // --------------------------------------------------------------------------
  // Struktur URL deep-link JIKN berdasarkan pola: 
  // https://jikn.anri.go.id/pencarian?q={KEYWORD}&instansi={KODE_INSTANSI}
  // 
  // CATATAN: Jika ANRI mengubah struktur URL JIKN di masa mendatang,
  // cukup ubah nilai di bagian ini saja tanpa menyentuh kode tampilan (UI).
  JIKN: {
    BASE_URL: 'https://jikn.anri.go.id',
    // Path endpoint pencarian JIKN
    SEARCH_PATH: '/pencarian',
    // Parameter nama keyword pencarian di URL JIKN
    QUERY_PARAM: 'q',
    // Parameter filter instansi di URL JIKN (untuk pre-filter ke Purwakarta)
    INSTANSI_PARAM: 'instansi',
    // Kode/nama instansi Purwakarta yang dikenali oleh sistem JIKN
    // Nilai ini disesuaikan dengan filter yang tersedia di portal JIKN
    INSTANSI_VALUE: 'Dinas Arsip dan Perpustakaan Kabupaten Purwakarta',
    // Fallback: URL halaman utama JIKN jika pencarian gagal/kosong
    FALLBACK_URL: 'https://jikn.anri.go.id',
  },

  // --------------------------------------------------------------------------
  // 3. SARAN TOPIK PENCARIAN (QUICK SEARCH CHIPS)
  // --------------------------------------------------------------------------
  // Daftar kata kunci populer yang ditampilkan sebagai tombol pintasan
  // agar pengguna tidak kebingungan harus mengetik apa.
  SUGGESTED_TOPICS: [
    'Bupati Purwakarta',
    'Peraturan Daerah',
    'Sejarah Purwakarta',
    'Sertifikat Tanah',
    'APBD Purwakarta',
    'Laporan Kegiatan',
    'Foto Dokumentasi',
    'Peta Wilayah',
  ],

  // --------------------------------------------------------------------------
  // 4. STATISTIK INFORMASIONAL (TAMPILAN ONLY — BUKAN DATA REALTIME)
  // --------------------------------------------------------------------------
  // Angka-angka ini bersifat statis/dekoratif untuk meningkatkan kepercayaan
  // pengguna terhadap portal JIKN. Update secara berkala sesuai info terbaru ANRI.
  STATS: [
    { label: 'Instansi Terdaftar di JIKN', value: '500+' },
    { label: 'Arsip Tersedia Nasional', value: '1 Juta+' },
    { label: 'Provinsi Tercakup', value: '34' },
  ],

  // --------------------------------------------------------------------------
  // 5. INFORMASI PENJELASAN / DISCLAIMER
  // --------------------------------------------------------------------------
  DISCLAIMER: {
    TITLE: 'Tentang Fitur Ini',
    BODY: 'Fitur "Cari Arsip" mengarahkan pencarian Anda langsung ke portal resmi JIKN (Jaringan Informasi Kearsipan Nasional) milik ANRI. Website Disipusda Purwakarta tidak menyimpan atau memproses data arsip; kami hanya menyediakan pintasan pencarian yang lebih mudah diakses oleh masyarakat Purwakarta.',
  },
};

/**
 * Fungsi utama: Merangkai URL deep-link pencarian JIKN.
 *
 * @param keyword - Kata kunci yang dimasukkan pengguna
 * @param filterInstansi - Apakah harus difilter ke instansi Purwakarta (default: true)
 * @returns URL string yang siap dibuka di tab baru
 *
 * Contoh hasil:
 *   buildJiknSearchUrl('sejarah bupati') 
 *   => "https://jikn.anri.go.id/pencarian?q=sejarah+bupati&instansi=Dinas+Arsip..."
 */
export function buildJiknSearchUrl(keyword: string, filterInstansi = true): string {
  const { BASE_URL, SEARCH_PATH, QUERY_PARAM, INSTANSI_PARAM, INSTANSI_VALUE, FALLBACK_URL } =
    ARSIP_CONFIG.JIKN;

  const trimmed = keyword.trim();

  if (!trimmed) {
    return FALLBACK_URL;
  }

  const params = new URLSearchParams();
  params.set(QUERY_PARAM, trimmed);

  if (filterInstansi) {
    params.set(INSTANSI_PARAM, INSTANSI_VALUE);
  }

  return `${BASE_URL}${SEARCH_PATH}?${params.toString()}`;
}
