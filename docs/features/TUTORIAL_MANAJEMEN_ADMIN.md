# 🛡️ Panduan Manajemen Admin & Verifikasi Akun Supabase

Panduan ini menjelaskan dua opsi untuk mengelola pembuatan akun admin baru di sistem perpustakaan Anda, lengkap dengan tutorial langkah demi langkah cara menerapkannya di Supabase.

---

## 📋 PILIHAN METODE VERIFIKASI

Anda dapat memilih salah satu dari dua metode di bawah ini untuk pendaftaran admin baru:

### 🌟 OPSI A: Auto-Confirm (Bisa Email Bebas/Bohongan) — *Sangat Direkomendasikan*
* **Cara Kerja**: Admin baru didaftarkan melalui fungsi khusus (*RPC*) di database yang secara otomatis menandai email langsung berstatus **terkonfirmasi** (`email_confirmed_at = now()`).
* **Kelebihan**: 
  - Tidak perlu email asli. Anda bebas memakai email dummy/bohongan (contoh: `adminbaru@test.com`).
  - Akun langsung aktif seketika setelah tombol simpan diklik tanpa perlu memverifikasi apa pun.
* **Persyaratan**: Anda harus menyalin dan menjalankan SQL script di bawah ini ke dalam **SQL Editor Supabase**.

### ✉️ OPSI B: Verifikasi Email Asli (Default)
* **Cara Kerja**: Menggunakan alur standar pendaftaran client-side Supabase Auth.
* **Kekurangan**:
  - Wajib menggunakan **email asli** yang aktif.
  - Akun admin baru tidak akan bisa login sebelum pemilik email membuka kotak masuknya dan mengklik link konfirmasi yang dikirimkan oleh Supabase.
* **Persyaratan**: Tidak perlu menjalankan SQL script apa pun, cukup biarkan sistem menggunakan alur fallback bawaan.

---

## 🛠️ TUTORIAL MENERAPKAN OPSI A (AUTO-CONFIRM)

Ikuti langkah-langkah berikut untuk memasang fungsi Auto-Confirm di database Supabase Anda:

### Langkah 1: Salin SQL Script di Bawah Ini

```sql
-- ============================================================================
-- SQL RPC MIGRATION: PEMBUATAN AKUN ADMIN AUTO-CONFIRM (EMAIL BEBAS/BOHONGAN)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_new_admin_user(
  admin_email text,
  admin_password text,
  admin_name text,
  admin_role text,
  avatar_col text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_user_id uuid;
  encrypted_pw text;
BEGIN
  -- 1. VALIDASI KEAMANAN
  -- Pastikan hanya akun yang ber-role 'super_admin' di database yang boleh memanggil fungsi ini
  IF NOT public.is_super_admin_from_admins() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Super Admin yang dapat membuat admin baru.';
  END IF;

  -- 2. VALIDASI INPUT DATA
  IF admin_email IS NULL OR admin_email = '' THEN
    RAISE EXCEPTION 'Email tidak boleh kosong.';
  END IF;
  IF admin_password IS NULL OR length(admin_password) < 6 THEN
    RAISE EXCEPTION 'Password minimal harus 6 karakter.';
  END IF;

  -- 3. CEK DUPLIKASI
  IF EXISTS (SELECT 1 FROM public.admins WHERE lower(email) = lower(admin_email)) THEN
    RAISE EXCEPTION 'Email admin sudah terdaftar di database.';
  END IF;

  -- 4. ALOKASI UUID BARU
  new_user_id := gen_random_uuid();
  
  -- 5. HASHING PASSWORD
  -- Menggunakan ekstensi pgcrypto bawaan postgres untuk enkripsi password aman (Blowfish)
  encrypted_pw := crypt(admin_password, gen_salt('bf', 10));

  -- 6. MASUKKAN DATA KE AUTH.USERS (Supabase Identity)
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at, -- BAGIAN PENTING: Mengatur tanggal konfirmasi langsung sekarang (Auto-Confirm)
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_super_admin
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    lower(admin_email),
    encrypted_pw,
    now(), -- Email langsung aktif seketika!
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('namaLengkap', admin_name),
    now(),
    now(),
    false
  );

  -- 7. MASUKKAN DATA KE PUBLIC.ADMINS (Profil Dashboard Aplikasi)
  INSERT INTO public.admins (
    id,
    nama_lengkap,
    email,
    password_hash,
    role,
    tanggal_dibuat,
    avatar_color
  ) VALUES (
    new_user_id,
    admin_name,
    lower(admin_email),
    encrypted_pw,
    admin_role,
    -- Format tanggal bahasa Indonesia otomatis: "7 Juni 2026"
    (
      EXTRACT(DAY FROM now())::text || ' ' ||
      CASE EXTRACT(MONTH FROM now())::int
        WHEN 1 THEN 'Januari' WHEN 2 THEN 'Februari' WHEN 3 THEN 'Maret'
        WHEN 4 THEN 'April' WHEN 5 THEN 'Mei' WHEN 6 THEN 'Juni'
        WHEN 7 THEN 'Juli' WHEN 8 THEN 'Agustus' WHEN 9 THEN 'September'
        WHEN 10 THEN 'Oktober' WHEN 11 THEN 'November' WHEN 12 THEN 'Desember'
      END || ' ' ||
      EXTRACT(YEAR FROM now())::text
    ),
    avatar_col
  );

  RETURN new_user_id;
END;
$$;

-- 8. PENGATURAN HAK AKSES FUNGSI (Untuk keamanan ketat)
-- Cabut akses eksekusi dari publik anonim
REVOKE ALL ON FUNCTION public.create_new_admin_user(text, text, text, text, text) FROM PUBLIC;
-- Berikan izin akses eksekusi hanya kepada user terautentikasi (Super Admin yang login)
GRANT EXECUTE ON FUNCTION public.create_new_admin_user(text, text, text, text, text) TO authenticated;
```

### Langkah 2: Jalankan Script di Supabase

1. Buka browser Anda dan login ke **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Pilih proyek database perpustakaan Anda.
3. Di bilah menu sisi kiri, klik ikon **SQL Editor** (ikon berbentuk lembaran kode).
4. Klik **New query** di sudut kiri atas untuk membuka tab editor kosong.
5. Tempel (*paste*) kode SQL yang sudah Anda salin di atas ke dalam editor tersebut.
6. Klik tombol **Run** (atau tekan tombol `Ctrl + Enter` / `Cmd + Enter`).
7. Pastikan muncul pesan sukses **"Success. No rows returned."** di panel hasil bawah.

---

## 🔍 TIPS & PENYELESAIAN MASALAH (TROUBLESHOOTING)

* **Saya mendapat error fungsi tidak ditemukan saat membuat admin baru**:
  Pastikan Anda telah menjalankan SQL script di atas di database Supabase Anda. Jika belum dideploy di Supabase, aplikasi web akan menggunakan metode fallback (Opsi B) yang membutuhkan email asli dan konfirmasi email secara manual.
* **Saya ingin mematikan konfirmasi email secara global di Supabase**:
  Anda juga dapat mematikan verifikasi email untuk seluruh pengguna (termasuk pendaftaran member) dengan masuk ke dashboard Supabase -> **Authentication** -> **Providers** -> **Email** -> Matikan sakelar **"Confirm email"** -> klik **Save**.
