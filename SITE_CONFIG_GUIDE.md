# Panduan Konfigurasi Website (Site Config)

Dokumen ini menjelaskan cara menggunakan file `src/config/siteConfig.ts` yang baru saja dibuat.

## Apa itu Site Config?
Daripada harus mencari-cari di mana letak teks, link navigasi, atau logo di dalam puluhan file komponen (seperti `Navbar.tsx` atau `Footer.tsx`), kita mengumpulkan semuanya ke dalam satu file "otak" bernama `siteConfig.ts`.

Keuntungan utama:
1. **Lebih Cepat:** Ganti satu baris kode, seluruh website berubah otomatis.
2. **Lebih Aman:** Menghindari salah hapus kode *logic* (seperti React hooks) saat Anda hanya ingin mengganti nama menu.

---

## Cara Menggunakan

Buka file **`src/config/siteConfig.ts`**. Anda akan melihat struktur ini:

### 1. Mengganti Nama / Logo
Cari bagian `BRAND`:
```typescript
BRAND: {
  NAME: 'Disipusda Purwakarta',
  SLOGAN: 'Memory of the Nation | Center of Literacy',
  LOGO: logoUtama,
}
```
*   Ubah `NAME` untuk mengubah hak cipta di Footer.
*   Ubah `SLOGAN` untuk mengubah teks italic di Footer.

### 2. Mengubah Menu Navigasi
Cari bagian `NAV_LINKS`. Anda akan melihat struktur daftar (Array) seperti ini:
```typescript
{ name: 'Katalog Buku', path: '/katalog' },
```
*   **Menambah menu tanpa dropdown:** Tambahkan objek `{ name: 'Nama', path: '/link' }`.
*   **Menambah menu dengan dropdown:**
```typescript
{
  name: 'Menu Baru',
  path: '#',
  subLinks: [
    { name: 'Anak Menu 1', path: '/anak-1' },
    { name: 'Anak Menu 2', path: '/anak-2' }
  ]
}
```

### 3. Mengganti Link Pihak Ketiga (Formulir/WhatsApp)
Cari bagian `EXTERNAL_LINKS`:
```typescript
EXTERNAL_LINKS: {
  FORM_PENGADUAN: 'https://docs.google.com/forms/...',
  HELPDESK_SRIKANDI: 'https://api.whatsapp.com/send/...'
}
```
Jika besok nomor WhatsApp admin Srikandi ganti, Anda **hanya perlu** mengganti URL-nya di sini, dan otomatis link di *Footer* maupun *Halaman Layanan* akan mengikuti (selama komponen tersebut memanggil file ini).

### 4. Menghidup-matikan Fitur (Feature Flags) ⭐ PENTING
Sistem ini dilengkapi dengan "Sakelar" jarak jauh. Cari bagian `FEATURES`:
```typescript
FEATURES: {
  ENABLE_CATALOG: true,
  REQUIRE_NIK: true,
  SHOW_DIGITAL_CARD: false,
}
```
*   **`REQUIRE_NIK`**: Ubah ke `false` jika klien merasa kolom NIK terlalu ribet saat pendaftaran. Formulir akan otomatis hilang tanpa merusak kode.
*   **`SHOW_DIGITAL_CARD`**: Ubah ke `true` jika klien ingin menampilkan desain Kartu Anggota Digital ber-QR Code di halaman Profil.
*   **`ENABLE_CATALOG`**: (Segera Hadir) Ubah ke `false` untuk merubah website menjadi murni Company Profile tanpa fitur perpustakaan.

---

## Kesimpulan (Untuk Klien)
Jika kelak proyek ini diserahkan kepada klien atau teknisi lain, Anda cukup memberikan panduan ini dan memberitahu:
> *"Pak/Bu, jika mau edit teks menu, logo, atau link formulir, tolong JANGAN ubah file `.tsx` yang rumit. Cukup buka folder `config` dan edit file `siteConfig.ts`. Semuanya sudah saya rapikan di sana."*
