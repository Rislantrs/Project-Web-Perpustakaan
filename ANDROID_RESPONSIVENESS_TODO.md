# TODO: Perbaikan Responsivitas UI Android (Mobile)

Dokumen ini berisi daftar tugas (*checklist*) detail untuk memperbaiki tampilan website agar sepenuhnya responsif pada perangkat Android/Mobile. Masalah utama saat ini adalah beberapa halaman masih menggunakan *inline styles* statis atau layout grid/flex yang tidak mengecil/menumpuk dengan benar, sehingga browser mobile terpaksa melakukan *zoom out* (hanya merubah ukuran) yang membuat teks menjadi sangat kecil dan layout berantakan.

---

## 📌 Masalah & Solusi Global (Layout Utama)

### 1. [Navbar.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/components/Navbar.tsx)
- [ ] **Batasan Tinggi Menu Mobile**: Pada perangkat Android dengan layar pendek (seperti resolusi 360x640), menu mobile yang terbuka (`AnimatePresence`) bisa terpotong di bagian bawah.
  - **Solusi**: Tambahkan `overflow-y-auto max-h-[calc(100vh-80px)]` pada panel menu mobile agar menu bisa di-scroll jika melebihi tinggi layar.
- [ ] **Lebar Logo**: Pastikan logo di navbar mengecil secara proporsional di layar sangat kecil (< 320px) agar tidak mendorong tombol menu hamburger.

### 2. [Footer.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/components/Footer.tsx)
- [ ] **Kolom Footer**: Di layar mobile, grid footer harus ditumpuk menjadi 1 kolom (`grid-cols-1`) daripada memaksakan beberapa kolom yang membuat teks link saling tumpang tindih.

---

## 📄 Halaman Publik (`src/pages/`)

### 3. [Home.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/Home.tsx)
- [ ] **Hero Section Text**: Judul utama "Disipusda Purwakarta" seringkali terpotong atau terbungkus dengan buruk pada layar HP Android 360px.
  - **Solusi**: Sesuaikan ukuran font secara dinamis menggunakan responsive text (`text-3xl sm:text-5xl lg:text-6xl`).
- [ ] **Berita Terkini Grid**: Struktur berita utama (`lg:col-span-7`) dan berita pendukung (`lg:col-span-5`) harus menumpuk dengan jarak (*gap*) yang cukup di mobile, serta pastikan teks judul berita tidak terpotong secara ekstrem.

### 4. [Diorama.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/Diorama.tsx)
- [ ] **Tab Switcher (Diorama Purwakarta / Nusantara)**: Tombol toggle tab menggunakan padding horizontal statis (`px-8 py-3`). Di layar mobile 360px, lebar total wadah melebihi lebar layar, menyebabkan scroll horizontal tak diinginkan pada halaman.
  - **Solusi**: Gunakan padding yang lebih kecil di mobile (`px-4 py-2 sm:px-8 sm:py-3`) atau buat switcher menjadi tumpuk/flex-wrap di mobile.
- [ ] **9 & 12 Segmen Grid**: Pastikan segmen-segmen diorama beralih menjadi 1 kolom (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) agar gambar segmen cukup besar dan teks penjelasannya nyaman dibaca di layar HP.

### 5. [StrukturOrganisasi.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/StrukturOrganisasi.tsx)
- [ ] **Grid Anggota Seksi**: Struktur menggunakan grid `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`. Pada HP Android dengan lebar layar kecil, layout 2 kolom membuat `ProfileCard` terlalu sempit dan teks peran menjadi sangat kecil (hanya 11px/12px) dan terpotong.
  - **Solusi**: Gunakan `grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5` agar di layar sangat sempit, card membesar dan beralih ke 1 kolom.

### 6. [KatalogBuku.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/KatalogBuku.tsx)
- [ ] **Horizontal Category Rail**: Baris tab kategori (`overflow-x-auto`) memerlukan efek bayangan transparan (*gradient fade*) di sisi kanan/kiri untuk memberi indikasi visual ke pengguna Android bahwa daftar tersebut bisa di-scroll ke samping.
- [ ] **Book Detail Side Panel**: Panel detail buku (`max-w-md`) harus beralih menjadi lebar penuh (`w-full`) di layar mobile agar sinopsis, data buku, dan tombol pinjam tidak terkompresi secara visual.

### 7. [JadwalLayanan.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/JadwalLayanan.tsx)
- [ ] **Overflow Tabel**: Tabel jadwal layanan akan meluber (*overflow*) ke kanan di layar HP.
  - **Solusi**: Bungkus tabel dengan `<div className="overflow-x-auto">` agar pengguna bisa menggeser tabel secara horizontal tanpa merusak layout halaman utama.

