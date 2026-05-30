# To Do Hari Ini - 30 Mei 2026

## 1. Audit Keamanan Web
- Status: SELESAI
- Periksa alur login, register, reset password, verifikasi OTP, dan logout.
- Cek apakah ada data sensitif yang masih disimpan di browser atau dikirim ke frontend tanpa proteksi.
- Audit akses database: RLS, policy insert/update/delete/select, dan hak akses admin vs member.
- Cek header keamanan, sanitasi input, dan risiko XSS/CSRF pada halaman konten.
- Catat temuan berdasarkan tingkat risiko: tinggi, sedang, rendah.

## 2. Audit Hutang Teknis
- Status: SELESAI
- Inventaris file yang masih pakai localStorage sebagai fallback utama.
- Identifikasi kode hardcoded yang seharusnya dipindah ke config atau database.
- Cek duplikasi logika antara service lokal dan Supabase.
- Tandai komponen atau service yang belum punya test.
- Buat daftar prioritas perbaikan: cepat, menengah, dan butuh refactor.

## 3. Review Migrasi DB dan Keamanan Login
- Pastikan skema PostgreSQL sudah sesuai untuk `members`, `admins`, `books`, `borrows`, dan tabel penting lain.
- Validasi bahwa password tidak disimpan dalam bentuk plaintext.
- Pastikan autentikasi memakai Supabase Auth atau mekanisme server-side yang aman.
- Periksa apakah migrasi SQL lama masih perlu disederhanakan atau dipisah per domain.
- Siapkan schema final yang lebih aman untuk produksi.

## 4. Tutorial untuk Pengguna
- Buat tutorial singkat yang mudah diikuti admin dan operator non-teknis.
- Sertakan langkah login, kelola data, cek notifikasi, dan alur kerja harian.
- Tambahkan bagian troubleshooting untuk error umum.
- Buat bahasa tutorial sederhana, tidak terlalu teknis, dan beri contoh gambar/screenshot jika perlu.

## Definisi Selesai
- Ada daftar temuan keamanan dan hutang teknis.
- Ada keputusan jelas apakah DB perlu migrasi ulang atau hanya hardening schema.
- Ada draft tutorial yang bisa langsung dipakai tim.
- Semua poin punya status: selesai, lanjut, atau blokir.

## Ringkasan TODO Repo (Hardcode Audit) - 30 Mei 2026
Berikut ringkasan status pekerjaan yang terkait audit hardcode dan migrasi token warna di repo hari ini.

- [x] Buat `src/config/externalLinks.ts` — selesai
- [x] Buat `src/config/appLimits.ts` — selesai
- [x] Tambah design tokens di `src/styles/tailwind.css` — selesai
- [x] Buat `src/config/colorPalette.ts` — selesai
- [x] Migrasi warna hardcoded di komponen penting — selesai (hotspot utama)
- [x] Perbarui dokumen panduan (`guidelines/Hardcode-Audit-Action-Plan.md`) — selesai
- [x] Scan repo untuk sisa hardcoded dan perbaiki — selesai (inventaris selesai)
- [x] Repo sweep: inventaris literal hex di `src/` — selesai
- [x] Buat daftar prioritas penggantian warna — selesai
- [x] Ganti batch pertama, kedua, & ketiga hex → token (prioritas tinggi) — selesai (Navbar, Footer, Home, JadwalLayanan, JasaKearsipan, ForgotPassword, AuthUpdatePassword, AuthVerifyCode, Galendo, Diorama, BlogList, ArticleDetail, AdminDashboard)

Catatan singkat:
- Batch pertama, kedua, dan ketiga sudah berhasil diterapkan ke seluruh file prioritas utama, sekunder, dan halaman detail/diorama; build produksi VITE berjalan sukses tanpa eror.
- Rekomendasi selanjutnya: lakukan sinkronisasi sisa folder administrasi khusus (`src/pages/admin/*`) dan integrasi unit testing / end-to-end sesuai rencana debt register.

File ini dibuat/diupdate otomatis oleh tugas audit hari ini.