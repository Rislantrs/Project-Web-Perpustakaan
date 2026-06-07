# 📚 Pusat Dokumentasi - Disipusda Purwakarta

Selamat datang di pusat dokumentasi teknis website **Perpustakaan Digital & Booking Enkapsulasi Arsip Disipusda Purwakarta**. Semua berkas panduan markdown telah dikelompokkan secara rapi berdasarkan kategori berikut:

---

## 📂 Struktur Direktori Dokumentasi

### 1. 🗄️ Database & Migrasi (`docs/database/`)
Panduan pemetaan, skema database, dan migrasi basis data dari PostgreSQL/Supabase ke basis data lokal MySQL:
* [PANDUAN_DATABASE_MIGRASI_LENGKAP.html](database/PANDUAN_DATABASE_MIGRASI_LENGKAP.html) - 🌟 **[HTML/PDF] Buku panduan gabungan dari keempat berkas di bawah ini, didesain khusus agar rapi saat diekspor ke PDF via browser (Ctrl + P).**
* [PANDUAN_MIGRASI_DATABASE.md](database/PANDUAN_MIGRASI_DATABASE.md) - Panduan lengkap migrasi database kustom (PostgreSQL ke MySQL), CSV, dan DDL skema MySQL.
* [panduan_database_lokal_hosting.md](database/panduan_database_lokal_hosting.md) - Cara menghubungkan React dengan database MySQL lokal di cPanel/hosting Anda via backend API.
* [panduan_skema_dan_storage.md](database/panduan_skema_dan_storage.md) - Penjelasan pemisahan skema SQL, RLS storage bucket, dan skrip otomatisasi unduh file Supabase.
* [panduan_setup_cron_digest.md](database/panduan_setup_cron_digest.md) - Konfigurasi cron digest email harian dan trigger database.


### 2. 📦 Hosting & Deployment (`docs/hosting/`)
Panduan mengunggah kode web ke hosting umum, VPS, serta konfigurasi domain dan SSL:
* [panduan_migrasi_hosting_terpadu.md](hosting/panduan_migrasi_hosting_terpadu.md) - Strategi lengkap migrasi mandiri ke Hostinger / VPS (Nginx, SSL, PM2, SMTP, Cron).
* [deployment_guide.md](hosting/deployment_guide.md) - Panduan umum deployment aplikasi frontend dan backend.
* [penjelasan_bahasa_dan_hosting.md](hosting/penjelasan_bahasa_dan_hosting.md) - Penjelasan arsitektur web dan pilihan hosting menggunakan bahasa sederhana/analogi untuk pembaca non-teknis.
* [panduan_navigasi_subdomain.md](hosting/panduan_navigasi_subdomain.md) - Tata cara pengaturan DNS dan navigasi antar subdomain.

### 3. 🔌 Integrasi Layanan & API (`docs/integration/`)
Panduan menghubungkan API eksternal, WhatsApp, dan layanan email:
* [TUTORIAL_INTEGRASI.md](integration/TUTORIAL_INTEGRASI.md) - Dokumentasi rincian integrasi API backend dan Supabase.
* [tutorial_integrasi_lengkap.md](integration/tutorial_integrasi_lengkap.md) - Rangkuman alur integrasi seluruh modul sistem.
* [panduan_integrasi_booking.md](integration/panduan_integrasi_booking.md) - Konfigurasi integrasi layanan booking arsip.
* [panduan_integrasi_whatsapp.md](integration/panduan_integrasi_whatsapp.md) - Panduan integrasi gateway notifikasi WhatsApp.
* [panduan_integrasi_wordpress_api.md](integration/panduan_integrasi_wordpress_api.md) - Penghubung portal web berbasis WordPress via REST API.
* [panduan_setup_resend.md](integration/panduan_setup_resend.md) - Integrasi SMTP Resend.com untuk notifikasi email OTP dan sirkulasi.

### 4. ⚙️ Panduan Fitur & Admin (`docs/features/`)
Panduan fungsionalitas aplikasi, manajemen administrator, sakelar fitur, dan daftar aset:
* [PANDUAN_FILE.md](features/PANDUAN_FILE.md) - Penjelasan struktur berkas proyek frontend React dan cara mengganti aset gambar statis dalam kode.
* [TUTORIAL_MANAJEMEN_ADMIN.md](features/TUTORIAL_MANAJEMEN_ADMIN.md) - Prosedur penambahan, pengelolaan, dan hak akses admin/super-admin.
* [PANDUAN_TOGGLE_FITUR.md](features/PANDUAN_TOGGLE_FITUR.md) - Mengaktifkan atau menonaktifkan fitur tertentu secara fleksibel di file konfigurasi.
* [PANDUAN_NONAKTIFKAN_FITUR.md](features/PANDUAN_NONAKTIFKAN_FITUR.md) - Panduan menonaktifkan fitur secara aman tanpa merusak struktur halaman.
* [ATTRIBUTIONS.md](features/ATTRIBUTIONS.md) - Sumber daya aset gambar, ikon, dan lisensi pustaka pihak ketiga.

### 5. 🎨 Desain, Responsivitas & Media (`docs/design/`)
Panduan visual, perbaikan tata letak layar HP, serta optimasi ukuran aset gambar:
* [ANDROID_RESPONSIVENESS_TODO.md](design/ANDROID_RESPONSIVENESS_TODO.md) - Daftar perbaikan responsivitas tata letak khusus untuk browser perangkat Android/HP.
* [PANDUAN_RESPONSIVITAS_ADMIN.md](design/PANDUAN_RESPONSIVITAS_ADMIN.md) - Dokumentasi perbaikan tampilan grid dan dashboard admin agar nyaman dibuka di layar HP.
* [IMAGE_OPTIMIZATION_GUIDE.md](design/IMAGE_OPTIMIZATION_GUIDE.md) - Cara memperkecil dan mengonversi format gambar ke WebP guna mempercepat loading website.

---

*Catatan: Seluruh berkas dokumentasi di atas ditulis dalam format Markdown (.md) dan dapat dibaca dengan mudah menggunakan text editor seperti VS Code, GitHub Viewer, maupun aplikasi penampil markdown lainnya.*
