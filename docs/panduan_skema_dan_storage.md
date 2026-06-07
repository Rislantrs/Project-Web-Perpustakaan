# 📑 Panduan Arsitektur Skema SQL & Manajemen Storage Bucket

Panduan ini disusun untuk memberikan kejelasan mengenai struktur pemisahan database SQL pada proyek Anda, cara mengambil bagian skema tertentu saja (seperti sistem login, admin, atau bucket), serta rekomendasi kode dinamis untuk penyimpanan file (Storage) agar tidak tertulis secara kaku (*hardcoded*).

---

## 📋 DAFTAR ISI
1. [Bagian 1: Pemisahan Skema SQL per Fitur](#1-bagian-1-pemisahan-skema-sql-per-fitur)
2. [Bagian 2: Ekstraksi Skema Minimalis (Hanya Auth, Admin, atau Bucket)](#2-bagian-2-ekstraksi-skema-minimalis-hanya-auth-admin-atau-bucket)
3. [Bagian 3: Rekomendasi Kode Dynamic Storage Bucket (Bebas Hardcoding)](#3-bagian-3-rekomendasi-kode-dynamic-storage-bucket-bebas-hardcoding)

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

### C. Jika Hanya Butuh Penyiapan Storage Bucket
Supabase menggunakan skema internal `storage.buckets` dan `storage.objects`. Anda tidak perlu membuat tabel secara manual di SQL Editor, cukup jalankan perintah ini di SQL Editor untuk membuat Bucket secara otomatis:

```sql
-- Membuat bucket untuk sampul buku & gambar artikel jika belum ada
INSERT INTO storage.buckets (id, name, public) 
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;
```

*Jangan lupa mengonfigurasi kebijakan RLS pada dashboard Supabase -> Storage -> Policies agar publik diizinkan membaca file (`SELECT`) dan admin diizinkan mengunggah file (`INSERT/UPDATE`).*

---

## 3. Rekomendasi Kode Dynamic Storage Bucket (Bebas Hardcoding)

Pada file bawaan [storageService.ts](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/services/storageService.ts), nama bucket default diatur secara statis:
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

### B. Solusi Upload Gambar jika Migrasi ke Hosting Sendiri (Non-Supabase)

Apabila Anda tidak lagi menggunakan Supabase dan ingin menyimpan file gambar langsung di folder web server Anda sendiri secara dinamis tanpa hardcode URL domain:

#### 1) Di Sisi Backend PHP (Contoh: `upload.php`):
Jangan menuliskan alamat URL domain website secara kaku di PHP. Gunakan global variable server PHP agar URL bersifat dinamis mengikuti domain tempat ia di-deploy:

```php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = uniqid() . '.' . $ext;
    
    // Folder penyimpanan di server hosting
    $upload_dir = 'uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    $target_file = $upload_dir . $new_filename;
    
    if (move_uploaded_file($file['tmp_name'], $target_file)) {
        // AMBIL DOMAIN SECARA DINAMIS (Anti Hardcoding URL)
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        $public_url = $protocol . $host . '/' . $target_file;
        
        echo json_encode([
            "success" => true,
            "url" => $public_url
        ]);
        exit();
    }
}

echo json_encode(["success" => false, "message" => "Gagal mengunggah berkas."]);
```

#### 2) Di Sisi Frontend React:
Cukup ubah endpoint target upload di `storageService.ts` untuk mengarah ke API kustom Anda:

```typescript
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload.php`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Gagal upload gambar');
  }

  // Mengembalikan URL publik gambar dinamis dari server Anda
  return result.url; 
};
```
Dengan menerapkan langkah-langkah di atas, baik skema basis data maupun penanganan penyimpanan berkas Anda akan terbebas dari keterikatan kaku (*loose coupling*), aman, dan sangat mudah untuk dimigrasikan ke platform hosting mana pun.
