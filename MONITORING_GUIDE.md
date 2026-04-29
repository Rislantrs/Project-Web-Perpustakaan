# Panduan Setup Monitoring (Sentry & GA4)

Dokumen ini menjelaskan cara mendapatkan kunci akses dan mengaktifkan fitur monitoring yang telah dipasang.

---

## 1. Setup Sentry (Error Tracking)

Sentry akan memberitahu Anda via email jika ada user yang mengalami error/crash di website.

### Langkah-langkah:
1.  **Daftar Akun:** Buka [sentry.io](https://sentry.io/) dan buat akun (Gratis).
2.  **Buat Project:**
    *   Klik **Create Project**.
    *   Pilih **React** sebagai platform.
    *   Beri nama proyek, misal: `Disipusda-Web`.
3.  **Dapatkan DSN:**
    *   Setelah proyek dibuat, masuk ke menu **Settings** (ikon gerigi).
    *   Pilih **Projects** -> Klik nama proyek Anda.
    *   Cari menu **Client Keys (DSN)** di sidebar kiri.
    *   Salin link yang muncul (contoh: `https://abcd@sentry.io/1234`).
4.  **Aktivasi:**
    *   Buka file `.env` di folder proyek Anda.
    *   Masukkan link tersebut ke variabel: `VITE_SENTRY_DSN=https://abcd@sentry.io/1234`.

---

## 2. Setup Google Analytics 4 (Pelacak Pengunjung)

Untuk mengetahui berapa banyak orang yang mengunjungi website Anda.

### Langkah-langkah:
1.  **Buka GA:** Masuk ke [analytics.google.com](https://analytics.google.com/) menggunakan akun Gmail.
2.  **Buat Akun/Property:**
    *   Klik **Admin** (gerigi di kiri bawah).
    *   Pilih **Create Property**.
    *   Pilih **Web** sebagai platform.
3.  **Dapatkan Measurement ID:**
    *   Masukkan URL website Anda.
    *   Setelah stream dibuat, Anda akan melihat **Measurement ID** berawalan `G-` (contoh: `G-XYZ123`).
4.  **Aktivasi:**
    *   Buka file `.env` di folder proyek Anda.
    *   Masukkan ID tersebut ke variabel: `VITE_GA_MEASUREMENT_ID=G-XYZ123`.

---

## FAQ (Pertanyaan Sering Muncul)

### Apakah aman jika saya Push ke GitHub sekarang padahal ID-nya masih kosong?
**SANGAT AMAN.**
Kodenya sudah saya buat "pintar". Jika ID-nya kosong, kodenya akan mendeteksi itu dan **tidak akan menjalankan apapun**. Website Anda tidak akan lambat dan tidak akan muncul error "ID tidak ditemukan".

### Bagaimana cara mematikannya nanti?
Cukup hapus nilai ID-nya di file `.env` dan simpan. Fitur monitoring akan langsung mati secara otomatis.

### Apakah data saya bocor jika saya menaruh ID ini di .env?
Variabel yang berawalan `VITE_` akan muncul di kode browser. Namun, ini **aman** untuk GA4 dan Sentry karena memang kuncinya bersifat publik agar browser bisa mengirim laporan ke dashboard Anda. Pihak lain tidak bisa merusak data Anda hanya dengan ID ini.
