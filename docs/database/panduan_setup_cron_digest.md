# ⏰ PANDUAN SETUP CRON JOB & ROTASI CRON SECRET

Dokumen ini menjelaskan hubungan keamanan antara Cron Job peminjaman buku dan laporan harian booking, serta memberikan panduan langkah demi langkah untuk melakukan rotasi (penggantian) **`CRON_SECRET`** yang aman.

---

## 📋 DAFTAR ISI
1. [Hubungan CRON_SECRET: Booking & Peminjaman Buku](#1-hubungan-cron_secret-booking--peminjaman-buku)
2. [Panduan Langkah demi Langkah Rotasi Token Keamanan](#2-panduan-langkah-demi-langkah-rotasi-token-keamanan)
3. [Skrip SQL pg_cron untuk Laporan Booking Harian](#3-skrip-sql-pg_cron-untuk-laporan-booking-harian)
4. [Sinkronisasi dengan GitHub Actions](#4-sinkronisasi-dengan-github-actions)

---

## 1. Hubungan CRON_SECRET: Booking & Peminjaman Buku

**Apakah keduanya menggunakan token rahasia yang sama?**
> [!IMPORTANT]
> **Ya.** Kedua layanan tersebut berada dalam satu proyek Supabase yang sama, sehingga mereka membaca satu variabel lingkungan (*environment variable*) yang sama yaitu **`CRON_SECRET`**.

* **Layanan A (Pengingat Buku Pinjaman):** Dipicu oleh GitHub Actions secara terjadwal, mengirimkan permintaan HTTP ke Supabase dengan header `x-cron-secret`.
* **Layanan B (Laporan Booking Harian):** Dipicu oleh ekstensi internal Supabase `pg_cron`, mengirimkan permintaan HTTP secara internal dengan header `x-cron-secret`.

Jika Anda mengganti nilai `CRON_SECRET` di dashboard Supabase demi keamanan, Anda **wajib memperbaruinya di kedua tempat tersebut** agar kedua fitur otomatisasi ini tidak mengalami kegagalan akses (`401 Unauthorized`).

---

## 2. Panduan Langkah demi Langkah Rotasi Token Keamanan

Ikuti langkah-langkah di bawah ini untuk membuat dan memperbarui token keamanan baru:

### Langkah 1: Buat Token Acak Baru
Gunakan generator teks acak atau buka terminal dan ketik perintah berikut untuk menghasilkan token yang kuat:
```bash
# Menghasilkan token acak berbasis base64 (32 karakter)
openssl rand -base64 32
```
*Contoh Token Baru:* `k7Yt2Pz9XmQ8wRs3vT5aB6cD7eF8gH9iJ0kL1mN2oP3=`

### Langkah 2: Perbarui Secret di Supabase
1. Masuk ke **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Buka menu **Settings** (ikon gerigi) > **API** > gulir ke bawah ke bagian **Secrets**.
3. Temukan nama variabel **`CRON_SECRET`**, lalu klik tombol edit (atau hapus lalu buat baru jika tombol edit tidak tersedia).
4. Masukkan token acak baru Anda ke dalam nilai rahasia tersebut.
5. Klik **Save**.

---

## 3. Skrip SQL pg_cron untuk Laporan Booking Harian

Setelah Anda mengubah nilai token di Supabase, Anda harus memperbarui pemicu otomatisasi database Supabase menggunakan token baru tersebut:

1. Buka menu **SQL Editor** di dashboard Supabase.
2. Klik **New Query**.
3. Salin, ubah placeholder `TOKEN_BARU_ANDA`, lalu jalankan skrip SQL berikut:

```sql
-- pg_cron setup untuk laporan harian booking
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Hapus jadwal lama jika sudah ada
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname = 'send-daily-booking-digest';

-- Jadwalkan dengan token baru (Ganti 'TOKEN_BARU_ANDA' dengan token baru dari Langkah 1)
SELECT cron.schedule(
  'send-daily-booking-digest',
  '0 1 * * *', -- Berjalan setiap hari pada jam 08:00 WIB (01:00 UTC)
  $$
  SELECT net.http_post(
    url := 'https://anqopdxzdkpsmtxuultp.supabase.co/functions/v1/send-booking-digest',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "TOKEN_BARU_ANDA"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```
4. Klik **Run**.

---

## 4. Sinkronisasi dengan GitHub Actions

Agar fitur pengingat peminjaman buku lama tetap berjalan dari GitHub Actions menggunakan token baru:

1. Masuk ke proyek Anda di **GitHub**.
2. Masuk ke menu **Settings** > **Secrets and variables** > **Actions**.
3. Temukan Repository Secret bernama **`CRON_SECRET`**.
4. Klik ikon pensil (edit), lalu masukkan nilai **`TOKEN_BARU_ANDA`** (nilai yang sama persis dengan Langkah 1 dan 3).
5. Klik **Update Secret**.
