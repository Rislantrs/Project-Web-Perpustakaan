# 📑 Panduan Arsitektur Skema SQL & Manajemen Storage Bucket

Panduan ini disusun untuk memberikan kejelasan mengenai struktur pemisahan database SQL pada proyek Anda, cara mengambil bagian skema tertentu saja (seperti sistem login, admin, atau bucket), serta rekomendasi kode dinamis untuk penyimpanan file (Storage) agar tidak tertulis secara kaku (*hardcoded*).

---

## 📋 DAFTAR ISI
1. [Bagian 1: Pemisahan Skema SQL per Fitur](#1-bagian-1-pemisahan-skema-sql-per-fitur)
2. [Bagian 2: Ekstraksi Skema Minimalis (Hanya Auth, Admin, atau Bucket)](#2-bagian-2-ekstraksi-skema-minimalis-hanya-auth-admin-atau-bucket)
3. [Bagian 3: Kebijakan RLS (Row Level Security) untuk Storage Bucket](#3-bagian-3-kebijakan-rls-row-level-security-untuk-storage-bucket)
4. [Bagian 4: Kode Dinamis Storage Bucket (Bebas Hardcoding)](#4-bagian-4-kode-dinamis-storage-bucket-bebas-hardcoding)
5. [Bagian 5: Skrip Backend Upload File Dinamis (PHP & Node.js Express)](#5-bagian-5-skrip-backend-upload-file-dinamis-php--nodejs-express)

---

## 1. Pemisahan Skema SQL per Fitur

Skema database pada proyek ini sudah dipisah secara terstruktur di dalam folder `supabase/migrations/` dan `docs/` berdasarkan perannya:

| Modul Fitur | Berkas Skema SQL / Lokasi | Deskripsi Tabel |
|---|---|---|
| **Fitur Utama & Artikel** | `20260530_01_consolidated_tables.sql`<br>(dan `PANDUAN_MIGRASI_DATABASE.md`) | `warga_reports` (lapor warga), `audit_logs` (log edit artikel), `categories` (kategori berita), `articles` (isi portal berita/artikel). |
| **Katalog Buku & Sirkulasi** | `PANDUAN_MIGRASI_DATABASE.md` (Opsi C)<br>(dan `20260530_01_consolidated_tables.sql`) | `books` (katalog), `borrows` (peminjaman), `queue` (daftar tunggu antrean buku), `members` (profil anggota), `admins` (daftar pengelola). |
| **Booking Enkapsulasi** | `20260604_01_booking_tables.sql` (dan pendukungnya) | `bookings` (data pesanan enkapsulasi), `booking_date_locks` (pengunci tanggal libur), `booking_audit_logs`. |

---

## 2. Ekstraksi Skema Minimalis (Hanya Auth, Admin, atau Bucket)

Jika tim pengembang Anda ingin mengambil sebagian fitur saja untuk dipasang di sistem lain, gunakan panduan ekstraksi skema minimal berikut:

### A. Jika Hanya Butuh Sistem Registrasi & Login Anggota
Sistem autentikasi Supabase menggunakan modul bawaan (`auth.users`). Namun, untuk menyimpan biodata lengkap profil anggota, kita memetakan data tersebut ke tabel `public.members`.

**Skema minimal yang dibutuhkan:**
```sql
CREATE TABLE IF NOT EXISTS public.members (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nik VARCHAR(50) DEFAULT NULL,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  telepon VARCHAR(20) DEFAULT NULL,
  alamat TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_member_email UNIQUE (email)
);
```

### B. Jika Hanya Butuh Sistem Otoritas Admin & Super Admin
Untuk membedakan user biasa dengan admin, kita menggunakan tabel `public.admins` serta helper functions untuk mengecek hak akses.

**Skema minimal admin:**
```sql
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(191) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT uq_admin_email UNIQUE (email)
);
```

**Fungsi Keamanan Pengecekan Admin (Gunakan di SQL Editor Supabase):**
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Cek apakah role admin terdaftar di token JWT auth user
  IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin'), false) THEN
    RETURN true;
  END IF;

  -- 2. Cek apakah ID user terdaftar di tabel admins
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE id = auth.uid()
  );
END;
$$;
```

---

## 3. Kebijakan RLS (Row Level Security) untuk Storage Bucket

Untuk mengamankan berkas gambar portal berita, sampul buku, atau lampiran dokumen laporan warga, buat dan aktifkan kebijakan keamanan berikut di Dashboard Supabase atau SQL Editor:

```sql
-- 1. Membuat Bucket Secara Aman
INSERT INTO storage.buckets (id, name, public) 
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Mengaktifkan RLS untuk storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Membaca File secara Publik (Bisa diakses siapa saja)
CREATE POLICY "Akses_Publik_Membaca_File" ON storage.objects FOR SELECT TO public
  USING (bucket_id IN ('articles', 'book-covers'));

-- 4. Kebijakan Menulis/Mengunggah File (Hanya Admin yang Terautentikasi)
CREATE POLICY "Hanya_Admin_Bisa_Upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('articles', 'book-covers') AND public.is_admin());

-- 5. Kebijakan Menghapus File (Hanya Admin yang Terautentikasi)
CREATE POLICY "Hanya_Admin_Bisa_Hapus" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('articles', 'book-covers') AND public.is_admin());
```

---

## 4. Kode Dinamis Storage Bucket (Bebas Hardcoding)

Pada file bawaan [storageService.ts](file:///c:/Users/Rislan/Downloads/Library%20Website Design/src/services/storageService.ts), nama bucket default diatur secara statis:
```typescript
const DEFAULT_BUCKET = 'articles';
```

Agar sistem lebih fleksibel dan terhindar dari *hardcoding* (sehingga nama bucket dapat diatur melalui file `.env`), terapkan rekomendasi perubahan kode berikut:

### A. Ubah di Sisi Kode React (Frontend)
Ubah pendefinisian nama bucket agar membaca variabel dari environment:

```typescript
// Ganti nilai statis dengan pembacaan dari env, dengan nilai fallback 'articles'
const DEFAULT_BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET_NAME as string) || 'articles';
```

Kemudian di file `.env` hosting Anda, Anda tinggal menambahkan baris baru jika ingin mengganti nama bucket:
```env
VITE_SUPABASE_BUCKET_NAME=nama_bucket_kustom_anda
```

---

## 5. Skrip Backend Upload File Dinamis & Keamanan (PHP & Node.js Express)

Apabila Anda beralih dari Supabase, berikut adalah skrip upload gambar yang telah diamankan dari serangan Remote Code Execution (RCE) dan Path Traversal:

### Opsi A: Skrip PHP (`upload.php` - cPanel Hosting)
Skrip ini memverifikasi tipe mime asli file, melakukan sanitasi nama, dan memastikan file yang diunggah benar-benar berkas gambar (bukan script PHP yang disamarkan):

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$headers = getallheaders();
$authToken = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
$expectedToken = "GANTI_DENGAN_TOKEN_KEAMANAN_RAHASIA_ANDA";

if (empty($authToken) || $authToken !== $expectedToken) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Akses Ditolak: Token tidak sah."]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $file = $_FILES['file'];
    
    // 1. Validasi Error Upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Gagal mengunggah berkas. Kode error: " . $file['error']]);
        exit();
    }

    // 2. Batasi Ukuran File (Contoh: Maksimal 2MB)
    $maxSize = 2 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Ukuran berkas terlalu besar. Maksimal 2MB."]);
        exit();
    }

    // 3. Validasi Ekstensi & Tipe Mime Asli (Mencegah Ekstensi Ganda seperti 'shell.php.jpg')
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    $fileName = basename($file['name']);
    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Cek mime type real menggunakan finfo
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $realMimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($ext, $allowedExtensions) || !in_array($realMimeType, $allowedMimeTypes)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Format berkas dilarang! Hanya mendukung gambar (JPG, PNG, GIF, WEBP)."]);
        exit();
    }

    // 4. Verifikasi apakah berkas benar-benar gambar menggunakan GD Library
    $imageInfo = @getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Berkas terdeteksi korup atau bukan gambar asli."]);
        exit();
    }

    // 5. Generate Nama Baru Acak
    $newFilename = uniqid('IMG-', true) . '.' . $ext;
    
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
        // Buat file .htaccess di folder uploads untuk menonaktifkan eksekusi script PHP
        file_put_contents($uploadDir . '.htaccess', "removehandler .php\nAddType text/plain .php");
    }
    
    $targetPath = $uploadDir . $newFilename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        $publicUrl = $protocol . $host . '/api/' . $targetPath;
        
        echo json_encode(["success" => true, "url" => $publicUrl]);
        exit();
    }
}

http_response_code(500);
echo json_encode(["success" => false, "message" => "Gagal menyimpan berkas di server."]);
?>
```

### Opsi B: Skrip Node.js Express (`uploadRoute.js` - VPS/Hostinger Node)
Menggunakan module `multer` dengan batasan ketat untuk mencegah serangan Denial of Service (DoS) dan RCE:

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const uploadDir = 'public/uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Bersihkan nama file asli dan buat string unik
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'IMG-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Format file tidak didukung! Harus berupa gambar.'));
  }
});

