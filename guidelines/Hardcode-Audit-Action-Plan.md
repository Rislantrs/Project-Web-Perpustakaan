# Hardcode Audit Action Plan

Dokumen ini memisahkan perbaikan berdasarkan area masalah supaya bisa dikerjakan bertahap tanpa mengganggu fitur yang sudah ada.

## Cara Kerja Paling Mudah

Kalau mau mulai tanpa bingung, pakai urutan ini:
1. Cari bagian yang ditulis langsung di file.
2. Pindahkan ke satu tempat yang mudah dicari.
3. Ganti hanya file yang paling sering dipakai dulu.
4. Coba jalankan aplikasi dan lihat apakah tampilannya masih sama.
5. Kalau aman, lanjut ke file berikutnya.

## 1) Domain Warna

Tujuan:
- Kurangi pemakaian warna yang ditulis langsung di file.
- Pindahkan warna utama ke satu tempat yang mudah dirawat.

Langkah paling gampang:
- Ambil satu halaman dulu, bukan semua halaman sekaligus.
- Ganti warna yang paling sering muncul.
- Setelah itu, cek tampilan di browser.

Checklist:
- [ ] Inventaris semua hex literal di halaman user/admin.
- [ ] Kelompokkan ke token semantic (`brand-primary`, `brand-accent`, `text-muted`, `surface-soft`).
- [x] Definisikan token di `src/styles/tailwind.css` (atau config tema tunggal). (starter token dibuat)
- [x] Buat `src/config/colorPalette.ts` untuk palet warna terpusat. (starter file dibuat)
- [ ] Ganti class hardcoded ke token bertahap per halaman prioritas tinggi.
- [ ] Validasi kontras teks terhadap background setelah migrasi.

Hotspot awal:
- `src/pages/**/*.tsx`
- `src/pages/admin/**/*.tsx`

## 2) Domain Tautan Luar

Tujuan:
- Mengurangi tautan luar yang tersebar di banyak file.
- Menentukan pihak yang dihubungi kalau ada perubahan tautan.

Langkah paling gampang:
- Catat dulu tautan yang paling sering dipakai.
- Simpan di satu daftar.
- Ganti tautan di halaman yang paling penting dulu.

Checklist:
- [ ] Daftar semua tautan luar yang muncul di halaman atau service.
- [ ] Tandai jenis tautan: gambar, layanan publik, dokumen, media sosial.
- [x] Buat satu daftar tautan di `src/config/externalLinks.ts` untuk tautan yang sering dipakai. (starter file dibuat)
- [ ] Ganti tautan yang ditulis langsung ke daftar tersebut.
- [ ] Tambahkan pengganti aman kalau tautan kosong atau salah.

Hotspot awal:
- `src/pages/Home.tsx`
- `src/pages/Galendo.tsx`
- `src/pages/JadwalLayanan.tsx`
- `src/pages/Ppid.tsx`
- `src/pages/admin/ManagePpid.tsx`
- `src/pages/admin/MediaEditor.tsx`

## 3) Domain Konstanta Operasional

Tujuan:
- Menyatukan angka penting seperti halaman, jeda waktu, dan batas unggah di satu tempat.

Langkah paling gampang:
- Cari angka yang diulang di banyak file.
- Pindahkan ke satu file khusus.
- Pakai file itu setiap kali ada angka baru.

Checklist:
- [ ] Catat angka penting yang dipakai lintas fitur login, katalog, admin, dan gambar.
- [x] Buat `src/config/appLimits.ts` untuk menyimpan angka penting itu. (starter file dibuat)
- [ ] Pindahkan angka yang masih ditulis langsung ke file ini.
- [ ] Tambahkan catatan singkat supaya orang awam tahu fungsi tiap angka.
- [ ] Cek ulang alur utama: login, verifikasi, katalog, dan pengelolaan data.

