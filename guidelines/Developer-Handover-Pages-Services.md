# Developer Handover Guide (Pages + Services)

Dokumen ini dibuat untuk developer pemula agar bisa melanjutkan project dengan cepat.
Fokus: file di `src/pages` dan `src/services`, termasuk area hardcode (warna, URL, angka limit, gambar, cooldown).

## 1) Cara baca cepat

1. Mulai dari `src/App.tsx` untuk peta routing.
2. Lanjut ke halaman user (`src/pages/*`) dan admin (`src/pages/admin/*`).
3. Untuk logic data, auth, dan sinkronisasi cloud, baca `src/services/*`.
4. Kalau mau ubah UI cepat, cari class Tailwind yang berisi warna hardcode seperti `#0c2f3d` dan `#d6a54a`.

## 2) Konvensi yang dipakai di project ini

- Banyak UI masih memakai **hardcoded style token** (contoh `#0c2f3d`, `#d6a54a`).
- Beberapa halaman memakai **URL gambar eksternal** (Unsplash, dll).
- Beberapa flow memakai **hardcoded angka operasional**:
  - `PAGE_SIZE` artikel
  - `BOOKS_PER_PAGE` katalog/admin
  - cooldown resend OTP `60 detik`
  - akses halaman verify `30 menit`
  - lockout admin `15 menit`, session TTL `12 jam`

Saran aman jangka panjang:
- Pindahkan konstanta ke satu tempat (misal `src/config/constants.ts`).
- Pindahkan warna brand ke CSS variable agar ganti tema cukup sekali.

## 3) Dokumentasi per file - SERVICES

### `src/services/authService.ts`
- Fungsi: auth admin/member legacy, session admin, lockout login, update profil member.
- Kompleks: validasi update profil + proteksi field sensitif.
- Hardcode penting:
  - `LOCKOUT_TIME = 15 * 60 * 1000`
  - `ADMIN_SESSION_TTL = 12 * 60 * 60 * 1000`
- Jika ubah keamanan login admin: cek fungsi lockout + penyimpanan session.

### `src/services/backendConfig.ts`
- Fungsi: pusat konfigurasi backend mode/environment.
- Jika pindah environment, cek file ini lebih dulu.

### `src/services/bookService.ts`
- Fungsi: CRUD buku, rekomendasi buku, peminjaman, antrian, wishlist, rating.
- Kompleks: sinkron stok + antrian + riwayat pinjaman.
- Saat ubah aturan peminjaman, audit fungsi borrow/join queue sekaligus.

### `src/services/dataService.ts`
- Fungsi: artikel, kategori, pagination artikel, sinkronisasi cloud -> cache.
- Kompleks: query filter Supabase + migrasi image base64 ke storage + cache refresh.
- Hardcode penting:
  - pagination artikel (`from/to` range)
  - debounce event sinkronisasi (internal)
- Catatan: `fetchArticlesPageWithCount()` dipakai pagination bernomor artikel.

### `src/services/db.ts`
- Fungsi: wrapper local storage/database key + model type dasar.
- Wajib konsisten dengan key yang dipakai service lain.

### `src/services/imageUtils.ts`
- Fungsi: util upload/konversi gambar.
- Kalau ubah bucket/folder storage, dampaknya luas ke media/artikel.

### `src/services/memberSession.ts`
- Fungsi: simpan, baca, hapus session member saat login/logout.
- Jika ganti strategi auth state, file ini pasti ikut berubah.

### `src/services/settingsService.ts`
- Fungsi: baca/simpan settings portal (jadwal, ppid, struktur, achievement).
- Kompleks: refresh beberapa domain settings secara paralel.

### `src/services/storageService.ts`
- Fungsi: helper storage object (upload/delete/get url).
- Jika bucket policy berubah, cek file ini dan RLS storage.

### `src/services/supabase.ts`
- Fungsi: inisialisasi client Supabase.
- Wajib aman: URL/key harus lewat env variable.

### `src/services/supabaseAuthService.ts`
- Fungsi: register/login/reset/verify OTP + sinkron profil `public.members`.
- Kompleks:
  - parse callback URL (`code`, `token_hash`, `access_token`)
  - sync data Auth -> tabel members -> local session
