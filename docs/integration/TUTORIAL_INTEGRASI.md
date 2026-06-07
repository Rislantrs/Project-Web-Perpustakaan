# 📕 PANDUAN INTEGRASI UTAMA & PEMELIHARAAN SISTEM
### (Supabase, Google OAuth, Custom SMTP, DNS Domain, & Mode Company Profile)

Panduan satu pintu (*all-in-one guide*) ini dirancang untuk mempermudah administrator, pemilik situs, maupun tim IT dalam mengelola, mengintegrasikan, dan memelihara seluruh infrastruktur sistem website perpustakaan digital **Disipusda**.

---

## 📂 Daftar Isi
1. [Rangkuman Variabel Lingkungan & API Keys](#1-rangkuman-variabel-lingkungan--api-keys)
2. [Integrasi Google OAuth (Google Sign-In)](#2-integrasi-google-oauth-google-sign-in)
3. [Layanan Email Transaksional (Custom SMTP & Resend)](#3-layanan-email-transaksional-custom-smtp--resend)
4. [Konfigurasi DNS, Hosting, & Pengalihan Domain](#4-konfigurasi-dns-hosting--pengalihan-domain)
5. [Persiapan Database & Penjadwal Otomatis (Cron Job)](#5-persiapan-database--penjadwal-otomatis-cron-job)
6. [Mode Company Profile (Menonaktifkan Katalog & Login secara Otomatis)](#6-mode-company-profile-menonaktifkan-katalog--login-secara-otomatis)
7. [Panduan Pemecahan Masalah (Troubleshooting)](#7-panduan-pemecahan-masalah-troubleshooting)

---

## 1. Rangkuman Variabel Lingkungan & API Keys

Sistem menggunakan beberapa kunci API untuk menghubungkan frontend ke layanan cloud. Berikut adalah daftar kunci yang wajib dikonfigurasi:

### A. Kunci Frontend (Disimpan di berkas `.env` atau Dashboard Hosting)
> [!IMPORTANT]
> Di Vite/React, seluruh variabel lingkungan untuk frontend **wajib diawali dengan awalan `VITE_`** agar dapat terbaca saat kompilasi.

* **`VITE_SUPABASE_URL`**: Alamat URL API Proyek Supabase Anda.  
  *Contoh:* `https://anqopdxzdkpsmtxuultp.supabase.co`
* **`VITE_SUPABASE_ANON_KEY`**: Kunci publik API Supabase (bersifat aman untuk diletakkan di browser).
* **`VITE_TURNSTILE_SITE_KEY`**: **Site Key** publik dari Cloudflare Turnstile.  
  *Nilai Lokal:* `1x00000000000000000000AA` (untuk uji coba di localhost).  
  *Nilai Produksi:* Salin **Site Key** asli dari dashboard Cloudflare Anda (berawalan `0x4AAAAAA...`).

### B. Kunci Rahasia Cloud (Disimpan di Supabase Dashboard → Settings → Secrets)
* **`RESEND_API_KEY`**: Kunci API dari layanan pengirim email Resend.com.
* **`RESEND_FROM_EMAIL`**: Alamat email pengirim transaksional (misal: `Disipusda <no-reply@domainanda.com>`).
* **`CRON_SECRET`**: Kunci keamanan acak untuk mengamankan trigger Cron Job pengingat peminjaman.

### C. Kunci Rahasia GitHub (Disimpan di GitHub → Settings → Secrets and variables → Actions)
* **`CRON_SECRET`**: Masukkan nilai kunci rahasia yang **sama persis** dengan nilai `CRON_SECRET` di Supabase Secrets agar GitHub Actions diizinkan memicu cron job pengiriman email.
* **`SUPABASE_FUNCTIONS_URL`**: URL fungsi pengingat Supabase Anda.  
  *Contoh:* `https://anqopdxzdkpsmtxuultp.supabase.co/functions/v1/send-borrow-reminders`
* **`SUPABASE_SERVICE_ROLE_KEY`**: Kunci akses admin tingkat tinggi Supabase untuk memotong pembatasan keamanan (*bypassing gateway auth*).

---

## 2. Integrasi Google OAuth (Google Sign-In)

Menghubungkan sistem pendaftaran dan masuk satu klik (*one-click login*) menggunakan akun Google.

### Langkah A: Buat Kredensial di Google Cloud Console
1. Buka **[Google Cloud Console](https://console.cloud.google.com/)** dan buat proyek baru bernama `Disipusda Perpustakaan`.
2. Masuk ke menu **OAuth Consent Screen** (Layar Persetujuan):
   * Setel jenis pengguna ke **External**.
   * Isi kolom nama aplikasi dengan **Disipusda Purwakarta** dan pasang logo perpustakaan agar pengguna percaya saat login.
3. Masuk ke menu **Credentials** (Kredensial):
   * Klik **+ Create Credentials** > **OAuth Client ID** > Tipe Aplikasi: **Web Application**.
   * Pada kolom **Authorized JavaScript origins**, tambahkan:
     * `http://localhost:5173` (untuk uji coba lokal).
     * `https://lann.codes` (domain staging).
     * `https://disipusda.purwakartakab.go.id` (domain produksi).
   * Pada kolom **Authorized redirect URIs**, tambahkan URL callback Supabase Anda secara persis:
     ```text
     https://anqopdxzdkpsmtxuultp.supabase.co/auth/v1/callback
     ```
   * Klik **Create**, lalu salin **Client ID** dan **Client Secret** yang diberikan.

### Langkah B: Daftarkan Kredensial di Supabase
1. Masuk ke **Supabase Dashboard** > **Auth** > **Providers** > **Google**.
2. Aktifkan sakelar **Enable Google Provider**.
3. Masukkan **Client ID** (kode panjang berakhiran `.apps.googleusercontent.com`) dan **Client Secret** yang Anda peroleh dari Google Cloud Console.
4. Klik **Save**.

---

## 3. Layanan Email Transaksional (Custom SMTP & Resend)

Untuk skala produksi, Anda wajib mengaktifkan SMTP Kustom agar link aktivasi pendaftaran dan token reset password dapat dikirimkan secara instan ke email pengguna perpustakaan.

### Cara Konfigurasi SMTP di Supabase:
1. Buka **Supabase Dashboard** > **Auth** > **SMTP Settings**.
2. Aktifkan **Enable Custom SMTP**.
3. Isi kolom pengaturan SMTP sesuai dengan penyedia email Anda:
   * **Sender Email**: Email resmi (misal: `no-reply@disipusda.purwakartakab.go.id`).
   * **Sender Name**: `Disipusda Purwakarta`.
   * **SMTP Provider / Host**: Host server email Anda (misal: `smtp.gmail.com` atau server SMTP instansi).
   * **Port**: `587` (STARTTLS) atau `465` (SSL).
   * **SMTP Username** & **SMTP Password**: Kredensial autentikasi akun email Anda.
4. Klik **Save Changes**.

---

## 4. Konfigurasi DNS, Hosting, & Pengalihan Domain

Agar login Google dan tautan aktivasi berjalan normal tanpa terlempar kembali ke alamat default `http://localhost:3000`, Anda harus mendaftarkan domain produksi asli Anda ke dalam pengaturan otentikasi Supabase.

### Langkah A: Konfigurasi DNS di Cloudflare / Niagahoster / IDCloudHost
1. Masuk ke panel kontrol DNS domain Anda.
2. Tambahkan **DNS Record** berikut untuk mengarahkan domain ke server hosting (misalnya Vercel/Cloudflare Pages):
   * **A Record**: Hubungkan nama domain utama `@` ke IP Address hosting Anda.
   * **CNAME Record**: Arahkan subdomain `www` ke URL target hosting Anda.

### Langkah B: Seting URL Pengalihan Aman di Supabase Auth
1. Masuk ke **Supabase Dashboard** > **Auth** > **URL Configuration**.
2. **Site URL**: Ganti `http://localhost:3000` dengan domain utama produksi Anda.  
   *Contoh:* `https://lann.codes` (atau `https://disipusda.purwakartakab.go.id`).
3. **Redirect URLs**: Klik **Add URL** dan tambahkan domain Anda diikuti dengan wildcard `/**` agar mencakup seluruh rute callback internal:
   * `https://lann.codes/**`
   * `https://disipusda.purwakartakab.go.id/**`
4. Klik **Save**.

---

## 5. Persiapan Database & Penjadwal Otomatis (Cron Job)

Sistem perpustakaan memerlukan penjadwalan otomatis harian untuk membatalkan antrian peminjaman yang kedaluwarsa serta mengirim notifikasi pengingat via email.

### Langkah A: Inisialisasi Skema Tabel
Buka menu **SQL Editor** di dashboard Supabase, buat tab query baru, lalu jalankan script berikut untuk membuat tabel histori notifikasi:

```sql
CREATE TABLE IF NOT EXISTS public.borrow_notification_logs (
    id BIGSERIAL PRIMARY KEY,
    borrow_id UUID NOT NULL,
    member_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    notification_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_borrow_notification_day UNIQUE (borrow_id, notification_type, notification_date)
);
```

### Langkah B: Menjadwalkan Cron Job Secara Natif di Supabase
Untuk menjadwalkan agar pemeriksaan buku berjalan otomatis setiap jam secara mandiri tanpa pihak ketiga, jalankan perintah SQL berikut di **SQL Editor**:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Hapus job lama jika ada agar tidak duplikat
SELECT cron.unschedule('kirim-pengingat-peminjaman-harian');

-- Jadwalkan pemanggilan otomatis Edge Function setiap jam
SELECT cron.schedule(
  'kirim-pengingat-peminjaman-harian',
  '0 * * * *', -- Berjalan setiap jam pada menit ke-0
  $$
  SELECT net.http_post(
    url := 'https://anqopdxzdkpsmtxuultp.supabase.co/functions/v1/send-borrow-reminders',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "MASUKKAN_CRON_SECRET_ANDA"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```
*(Ganti `MASUKKAN_CRON_SECRET_ANDA` dengan kunci rahasia yang sama dengan yang diset di Secrets).*

---

## 6. Mode Company Profile (Menonaktifkan Katalog & Login secara Otomatis)

Jika di masa mendatang instansi meminta agar website dirubah menjadi **Company Profile murni** (hanya berisi portal berita, sejarah, PPID, dan profil dinas) tanpa ada fitur perpustakaan, pendaftaran, dan sistem masuk/login anggota, Anda hanya perlu mengubah satu flag konfigurasi!

### Cara Menonaktifkan:
1. Buka berkas [src/config/siteConfig.ts](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/config/siteConfig.ts).
2. Temukan bagian konfigurasi fitur opsional di bagian bawah:
   ```typescript
   FEATURES: {
     ENABLE_CATALOG: true, // Nilai default (aktif)
     REQUIRE_NIK: false,
     SHOW_DIGITAL_CARD: false,
   }
   ```
3. Ubah nilai **`ENABLE_CATALOG`** menjadi **`false`**:
   ```typescript
   FEATURES: {
     ENABLE_CATALOG: false, // Cukup ubah ini ke false!
     REQUIRE_NIK: false,
     SHOW_DIGITAL_CARD: false,
   }
   ```
4. Simpan berkas, lalu lakukan build/deploy ulang proyek Anda.

### Apa yang Terjadi Secara Otomatis di Sistem?
Ketika `ENABLE_CATALOG` diatur ke `false`, arsitektur kode kami telah dirancang untuk secara otomatis melakukan tindakan berikut secara instan:
1. **Navigasi Utama Bersih**: Menu "Katalog Buku" dan "Riwayat Pinjaman" akan langsung disembunyikan dan dihilangkan dari menu Navbar atas maupun navigasi menu Mobile.
2. **Tombol Autentikasi Lenyap**: Tombol "Masuk / Login" dan avatar profil anggota akan disembunyikan sepenuhnya dari header halaman web agar publik tidak dapat mengakses portal pendaftaran.
3. **Pengalihan Proteksi Rute (Auto-Redirect)**: Untuk mengamankan rute jika ada pengguna yang mencoba mengetikkan URL secara manual di browser, sistem router kami di [src/App.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/App.tsx) akan memblokir akses dan langsung mengalihkan rute-rute berikut kembali ke **Beranda (`/`)** secara aman:
   * Halaman Login (`/login`)
   * Halaman Pendaftaran (`/register`)
   * Halaman Lupa Password (`/forgot-password`)
   * Halaman Profil Anggota (`/profil`)
   * Halaman Riwayat Peminjaman (`/riwayat-pinjaman`)
   * Halaman Katalog Utama (`/katalog`)

---

## 7. Panduan Pemecahan Masalah (Troubleshooting)

### A. Eror "Redirect URI Mismatch" saat Klik Tombol Google
* **Penyebab**: Alamat URL callback di Google Developer Console tidak sama dengan URL redirect Supabase Anda.
* **Solusi**: Periksa kembali domain Anda di Google Cloud Console. Pastikan menggunakan protokol aman `https` dan URL callback mengarah persis ke proyek Supabase Anda: `https://anqopdxzdkpsmtxuultp.supabase.co/auth/v1/callback`.

### B. Eror "HTTP status: 401 Unauthorized" saat GitHub Actions / Cron Job Berjalan
* **Penyebab**: Nilai `CRON_SECRET` yang disimpan di **Supabase Secrets** tidak cocok dengan nilai yang dikirimkan oleh **GitHub Actions Secrets** atau cron job eksternal Anda.
* **Solusi**: Perbarui nilai `CRON_SECRET` di menu **Settings > Edge Functions** di Supabase Dashboard dan menu **Settings > Secrets > Actions** di GitHub agar keduanya menggunakan nilai rahasia baru yang sama persis.

### C. Tulisan "Hanya untuk pengujian" di Cloudflare Turnstile Produksi
* **Penyebab**: Program dikompilasi menggunakan kunci uji coba default `1x00000000000000000000AA`.
* **Solusi**: Daftarkan domain Anda di dashboard Cloudflare Turnstile, dapatkan Site Key asli Anda yang berawalan `0x4AAAAAA...`, pasang sebagai variabel `VITE_TURNSTILE_SITE_KEY` di hosting produksi Anda, lalu jalankan perintah deploy/build ulang proyek Anda.

---
*Dokumen ini dibuat khusus untuk mempermudah transisi tim pengembang dan pemelihara website Disipusda Purwakarta.*
