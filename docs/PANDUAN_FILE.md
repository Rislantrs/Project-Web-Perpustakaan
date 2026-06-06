# Panduan Struktur File dan Pengelolaan Aset Gambar
Disipusda Purwakarta - Perpustakaan Digital

Dokumen ini menjelaskan cara mengganti gambar yang telah ditentukan di dalam kode program, serta memberikan peta lengkap seluruh file di dalam proyek ini beserta fungsinya masing-masing.

---

## Cara Mengganti Gambar yang Ditentukan di Kode

Ada tiga cara utama untuk mengganti gambar yang terpasang di proyek ini:

### Cara 1: Mengganti File Gambar Asli (Paling Mudah)
Anda tidak perlu mengubah kode program sama sekali. Cukup ganti file gambar yang ada di folder src/assets/ dengan file gambar baru yang memiliki nama, ekstensi, dan folder penyimpanan yang sama persis.

Sebagai contoh, jika ingin mengganti gambar gedung arsip di halaman beranda:
1. Cari berkas asli di folder src/assets/layanan/kearsipan/Gedung_Arsip.webp.
2. Siapkan file gambar baru Anda, sesuaikan ukurannya agar tidak terlalu besar, lalu konversi ke format .webp.
3. Ganti nama file baru tersebut menjadi Gedung_Arsip.webp.
4. Salin dan timpa file lama di folder src/assets/layanan/kearsipan/.

### Cara 2: Mengubah Kode Import Gambar
Jika Anda ingin menggunakan file gambar dengan nama baru atau folder yang berbeda:
1. Pindahkan gambar baru Anda ke folder yang sesuai di dalam src/assets/.
2. Buka file .tsx komponen yang menampilkan gambar tersebut.
3. Ubah baris import di bagian atas file.
   Contoh pada src/pages/Home.tsx:
   ```typescript
   // Sebelum:
   import gedungArsip from '../assets/layanan/kearsipan/Gedung_Arsip.webp';
   
   // Sesudah:
   import gedungArsip from '../assets/layanan/kearsipan/Gedung_Arsip_Baru.webp';
   ```

### Cara 3: Menggunakan URL Gambar Dinamis atau Supabase Storage
Jika Anda ingin foto tersebut dikelola secara dinamis melalui database sehingga bisa diganti tanpa mengubah kode program:
1. Unggah gambar baru ke Supabase Storage (misalnya bucket public-assets).
2. Ambil URL publik dari berkas yang telah diunggah.
3. Di dalam kode komponen (misal src/pages/Home.tsx), ganti pemanggilan variabel gambar lokal dengan alamat URL tersebut.
   Contoh:
   ```tsx
   // Sebelum:
   <img src={gedungArsip} alt="Gedung Arsip" />
   
   // Sesudah:
   <img src="https://[PROJECT_ID].supabase.co/storage/v1/object/public/assets/gedung-arsip-baru.jpg" alt="Gedung Arsip" />
   ```

---

## Daftar Lokasi Gambar yang Ditentukan di Kode

Berikut adalah daftar halaman yang menggunakan gambar lokal langsung di dalam kode:

| Halaman / Fitur | Berkas Kode | Variabel dan Lokasi Aset |
| :--- | :--- | :--- |
| **Logo Instansi (Navigasi, Footer, Kartu)** | siteConfig.ts | logoUtama (src/assets/logo/logoDisispuda.webp) dan logoAlternatif (src/assets/logo/logo_perpus.webp) |
| **Kartu Anggota Digital** | MemberCardQR.tsx | logo (src/assets/logo/logoDisispuda.webp) |
| **Beranda (Home)** | Home.tsx | gedungArsip (src/assets/layanan/kearsipan/Gedung_Arsip.webp), perpustakaanImg (src/assets/layanan/perpustakaan/mohHatta.webp), dioramaImg (src/assets/layanan/dioramaPurwakarta/image-1.webp), libHero, libIndoor, libRoom, siknImg, virtualImg |
| **Diorama (Bale Panyawangan)** | Diorama.tsx | Galeri diorama nusantara (n1 sampai n12), diorama purwakarta (p1 sampai p9), heroPurwakarta, heroNusantara, libHero, libRoom |
| **Kearsipan** | Kearsipan.tsx | heroImg (Gedung_Arsip.webp), aaiImg (AAI-Cabang-Purwakarta-1024x575.webp), depoImg (Ruang-Depo-Arsip-Disipusda-Purwakarta-1024x575.webp), libTeam (lib-team.webp) |
| **Perpustakaan** | Perpustakaan.tsx | heroImg (diorama-purwakarta-02.webp) |
| **Halaman Login** | Login.tsx | libIndoor (src/assets/image/lib-indoor.webp) |
| **Katalog Buku (Banner)** | KatalogBuku.tsx | libBooks (src/assets/image/lib-books.webp) |
| **Halaman Galendo** | Galendo.tsx | galendo1, galendo2, galendo3, naskahKuno (src/assets/lainLain/galendo/) |