- Hardcode penting:
  - redirect callback `/auth/callback`
  - type OTP (`signup`, `magiclink`)

## 4) Dokumentasi per file - PAGES (User)

### `src/pages/ArticleDetail.tsx`
- Fungsi: detail artikel + share/bookmark + galeri/lightbox + download media.
- Hardcode: banyak warna premium, style visual intensif.
- Titik ubah desain: header, hero, lightbox section.

### `src/pages/AuthCallback.tsx`
- Fungsi: memproses link dari email Supabase (verify/recovery/magiclink).
- Kompleks: fallback ke verifikasi manual jika callback gagal.

### `src/pages/AuthUpdatePassword.tsx`
- Fungsi: form update password pasca recovery.
- Hardcode: warna tombol dan background auth.

### `src/pages/AuthVerifyCode.tsx`
- Fungsi: verifikasi OTP manual + resend email.
- Kompleks: guard akses via sessionStorage + cooldown resend.
- Hardcode penting:
  - akses verify valid 30 menit
  - cooldown resend 60 detik

### `src/pages/BlogList.tsx`
- Fungsi: daftar artikel dengan filter + search + pagination bernomor.
- Kompleks: sinkron filter + server pagination + total count.
- Hardcode penting:
  - `PAGE_SIZE = 10`

### `src/pages/Diorama.tsx`
- Fungsi: informasi diorama, segmen konten, CTA layanan.
- Hardcode: URL eksternal layanan, gambar thumbnail eksternal, warna section.

### `src/pages/ForgotPassword.tsx`
- Fungsi: request reset password via email.
- Hardcode: gaya auth page.

### `src/pages/Galendo.tsx`
- Fungsi: informasi layanan galendo + link form eksternal.
- Hardcode: URL Google Form/pernaskahan.

### `src/pages/Home.tsx`
- Fungsi: landing utama + highlight konten + CTA.
- Hardcode: beberapa URL gambar Unsplash dan link eksternal JIKN.

### `src/pages/JadwalLayanan.tsx`
- Fungsi: tampil jadwal layanan + lokasi.
- Hardcode: link Google Maps.

### `src/pages/JasaKearsipan.tsx`
- Fungsi: informasi layanan jasa kearsipan.
- Dominan konten statis + styling Tailwind.

### `src/pages/KatalogBuku.tsx`
- Fungsi: katalog buku, filter, detail, borrow/queue/wishlist/rating.
- Kompleks: state besar + interaction buku + pagination.
- Hardcode penting: `BOOKS_PER_PAGE = 12`, background image URL.

### `src/pages/Kearsipan.tsx`
- Fungsi: profil layanan kearsipan dan edukasi akses arsip.
- Hardcode: gambar eksternal + link JIKN.

### `src/pages/LaporWarga.tsx`
- Fungsi: form pengaduan/report warga.
- Hardcode sensitif: endpoint telegram bot (`api.telegram.org`).
- Catatan keamanan: token bot jangan hardcode di frontend production.

### `src/pages/LayananRentan.tsx`
- Fungsi: informasi layanan untuk kelompok rentan.
- Dominan konten statis.

### `src/pages/Login.tsx`
- Fungsi: login member + redirect verify jika email belum terkonfirmasi.
- Hardcode: hero image URL + style auth.

### `src/pages/NotFound.tsx`
- Fungsi: halaman 404.
- Ubah teks/CTA sesuai kebutuhan brand.

### `src/pages/Pabukon.tsx`
- Fungsi: konten halaman pabukon.
- Dominan konten statis.

### `src/pages/Perpustakaan.tsx`
- Fungsi: informasi layanan perpustakaan.
- Dominan konten statis + CTA.

### `src/pages/Ppid.tsx`
- Fungsi: menampilkan data PPID/public info.
- Bergantung pada data service artikel/ppid.

### `src/pages/Prestasi.tsx`
- Fungsi: daftar prestasi.
- Hardcode: data prestasi + gambar eksternal.

### `src/pages/Profil.tsx`
- Fungsi: profil instansi.
- Hardcode: beberapa gambar background eksternal.