// Endpoint Upload Express
router.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Berkas tidak ditemukan.' });
  }
  
  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url: publicUrl });
});

// Global Error Handler untuk Multer (misal ukuran file melebihi limit)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Kesalahan upload: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;
```

---

## 6. Otomatisasi Unduh Seluruh Gambar dari Supabase Storage

Apabila data gambar Anda di Supabase Storage sudah banyak, sangat melelahkan jika harus mengunduhnya satu-persatu. Gunakan skrip otomatisasi Node.js di bawah ini pada komputer lokal Anda untuk mengunduh semua file di bucket `articles` dan `book-covers`:

```javascript
// Simpan sebagai download_supabase.js
// Jalankan: npm install @supabase/supabase-js fs path
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://anqopdxzdkpsmtxuultp.supabase.co';
const SUPABASE_KEY = 'GANTI_DENGAN_SERVICE_ROLE_KEY_SUPABASE_ANDA'; // Gunakan service role key agar bypass RLS untuk backup
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKETS = ['articles', 'book-covers'];
const OUTPUT_DIR = './downloaded_assets';

async function downloadFile(bucket, filePath) {
  const { data, error } = await supabase.storage.from(bucket).download(filePath);
  if (error) {
    console.error(`Gagal unduh ${filePath}:`, error.message);
    return;
  }
  
  const destPath = path.join(OUTPUT_DIR, bucket, filePath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
  console.log(`Berhasil unduh: ${bucket}/${filePath}`);
}

async function listAndDownload(bucket, folder = '') {
  const { data, error } = await supabase.storage.from(bucket).list(folder);
  if (error) {
    console.error(`Gagal membaca bucket ${bucket}:`, error.message);
    return;
  }

  for (const item of data) {
    const itemPath = folder ? `${folder}/${item.name}` : item.name;
    if (item.id === null) {
      // Jika id null, berarti ini adalah folder, lakukan rekursif
      await listAndDownload(bucket, itemPath);
    } else {
      // Berupa file, lakukan download
      await downloadFile(bucket, itemPath);
    }
  }
}

async function run() {
  console.log('Memulai pencadangan berkas Supabase Storage...');
  for (const bucket of BUCKETS) {
    await listAndDownload(bucket);
  }
  console.log('Pencadangan Selesai! Berkas disimpan di folder ./downloaded_assets/');
}

run();
```

Setelah terunduh ke folder lokal, Anda tinggal mengunggah folder tersebut ke server hosting baru Anda melalui **cPanel File Manager** atau **FTP Client (FileZilla)** ke direktori `/public/uploads/` atau `/api/uploads/`.