---

## Struktur Direktori Proyek

```text
Library Website Design/
├── .env                       # Variabel lingkungan untuk konfigurasi umum
├── .env.secrets               # Variabel lingkungan rahasia (diabaikan oleh git)
├── ATTRIBUTIONS.md            # Informasi lisensi aset pihak ketiga
├── IMAGE_OPTIMIZATION_GUIDE.md # Panduan kompresi dan optimasi gambar
├── PANDUAN_MIGRASI_DATABASE.md # Panduan skema database dan migrasi ke Supabase
├── README.md                  # Panduan umum proyek dan konfigurasi awal
├── TUTORIAL_INTEGRASI.md      # Panduan integrasi API dan backend database
├── package.json               # Daftar pustaka Node.js dan perintah build
├── vite.config.ts             # Konfigurasi compiler Vite
├── public/                    # Folder aset statis publik (seperti favicon)
├── supabase/                  # Konfigurasi dan migrasi database Supabase
└── src/                       # Folder utama kode sumber aplikasi frontend
    ├── App.tsx                # Sistem rute utama aplikasi
    ├── main.tsx               # Titik masuk utama aplikasi React
    ├── assets/                # Aset gambar lokal
    ├── components/            # Komponen UI global yang digunakan berulang kali
    ├── config/                # Konfigurasi parameter, warna, dan navigasi
    ├── layouts/               # Struktur tata letak halaman (publik/admin)
    ├── pages/                 # File halaman web untuk pengunjung
    │   └── admin/             # File halaman khusus admin
    ├── security/              # Modul pemantauan keamanan dan audit
    ├── services/              # Modul penghubung database dan otentikasi
    ├── styles/                # File gaya desain global (CSS)
    └── utils/                 # Kumpulan fungsi pembantu (helper)
```

---

## Penjelasan Berkas di Folder `src/`

Berikut adalah rincian seluruh file yang berada di dalam folder src/:

### 1. Berkas Utama di Folder `src/`
*   **App.tsx**: Mengatur rute navigasi utama website. File ini menentukan halaman mana yang akan dibuka berdasarkan alamat URL, serta memproteksi halaman admin agar tidak dapat diakses tanpa login.
*   **main.tsx**: Menginisialisasi React dan merender komponen utama ke dalam DOM HTML. Di file ini juga dipasang notifikasi melayang (Toast).
*   **vite-env.d.ts**: Menyediakan deklarasi tipe data untuk variabel lingkungan Vite dan tipe file eksternal seperti gambar.

### 2. Komponen Global (`src/components/`)
*   **ErrorBoundaryFallback.tsx**: Tampilan darurat yang muncul otomatis apabila terjadi kesalahan fatal pada program, mencegah halaman kosong putih.
*   **Navbar.tsx**: Menu navigasi bagian atas website, mendukung dropdown menu bertingkat, responsive mobile, dan menampilkan menu pengguna setelah login.
*   **Footer.tsx**: Kaki halaman yang memuat informasi kontak instansi, alamat, tautan cepat, jam buka layanan, dan hak cipta.
*   **MemberCardQR.tsx**: Kartu anggota perpustakaan digital untuk anggota perpustakaan, dilengkapi dengan kode QR untuk pemindaian fisik.
*   **SafeImage.tsx**: Komponen pembungkus gambar yang otomatis menampilkan gambar cadangan jika gambar utama gagal dimuat atau tautannya rusak.

### 3. Konfigurasi (`src/config/`)
*   **siteConfig.ts**: Berkas pusat pengaturan identitas instansi, warna tema, susunan menu navigasi, dan sakelar fitur (seperti mengaktifkan katalog).
*   **externalLinks.ts**: Menyimpan tautan luar instansi (seperti pameran virtual, WhatsApp admin, dan form pengaduan) agar mudah dikelola di satu tempat.
*   **appLimits.ts**: Berisi batas kapasitas berkas unggahan, resolusi gambar, jumlah data per halaman, dan durasi aktif sesi login.
*   **colorPalette.ts**: Menyediakan daftar kode warna acak untuk latar belakang avatar profil anggota perpustakaan.

