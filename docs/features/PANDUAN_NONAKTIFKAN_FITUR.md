# Panduan Menonaktifkan Fitur Katalog, Login, dan Peminjaman Buku
*Disipusda Purwakarta - Perpustakaan Digital*

Dokumen ini berisi panduan teknis langkah demi langkah untuk menyembunyikan atau menonaktifkan fitur **Katalog Buku**, **Login Anggota (Member)**, dan **Kelola Peminjaman Buku** di panel admin.

---

## 🛠️ Ringkasan Langkah

Untuk menonaktifkan fitur ini secara penuh dan rapi, Anda perlu melakukan 4 langkah:
1. **Langkah 1:** Mengubah nilai konfigurasi global di `siteConfig.ts` (otomatis menyembunyikan katalog & login di web publik).
2. **Langkah 2:** Memodifikasi sidebar navigasi admin di `AdminLayout.tsx`.
3. **Langkah 3:** Memodifikasi widget statistik dashboard admin di `AdminDashboard.tsx`.
4. **Langkah 4:** Memodifikasi rute halaman di `App.tsx` agar halaman tersebut tidak bisa diakses langsung via URL.

---

## 💻 Panduan Teknis & Perubahan Kode

### Langkah 1: Mengubah Konfigurasi Global (Frontend Publik)
Ubah pengaturan *feature flag* di file **[siteConfig.ts](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/config/siteConfig.ts)** pada bagian `FEATURES` (sekitar baris 114):

```diff
   FEATURES: {
     // Jika false: Menu katalog, pencarian buku, dan riwayat pinjaman akan disembunyikan.
-    ENABLE_CATALOG: true,
+    ENABLE_CATALOG: false,
```
*Efek: Tombol login, menu Katalog Buku, dan seluruh halaman akses member (seperti profil/riwayat) akan disembunyikan dari pengunjung biasa.*

---

### Langkah 2: Menyembunyikan Menu Admin (Sidebar)
Agar admin tidak melihat menu Kelola Buku, Kelola Kategori, Konfirmasi Ambil (Peminjaman), dan Kelola Member saat fitur dinonaktifkan, edit file **[AdminLayout.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/layouts/AdminLayout.tsx)** bagian `navGroups` (mulai baris 20):

```diff
   const navGroups = [
     {
       id: 'utama',
       title: 'Utama',
       items: [
         { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
       ],
     },
     {
       id: 'konten',
       title: 'Konten & Koleksi',
       items: [
-        { name: 'Kelola Buku', path: '/admin/books', icon: <BookOpen size={20} /> },
-        { name: 'Kelola Kategori', path: '/admin/categories', icon: <Tags size={20} /> },
+        ...(SITE_CONFIG.FEATURES.ENABLE_CATALOG ? [
+          { name: 'Kelola Buku', path: '/admin/books', icon: <BookOpen size={20} /> },
+          { name: 'Kelola Kategori', path: '/admin/categories', icon: <Tags size={20} /> },
+        ] : []),
         { name: 'Semua Artikel', path: '/admin/articles', icon: <FileText size={20} /> },
         { name: 'Tulis Artikel', path: '/admin/articles/new', icon: <FilePlus size={20} /> },
         { name: 'Kelola Media', path: '/admin/media', icon: <ImageIcon size={20} /> },
       ],
     },
     {
       id: 'layanan',
       title: 'Layanan & Publik',
       items: [
-        { name: 'Konfirmasi Ambil', path: '/admin/borrows', icon: <LucideHistory size={20} /> },
-        { name: 'Kelola Member', path: '/admin/members', icon: <Users size={20} /> },
+        ...(SITE_CONFIG.FEATURES.ENABLE_CATALOG ? [
+          { name: 'Konfirmasi Ambil', path: '/admin/borrows', icon: <LucideHistory size={20} /> },
+          { name: 'Kelola Member', path: '/admin/members', icon: <Users size={20} /> },
+        ] : []),
         { name: 'Jadwal Layanan', path: '/admin/schedules', icon: <Clock size={20} /> },
         { name: 'Kelola PPID', path: '/admin/ppid', icon: <FileText size={20} /> },
         { name: 'Laporan Warga', path: '/admin/reports', icon: <MessageSquare size={20} /> },
       ],
     },
```

---

### Langkah 3: Menyembunyikan Statistik Peminjaman di Dashboard Admin
Agar widget statistik peminjaman dan jumlah anggota tidak muncul saat fitur dimatikan, edit file **[AdminDashboard.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/pages/admin/AdminDashboard.tsx)**:

1. Tambahkan import `SITE_CONFIG` di bagian atas berkas:
   ```typescript
   import { SITE_CONFIG } from '../../config/siteConfig';
   ```

2. Ubah variabel `stats` menjadi seperti berikut:
   ```diff
     const stats = [
       { title: 'Total Artikel', value: articles.length, icon: <FileText size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
       { title: 'Total Pembaca', value: articles.reduce((acc, curr) => acc + (curr.views || 0), 0), icon: <TrendingUp size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
-      { title: 'Peminjaman Aktif', value: activeBorrows, icon: <LucideHistory size={24} className="text-emerald-500" />, bg: 'bg-emerald-50' },
-      { title: 'Total Anggota', value: membersCount, icon: <Users size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
+      ...(SITE_CONFIG.FEATURES.ENABLE_CATALOG ? [
+        { title: 'Peminjaman Aktif', value: activeBorrows, icon: <LucideHistory size={24} className="text-emerald-500" />, bg: 'bg-emerald-50' },
+        { title: 'Total Anggota', value: membersCount, icon: <Users size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
+      ] : []),
     ];
   ```

---

### Langkah 4: Mengamankan Akses URL Halaman Admin (Router)
Edit file **[App.tsx](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/App.tsx)** pada bagian rute admin (sekitar baris 213) agar admin tidak dapat mengakses halaman kelola buku atau peminjaman secara langsung melalui URL ketikan:

```diff
-            <Route path="books" element={<ManageBooks />} />
-            <Route path="books/new" element={<BookEditor />} />
-            <Route path="books/edit/:id" element={<BookEditor />} />
-            <Route path="categories" element={<ManageCategories />} />
+            <Route path="books" element={
+              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <ManageBooks /> : <Navigate to="/admin" replace />
+            } />
+            <Route path="books/new" element={
+              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <BookEditor /> : <Navigate to="/admin" replace />
+            } />
+            <Route path="books/edit/:id" element={
+              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <BookEditor /> : <Navigate to="/admin" replace />
+            } />
+            <Route path="categories" element={
+              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <ManageCategories /> : <Navigate to="/admin" replace />
+            } />
             <Route path="admins" element={<ManageAdmins />} />
-            <Route path="members" element={<ManageMembers />} />
-            <Route path="borrows" element={<ManageBorrows />} />
+            <Route path="members" element={
+              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <ManageMembers /> : <Navigate to="/admin" replace />
+            } />
+            <Route path="borrows" element={
+              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <ManageBorrows /> : <Navigate to="/admin" replace />
+            } />
```

---

## 💡 Keuntungan Metode Ini
Dengan menerapkan langkah-langkah di atas, Anda memiliki kendali penuh secara dinamis. Jika sewaktu-waktu fitur katalog, login, dan peminjaman ingin diaktifkan kembali, Anda **hanya perlu mengubah nilai `ENABLE_CATALOG` kembali menjadi `true` di file `siteConfig.ts`** tanpa perlu mengubah kode program lagi!