### 8. [RiwayatPinjaman.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/RiwayatPinjaman.tsx) & [Profil.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/Profil.tsx)
- [ ] **Layout Dashboard Akun**: Sidebar navigasi akun dan konten utama harus bertumpuk secara vertikal di mobile dengan jarak padding yang rapi.
- [ ] **Tabel Riwayat**: Pastikan status peminjaman (badge hijau/merah) dan tanggal kembali memiliki ruang yang cukup atau beralih ke format *card-based list* di layar mobile.

### 9. [LaporWarga.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/LaporWarga.tsx) & Auth Pages ([Login.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/Login.tsx) / [Register.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/Register.tsx))
- [ ] **Lebar Form Card**: Di layar mobile, kurangi padding luar form card (`p-8` menjadi `p-5`) dan pastikan lebar card mengikuti lebar layar kontainer (`w-full`).

---

## 📅 Modul Booking Enkapsulasi (`src/modules/booking/`)

### 10. [BookingPage.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/modules/booking/pages/BookingPage.tsx)
- [ ] **Hapus Selektor CSS Inline Hack**:
  - **Masalah**: Halaman menggunakan tag `<style>` dengan selektor string inline:
    ```css
    div[style*="grid-template-columns: minmax(0, 1fr) minmax(0, 300px)"] {
      grid-template-columns: 1fr !important;
    }
    ```
    Metode ini sangat rapuh. Jika format whitespace style berubah sedikit saja, grid kolaps kolom di Android akan gagal, menyebabkan layout hancur.
  - **Solusi**: Ganti layout grid menggunakan kelas Tailwind responsive atau state variabel CSS di React.
- [ ] **Step Indicator Mobile**: Jarak garis penghubung antar-langkah sangat sempit di mobile, menyebabkan teks label tumpang tindih. Buat agar garis konektor menghilang atau gunakan versi ringkas khusus mobile.

### 11. [BookingCalendar.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/modules/booking/pages/BookingCalendar.tsx)
- [ ] **Grid & Ukuran Cell Kalender**:
  - Di layar HP Android (terutama lebar < 360px), cell kalender berukuran `minHeight: '46px'` dengan padding 16px di sekeliling kalender dapat terkompresi. Angka tanggal dan titik indikator status bisa bertumpuk secara vertikal.
  - **Solusi**: Gunakan unit ukuran relatif (seperti `aspect-square`) untuk sel kalender dan sesuaikan padding kontainer luar kalender di mobile menjadi lebih kecil (`padding: '4px 8px 8px'`).

### 12. [BookingForm.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/modules/booking/pages/BookingForm.tsx)
- [ ] **Pill Date Header**: Tombol "Ganti Tanggal" di header tanggal terpilih menggunakan `marginLeft: 'auto'`. Di layar mobile sempit, tombol ini akan terhimpit oleh teks tanggal yang panjang, sehingga teks tanggal terpotong.
  - **Solusi**: Pada layar mobile, beralihlah ke susunan vertikal (tanggal di atas, tombol ganti tanggal di bawahnya) menggunakan flexbox responsive.

### 13. [RescheduleConfirm.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/modules/booking/pages/RescheduleConfirm.tsx)
- [ ] **Wadah Konfirmasi**: Card detail jadwal ulang harus memiliki margin yang aman di layar Android agar tidak mepet ke tepi layar.

---

## 🛠️ Halaman Admin (`src/pages/admin/` & `src/modules/booking/pages/admin/`)

*Catatan: Meskipun halaman admin lebih sering dibuka via desktop/laptop, responsivitas dasar di Android tetap diperlukan untuk kebutuhan pemantauan darurat.*

### 14. Dashboard & Tables ([AdminDashboard.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/admin/AdminDashboard.tsx), [AdminBookings.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/modules/booking/pages/admin/AdminBookings.tsx), dsb.)
- [ ] **Responsivitas Tabel Data**: Semua tabel manajemen admin (anggota, buku, peminjaman, booking) akan pecah dan meluap ke kanan di mobile.
  - **Solusi**: Setiap tabel **wajib** dibungkus di dalam kontainer scroll horizontal (`overflow-x-auto`) atau diubah menjadi bentuk kartu daftar khusus jika diakses dari mobile.
- [ ] **Sidebar Navigasi Admin**: Pastikan menu sidebar beralih menjadi sistem laci/drawer (*collapsible sidebar*) saat dibuka dari perangkat Android.
