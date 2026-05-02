# Rencana Aksi (Implementation Plan) - Finalisasi Proyek

Dokumen ini adalah panduan langkah demi langkah untuk menyelesaikan proyek Disipusda agar siap diserahkan ke klien dengan kualitas profesional.

---

## FASE 1: Perubahan Inti (UI/UX & Pendaftaran)

### 1. Menyederhanakan Pendaftaran
- **Masalah Saat Ini:** Wajib input NIK membuat pendaftaran terkesan kaku dan menyeramkan.
- **Solusi:** 
  - NIK dihilangkan dari form registrasi utama.
  - Pendaftaran hanya butuh Nama Lengkap, Email, dan Password (atau Nomor WA).
  - NIK hanya diminta secara *offline* saat aktivasi peminjaman fisik di perpustakaan.

### 2. Kartu Anggota Digital (Member Card)
- **Desain:** Membuat komponen kartu premium berdesain *Glassmorphism* (efek kaca) di halaman Profil (`src/pages/Profile.tsx`).
- **Fitur:** Kartu ini akan menampilkan Nama, Nomor Anggota, dan sebuah **QR Code** yang bisa di-scan oleh petugas perpustakaan sungguhan.

---

## FASE 2: Logika "Feature Flag" (Mematikan Katalog Tanpa Error)

Anda benar! Jika kita hanya menyembunyikan link "Katalog", halaman Admin pasti akan error atau memunculkan halaman kosong.

### Solusi Logis (Smart Toggling):
Kita akan menambahkan opsi `ENABLE_CATALOG: true | false` di file `siteConfig.ts`.
Jika nilainya `false`, sistem akan otomatis:
1.  **Frontend User:** Menghilangkan menu Katalog dari Navbar, Footer, dan menyembunyikan bagian "Buku Terbaru" dari halaman Home.
2.  **Dashboard Admin:** Menyembunyikan menu "Kelola Buku" dan "Antrean Peminjaman" dari Sidebar Admin secara otomatis.
3.  **Halaman Profil:** Menyembunyikan tab "Riwayat Peminjaman".
4.  **Routing Guard:** Jika ada user yang iseng mengetik URL `/katalog` secara manual, sistem akan me-redirect mereka kembali ke halaman Home (tidak terjadi error halaman rusak).

---

## FASE 3: Strategi Migrasi Database Lintas Platform

Ini adalah poin yang sangat kritis. Saat ini web Anda sangat bergantung pada **Supabase (PostgreSQL)**. Bagaimana jika klien memakai **MySQL** atau server lokal?

### Solusi: "Service-Based Architecture"
Kabar baiknya, kode Anda sudah dirancang dengan cerdas. Komponen UI (React) Anda tidak pernah berbicara langsung dengan Supabase. Mereka hanya meminta data ke file `Service` (contoh: `bookService.ts`).

**Skenario Migrasi ke MySQL:**
1. Klien membangun backend API mereka sendiri (pakai PHP/Laravel, Node.js, atau Python) yang terhubung ke MySQL mereka.
2. Di aplikasi React Anda, klien **hanya perlu mengubah isi file Service**.
   - Contoh saat ini di `bookService.ts`: `supabase.from('books').select()`
   - Diubah menjadi: `axios.get('https://api-klien.com/books')`
3. Seluruh UI, desain, dan komponen React **tidak perlu diubah sama sekali**. Tidak akan ada error di sisi visual.

### 3. Konsolidasi & Export Skema SQL (Pembersihan Database)
- **Masalah:** Struktur database saat ini masih berceceran karena banyak perubahan selama masa pengembangan.
- **Tugas:** 
  - Mengumpulkan seluruh perintah `CREATE TABLE` untuk semua fitur (Anggota, Buku, Artikel, Peminjaman, Pengaturan).
  - Mengumpulkan seluruh aturan **RLS (Row Level Security)** agar keamanan tetap terjaga di database klien.
  - Menyatukan semuanya ke dalam satu file `SCHEMA_MASTER.sql` yang bersih dan siap pakai.
  - Memastikan tidak ada data sampah (dummy data pribadi) yang ikut terbawa ke database klien.

---

## FASE 4: Dokumentasi & Edukasi Klien

1. **Tutorial Setup (Generic):** Membuat panduan umum (README) cara setup variabel environment (`.env`), cara mengubah warna tema, dan cara *build* ke server.
2. **Draft Presentasi (PPT):** Membuat kerangka materi untuk presentasi proyek Anda ke klien, menonjolkan fitur-fitur mahal seperti Keamanan, Aksesibilitas, dan Kemudahan Migrasi.
3. **Merapikan Markdown:** Membersihkan dan mempercantik panduan-panduan yang sudah kita buat sebelumnya.

---

### Eksekusi Selanjutnya
Sesuai rencana, saya akan mulai bekerja pada **Fase 1 (Menyederhanakan Pendaftaran dan Membuat Kartu Digital)**.
