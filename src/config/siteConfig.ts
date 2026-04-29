// Import Assets secara terpusat
import logoUtama from '../assets/logo/logoDisispuda.webp';
import logoAlternatif from '../assets/logo/logo_perpus.webp';

/**
 * ============================================================================
 * 🌟 FILE KONFIGURASI PUSAT (SITE CONFIGURATION) 🌟
 * ============================================================================
 * 
 * File ini adalah "Otak Utama" dari identitas website Anda.
 * Jika Anda ingin mengubah warna tema, mengganti logo, atau menambah menu
 * navigasi baru, Anda HANYA PERLU mengubahnya di file ini.
 * 
 * Keuntungan:
 * 1. Tidak perlu lagi mencari-cari kode di ratusan file.
 * 2. Mencegah error "salah ketik" saat mengganti link.
 * 3. Sangat mudah jika suatu saat website ini diserahkan ke tim IT lain.
 */

export const SITE_CONFIG = {
  // --------------------------------------------------------------------------
  // 1. BRANDING & IDENTITAS
  // --------------------------------------------------------------------------
  BRAND: {
    NAME: 'Disipusda Purwakarta',
    SHORT_NAME: 'Disipusda',
    SLOGAN: 'Memory of the Nation | Center of Literacy',
    LOGO: logoUtama,
    LOGO_ALT: logoAlternatif,
  },

  // --------------------------------------------------------------------------
  // 2. TEMA WARNA (THEME COLORS)
  // --------------------------------------------------------------------------
  // Jika ingin ganti tema website dari Biru-Emas menjadi warna lain,
  // Anda bisa mengubah kode HEX di bawah ini, lalu lakukan Search & Replace
  // (Ctrl+Shift+F) di VS Code untuk mengganti warna lama ke warna baru ini.
  // Walaupun Tailwind punya fitur theme, menyimpan daftarnya di sini membantu
  // sebagai dokumentasi cepat.
  COLORS: {
    PRIMARY: '#0c2f3d',    // Biru Gelap (Header, Footer, Tombol Utama)
    SECONDARY: '#d6a54a',  // Emas (Aksen, Garis bawah, Hover)
    ACCENT: '#1f3e4e',     // Biru Muda (Elemen sekunder)
  },

  // --------------------------------------------------------------------------
  // 3. NAVIGASI UTAMA (MENU ATAS & MOBILE)
  // --------------------------------------------------------------------------
  // Jika ingin menambah menu baru (misal: "Pengumuman"), cukup tambahkan
  // satu baris { name: 'Pengumuman', path: '/pengumuman' } di bawah.
  // Menu Navbar akan OTOMATIS menyesuaikan!
  NAV_LINKS: [
    { name: 'Beranda', path: '/' },
    {
      name: 'Profil',
      path: '#', // '#' berarti ini adalah dropdown (punya anak menu)
      subLinks: [
        { name: 'Sejarah', path: '/profil/sejarah' },
        { name: 'Struktur Organisasi', path: '/profil/struktur' },
        { name: 'Prestasi', path: '/profil/prestasi' }
      ]
    },
    {
      name: 'Layanan',
      path: '#',
      subLinks: [
        { name: 'Kearsipan', path: '/kearsipan' },
        { name: 'Perpustakaan', path: '/perpustakaan' },
        { name: 'Bale Panyawangan', path: '/bale-panyawangan' }
      ]
    },
    { name: 'Katalog Buku', path: '/katalog' },
    { name: 'Berita Terkini', path: '/artikel?kategori=Berita Terkini' },
    {
      name: 'Artikel',
      path: '#',
      subLinks: [
        { name: 'Media Mewarnai', path: '/artikel?kategori=Media Mewarnai' },
        { name: 'Perpustakaan Keliling', path: '/artikel?kategori=Perpus Keliling' },
        { name: 'Galeri Foto', path: '/artikel?kategori=Galeri' },
        { name: 'Video Terkini', path: '/artikel?kategori=Video Terkini' },
        { name: 'Pojok Carita', path: '/artikel?kategori=Pojok Carita' },
        { name: 'Serba-Serbi Purwakarta', path: '/artikel?kategori=Serba-serbi Purwakarta' },
        { name: 'Edukasi', path: '/artikel?kategori=Edukasi' },
        { name: 'Kedinasan', path: '/artikel?kategori=Kedinasan' },
        { name: 'Statistik', path: '/artikel?kategori=Statistik' }
      ]
    },
    {
      name: 'Lain-Lain',
      path: '#',
      subLinks: [
        { name: 'Galeri Perpus Keliling', path: '/artikel?kategori=Galeri Perpus Keliling' },
        { name: 'Pabukon', path: '/pabukon' },
        { name: 'GALENDO', path: '/galendo' },
        { name: 'PPID', path: '/ppid' },
        { name: 'Zona Integritas', path: '/zona-integritas' }
      ]
    },
  ],

  // --------------------------------------------------------------------------
  // 4. LINK EKSTERNAL (HARDCODED)
  // --------------------------------------------------------------------------
  // Link-link yang mengarah ke website luar pemerintahan atau formulir eksternal.
  EXTERNAL_LINKS: {
    JIKN: 'https://jikn.anri.go.id/',
    PAMERAN_VIRTUAL: 'https://jikn.anri.go.id/pameran-virtual',
    FORM_PENGADUAN: 'https://docs.google.com/forms/d/e/1FAIpQLSe2S9Ck-DAPbISSJcDLRiHg6d3aoiCU7xu7bYoLjbLY-gFGhg/viewform',
    HELPDESK_SRIKANDI: 'https://api.whatsapp.com/send/?phone=6288971405196&text&type=phone_number&app_absent=0'
  }
};
