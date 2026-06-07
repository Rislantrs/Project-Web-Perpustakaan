# 🔗 Panduan Konfigurasi Navigasi Balik Subdomain ke Website Utama

Saat Anda menjalankan modul **Booking Enkapsulasi** di subdomain terpisah (misal: `booking.purwakartakab.go.id`), Anda tentu ingin agar mengklik logo atau menu **"Beranda"** akan mengarahkan pengguna kembali ke website utama WordPress (`https://web-utama-wordpress.com`), bukan ke halaman beranda subdomain yang kosong.

Panduan ini menjelaskan cara mengonfigurasi dan mengaktifkan fitur redirect dinamis tersebut dengan mudah.

---

## 📋 DAFTAR ISI
1. [Langkah 1: Tambahkan Variabel URL Web Utama](#langkah-1-tambahkan-variabel-url-web-utama)
2. [Langkah 2: Cara Kerja Kode di `Navbar.tsx`](#langkah-2-cara-kerja-kode-di-navbartx)
3. [Langkah 3: Mengatasi Navigasi di Halaman Lain (Login / Error 404)](#langkah-3-mengatasi-navigasi-di-halaman-lain-login--error-404)

---

## Langkah 1: Tambahkan Variabel URL Web Utama

Buka file `.env` pada server/hosting subdomain Anda dan tambahkan alamat URL website utama Anda:

```env
# Alamat URL website utama WordPress Anda
VITE_MAIN_WEBSITE_URL=https://web-utama-wordpress.com
```

*Jika variabel ini tidak diisi, sistem secara otomatis akan menggunakan fallback `/` (tetap mengarah ke beranda internal lokal seperti biasa).*

---

## Langkah 2: Cara Kerja Kode di `Navbar.tsx`

Kami telah memodifikasi file [Navbar.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/components/Navbar.tsx) agar dapat mendeteksi apakah `VITE_MAIN_WEBSITE_URL` adalah tautan luar (dimulai dengan `http` atau `https`). 

Jika merupakan tautan luar, Navbar akan merender tag jangkar HTML biasa (`<a href="...">`) agar browser melakukan redirect keluar dari React Router ke website WordPress Anda secara mulus.

Berikut adalah potongan logika yang diimplementasikan:

```typescript
// Ambil URL beranda dari env, defaultnya adalah '/'
const homeUrl = (import.meta.env.VITE_MAIN_WEBSITE_URL as string) || '/';

// Helper untuk mengecek apakah path mengarah ke eksternal domain
const isExternal = (path: string) => path.startsWith('http://') || path.startsWith('https://');
```

Pada Logo dan Menu Beranda:
*   Jika **Internal (`/`)**: Menggunakan komponen `<Link to="/">` bawaan React Router.
*   Jika **Eksternal (`https://...`)**: Menggunakan tag `<a href="https://...">` biasa.

---

## Langkah 3: Mengatasi Navigasi di Halaman Lain (Login / Error 404)

Apabila pengguna membuka halaman **Login** atau halaman **Error 404 (Not Found)** di subdomain, mereka juga akan melihat tombol kembali ke Beranda. Tombol-tombol tersebut juga secara otomatis mengikuti konfigurasi `VITE_MAIN_WEBSITE_URL` Anda secara konsisten.
