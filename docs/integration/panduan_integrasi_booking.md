# Panduan Integrasi & Panduan Deploy Modul Booking Enkapsulasi

Dokumen ini menjelaskan langkah-langkah selanjutnya yang harus Anda ambil untuk melakukan deployment, opsi migrasi ke web lama (jika web baru batal digunakan), serta skenario penggunaan multi-domain (microservice).

---

## 📋 DAFTAR ISI
1. [Langkah Deployment & Setup Notifikasi](#1-langkah-deployment--setup-notifikasi)
2. [Skenario A: Menggunakan Modul di Web Baru (Monolith)](#2-skenario-a-menggunakan-modul-di-web-baru-monolith)
3. [Skenario B: Memindahkan Modul ke Web Lama (Web Baru Batal)](#3-skenario-b-memindahkan-modul-ke-web-lama-web-baru-batal)
4. [Skenario C: Menjalankan di Domain Baru (Tetap Terhubung Web Lama)](#4-skenario-c-menjalankan-di-domain-baru-tetap-terhubung-web-lama)

---

## 1. Langkah Deployment & Setup Notifikasi

Agar email notifikasi dan bot Telegram admin bekerja, Anda wajib mengunggah (*deploy*) Supabase Edge Functions yang berada di folder `supabase/functions/`.

### Langkah-langkah:
1. **Install Supabase CLI** di komputer Anda (jika belum ada):
   ```bash
   # Menggunakan npm
   npm install -g supabase
   ```
2. **Login ke akun Supabase Anda** melalui terminal:
   ```bash
   supabase login
   ```
3. **Inisialisasi Project Link** (Hubungkan folder lokal ke project Supabase cloud Anda):
   ```bash
   # Masukkan Project Reference ID dari Supabase dashboard
   supabase link --project-ref <PROJECT_REF_ID>
   ```
4. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy booking-notification --project-ref <PROJECT_REF_ID>
   supabase functions deploy booking-status-change --project-ref <PROJECT_REF_ID>
   supabase functions deploy telegram-webhook --project-ref <PROJECT_REF_ID>
   ```
5. **Set Environment Secrets** di dashboard Supabase (Settings -> API -> Edge Function Secrets) atau via CLI:
   ```bash
   supabase secrets set TELEGRAM_BOT_TOKEN="isi_token_bot"
   supabase secrets set TELEGRAM_ADMIN_CHAT_ID="isi_id_chat_admin"
   supabase secrets set RESEND_API_KEY="re_isi_key_resend_anda"
   supabase secrets set SITE_URL="https://domain-website-anda.com"
   ```

---

## 2. Skenario A: Menggunakan Modul di Web Baru (Monolith)

Ini adalah skenario default di mana modul booking berjalan menyatu di dalam project React + Vite yang baru saja dibuat.

### Langkah Pengaktifan:
1. Pastikan file `.env` di hosting baru Anda diset sebagai berikut:
   ```env
   VITE_ENABLE_BOOKING=true
   VITE_BOOKING_DB_MODE=supabase
   ```
2. Modul akan otomatis muncul di navigasi header "Layanan" dan rute `/booking-enkapsulasi` serta `/admin/bookings` akan aktif.

---

## 3. Skenario B: Memindahkan Modul ke Web Lama (Web Baru Batal)

Jika karena suatu alasan website baru ditolak, dan Anda harus memasang fitur ini di **website lama Anda**, lakukan langkah-langkah berikut:

### Jika Website Lama Anda menggunakan React / Next.js:
1. **Salin Folder Modul:** 
   Copy folder `src/modules/booking/` dari project baru ini, lalu paste ke folder `src/` atau `src/modules/` di project web lama.
2. **Install Dependensi Tambahan:**
   Di terminal project web lama Anda, jalankan:
   ```bash
   npm install xlsx jspdf jspdf-autotable motion lucide-react sonner
   ```
3. **Daftarkan Rute (Routing):**
   Tambahkan rute halaman ke file routing web lama Anda (seperti `App.tsx` atau router Next.js):
   - `/booking-enkapsulasi` mengarah ke `BookingPage.tsx`
   - `/admin/bookings` mengarah ke `AdminBookings.tsx`
   - `/booking-enkapsulasi/konfirmasi-reschedule` mengarah ke `RescheduleConfirm.tsx`

### Jika Website Lama Anda menggunakan PHP (Laravel / cPanel / HTML Biasa):
Karena modul ini dibangun menggunakan React, Anda tidak bisa langsung menyalin file `.tsx` ke dalam PHP murni. Solusi terbaiknya adalah menggunakan **metode Micro Frontend (Embedding)**:
1. Build modul booking di project baru ini menjadi file Javascript statis.
2. Di web lama (PHP), panggil file javascript tersebut menggunakan tag iframe atau inject element div:
   ```html
   <!-- Cara termudah: Menggunakan iframe di web lama -->
   <iframe src="https://booking-enkapsulasi.domainbaru.com/booking-enkapsulasi" width="100%" height="800px" frameborder="0"></iframe>
   ```

---

## 4. Skenario C: Menjalankan di Domain Baru (Tetap Terhubung Web Lama)

Anda dapat men-deploy modul booking ini di **domain/subdomain baru** (misal: `booking-enkapsulasi.purwakartakab.go.id`), namun datanya **tetap terhubung** ke database web utama/web lama. 

### Bagaimana Cara Menghubungkannya?

Meskipun domainnya berbeda, kedua website dapat terhubung ke satu database yang sama melalui dua metode:

#### Metode 1: Menggunakan Satu Database Supabase yang Sama (Sangat Direkomendasikan)
Supabase mengizinkan koneksi dari banyak domain berbeda sekaligus tanpa batasan.
1. Di project web baru (yang dideploy di domain baru), atur file konfigurasi `.env` untuk mengarah ke Supabase project milik website utama/lama:
   ```env
   # Masukkan URL Supabase dan Anon Key dari project Supabase web lama
   VITE_SUPABASE_URL=https://project-web-lama.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_BOOKING_DB_MODE=supabase
   ```
2. Jalankan migrasi SQL database (`20260604_booking_enkapsulasi.sql`) di dalam project Supabase web lama tersebut.
3. **Hasil:** Pengguna yang memesan di domain baru akan langsung masuk ke database Supabase yang sama dengan web lama. Dashboard admin di web lama pun bisa langsung membaca datanya.

#### Metode 2: Menggunakan Mode Microservice (REST API)
Jika database web lama menggunakan MySQL/Postgres tradisional (bukan Supabase) dan berada di server hosting tersendiri:
1. Web lama bertindak sebagai server API yang menyediakan endpoint HTTP.
2. Di project booking (domain baru), ubah konfigurasi `.env` menjadi:
   ```env
   VITE_BOOKING_DB_MODE=api
   VITE_BOOKING_API_URL=https://api.web-lama.com/api
   VITE_BOOKING_API_TOKEN=token_keamanan_api_anda
   ```
3. Kelas [ApiBookingRepo.ts](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/modules/booking/repository/ApiBookingRepo.ts) akan mengambil alih tugas dan melakukan komunikasi HTTP Fetch ke web lama secara otomatis di belakang layar.