Hotspot awal:
- `src/pages/AuthVerifyCode.tsx`
- `src/pages/BlogList.tsx`
- `src/pages/KatalogBuku.tsx`
- `src/pages/admin/ManageBooks.tsx`
- `src/pages/admin/ManageMembers.tsx`
- `src/pages/admin/ManageStructure.tsx`
- `src/services/authService.ts`
- `src/services/imageUtils.ts`

## 4) Domain Endpoint Sensitif

Tujuan:
- Menghindari rahasia atau akses penting ditaruh langsung di halaman depan.
- Memindahkan akses yang sensitif lewat jalur yang lebih aman.

Langkah paling gampang:
- Cek apakah ada token, secret, atau alamat akses penting di file depan.
- Pindahkan dulu yang paling berisiko.
- Sisakan catatan singkat supaya mudah diingat saat maintenance.

Checklist:
- [ ] Cek akses publik yang berisiko membuka rahasia.
- [ ] Pindahkan bagian yang sensitif ke backend atau fungsi server.
- [ ] Simpan rahasia hanya di sisi server.
- [ ] Ubah frontend supaya memanggil jalur internal yang aman.
- [ ] Tambahkan catatan keamanan di panduan serah-terima dan deploy.

Hotspot awal:
- `src/pages/LaporWarga.tsx`
- `src/services/supabase.ts`
- `.env*` (validasi keberadaan key di runtime build/deploy)

## 5) Eksekusi Sprint

Sprint 1:
- Warna + konstanta operasional (paling minim risiko perubahan behavior).

Sprint 2:
- URL eksternal ke central map + fallback handling.

Sprint 3:
- Endpoint sensitif dan hardening deployment.

## 6) Definition Of Done

- Tidak ada tautan, warna, atau angka penting yang masih ditulis langsung di area prioritas.
- Semua angka penting sudah disimpan di satu tempat dan diberi catatan singkat.
- Bagian sensitif tidak dijalankan langsung dari halaman depan.
- Panduan kerja dan serah-terima diperbarui setelah tiap tahap selesai.
- Kalau ada item yang belum selesai, item itu tetap dicatat di backlog supaya tidak hilang.

## 7) Debt Register (Phase 1)

Gunakan tabel ini untuk mencatat perbaikan cepat yang masih ditoleransi sementara.
Kolom penanggung jawab dibuat sederhana: cukup sebut pihak internal, tim pendamping, atau pihak ketiga.

| ID | Area | Pihak yang Dikoordinasikan | Lokasi | Masalah | Dampak | Prioritas | Target Perbaikan | Status |
|---|---|---|---|---|---|---|---|---|
| TD-001 | Laporan Warga | Pihak ketiga / pendamping teknis | `src/pages/LaporWarga.tsx`, `src/pages/admin/ManageReports.tsx` | Data laporan masih disimpan di browser | Risiko data hilang antar perangkat | High | Pindah ke tabel Supabase + aturan akses | Open |
| TD-002 | Login & Sesi | Pihak ketiga / pendamping teknis | `src/services/authService.ts`, `src/services/memberSession.ts` | Sesi masih bergantung ke browser | Risiko data sesi tidak konsisten | High | Perkuat alur login dan kurangi data sensitif di browser | Open |
| TD-003 | Tautan Luar | Tim front-end | `src/pages/*`, `src/components/Footer.tsx` | Tautan luar tersebar di banyak file | Sulit dirawat dan rawan salah tujuan | Medium | Satukan di `src/config/externalLinks.ts` | Open |
| TD-004 | Kecepatan Aplikasi | Tim front-end / build | `src/App.tsx` (halaman publik), hasil build | File utama masih terlalu besar | Halaman terasa lebih lambat di ponsel | High | Muat halaman berat hanya saat dibuka | Open |
| TD-005 | Standar Kode | Tim pengembangan / DevOps | Root config | Aturan tulis kode belum seragam | Review lebih lama dan hasil tidak konsisten | Medium | Terapkan pemeriksaan dasar secara bertahap | In Progress |
