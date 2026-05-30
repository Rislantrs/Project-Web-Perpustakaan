# 📘 Panduan Integrasi Sistem & Layanan Eksternal
### (Supabase, Google OAuth, Custom SMTP, & Keamanan Cloudflare)

Panduan ini disusun untuk memberikan petunjuk langkah-demi-langkah bagi pengembang maupun tim IT dalam menyambungkan sistem website perpustakaan **Disipusda** ke berbagai infrastruktur dan layanan eksternal di lingkungan produksi (*production*).

---

## 📂 Daftar Isi
1. [Koneksi Supabase ke Proyek (Variabel Lingkungan)](#1-koneksi-supabase-ke-proyek)
2. [Konfigurasi Integrasi Google OAuth (Google Sign-In)](#2-konfigurasi-integrasi-google-oauth)
3. [Konfigurasi Layanan Email SMTP Kustom](#3-konfigurasi-layanan-email-smtp-kustom)
4. [Persiapan Database & Kebijakan RLS (Security Policies)](#4-persiapan-database--kebijakan-rls)
5. [Konfigurasi Cloudflare Turnstile (Anti-Bot Captcha)](#5-konfigurasi-cloudflare-turnstile)
6. [Langkah Uji Coba & Troubleshooting](#6-langkah-uji-coba--troubleshooting)

---

## 1. Koneksi Supabase ke Proyek

Agar aplikasi React dapat berkomunikasi dengan basis data dan otentikasi di Cloud, Anda perlu mendefinisikan URL proyek dan Kunci Anonim (*Anonymous Key*) dari Supabase.

### Langkah-langkah:
1. Masuk ke **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Buka proyek Anda, lalu navigasikan ke menu **Settings** (ikon gerigi) > **API**.
3. Salin nilai dari kolom berikut:
   * **Project URL**: `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   * **API Keys (anon/public)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Buat atau edit berkas bernama `.env` di direktori utama (*root*) proyek Anda, lalu masukkan nilai tersebut:

```env
# Koneksi Supabase API
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Keamanan Turnstile (opsional)
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

> [!WARNING]
> Berkas `.env` menyimpan kunci keamanan aplikasi Anda. **JANGAN PERNAH** memasukkan berkas `.env` ke repositori publik seperti GitHub. Berkas ini sudah dimasukkan ke dalam `.gitignore` secara default.

---

## 2. Konfigurasi Integrasi Google OAuth

Dengan penonaktifan NIK dan aktivasi sistem masuk satu klik (*one-click login*), Google OAuth sangat krusial untuk memberikan pengalaman autentikasi yang instan.

### Bagian A: Membuat Kredensial di Google Cloud Console
1. Buka **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Buat proyek baru atau pilih proyek yang sudah ada.
3. Cari dan buka menu **OAuth Consent Screen** (Layar Persetujuan OAuth):
   * Pilih Jenis Pengguna: **External** (Eksternal).
   * Isi informasi wajib aplikasi (Nama Aplikasi, Email Dukungan Pengguna, dan Email Kontak Pengembang).
   * Pada langkah *Scopes*, tambahkan cakupan dasar: `.../auth/userinfo.email` dan `.../auth/userinfo.profile`.
   * Pada langkah *Test Users*, tambahkan email Anda sendiri jika status aplikasi masih dalam tahap draf/pengujian.
4. Buka menu **Credentials** (Kredensial) di bilah navigasi samping:
   * Klik **+ Create Credentials** > pilih **OAuth Client ID**.
   * Pilih tipe aplikasi: **Web Application** (Aplikasi Web).
   * Masukkan nama identifikasi (misal: `Disipusda Library Production`).
   * Pada bagian **Authorized redirect URIs** (URI Pengalihan yang Diizinkan), masukkan URI callback Supabase proyek Anda. Formatnya:
     ```text
     https://<PROJECT_REF_ID>.supabase.co/auth/v1/callback
     ```
     *(Ganti `<PROJECT_REF_ID>` dengan ID unik proyek Supabase Anda. Anda dapat melihat ID ini di URL dashboard Supabase Anda).*
   * Klik **Create**.
5. Simpan informasi penting yang ditampilkan pada dialog sukses:
   * **Client ID**
   * **Client Secret**

### Bagian B: Mengaktifkan Google Provider di Supabase
1. Masuk kembali ke **Supabase Dashboard** Anda.
2. Buka menu **Auth** > **Providers** > klik pilihan **Google**.
3. Aktifkan sakelar (*toggle*) **Enable Google Provider**.
4. Tempelkan informasi dari Google Cloud Console tadi ke kolom masing-masing:
   * **Client ID (for OAuth)**
   * **Client Secret (for OAuth)**
5. Klik **Save** (Simpan).

---

## 3. Konfigurasi Layanan Email SMTP Kustom

Secara default, Supabase menyediakan kuota pengiriman email built-in yang sangat terbatas (hanya 3 email per jam) dan menggunakan nama pengirim default. Untuk skala produksi, Anda wajib menghubungkan server SMTP kustom Anda sendiri (misal: layanan SMTP internal `.go.id`, SendGrid, Mailgun, Brevo, atau Gmail SMTP).

### Mengapa SMTP Kustom Diperlukan?
* Mengirimkan link aktivasi pendaftaran secara andal.
* Mengirimkan instruksi pemulihan (*Reset Password*) ke email pengguna.
* Menghindari pembatasan laju pengiriman (*rate limit*).

### Langkah-langkah Konfigurasi di Supabase:
1. Masuk ke **Supabase Dashboard** > **Auth** > **SMTP Settings**.
2. Aktifkan sakelar **Enable Custom SMTP**.
3. Lengkapi parameter server email Anda:
   * **Sender Email**: Email resmi perpustakaan (misalnya: `perpustakaan@disipusda.purwakartakab.go.id` atau `no-reply@domainanda.com`).
   * **Sender Name**: Nama pengirim yang tampil di inbox pengguna (misalnya: `Disipusda Purwakarta`).
   * **SMTP Provider / Host**: Alamat server pengiriman (misalnya: `smtp.gmail.com` atau `smtp.sendgrid.net`).
   * **Port**:
     * `587` (Rekomendasi untuk enkripsi STARTTLS).
     * `465` (Untuk enkripsi SSL murni).
   * **SMTP Username**: Username autentikasi email (biasanya sama dengan alamat email pengirim).
   * **SMTP Password**: Kata sandi email Anda (atau *App Password* khusus jika menggunakan verifikasi 2 langkah di Gmail).
4. Klik **Save Changes**.

---

## 4. Persiapan Database & Kebijakan RLS

Sistem pendaftaran menyimpan profil ke tabel database publik. Struktur tabel dan keamanan data harus dipastikan siap di sisi Supabase.

### Bagian A: Membuat Tabel Anggota (`members`)
Eksekusi script SQL berikut di menu **SQL Editor** pada dashboard Supabase untuk memastikan tabel `members` siap menerima sinkronisasi data dari Google Auth maupun form manual:

```sql
-- Membuat Tabel Members
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nomor_anggota VARCHAR(50) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    nik_masked VARCHAR(50) DEFAULT '************',
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) DEFAULT 'managed-by-supabase-auth',
    alamat TEXT DEFAULT '',
    telepon VARCHAR(50) DEFAULT '',
    jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L', 'P')) DEFAULT 'L',
    tanggal_lahir DATE,
    tanggal_daftar VARCHAR(50),
    avatar_color VARCHAR(10) DEFAULT '#0c2f3d',
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### Bagian B: Kebijakan RLS (Row Level Security)
Row Level Security memastikan anggota biasa tidak dapat memodifikasi, menghapus, atau membaca data sensitif anggota lain tanpa izin otorisasi yang sah.

Buka **SQL Editor** dan jalankan kebijakan pengamanan berikut:

```sql
-- 1. Mengaktifkan RLS pada Tabel Members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 2. Kebijakan Membaca Data: 
-- Anggota hanya boleh membaca profilnya sendiri, Admin boleh membaca semua profil.
CREATE POLICY "Allow members to read own profile"
ON public.members FOR SELECT
TO authenticated
USING (
    auth.uid() = id
    OR 
    EXISTS (
        SELECT 1 FROM public.admins WHERE email = auth.email()
    )
);

-- 3. Kebijakan Pembaruan Data:
-- Pengguna hanya diizinkan mengedit datanya sendiri secara mandiri.
CREATE POLICY "Allow members to update own profile"
ON public.members FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Kebijakan Pendaftaran (Insert):
-- Mengizinkan pembuatan baris baru untuk pengguna terautentikasi baru.
CREATE POLICY "Allow system/self registration insert"
ON public.members FOR INSERT
WITH CHECK (true);
```

---

## 5. Konfigurasi Cloudflare Turnstile

Cloudflare Turnstile digunakan pada sistem masuk (*Login*) untuk menangkal upaya pembobolan paksa (*brute force attack*) oleh bot otomatis tanpa mengganggu pengalaman kenyamanan pengguna dengan gambar teka-teki yang sulit.

### Langkah-langkah:
1. Buka dashboard **[Cloudflare Turnstile](https://dash.cloudflare.com/)**.
2. Daftarkan domain website produksi Anda.
3. Dapatkan nilai **Site Key** dan **Secret Key**.
4. Masukkan **Site Key** ke berkas `.env` proyek Anda pada bagian `VITE_TURNSTILE_SITE_KEY` agar Turnstile Widget di halaman Login ter-render dengan normal di web produksi Anda.
   *(Di lingkungan lokal/development, Turnstile disetel menggunakan kode dummy bawaan Cloudflare `1x00000000000000000000AA` yang otomatis selalu lulus verifikasi secara instan).*

---

## 6. Langkah Uji Coba & Troubleshooting

Setelah semua integrasi terpasang, lakukan pemeriksaan kesehatan sistem (*system check*) berikut:

| Gejala Masalah | Penyebab Umum | Solusi Penyelesaian |
| :--- | :--- | :--- |
| **Eror "Redirect URI mismatch" saat klik tombol Google** | URL Callback di Google Cloud Console berbeda dengan yang didaftarkan di Supabase. | Pastikan URL di Google Developer Console sama persis dengan URL redirect dari Supabase (gunakan protokol `https` untuk production). |
| **Email verifikasi pendaftaran tidak masuk ke kotak masuk** | Kuota bawaan Supabase habis atau SMTP kustom salah konfigurasi password/port. | Periksa kredensial SMTP Anda di menu **Auth > SMTP Settings**. Uji kirim email manual dengan mengganti port dari `465` ke `587` (atau sebaliknya). |
| **Data Google login masuk, tapi nama lengkap kosong/salah** | Skema tabel database `members` gagal memetakan nama dari OAuth Metadata. | Sistem kami telah dilengkapi fallback aman di berkas `supabaseAuthService.ts`. Pastikan kolom `namaLengkap` diatur mengambil nama awal email jika metadata `full_name` Google kosong. |
| **Katalog buku lambat atau error database** | Kunci API Key di berkas `.env` kadaluarsa atau koneksi internet terputus. | Periksa log konsol browser Anda. Salin ulang kunci anon terbaru dari dashboard proyek Supabase. |

---
*Dokumen ini dibuat khusus untuk mempermudah transisi pengelolaan tim IT Perpustakaan dan Kearsipan Disipusda.*
