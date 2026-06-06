# 📦 PANDUAN MIGRASI KE HOSTING TERPADU (HOSTINGER/VPS)
### Menggunakan Node.js (JavaScript/TypeScript) & Menghindari Overhaul Kode

Dokumen ini dirancang khusus untuk menjelaskan bagaimana website Perpustakaan/Booking Disipusda dapat dipindahkan sepenuhnya ke satu penyedia hosting terpadu (seperti Hostinger) tanpa harus mengubah bahasa pemrograman ke PHP dan tanpa merombak total kode frontend Anda.

---

## 📋 DAFTAR ISI
1. [Apakah Kode Harus Dirombak Total?](#1-apakah-kode-harus-dirombak-total)
2. [Mengapa Node.js, Bukan PHP?](#2-mengapa-node-js-bukan-php)
3. [Arsitektur Transisi (Bagaimana Kode Kita Mendukung Ini)](#3-arsitektur-transisi-bagaimana-kode-kita-mendukung-ini)
4. [Cara Kerja Fitur Khusus di Hostinger (OAuth, Cron, Email, Telegram)](#4-cara-kerja-fitur-khusus-di-hostinger-oauth-cron-email-telegram)
5. [Langkah-Langkah Migrasi ke Hostinger](#5-langkah-langkah-migrasi-ke-hostinger)

---

## 1. Apakah Kode Harus Dirombak Total?

> [!IMPORTANT]
> **Tidak.** Kode frontend React + Vite Anda tidak perlu dirombak sama sekali.
>
> Frontend React Anda ketika dibangun (`npm run build`) akan menghasilkan file statis murni (HTML, CSS, dan JavaScript di folder `dist`). File-file ini dapat diunggah dan dijalankan di server mana pun di dunia (termasuk folder `public_html` di Hostinger) layaknya file HTML biasa.

Perubahan hanya diperlukan pada **sumber data** (database & backend API), yang saat ini menggunakan Supabase. Namun, karena kode kita sudah dirancang menggunakan **Repository Pattern (Database-Agnostic)**, transisi ini sangat mudah dan rapi.

---

## 2. Mengapa Node.js, Bukan PHP?

Anda **tidak harus belajar atau menulis PHP** jika pindah ke Hostinger! Karena bahasa pemrograman utama proyek ini adalah JavaScript/TypeScript, Anda dapat menggunakan **Node.js** sebagai server backend Anda di Hostinger.

* Hostinger menyediakan paket **Node.js Hosting** atau **VPS (Virtual Private Server)** yang memungkinkan Anda menjalankan aplikasi backend Node.js (seperti Express, NestJS, atau Fastify) secara penuh.
* Anda tetap menulis kode backend dalam bahasa JavaScript/TypeScript yang sudah Anda kuasai.

---

## 3. Arsitektur Transisi (Bagaimana Kode Kita Mendukung Ini)

Di dalam struktur folder proyek kita, silakan perhatikan berkas ini:
📂 [src/modules/booking/repository/factory.ts](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/modules/booking/repository/factory.ts)

Sistem kita sudah memiliki dua mode database:
1. **Mode Supabase (`supabase`):** Membaca data langsung dari Supabase cloud (aktif saat ini).
2. **Mode REST API (`api`):** Menghubungkan frontend ke server backend kustom apa pun melalui HTTP request.

Jika Anda membuat server backend Node.js baru di Hostinger untuk terhubung ke database lokal Hostinger, Anda **cukup mengubah berkas `.env`** di website Anda menjadi:
```env
VITE_BOOKING_DB_MODE=api
VITE_BOOKING_API_URL=https://api.lann.codes/api
VITE_BOOKING_API_TOKEN=token_keamanan_api_anda
```
Frontend React Anda secara otomatis akan langsung beralih membaca data dari server Hostinger Anda tanpa ada satu pun baris kode UI yang dirombak!

---

## 4. Cara Kerja Fitur Khusus di Hostinger (OAuth, Cron, Email, Telegram)

Jika semua dipusatkan di server Node.js Hostinger Anda, berikut adalah cara masing-masing fitur bekerja secara mandiri:

### A. Database (MySQL / PostgreSQL)
* Anda membuat database MySQL/Postgres melalui panel Hostinger.
* Server Node.js Anda terhubung ke database tersebut menggunakan library seperti `mysql2` atau ORM seperti `Prisma`/`Sequelize` secara lokal (`localhost`).

### B. Cron Job (Laporan Harian & Pengingat)
* Anda membuat jadwal tugas di panel **Cron Jobs** Hostinger.
* Setiap jam 08:00 WIB, Hostinger akan memicu file skrip Node.js Anda (misal: `node dist/cron/dailyDigest.js`). Skrip inilah yang akan mengambil data dari database lokal lalu mengirim notifikasi ke Telegram/Email Anda.

### C. Pengiriman Email
* Server Node.js Anda tetap bisa memanggil API Resend, atau Anda dapat menggunakan akun SMTP gratis bawaan domain Hostinger Anda menggunakan library `nodemailer` di Node.js.

### D. Google OAuth
* Server Node.js Anda akan menangani proses otentikasi Google OAuth menggunakan library seperti `passport-google-oauth20`. Alur redirect Google akan langsung mengarah ke server Hostinger Anda, bukan lagi ke Supabase.

---

## 5. Langkah-Langkah Migrasi ke Hostinger

Jika Anda memutuskan menggunakan Hostinger di masa depan:

1. **Sewa Hosting Node.js / VPS** di Hostinger.
2. **Buat Database SQL** di panel Hostinger dan catat kredensialnya.
3. **Bangun Server Backend Node.js** (misal menggunakan Express.js) yang memuat skema tabel yang sama dan menyediakan endpoint API (seperti GET `/api/bookings`, PATCH `/api/bookings/:id/status`, dsb).
4. **Deploy Server Backend Node.js** tersebut ke Hostinger.
5. **Deploy Frontend React:** Jalankan `npm run build` pada proyek web Anda, lalu upload seluruh isi folder `dist/` ke folder `public_html` domain Anda di Hostinger.
6. **Ubah Konfigurasi `.env`** frontend agar mengarah ke URL API backend Hostinger Anda dengan mode `VITE_BOOKING_DB_MODE=api`.
