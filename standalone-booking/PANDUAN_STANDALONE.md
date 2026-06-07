# 📅 Panduan Penggunaan Project Standalone Booking (Modul Mandiri)

Project di dalam folder `standalone-booking/` adalah versi **modular mandiri (micro-frontend)** dari fitur Booking Enkapsulasi Arsip. Proyek ini dipisahkan dari website utama agar ringan, terfokus, dan siap di-deploy secara terpisah pada subdomain khusus (seperti `booking.purwakartakab.go.id`).

---

## 🚀 KEUNTUNGAN MODUL MANDIRI
1. **Sangat Ringan:** Ukuran bundle build sangat kecil karena tidak memuat halaman katalog buku, diorama, berita, PPID, dan modul lainnya.
2. **Bebas Crash:** Gangguan atau pemeliharaan (*maintenance*) pada website utama tidak akan memengaruhi sistem pendaftaran booking.
3. **Centralized Configuration:** Desain, logo, warna, dan tautan tombol kembali ke website utama diatur di satu file konfigurasi terpusat.

---

## 🛠️ KONFIGURASI TERPUSAT (`src/config/bookingConfig.ts`)

Semua identitas tampilan diatur di dalam file [bookingConfig.ts](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/standalone-booking/src/config/bookingConfig.ts). Anda dapat mengedit file ini untuk menyesuaikan identitas:

```typescript
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
  // Ubah link ini ke alamat website utama WordPress Anda
  MAIN_WEBSITE_URL: import.meta.env.VITE_MAIN_WEBSITE_URL || 'https://web-utama-wordpress.com',

  // 3. KONTAK FOOTER
  FOOTER: {
    ADDRESS: 'Jl. Veteran No. 1, Komplek Perum Griya Asri, Ciseureuh, Purwakarta, Jawa Barat 41118',
    TELEPHONE: '+62 812-3456-7890',
    EMAIL: 'arsip@disipusda.purwakarta.go.id',
    INSTAGRAM: 'https://www.instagram.com/disipusdapwk/',
  },
};
```

---

## 💻 LANGKAH MENJALANKAN DI LOKAL (DEVELOPMENT)

1. Buka terminal Anda.
2. Pindah direktori kerja ke dalam folder `standalone-booking`:
   ```bash
   cd standalone-booking
   ```
3. Install seluruh pustaka pendukung (*dependencies*):
   ```bash
   npm install
   ```
4. Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
5. Sesuaikan variabel `.env` dengan kredensial Supabase Anda.
6. Jalankan server lokal:
   ```bash
   npm run dev
   ```
7. Buka browser pada alamat yang tertera (biasanya `http://localhost:5173`).

---

## 🌐 LANGKAH DEPLOYMENT KE PRODUKSI (HOSTING)

Jika Anda ingin menayangkan website ini secara publik:

1. Di dalam folder `standalone-booking`, lakukan kompilasi produksi:
   ```bash
   npm run build
   ```
2. Perintah di atas akan menghasilkan folder bernama **`dist/`** yang berisi file HTML, CSS, dan JS statis murni.
3. Unggah (upload) seluruh isi folder **`dist/`** tersebut ke direktori publik hosting subdomain Anda (seperti `public_html` di cPanel/Hostinger atau via Vercel/Netlify).
4. Buat halaman baru di website utama WordPress Anda, lalu pasang iframe yang mengarah ke subdomain tersebut:
   ```html
   <iframe 
     src="https://booking.purwakartakab.go.id" 
     width="100%" 
     height="950px" 
     style="border: none; overflow: hidden;"
     scrolling="no">
   </iframe>
   ```

Dengan begitu, alur pendaftaran booking Anda akan berjalan secara mandiri dan aman!
