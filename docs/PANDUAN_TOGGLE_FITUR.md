# Panduan Mengaktifkan dan Menonaktifkan Fitur Katalog serta Peminjaman Buku
Disipusda Purwakarta - Perpustakaan Digital

Seluruh logika sistem telah diintegrasikan dengan konfigurasi terpusat. Pengembang atau pengelola sistem dapat mengaktifkan atau menonaktifkan fitur Katalog Buku, Pendaftaran/Login Anggota, serta Manajemen Peminjaman Admin hanya dengan mengubah satu baris parameter saja.

---

## Cara Mengubah Status Fitur

Buka file konfigurasi utama: src/config/siteConfig.ts.

Cari objek FEATURES pada baris 114, lalu sesuaikan nilai parameter berikut:

```typescript
  FEATURES: {
    // Ubah parameter di bawah ini:
    // true  => Mengaktifkan semua fitur katalog dan peminjaman
    // false => Menonaktifkan semua fitur katalog dan peminjaman secara total
    ENABLE_CATALOG: true, 
    
    REQUIRE_NIK: false,
    SHOW_DIGITAL_CARD: false,
  }
```

---

## Penyesuaian Otomatis Saat Parameter Diubah

Ketika nilai ENABLE_CATALOG diubah menjadi false, sistem secara otomatis akan menyesuaikan bagian-bagian berikut:

### Sisi Pengunjung dan Publik (Frontend)
1. Navigasi dan Menu: Tautan menu Katalog Buku dan tombol Login akan disembunyikan dari Navbar atas dan menu versi mobile.
2. Keamanan Rute: Jika ada pengguna mengakses URL /katalog, /login, /register, /profil, atau /riwayat-pinjaman secara langsung, sistem akan menolak akses dan mengarahkan kembali ke halaman utama.
3. Halaman Layanan Perpustakaan: Tombol ajakan bertindak untuk menjelajahi katalog buku pada halaman Perpustakaan.tsx akan disembunyikan.
4. Halaman Pabukon (Perpustakaan Desa): Bagian pencarian buku (OPAC) dan registrasi anggota pada halaman Pabukon.tsx akan disembunyikan, sehingga hanya menampilkan bagian statistik.
5. Halaman Error (404 Not Found): Rekomendasi pencarian cepat untuk Katalog Buku pada halaman NotFound.tsx akan disembunyikan.

### Sisi Pengelola (Dashboard Admin)
1. Menu Navigasi Admin: Menu-menu berikut akan disembunyikan dari sidebar navigasi admin di berkas AdminLayout.tsx:
   - Kelola Buku
   - Kelola Kategori
   - Konfirmasi Ambil (Persetujuan peminjaman)
   - Kelola Member (Persetujuan pendaftaran anggota)
2. Ringkasan Statistik Dashboard: Informasi metrik Peminjaman Aktif dan Total Anggota pada halaman utama AdminDashboard.tsx akan disembunyikan secara dinamis.
3. Proteksi Akses URL Admin: Pengelola tidak dapat mengakses halaman kelola buku atau peminjaman secara langsung melalui alamat URL browser. Akses akan dibatalkan di berkas App.tsx dan dialihkan ke dashboard utama admin (/admin).

---

## Keuntungan Metode Konfigurasi Terpusat
Dengan metode ini, jika layanan peminjaman buku ingin diaktifkan kembali di kemudian hari, pengelola cukup mengubah nilai parameter menjadi true pada berkas siteConfig.ts tanpa perlu melakukan modifikasi atau penulisan ulang pada kode program.