### `src/pages/Referensi.tsx`
- Fungsi: daftar referensi/sumber.
- Dominan konten statis.

### `src/pages/Register.tsx`
- Fungsi: registrasi akun member.
- Kompleks: setelah signup diarahkan ke verify page (`/auth/verify?email=`).
- Hardcode: hero image URL.

### `src/pages/RiwayatPinjaman.tsx`
- Fungsi: tampil riwayat pinjaman user.
- Bergantung pada data borrow di service buku.

### `src/pages/Sejarah.tsx`
- Fungsi: halaman sejarah instansi.
- Dominan konten statis.

### `src/pages/StrukturOrganisasi.tsx`
- Fungsi: menampilkan struktur organisasi.
- Data dapat berasal dari settings/service struktur.

### `src/pages/ZonaIntegritas.tsx`
- Fungsi: informasi zona integritas.
- Dominan konten statis.

## 5) Dokumentasi per file - PAGES ADMIN

### `src/pages/admin/AdminDashboard.tsx`
- Fungsi: ringkasan data admin (artikel, buku, dsb).
- Hardcode: warna metric card + aksi cepat.

### `src/pages/admin/ArticleEditor.tsx`
- Fungsi: editor artikel (rich text), upload gambar, metadata.
- Kompleks: editor command chain + inject caption style.
- Hardcode: snippet style caption HTML, banyak style warna toolbar.

### `src/pages/admin/BookEditor.tsx`
- Fungsi: form tambah/edit buku.
- Hardcode: class input dan default styling.

### `src/pages/admin/LoginAdmin.tsx`
- Fungsi: login admin panel.
- Hardcode: style autentikasi admin.

### `src/pages/admin/ManageAdmins.tsx`
- Fungsi: CRUD admin user + role.
- Kompleks: validasi role dan proteksi aksi.

### `src/pages/admin/ManageArticles.tsx`
- Fungsi: list/filter/hapus artikel.
- Kompleks: sinkron daftar setelah perubahan.

### `src/pages/admin/ManageBooks.tsx`
- Fungsi: list/filter/pagination buku admin.
- Hardcode penting: `BOOKS_PER_PAGE = 10`.

### `src/pages/admin/ManageBorrows.tsx`
- Fungsi: kelola peminjaman dan status pengembalian.
- Kompleks: perubahan status berpengaruh ke stok buku.

### `src/pages/admin/ManageCategories.tsx`
- Fungsi: kelola kategori konten/buku.
- Dampak luas: dipakai lintas halaman filter.

### `src/pages/admin/ManageMedia.tsx`
- Fungsi: manajemen media gallery/video.
- Perlu konsistensi dengan `MediaEditor`.

### `src/pages/admin/ManageMembers.tsx`
- Fungsi: list member + hapus member cloud.
- Kompleks: sinkron hapus di Supabase + refresh local cache.

### `src/pages/admin/ManagePpid.tsx`
- Fungsi: kelola data PPID.
- Hardcode: placeholder URL drive.

### `src/pages/admin/ManageReports.tsx`
- Fungsi: kelola laporan/pengaduan masuk.
- Periksa alur integrasi ke channel notifikasi.

### `src/pages/admin/ManageSchedules.tsx`
- Fungsi: kelola jadwal layanan.
- Biasanya terkait settings service.

### `src/pages/admin/ManageStructure.tsx`
- Fungsi: kelola struktur organisasi.
- Terkait halaman profil/struktur.

### `src/pages/admin/MediaEditor.tsx`
- Fungsi: buat/edit item media.
- Hardcode: fallback URL placeholder.

### `src/pages/admin/Settings.tsx`
- Fungsi: konfigurasi global portal dari admin panel.
- Perubahan di sini bisa berpengaruh lintas halaman user.

## 6) Checklist saat ganti tampilan/desain

- Cari warna hardcoded di pages/admin dengan keyword:
  - `#0c2f3d`, `#d6a54a`, `#1a4254`, `#c09440`
- Cari background image eksternal:
  - keyword `images.unsplash.com`
- Cari link layanan eksternal:
  - keyword `https://` di file halaman terkait
