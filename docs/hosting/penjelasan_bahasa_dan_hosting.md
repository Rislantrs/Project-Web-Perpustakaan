# 💡 Penjelasan Sederhana Teknologi & Pilihan Hosting (Untuk Pembaca Non-Teknis)

Dokumen ini disusun menggunakan bahasa sederhana dan analogi sehari-hari untuk menjelaskan arsitektur teknologi website **Disipusda Perpustakaan & Booking**, serta menjawab keraguan umum mengenai pemindahan hosting (migrasi).

---

## 📋 DAFTAR ISI
1. [Analogi Sederhana: Bagaimana Website Bekerja?](#1-analogi-sederhana-bagaimana-website-bekerja)
2. [Poin Penting: Apakah Kode Program Harus Dirombak Total?](#2-poin-penting-apakah-kode-program-harus-dirombak-total)
3. [Mengenal Supabase Cloud vs Hostinger (Database Lokal)](#3-mengenal-supabase-cloud-vs-hostinger-database-lokal)
4. [Tabel Pilihan Skenario Hosting (Mana yang Paling Cocok?)](#4-tabel-pilihan-skenario-hosting-mana-yang-paling-cocok)
5. [Pertanyaan yang Sering Ditanyakan (FAQ)](#5-pertanyaan-yang-sering-ditanyakan-faq)

---

## 1. Analogi Sederhana: Bagaimana Website Bekerja?

Bayangkan website perpustakaan digital Anda seperti sebuah **Rumah Makan (Restoran)** yang melayani pelanggan:

### A. Frontend (React / TypeScript) ➡️ "Ruang Makan & Pelayan"
* Ini adalah bagian visual restoran yang dilihat, disentuh, dan ditempati oleh pelanggan (seperti meja, kursi, lampu hias, daftar menu, dan pelayan yang ramah).
* Bagian ini bertugas mencatat apa yang Anda klik (seperti memesan makanan) lalu menampilkannya secara cantik di browser komputer/HP Anda.

### B. Backend API (Skrip Server) ➡️ "Juru Masak / Koki di Dapur"
* Ini adalah dapur restoran tempat koki memasak makanan. Pengunjung di meja makan tidak bisa melihat ke dalam dapur, tetapi mereka menerima makanan yang lezat lewat pelayan.
* Bagian dapur inilah yang memproses keamanan, memeriksa apakah stok buku masih ada, menghitung denda keterlambatan, dan mengirim email notifikasi.

### C. Database (MySQL / PostgreSQL / Supabase) ➡️ "Gudang Bahan Makanan"
* Ini adalah kulkas raksasa di belakang dapur untuk menyimpan semua bahan baku secara teratur (seperti daftar buku, data member, data transaksi pinjam, password admin, dll).

---

## 2. Poin Penting: Apakah Kode Program Harus Dirombak Total?

> [!IMPORTANT]
> **Jawabannya: SAMA SEKALI TIDAK.** 
> Kode tampilan (React) Anda tidak perlu dibuang atau dirombak menjadi bahasa PHP jika Anda pindah hosting ke Hostinger.

Mengapa demikian?
Ketika website Anda selesai didevelop, program React akan dijalankan perintah kompilasi (`npm run build`). Perintah ini otomatis menerjemahkan kode React Anda yang kompleks menjadi file-file halaman web biasa (HTML, CSS, dan JavaScript) yang diletakkan di dalam folder bernama `dist/`.

File-file di dalam folder `dist/` ini bersifat **statis** (artinya dapat dipindahkan dan dijalankan di server web manapun di seluruh dunia, termasuk Hostinger, layaknya file gambar atau dokumen biasa). Browser HP pengunjunglah yang akan mengunduh file ini dan menjalankannya secara lokal.

---

## 3. Mengenal Supabase Cloud vs Hostinger (Database Lokal)

Saat ini, sistem website Anda menggunakan arsitektur modern (Hybrid Cloud):
* **Tampilan (React):** Di-deploy secara gratis di platform CDN global (seperti Cloudflare Pages atau Vercel). Ini membuat website dimuat sangat cepat dari server terdekat ke pengguna.
* **Dapur & Gudang (Supabase Cloud):** Menangani database, bot notifikasi Telegram, login Google, dan cron job secara gratis di infrastruktur cloud milik Supabase.

Jika di masa mendatang instansi Anda ingin **memusatkan semuanya di satu hosting mandiri milik dinas atau menyewa di Hostinger** agar tidak tergantung pada Supabase Cloud, Anda memiliki dua pilihan:

- **Pilihan 1 (Rekomendasi - Node.js):** Anda menyewa hosting Node.js atau VPS di Hostinger. Karena programmer Anda sudah menulis sistem dalam bahasa JavaScript/TypeScript, backend di server Hostinger dapat dibuat menggunakan runtime **Node.js** (bukan PHP). Ini menghemat waktu pembuatan program secara drastis karena bahasanya sama dengan frontend.
- **Pilihan 2 (PHP - Hosting Shared Murah):** Jika terpaksa menggunakan shared hosting PHP biasa (karena anggaran dinas yang sangat terbatas), programmer cukup membuat skrip PHP sederhana sebagai "pelayan baru" di dapur, sementara tampilan depan (React) Anda tetap utuh tanpa dirusak atau dirombak.

---

## 4. Tabel Pilihan Skenario Hosting (Mana yang Paling Cocok?)

Gunakan tabel perbandingan di bawah ini sebagai bahan diskusi rapat internal instansi:

| Kriteria Pertimbangan | Skenario A (Paling Direkomendasikan) | Skenario B (Opsi Node.js Hostinger) | Skenario B (Opsi PHP Hostinger) |
| :--- | :--- | :--- | :--- |
| **Konsep Sistem** | Tampilan di Hostinger / Cloudflare, Database tetap di Supabase Cloud. | Tampilan & Database dipindahkan sepenuhnya ke VPS/Node.js Hostinger. | Tampilan di Hostinger, database di MySQL lokal dengan jembatan API PHP. |
| **Biaya Bulanan** | **Sangat Murah** (Cukup sewa shared hosting terkecil untuk tampilan). | **Sedang** (Sewa paket VPS Hostinger agar Node.js dapat berjalan lancar). | **Murah** (Sewa paket shared hosting standar yang mendukung PHP & MySQL). |
| **Kerumitan Pengerjaan** | **Sangat Mudah (10 Menit Selesai).** Tinggal upload folder build ke Hostinger. | **Sedang.** Perlu memindahkan database dan menyalakan server Node.js di VPS. | **Tinggi.** Programmer harus menulis ulang logika backend menggunakan PHP. |
| **Apakah Login Google Aktif?** | **Ya**, aktif otomatis tanpa konfigurasi server baru. | **Ya**, perlu dikonfigurasi ulang (Google Credentials) di server Node.js. | **Ya**, harus dibuatkan endpoint khusus di server PHP. |
| **Apakah UI React Dirombak?** | **TIDAK** ❌ (Tampilan visual 100% utuh). | **TIDAK** ❌ (Tampilan visual 100% utuh). | **TIDAK** ❌ (Tampilan visual 100% utuh). |
| **Keamanan Data** | **Sangat Tinggi** (Dikelola oleh tim infrastruktur Supabase). | **Tinggi** (Dikelola sendiri oleh administrator server VPS Anda). | **Cukup** (Bergantung pada konfigurasi firewall shared hosting). |

---

## 5. Kamus Sederhana Istilah Teknologi (Glossary)

Untuk memudahkan komunikasi dengan pimpinan atau pihak luar, berikut adalah pengertian istilah teknis dalam bahasa sederhana:

1. **Vite / React:** Mesin perancang tampilan. React bertugas membuat tombol-tombol interaktif, form input, dan halaman animasi agar terasa responsif dan "hidup".
2. **Database (MySQL / PostgreSQL):** Lemari arsip digital tempat menyimpan semua tulisan seperti daftar buku, riwayat peminjaman, sandi admin, dan laporan lapor warga.
3. **API (Application Programming Interface):** Jembatan pos surat. Tugasnya adalah mengirimkan data yang diketik di layar HP/komputer pengguna ke server database, dan sebaliknya.
4. **CORS:** Aturan satpam browser. CORS memastikan bahwa website Anda hanya boleh meminta data dari server Anda sendiri, bukan dari website asing/hacker.
5. **SMTP (Simple Mail Transfer Protocol):** Kantor pos digital yang mengirimkan email notifikasi (seperti email konfirmasi pesanan enkapsulasi arsip atau peringatan batas waktu).
6. **Cron Job:** Alarm otomatis. Cron job adalah sistem penjadwalan yang berbunyi secara berkala (misal tiap jam 7 pagi) untuk memicu proses tertentu seperti mendeteksi peminjam yang telat mengembalikan buku.
7. **PM2:** Penjaga server Node.js. PM2 bertugas memantau agar aplikasi backend di VPS tidak mati, dan otomatis menyalakannya kembali jika server sempat ter-restart.

---

## 6. Pertanyaan yang Sering Ditanyakan (FAQ)

### ❓ Apakah React hanya bisa berjalan di server Node.js?
**TIDAK.** React adalah aplikasi sisi klien (client-side). Setelah dikompilasi (`npm run build`), React berubah menjadi file statis biasa (HTML, CSS, JS). Anda bisa mengunggah file hasil kompilasi tersebut ke hosting PHP biasa, server Windows (IIS), Apache, Nginx, maupun VPS Linux tanpa perlu menginstal Node.js di server tersebut.

### ❓ Kenapa kemarin sempat terjadi error login admin / login Google?
Itu adalah kendala penyesuaian skema internal database Supabase Auth (skema user & identities) dan rendering ganda bawaan React 18 di browser. Masalah ini **sudah diperbaiki secara tuntas** dan kodenya sudah dipasang di GitHub, sehingga sistem pendaftaran admin dan login user sudah normal baik di server lokal maupun hosting produksi.

### ❓ Bagaimana cara mencadangkan (backup) data jika pindah dari Supabase?
Jika Anda menggunakan Supabase, Anda dapat mengunduh database dalam format file `.sql` melalui menu database backup atau menggunakan perintah `pg_dump`. Jika Anda sudah bermigrasi ke MySQL lokal di Hostinger, backup dapat dilakukan dengan sangat mudah melalui menu **Export** di **phpMyAdmin** dengan format `.sql` atau `.csv`.

### ❓ Berapa kapasitas penyimpanan (storage) yang dibutuhkan?
Katalog buku perpustakaan digital ini sangat hemat penyimpanan karena data teks disimpan dalam bentuk baris database (hanya memakan beberapa Megabyte saja). Yang memakan ruang penyimpanan adalah **gambar sampul buku** dan **foto profil**. Jika Anda memindahkan penyimpanan file (storage) ke lokal hosting Anda sendiri, kapasitas 10GB - 20GB sudah sangat lebih dari cukup untuk menampung ribuan gambar sampul buku berkualitas standar.

### ❓ Apa rekomendasi terbaik untuk instansi kami saat ini?
Gunakan **Skenario A** untuk jangka pendek dan menengah. Website tampilan React di-upload ke Hostinger agar menggunakan nama domain resmi instansi Anda (misal: `disipusda.purwakartakab.go.id`), tetapi database dan fungsi otentikasi biarkan tetap berjalan di Supabase Cloud secara gratis. Skenario ini tidak memakan biaya server tambahan (cukup bayar domain), pengerjaannya instan (10 menit), dan keamanannya sangat tinggi karena dikelola langsung oleh tim keamanan cloud profesional Supabase.

