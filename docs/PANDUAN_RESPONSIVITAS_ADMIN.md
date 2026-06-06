# 📱 TODO: Perbaikan Responsivitas UI Android/Mobile untuk Panel Admin

Dokumen ini berisi daftar tugas (*checklist*) lengkap dan detail untuk merombak seluruh halaman Panel Admin (`src/pages/admin/` & `src/modules/booking/pages/admin/`) agar ramah digunakan di perangkat Android (Mobile). 

---

## 📌 1. Tata Letak Global (Layout & Sidebar)
Masalah terbesar di mobile saat ini adalah **Sidebar Admin** yang selalu terbuka (`w-64` statis), sehingga memakan hampir seluruh lebar layar HP.

### 📋 Tugas:
- [x] **Modifikasi [AdminLayout.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/layouts/AdminLayout.tsx)**:
  - [x] Tambahkan state `isSidebarOpen` (boolean) untuk mengontrol visibilitas sidebar di mobile.
  - [x] Ubah `<aside>` menjadi bertipe drawer di layar mobile:
    - Gunakan class: `fixed inset-y-0 left-0 z-50 transform -translate-x-full md:translate-x-0 md:relative md:flex transition-transform duration-300 ease-in-out`
    - Jika `isSidebarOpen` bernilai `true`, tambahkan class `translate-x-0` untuk menampilkan sidebar di mobile.
  - [x] Tambahkan overlay gelap (backdrop) di mobile ketika sidebar aktif:
    - `<div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />`
  - [x] Tambahkan **Header Mobile** di bagian atas konten utama (`<main>`):
    - Tampilkan hanya di layar mobile (`md:hidden`).
    - Berisi tombol menu hamburger (icon `Menu` dari `lucide-react`) untuk membuka sidebar, judul "PerpusAdmin", dan info ringkas admin.
  - [x] Sesuaikan padding konten utama di `<main>`:
    - Ubah `p-8` menjadi `p-4 sm:p-8` agar tidak memakan ruang berlebih di layar HP yang sempit.

---

## 📊 2. Dashboard Admin (`AdminDashboard.tsx`)
Halaman dashboard saat ini menggunakan grid kolom yang padat dan grafik/tabel yang bisa pecah di layar sempit.

### 📋 Tugas:
- [x] **Modifikasi [AdminDashboard.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/admin/AdminDashboard.tsx)**:
  - [x] **Statistik Grid**: Ubah grid dari `grid-cols-4` menjadi `grid-cols-2 lg:grid-cols-4` atau `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` agar kartu statistik tidak menyusut terlalu sempit di Android.
  - [x] **Grafik / Chart**: Jika ada grafik aktivitas, pastikan menggunakan responsive container agar lebarnya otomatis menyesuaikan layar HP (`ResponsiveContainer` jika menggunakan Recharts).
  - [x] **Aktivitas Terbaru**: Ubah tata letak daftar aktivitas dari bentuk tabel menjadi bentuk list-card (daftar kartu vertikal) di layar mobile.

---

## 📅 3. Booking Enkapsulasi (`AdminBookings.tsx`)
Halaman ini sangat krusial karena admin sering membuka detail booking dari notifikasi Telegram di HP mereka.

### 📋 Tugas:
- [x] **Modifikasi [AdminBookings.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/modules/booking/pages/admin/AdminBookings.tsx)**:
  - [x] **Filter Tabs**: Flex container filter status harus diubah menjadi `flex-wrap gap-2` atau menggunakan overflow-x horizontal rail agar tombol filter tidak bertumpuk tidak beraturan di HP.
  - [x] **Booking List / Cards (Pengganti Tabel)**:
    - Di layar besar, tetap gunakan tabel.
    - Di layar mobile (`block md:hidden`), tampilkan booking dalam bentuk **Kartu (Card)** yang berisi: Nama Pemesan, Tanggal, Jumlah Dokumen, Status, dan Tombol Aksi (Setujui / Tolak / Reschedule).
  - [x] **Modal Detail & Approval**:
    - Pastikan modal persetujuan (yang berisi input edit jumlah dokumen) memiliki padding yang cukup dan lebar `max-w-md w-[calc(100%-2rem)]` agar tidak terpotong di bagian bawah/samping layar Android.
    - Gunakan input numerik yang mudah ditekan dengan jari (padding minimal `p-3` atau `h-11`).

---

## 📁 4. Semua Halaman Pengelolaan Data (Tabel & Manajemen)
Meliputi: `ManageBooks.tsx`, `ManageArticles.tsx`, `ManageMedia.tsx`, `ManageMembers.tsx`, `ManageBorrows.tsx`, `ManageAdmins.tsx`, `ManageCategories.tsx`, `ManageReports.tsx`, `ManageSchedules.tsx`, `ManageStructure.tsx`, `ManagePpid.tsx`.

Halaman-halaman ini didominasi oleh tabel data besar.

### 📋 Tugas:
- [x] **Bungkus Semua Tabel dengan Overflow**:
  - Semua elemen `<table>` harus dibungkus dengan `<div className="w-full overflow-x-auto rounded-lg border border-gray-200">` agar tabel bisa di-scroll secara horizontal tanpa merusak layout luar halaman (Verified: semua tabel pengelolaan data admin sudah terbungkus dengan aman).
- [x] **Tombol Aksi di Kolom Tabel**:
  - Tombol Edit/Delete seringkali diletakkan berdampingan dalam baris tabel. Pada mobile, bungkus tombol-tombol tersebut dengan `flex flex-col gap-1 sm:flex-row` agar tidak membuat lebar kolom melar.
- [x] **Header Konten Halaman (Search Bar & Tombol Tambah)**:
  - Bagian atas halaman biasanya berisi judul, kolom pencarian, dan tombol "Tambah Baru".
  - Di layar mobile, ubah dari flex row (`justify-between`) menjadi flex column (`flex-col gap-3 w-full`), dengan kolom pencarian dan tombol berukuran lebar penuh (`w-full`).

---

## ✍️ 5. Halaman Form & Editor (`ArticleEditor.tsx`, `BookEditor.tsx`, `MediaEditor.tsx`, `Settings.tsx`)
Formulir input data panjang dengan editor teks (seperti Rich Text Editor) seringkali hancur di layar HP.

### 📋 Tugas:
- [x] **Form Fields Grid**:
  - Ganti susunan form dari 2 kolom berdampingan menjadi 1 kolom penuh di mobile (`grid-cols-1 md:grid-cols-2`).
- [x] **Rich Text Editor (jika ada)**:
  - Pastikan toolbar editor teks otomatis melakukan wrapping (*flex-wrap*) ke bawah agar tidak keluar dari area layar HP.
- [x] **Image Upload / Preview**:
  - Komponen upload gambar harus beradaptasi menjadi susunan vertikal (preview di atas, tombol/dropzone di bawah) di layar mobile.
- [x] **Fixed Bottom Bar (Tombol Simpan/Batal)**:
  - Berikan ruang padding bawah yang cukup agar tombol aksi utama di bagian paling bawah formulir tidak tertutup oleh keyboard virtual Android.
