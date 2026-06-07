# 📖 Panduan Lengkap: Hosting, Domain Custom, dan Integrasi Supabase

Panduan ini menjelaskan langkah demi langkah untuk melakukan *deployment* (hosting) website perpustakaan, menghubungkan domain kustom dari luar (seperti Name.com), mengonfigurasi database Supabase, dan mengatur keamanan API keys.

---

## 🗺️ DAFTAR ISI
1. [Bagian 1: Hosting & Pengaturan Custom Domain](#-bagian-1-hosting--pengaturan-custom-domain)
2. [Bagian 2: Integrasi Supabase & Manajemen API Key](#-bagian-2-integrasi-supabase--manajemen-api-key)
3. [Bagian 3: Pengaturan Secrets & CI/CD di Platform Deployment](#-bagian-3-pengaturan-secrets--cicd-di-platform-deployment)
4. [FAQ (Pertanyaan Umum)](#-faq-pertanyaan-umum)

---

## 🚀 BAGIAN 1: HOSTING & PENGATURAN CUSTOM DOMAIN

Untuk aplikasi berbasis React + Vite (SPA/Single Page Application), platform hosting gratis terbaik, tercepat, dan paling stabil adalah **Vercel** atau **Netlify**. Panduan ini menggunakan **Vercel** sebagai contoh utama karena mendukung integrasi otomatis yang sangat baik dengan GitHub.

### Langkah 1: Hosting Website ke Vercel (via GitHub)
1. Unggah (*push*) proyek Anda ke repositori GitHub (publik atau privat).
2. Buka dan login ke [Vercel Dashboard](https://vercel.com).
3. Klik tombol **"Add New"** > **"Project"**.
4. Hubungkan akun GitHub Anda, lalu cari nama repositori website perpustakaan Anda dan klik **"Import"**.
5. Pada bagian **Environment Variables**, masukkan variabel environment Supabase Anda (baca [Bagian 2](#-bagian-2-integrasi-supabase--manajemen-api-key) untuk detailnya).
6. Klik tombol **"Deploy"**. Tunggu 1–2 menit sampai website Anda selesai di-build dan mendapatkan domain gratis bawaan (contoh: `web-perpustakaan.vercel.app`).

---

### Langkah 2: Membeli Domain di Name.com
Jika Anda ingin menggunakan domain kustom komersial (seperti `.com`, `.net`, `.id`):
1. Kunjungi situs [Name.com](https://www.name.com) dan buat akun.
2. Cari nama domain yang Anda inginkan pada kolom pencarian (misal: `perpustakaandaerah.com`).
3. Tambahkan ke keranjang belanja (*Add to Cart*), lakukan pembayaran (*Checkout*), dan selesaikan transaksi hingga domain resmi menjadi milik Anda.

---

### Langkah 3: Menghubungkan Domain dari Name.com ke Vercel (DNS Setting)

Setelah membeli domain, Anda harus memberi tahu Name.com agar mengarahkan lalu lintas domain tersebut ke server Vercel.

#### A. Daftarkan Domain Anda di Vercel
1. Buka Vercel Dashboard, masuk ke proyek website Anda.
2. Navigasi ke menu **Settings** (di bagian atas) > **Domains** (di sidebar kiri).
3. Pada kolom input, masukkan nama domain yang telah Anda beli (contoh: `perpustakaandaerah.com`), lalu klik **"Add"**.
4. Pilih opsi rekomendasi: **"Redirect perpustakaandaerah.com to www.perpustakaandaerah.com"** atau sebaliknya.
5. Vercel akan menampilkan status **"Invalid Configuration"** dengan warna merah. Jangan khawatir, Vercel sedang menampilkan **nilai DNS** yang harus Anda pasang di Name.com:
   * **A Record** untuk `perpustakaandaerah.com` mengarah ke IP: `76.76.21.21`
   * **CNAME Record** untuk `www.perpustakaandaerah.com` mengarah ke: `cname.vercel-dns.com`

#### B. Konfigurasi DNS di Dashboard Name.com
1. Login ke akun Anda di [Name.com](https://www.name.com).
2. Klik tombol **"My Domains"** di pojok kanan atas untuk melihat daftar domain Anda.
3. Klik nama domain Anda (misal: `perpustakaandaerah.com`).
4. Pada panel sebelah kiri atau tengah, cari dan klik menu **"DNS Management"** atau **"Manage DNS Records"**.
5. Anda akan melihat tabel daftar record DNS. Tambahkan dua record baru seperti petunjuk dari Vercel berikut:

##### 1. Menambahkan A Record (Untuk Domain Utama / Tanpa www)
* **Type:** Pilih **A**
* **Host / Name:** Biarkan kosong, atau isi dengan simbol **`@`**
* **Answer / Value (IP Address):** Masukkan IP Vercel: **`76.76.21.21`**
* **TTL:** Biarkan default (misal: `300` atau `3600`)
* Klik **"Add Record"** atau **"Save"**.

##### 2. Menambahkan CNAME Record (Untuk Subdomain www)
* **Type:** Pilih **CNAME**
* **Host / Name:** Isi dengan **`www`**
* **Answer / Value (Target Host):** Masukkan CNAME Vercel: **`cname.vercel-dns.com`**
* **TTL:** Biarkan default (misal: `300` atau `3600`)
* Klik **"Add Record"** atau **"Save"**.

> [!WARNING]
> Hapus record DNS lama yang bertipe **A** atau **CNAME** jika ada yang berbenturan dengan nilai baru di atas (terutama jika ada record default bawaan dari Name.com).

#### C. Verifikasi Koneksi
1. Kembali ke halaman **Settings > Domains** di Vercel Dashboard.
2. Vercel akan otomatis melakukan pengecekan berkala. Jika konfigurasi Anda benar, status merah akan berubah menjadi **hijau (Active)** dengan ikon gembok SSL (HTTPS) aktif.
3. > [!NOTE]
   > Proses pembaruan DNS (propagasi) membutuhkan waktu berkisar antara **15 menit hingga maksimal 24 jam**. Jika belum langsung aktif, harap tunggu beberapa saat.

---

## 🔑 BAGIAN 2: INTEGRASI SUPABASE & MANAJEMEN API KEY

Website Anda berkomunikasi dengan Supabase melalui API menggunakan dua variabel lingkungan (*environment variables*).

### Variabel Environment yang Digunakan
Di dalam proyek lokal Anda, variabel ini disimpan di dalam file `.env` (atau `.env.secrets`):
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

* **`VITE_SUPABASE_URL`**: URL endpoint API unik milik proyek Supabase Anda.
* **`VITE_SUPABASE_ANON_KEY`**: Kunci publik (Anon Key) yang digunakan untuk melakukan operasi dasar database dengan batasan keamanan yang ketat.

---

### Cara Mendapatkan API Keys di Dashboard Supabase
1. Login ke [Supabase Dashboard](https://supabase.com).
2. Klik proyek database perpustakaan Anda.
3. Di sidebar sebelah kiri paling bawah, klik ikon roda gigi (**Project Settings**).
4. Klik menu **API**.
5. Salin nilai yang Anda butuhkan:
   * **Project URL**: Salin URL di kolom **Project URL** dan tempel sebagai nilai `VITE_SUPABASE_URL`.
   * **Anon Key (Public)**: Cari bagian **Project API keys**, temukan baris bertuliskan **`anon` `public`**, salin kuncinya yang panjang dan tempel sebagai nilai `VITE_SUPABASE_ANON_KEY`.

> [!CAUTION]
> **PENTING:** Jangan pernah menggunakan kunci **`service_role` `secret`** di dalam file front-end Anda. Kunci `service_role` memiliki akses admin penuh yang dapat menembus sistem keamanan RLS (Row Level Security) dan memanipulasi database tanpa batas. Jika kunci ini bocor ke publik, database Anda bisa dihapus oleh orang asing.

---

### Hubungan Client React dengan Supabase
Aplikasi React berjalan langsung di browser pengguna (*client-side*). Saat aplikasi melakukan *request* data (seperti daftar buku atau anggota), aplikasi akan mengirimkan permintaan HTTPS ke URL Supabase dengan melampirkan Anon Key di header request. Supabase kemudian memeriksa aturan **RLS (Row Level Security)** pada tabel Anda untuk menentukan apakah request tersebut diizinkan atau ditolak.

---

## ⚙️ BAGIAN 3: PENGATURAN SECRETS & CI/CD DI PLATFORM DEPLOYMENT

Agar website versi produksi (live) dapat terhubung ke Supabase, variabel environment harus didaftarkan di platform hosting.

### A. Konfigurasi Environment Variables di Vercel
1. Buka dashboard proyek Anda di Vercel.
2. Masuk ke tab **Settings** > **Environment Variables**.
3. Tambahkan variabel satu per satu:
   * **Key:** `VITE_SUPABASE_URL` | **Value:** *[URL Supabase Anda]*
   * **Key:** `VITE_SUPABASE_ANON_KEY` | **Value:** *[Anon Key Supabase Anda]*
4. Pastikan centang pada **Production**, **Preview**, dan **Development** tetap aktif.
5. Klik **Save**.
6. > [!IMPORTANT]
   > Setelah menambahkan variabel baru, Anda harus melakukan redeploy proyek (bisa dengan push perubahan kecil ke GitHub) agar Vercel membangun ulang website dengan variabel environment yang baru.

---

### B. Konfigurasi GitHub Secrets untuk CI/CD (GitHub Actions)
Jika Anda menggunakan GitHub Actions untuk menguji kode atau mendeploy otomatis secara mandiri:

1. Buka repositori GitHub proyek Anda.
2. Klik tab **Settings** (ikon roda gigi di bagian atas).
3. Pada menu sebelah kiri, cari bagian **Security** > klik **Secrets and variables** > pilih **Actions**.
4. Klik tombol **"New repository secret"** (berwarna hijau).
5. Masukkan nama secret dan nilainya:
   * **Name:** `VITE_SUPABASE_URL` | **Secret:** *[Masukkan URL Supabase]* -> Klik **Add secret**.
   * **Name:** `VITE_SUPABASE_ANON_KEY` | **Secret:** *[Masukkan Anon Key]* -> Klik **Add secret**.
6. GitHub Actions sekarang dapat membaca variabel tersebut secara aman selama proses build menggunakan sintaks `${{ secrets.VITE_SUPABASE_URL }}` tanpa perlu menuliskan kuncinya secara mentah di kode sumber.

---

## ❓ FAQ (PERTANYAAN UMUM)

### T: Mengapa GitHub Actions tidak bisa dibuat langsung di dalam Dashboard Supabase?
**J:** Supabase adalah penyedia layanan backend (**Backend-as-a-Service / BaaS**). Tugas utama Supabase adalah menyediakan database PostgreSQL, autentikasi user, penyimpanan file (storage), dan fungsi API. 

Supabase tidak memiliki server komputasi umum (seperti runner/compiler) yang dirancang untuk mem-build kode aplikasi web (seperti React/Vite) atau menjalankan alur kerja CI/CD. 

Proses kompilasi website memerlukan compiler Node.js/Vite untuk mengubah kode React Anda menjadi file HTML, CSS, dan JS statis yang siap saji. Tugas build inilah yang dikerjakan oleh platform seperti **GitHub Actions** (sebagai compiler otomatis) dan **Vercel** (sebagai server hosting file statis). Supabase hanya bertindak sebagai database tujuan saat website yang sudah ter-deploy meminta data.

### T: Apa bedanya file `.env` lokal dengan Environment Variables di Vercel?
**J:** 
* File `.env` lokal digunakan saat Anda menjalankan perintah pengembangan mandiri di komputer Anda (`npm run dev`). File ini **tidak boleh diunggah ke GitHub** karena berisi konfigurasi privat.
* Environment Variables di Vercel adalah pengganti file `.env` untuk website versi produksi yang bisa diakses secara publik. Vercel akan menyuntikkan (*inject*) variabel-variabel tersebut ke dalam kode website Anda saat proses build terjadi di server cloud mereka.