- Setelah ubah desain, cek:
  1. Mobile breakpoints (`sm`, `md`, `lg`)
  2. Kontras teks terhadap background
  3. Tombol primary konsisten antar halaman auth/admin/user

## 7) Area prioritas refactor (biar lebih mudah dirawat)

1. Pusatkan semua warna brand ke design token (`:root` CSS variables).
2. Pusatkan konstanta operasional (page size, cooldown, ttl) ke file config.
3. Hilangkan endpoint sensitif dari frontend (`LaporWarga` Telegram token flow).
4. Tambahkan unit test untuk service auth, book borrow/queue, dan article pagination.

## 8) Progress komentar inline (Phase 2)

Batch yang sudah didokumentasikan inline lebih detail:
- Auth module:
  - `src/services/authService.ts`
  - `src/services/supabaseAuthService.ts`
  - `src/pages/Login.tsx`
  - `src/pages/Register.tsx`
  - `src/pages/ForgotPassword.tsx`
  - `src/pages/AuthCallback.tsx`
  - `src/pages/AuthVerifyCode.tsx`
- Artikel module:
  - `src/pages/BlogList.tsx`
  - `src/services/dataService.ts`
- Buku + sirkulasi module:
  - `src/services/bookService.ts`
  - `src/pages/admin/ManageBorrows.tsx`
- Admin data module:
  - `src/pages/admin/ManageMembers.tsx`
  - `src/pages/admin/ManageBooks.tsx`
  - `src/pages/admin/ManageArticles.tsx`
- Admin content & configuration module:
  - `src/pages/admin/ArticleEditor.tsx`
  - `src/pages/admin/MediaEditor.tsx`
  - `src/pages/admin/ManageMedia.tsx`
  - `src/pages/admin/Settings.tsx`
  - `src/pages/admin/ManageSchedules.tsx`
  - `src/pages/admin/ManageStructure.tsx`
  - `src/pages/admin/ManagePpid.tsx`
- Static user pages (hardcoded/external link markers):
  - `src/pages/Home.tsx`
  - `src/pages/Diorama.tsx`
  - `src/pages/Galendo.tsx`
  - `src/pages/Kearsipan.tsx`
  - `src/pages/JadwalLayanan.tsx`
  - `src/pages/Prestasi.tsx`
  - `src/pages/Profil.tsx`
  - `src/pages/LaporWarga.tsx`
- Static user pages (lanjutan):
  - `src/pages/Sejarah.tsx`
  - `src/pages/Referensi.tsx`
  - `src/pages/ZonaIntegritas.tsx`
  - `src/pages/Pabukon.tsx`
  - `src/pages/Perpustakaan.tsx`
  - `src/pages/LayananRentan.tsx`
- Supporting services (deep inline comments):
  - `src/services/settingsService.ts`
  - `src/services/storageService.ts`
  - `src/services/imageUtils.ts`
  - `src/services/db.ts`
  - `src/services/memberSession.ts`
  - `src/services/supabase.ts`
- Remaining user/admin pages (function-level comments):
  - `src/pages/AuthUpdatePassword.tsx`
  - `src/pages/JasaKearsipan.tsx`
  - `src/pages/KatalogBuku.tsx`
  - `src/pages/NotFound.tsx`
  - `src/pages/Ppid.tsx`
  - `src/pages/RiwayatPinjaman.tsx`
  - `src/pages/StrukturOrganisasi.tsx`
  - `src/pages/admin/AdminDashboard.tsx`
  - `src/pages/admin/LoginAdmin.tsx`
  - `src/pages/admin/ManageAdmins.tsx`
  - `src/pages/admin/ManageCategories.tsx`
  - `src/pages/admin/ManageReports.tsx`
  - `src/pages/admin/BookEditor.tsx`

Action plan tambahan:
- `guidelines/Hardcode-Audit-Action-Plan.md` (audit terpisah per domain: warna, URL eksternal, konstanta operasional, endpoint sensitif)

---

Jika ingin lanjut tahap 2, buat dokumen terpisah:
- `guidelines/Function-Level-Comments-TODO.md`

Isinya daftar fungsi kompleks per file yang perlu komentar lebih detail baris per baris.