### 4. Layouts (`src/layouts/`)
*   **MainLayout.tsx**: Struktur layout utama untuk halaman publik (menggabungkan navigasi atas, konten halaman, dan kaki halaman).
*   **AdminLayout.tsx**: Struktur layout khusus halaman admin yang menyediakan sidebar navigasi menu pengelolaan dan area konten kerja admin.

### 5. Halaman Publik dan Anggota (`src/pages/`)
*   **Home.tsx**: Halaman beranda utama perpustakaan yang menampilkan banner, sekilas profil, layanan cepat, dan berita terbaru.
*   **Profil.tsx**: Halaman dashboard anggota perpustakaan yang berisi kartu anggota digital, biodata, dan ringkasan pinjaman.
*   **KatalogBuku.tsx**: Halaman pencarian buku dengan filter kategori, pencarian teks, dan formulir pengajuan peminjaman buku.
*   **RiwayatPinjaman.tsx**: Halaman untuk melacak status peminjaman buku anggota, tanggal jatuh tempo, denda, dan status pengembalian.
*   **BlogList.tsx**: Halaman daftar artikel berita, pengumuman, dan materi edukasi.
*   **ArticleDetail.tsx**: Halaman pembaca detail berita, dilengkapi tombol berbagi, daftar berita terkait, dan tombol unduh media jika tersedia.
*   **Diorama.tsx**: Halaman panduan informasi sejarah museum Bale Panyawangan Diorama Purwakarta dan Diorama Nusantara.
*   **Kearsipan.tsx**: Informasi detail seputar layanan arsip daerah, jadwal retensi arsip, dan tata kelola dokumen dinas.
*   **Perpustakaan.tsx**: Informasi seputar fasilitas fisik perpustakaan daerah, seperti ruang baca umum dan ruang baca anak.
*   **Galendo.tsx**: Galeri naskah kuno digital Purwakarta yang mendokumentasikan manuskrip kuno bernilai sejarah.
*   **LaporWarga.tsx**: Halaman formulir laporan pengaduan, kritik, dan saran masyarakat secara online.
*   **Pabukon.tsx**: Daftar dan informasi pojok baca masyarakat (Pabukon) di tingkat desa dan kelurahan.
*   **JadwalLayanan.tsx**: Jam operasional perpustakaan umum, museum diorama, dan rute perpustakaan keliling.
*   **JasaKearsipan.tsx**: Penjelasan layanan peminjaman arsip dan konsultasi kearsipan bagi instansi atau perorangan.
*   **LayananRentan.tsx**: Panduan layanan khusus untuk kelompok rentan (lansia, ibu hamil, dan penyandang disabilitas).
*   **Ppid.tsx**: Halaman permohonan informasi publik melalui Pejabat Pengelola Informasi dan Dokumentasi (PPID).
*   **Sejarah.tsx**: Halaman informasi sejarah berdirinya Dinas Kearsipan dan Perpustakaan Kabupaten Purwakarta.
*   **StrukturOrganisasi.tsx**: Bagan susunan kepegawaian dan kepemimpinan dinas.
*   **Prestasi.tsx**: Galeri penghargaan dan pencapaian kerja yang telah diraih oleh dinas.
*   **ZonaIntegritas.tsx**: Komitmen dinas dalam hal transparansi publik dan pembangunan zona bebas korupsi.
*   **Login.tsx**: Halaman login untuk masuk ke akun anggota perpustakaan.
*   **Register.tsx**: Halaman pendaftaran keanggotaan perpustakaan digital baru.
*   **ForgotPassword.tsx**: Formulir pengajuan atur ulang kata sandi (lupa kata sandi).
*   **AuthCallback.tsx**: Halaman perantara untuk memvalidasi token otentikasi dari email.
*   **AuthUpdatePassword.tsx**: Formulir pembuatan kata sandi baru setelah mengajukan lupa kata sandi.
*   **AuthVerifyCode.tsx**: Halaman verifikasi kode OTP setelah melakukan pendaftaran anggota.
*   **NotFound.tsx**: Halaman pemberitahuan error 404 ketika pengunjung mengakses halaman yang tidak ada.

