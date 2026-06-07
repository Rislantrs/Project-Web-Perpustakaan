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

Untuk skala produksi, Anda wajib mengaktifkan SMTP Kustom agar link aktivasi pendaftaran dan token reset password dapat dikirimkan secara instan ke email pengguna perpustakaan tanpa batasan limit email gratisan Supabase (maksimal 3 email per jam).

### A. Cara Konfigurasi Resend SMTP di Supabase Auth
1. Dapatkan **SMTP API Key** di Resend.com (buka **Resend > API Keys** > buat Key baru dengan akses *Sending*).
2. Masuk ke **Supabase Dashboard > Auth > SMTP Settings**.
3. Aktifkan sakelar **"Enable Custom SMTP"**.
4. Isi kolom konfigurasi SMTP secara persis seperti berikut:
   * **Sender Email**: Email resmi berdomain Anda yang sudah diverifikasi di Resend (contoh: `no-reply@lann.codes` atau `admin@perpustakaandaerah.com`).
   * **Sender Name**: `Disipusda Purwakarta` (Nama pengirim di Inbox).
   * **SMTP Host**: **`smtp.resend.com`**
   * **Port**: **`465`** (SSL/TLS) atau **`587`** (STARTTLS). *Disarankan menggunakan `465`*.
   * **SMTP Username**: **`resend`** (tulis huruf kecil semua, jangan gunakan nama email Anda).
   * **SMTP Password**: Masukkan **API Key** Resend yang diperoleh di langkah 1 (berawalan `re_...`).
5. Klik **Save Changes**.

---

## 3.1. Pengaturan Custom Secrets di Supabase
Untuk mendukung alur notifikasi email kustom, integrasi Telegram Admin, dan penjadwalan otomatis yang dijalankan oleh **Supabase Edge Functions**, Anda wajib mendaftarkan variabel rahasia (*Custom Secrets*) di dashboard Supabase.

### A. Daftar Secrets yang Wajib Dikonfigurasi:
Berdasarkan kebutuhan backend perpustakaan, berikut adalah secrets yang harus Anda daftarkan:

* **`RESEND_API_KEY`**: API Key dari dashboard Resend Anda (contoh: `re_123456...`). Digunakan oleh Edge Function untuk mengirim email transaksi.
* **`RESEND_FROM_EMAIL`**: Alamat email pengirim transaksi yang valid dan terverifikasi di Resend (contoh: `Disipusda <no-reply@lann.codes>`).
* **`TELEGRAM_BOT_TOKEN`**: Token rahasia dari bot Telegram Anda yang dibuat via `@BotFather`.
* **`TELEGRAM_ADMIN_CHAT_ID`**: ID chat penerima notifikasi admin Telegram (dapat berupa ID chat pribadi Anda atau ID grup admin).
* **`SITE_URL`**: URL utama website frontend Anda (contoh: `https://lann.codes` atau `https://project-web-perpustakaan.pages.dev`). Digunakan untuk menyusun tautan reschedule/konfirmasi dalam email.
* **`CRON_SECRET`**: Token keamanan acak panjang untuk memverifikasi request cron job terjadwal (mencegah pihak asing memicu cron Anda secara sembarangan).

### B. Cara Memasukkan Secrets ke Supabase:

#### Cara 1: Lewat Dashboard Supabase (Visual)
1. Buka **Supabase Dashboard** > pilih Proyek Anda.
2. Buka menu **Settings** (ikon roda gigi di kiri bawah) > pilih menu **Edge Functions** (atau menu **API** pada versi dashboard tertentu).
3. Gulir ke bawah hingga menemukan bagian **Custom Secrets**.
4. Klik **Add a Secret** (atau **Edit**), masukkan kolom **Name** (misal: `RESEND_API_KEY`) dan **Value** (kunci rahasianya), lalu klik Save. Ulangi untuk semua secrets di atas.

#### Cara 2: Lewat Supabase CLI (Terminal)
Jika Anda mengelola proyek menggunakan komputer lokal, jalankan perintah berikut di folder proyek Anda:
```bash
supabase secrets set RESEND_API_KEY="re_key_anda" RESEND_FROM_EMAIL="Disipusda <no-reply@lann.codes>" TELEGRAM_BOT_TOKEN="token_bot_anda" TELEGRAM_ADMIN_CHAT_ID="id_chat_admin" SITE_URL="https://lann.codes" CRON_SECRET="kunci_cron_acak_anda"
```

---

## 3.2. Deploy & Manajemen Supabase Edge Functions
Seluruh logika backend perantara perpustakaan (pengiriman email notifikasi booking, perubahan status, pengingat denda peminjaman, dan webhook bot Telegram) dideploy di serverless platform **Supabase Edge Functions**.

Ada **6 Edge Functions** utama yang harus Anda deploy dari folder `supabase/functions/` ke cloud Supabase:

1. **`booking-notification`**: Mengirim notifikasi email dan Telegram ketika ada pemohon baru yang membuat reservasi arsip/buku.
2. **`booking-status-change`**: Mengirim email pemberitahuan ke pemohon ketika admin menyetujui, menolak, atau menjadwal ulang (reschedule) waktu booking mereka.
3. **`send-booking-digest`**: Cron harian yang memproses dan mengirim rangkuman (digest) booking masuk ke admin.
4. **`send-borrow-notification`**: Mengirim email konfirmasi ke peminjam ketika proses peminjaman buku perpustakaan berhasil dicatat oleh admin.
5. **`send-borrow-reminders`**: Cron harian yang memindai database untuk mendeteksi buku yang mendekati masa jatuh tempo dan otomatis mengirim email pengingat pengembalian ke peminjam.
6. **`telegram-webhook`**: Endpoint penerima pesan balik dari Telegram Bot agar admin dapat merespons notifikasi secara langsung via aplikasi Telegram.

### Langkah Mendeploy Edge Functions ke Supabase:
1. Pastikan **Supabase CLI** sudah terinstal secara global:
   ```bash
   npm install -g supabase
   ```
2. Hubungkan terminal lokal Anda dengan akun Supabase:
   ```bash
   supabase login
   ```
3. Hubungkan folder proyek lokal ke proyek Supabase cloud Anda:
   ```bash
   supabase link --project-ref <PROJECT_REF_ID>
   ```
   *(PROJECT_REF_ID dapat Anda lihat pada URL dashboard Supabase Anda, contoh: `https://supabase.com/dashboard/project/anqopdxzdkpsmtxuultp` -> REF ID nya adalah `anqopdxzdkpsmtxuultp`).*
4. Jalankan perintah deploy untuk masing-masing fungsi secara bergantian:
   ```bash
   supabase functions deploy booking-notification
   supabase functions deploy booking-status-change
   supabase functions deploy send-booking-digest
   supabase functions deploy send-borrow-notification
   supabase functions deploy send-borrow-reminders
   supabase functions deploy telegram-webhook
   ```
5. Periksa status fungsi di dashboard Supabase pada tab **Edge Functions** di bilah navigasi kiri. Pastikan keenam fungsi di atas sudah berstatus **Active** dan memiliki URL endpoint masing-masing.

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