### 6. Halaman Dashboard Admin (`src/pages/admin/`)
*   **LoginAdmin.tsx**: Halaman masuk bagi pengelola atau petugas perpustakaan ke panel admin.
*   **AdminDashboard.tsx**: Halaman dashboard utama admin yang menampilkan ringkasan data statistik dan perkembangan perpustakaan.
*   **ManageBooks.tsx**: Halaman tabel daftar buku perpustakaan untuk menambah, mengedit, atau menghapus data buku.
*   **BookEditor.tsx**: Formulir pengisian data buku baru atau pengeditan data buku yang sudah ada (judul, ISBN, penulis, e-book, cover).
*   **ManageCategories.tsx**: Halaman kelola kategori pengelompokan buku di perpustakaan.
*   **ManageBorrows.tsx**: Daftar peminjaman buku anggota yang memerlukan tindakan persetujuan ambil atau konfirmasi pengembalian oleh admin.
*   **ManageMembers.tsx**: Daftar data anggota perpustakaan terdaftar untuk mengaktifkan status atau memblokir akun.
*   **ManageArticles.tsx**: Daftar seluruh artikel berita dan pengumuman yang ada di database web.
*   **ArticleEditor.tsx**: Formulir editor teks lengkap untuk menulis konten artikel berita beserta gambar sampulnya.
*   **ManageMedia.tsx**: Kelola file media digital eksternal seperti gambar mewarnai anak atau komik digital.
*   **MediaEditor.tsx**: Formulir unggah file media baru dan deskripsi pendukungnya.
*   **ManagePpid.tsx**: Panel kelola dokumen permohonan informasi yang masuk dari masyarakat.
*   **ManageSchedules.tsx**: Panel pengaturan jam buka layanan perpustakaan secara dinamis.
*   **ManageStructure.tsx**: Kelola nama pejabat dinas, jabatan, dan struktur kepegawaian dinas.
*   **ManageAdmins.tsx**: Manajemen daftar akun administrator web (hanya dapat diakses oleh tingkat Superadmin).
*   **ManageReports.tsx**: Menu cetak laporan sirkulasi peminjaman buku periodik.
*   **Settings.tsx**: Pengaturan integrasi server, mode pemeliharaan web, dan kunci API sistem.

### 7. Services dan Integrasi Database (`src/services/`)
*   **supabase.ts**: Inisialisasi koneksi klien Supabase untuk menghubungkan aplikasi React dengan server database.
*   **db.ts**: Menyediakan data lokal cadangan (mock data) apabila aplikasi berjalan dalam mode luring atau tanpa koneksi database.
*   **authService.ts**: Pengelolaan token sesi login pengguna, hak akses klien, dan cookies keamanan.
*   **supabaseAuthService.ts**: Logika otentikasi Supabase untuk pendaftaran, login, logout, verifikasi email, dan sinkronisasi ke tabel anggota.
*   **bookService.ts**: Modul CRUD untuk tabel buku, kategori, penilaian buku, sirkulasi transaksi peminjaman, dan perhitungan denda.
*   **dataService.ts**: Modul CRUD untuk tabel artikel, jadwal layanan, dan pengumuman dinas.
*   **emailService.ts**: Modul untuk memicu pengiriman notifikasi email ke pengguna menggunakan Supabase Edge Functions dan Resend API.
*   **storageService.ts**: Layanan unggah berkas gambar cover buku, berkas PDF e-book, dan media lainnya ke Supabase Storage.
*   **settingsService.ts**: Mengambil dan menyimpan pengaturan aplikasi web dari tabel konfigurasi database.
*   **reportService.ts**: Menghitung data statistik peminjaman terpopuler dan rekap laporan bulanan admin.
*   **memberSession.ts**: Penyimpanan sesi aktif lokal dari akun anggota perpustakaan yang sedang masuk.
*   **backendConfig.ts**: Penentu mode database (apakah menggunakan mode mock lokal atau Supabase cloud).

### 8. Security dan Monitoring (`src/security/`)
*   **monitoring.ts**: Melacak performa rendering halaman web dan mencatat kesalahan JavaScript untuk dianalisis demi kelancaran aplikasi.
*   **examples.ts**: Menyediakan contoh implementasi perlindungan input form dari celah keamanan XSS dan SQL Injection.

### 9. Styles (`src/styles/`)
*   **tailwind.css**: File CSS utama yang memuat font, direktif Tailwind CSS v4, dan kelas pembantu gaya desain khusus (seperti glassmorphism).

### 10. Utilities (`src/utils/`)
*   **security.ts**: Menyediakan fungsi sensor NIK otomatis untuk melindungi data privasi anggota.
*   **imageUtils.ts**: Modul pembantu untuk memvalidasi ukuran dan dimensi gambar sebelum diunggah ke server.
*   **webVitals.ts**: Mengukur performa kecepatan muat halaman web berdasarkan standar industri Core Web Vitals.
