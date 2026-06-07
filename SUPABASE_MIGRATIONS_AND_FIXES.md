# 🛠️ Supabase Database Migrations & Auth Fixes
### Dokumentasi Perbaikan Autentikasi Admin & Sinkronisasi Member

Dokumen ini berisi kumpulan query SQL yang wajib dijalankan di **SQL Editor Supabase** untuk memastikan sistem autentikasi, manajemen admin, dan pembersihan akun berjalan sempurna pada server produksi/hosting.

---

## 📂 Daftar Isi
1. [Trigger: Hapus Otomatis Auth User (`trigger_handle_member_deleted`)](#1-trigger-hapus-otomatis-auth-user-trigger_handle_member_deleted)
2. [RPC: Hapus Bersih User Berdasarkan Email (`force_delete_user_by_email`)](#2-rpc-hapus-bersih-user-berdasarkan-email-force_delete_user_by_email)
3. [RPC: Pembuat Akun Admin Baru (`create_new_admin_user`)](#3-rpc-pembuat-akun-admin-baru-create_new_admin_user)
4. [RPC: Pembaru Sandi Admin (`update_admin_password`)](#4-rpc-pembaru-sandi-admin-update_admin_password)
5. [Logika & Cara Kerja Perbaikan System](#5-logika--cara-kerja-perbaikan-system)

---

## 1. Trigger: Hapus Otomatis Auth User (`trigger_handle_member_deleted`)
**Fungsi:** Menghapus data autentikasi di `auth.users` secara otomatis saat admin menghapus anggota dari menu *Manajemen Member* (`public.members`). Ini mencegah adanya akun "mengambang" yang membuat email tersebut tidak bisa didaftarkan kembali.

```sql
CREATE OR REPLACE FUNCTION public.handle_member_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- Menghapus user dari auth.users secara otomatis
  DELETE FROM auth.users WHERE id = OLD.id::uuid;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger ke tabel public.members
DROP TRIGGER IF EXISTS trigger_handle_member_deleted ON public.members;
CREATE TRIGGER trigger_handle_member_deleted
  AFTER DELETE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_member_deleted();
```

---

## 2. RPC: Hapus Bersih User Berdasarkan Email (`force_delete_user_by_email`)
**Fungsi:** Perintah pembersihan darurat untuk menghapus seluruh data user (Admin, Member, Transaksi Pinjam, Antrian, dan Autentikasi Auth) hanya menggunakan email. Sangat berguna jika ada email yang tersangkut karena kesalahan skema sebelumnya.

```sql
CREATE OR REPLACE FUNCTION public.force_delete_user_by_email(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Dapatkan ID user berdasarkan email
  SELECT id INTO target_user_id FROM auth.users WHERE lower(email) = lower(target_email);
  
  IF target_user_id IS NOT NULL THEN
    -- Hapus dari borrows & queue
    DELETE FROM public.borrows WHERE "memberId" = target_user_id::text;
    DELETE FROM public.queue WHERE "memberId" = target_user_id::text;
    
    -- Hapus dari public.admins
    DELETE FROM public.admins WHERE id = target_user_id;
    
    -- Hapus dari public.members (dengan typecast ::text)
    DELETE FROM public.members WHERE id = target_user_id::text;
    
    -- Hapus dari auth.users
    DELETE FROM auth.users WHERE id = target_user_id;
  END IF;
END;
$$;
```

**Cara Penggunaan di SQL Editor:**
```sql
SELECT public.force_delete_user_by_email('email_yang_bermasalah@gmail.com');
```

---

## 3. RPC: Pembuat Akun Admin Baru (`create_new_admin_user`)
**Fungsi:** Membuat akun admin baru secara instan langsung terkonfirmasi (Auto-Confirm). 
* **Pembaruan Penting:** Fungsi ini sekarang menyisipkan data ke tabel **`auth.identities`** agar mesin autentikasi Supabase (GoTrue) tidak mengalami *Error 500 (Internal Server Error)* saat login.
* **Perbaikan Search Path:** Menambahkan skema `extensions` pada `search_path` agar PostgreSQL dapat menemukan fungsi enkripsi `gen_salt` dan `crypt`.

```sql
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
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id uuid;
  encrypted_pw text;
BEGIN
  -- 1. Validasi keamanan: Pastikan hanya Super Admin yang bisa memanggil fungsi ini
  IF NOT public.is_super_admin_from_admins() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Super Admin yang dapat membuat admin baru.';
  END IF;

  -- 2. Validasi input dasar
  IF admin_email IS NULL OR admin_email = '' THEN
    RAISE EXCEPTION 'Email tidak boleh kosong.';
  END IF;
  IF admin_password IS NULL OR length(admin_password) < 6 THEN
    RAISE EXCEPTION 'Password minimal harus 6 karakter.';
  END IF;

  -- 3. Cek apakah email sudah ada di tabel public.admins
  IF EXISTS (SELECT 1 FROM public.admins WHERE lower(email) = lower(admin_email)) THEN
    RAISE EXCEPTION 'Email admin sudah terdaftar di database.';
  END IF;

  -- 4. Generate UUID baru untuk User
  new_user_id := gen_random_uuid();
  
  -- 5. Enkripsi password menggunakan crypt dari pgcrypto
  encrypted_pw := crypt(admin_password, gen_salt('bf', 10));

  -- 6. Sisipkan data ke auth.users (Tabel Kredensial Supabase)
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_super_admin,
    phone,
    phone_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    is_anonymous
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    lower(admin_email),
    encrypted_pw,
    now(), -- Mengatur email langsung terkonfirmasi (Auto-Confirm)
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('namaLengkap', admin_name),
    now(),
    now(),
    false,
    NULL,
    NULL,
    '',
    '',
    '',
    '',
    false
  );

  -- 7. Sisipkan data ke auth.identities (Mencegah error 500 di GoTrue/Supabase Auth)
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,         -- id (uuid)
    new_user_id::text,   -- provider_id (text)
    new_user_id,         -- user_id (uuid)
    jsonb_build_object('sub', new_user_id::text, 'email', lower(admin_email), 'email_verified', true, 'email_verified_at', now()),
    'email',
    now(),
    now(),
    now()
  );

  -- 8. Sisipkan data ke public.admins
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

-- Cabut akses eksekusi dari publik dan berikan hanya untuk authenticated users
REVOKE ALL ON FUNCTION public.create_new_admin_user(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_new_admin_user(text, text, text, text, text) TO authenticated;
```

---

## 4. RPC: Pembaru Sandi Admin (`update_admin_password`)
**Fungsi:** Mengubah password admin secara terenkripsi baik di tabel profil `public.admins` maupun kredensial login utama `auth.users`. Menggunakan skema pencarian `extensions` agar fungsi hashing dapat terbaca.

```sql
CREATE OR REPLACE FUNCTION public.update_admin_password(
  target_user_id uuid,
  new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  encrypted_pw text;
BEGIN
  -- Validasi Keamanan
  IF NOT (public.is_super_admin_from_admins() OR auth.uid() = target_user_id) THEN
    RAISE EXCEPTION 'Akses ditolak: Anda tidak memiliki izin untuk mengubah password admin ini.';
  END IF;

  -- Validasi input dasar
  IF new_password IS NULL OR length(new_password) < 6 THEN
    RAISE EXCEPTION 'Password minimal harus 6 karakter.';
  END IF;

  -- Enkripsi password menggunakan crypt dari pgcrypto
  encrypted_pw := crypt(new_password, gen_salt('bf', 10));

  -- Update data di auth.users (Tabel Kredensial Supabase)
  UPDATE auth.users
  SET encrypted_password = encrypted_pw,
      updated_at = now()
  WHERE id = target_user_id;

  -- Update data di public.admins
  UPDATE public.admins
  SET password_hash = encrypted_pw
  WHERE id = target_user_id;

  RETURN true;
END;
$$;

-- Cabut akses eksekusi dari publik dan berikan hanya untuk authenticated users
REVOKE ALL ON FUNCTION public.update_admin_password(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_admin_password(uuid, text) TO authenticated;
```

---

## 5. Logika & Cara Kerja Perbaikan System

### A. Strict Mode Rendering (`AuthCallback.tsx`)
React 18 dalam mode pengembangan/ Strict Mode memicu fungsi `useEffect` sebanyak dua kali secara beruntun. Hal ini menyebabkan kode penukaran token Google OAuth (`exchangeCodeForSession`) dijalankan dua kali, di mana pemanggilan kedua selalu gagal dengan error *"Link kedaluwarsa"* karena token sudah dipakai oleh pemanggilan pertama.

**Solusi:** File `AuthCallback.tsx` sekarang mengecek sesi aktif (`supabase.auth.getSession()`) terlebih dahulu sebelum melakukan penukaran token. Jika sesi aktif sudah dideteksi (dari render pertama), render kedua akan langsung mendeteksi status sukses dan mengalihkan pengguna ke halaman utama.

### B. Sinkronisasi Skema `auth.identities`
GoTrue memerlukan referensi relasi yang valid antara `auth.users` dan `auth.identities` untuk mencatat identitas unik penyedia login (provider). Jika data identitas kosong, Supabase akan mengembalikan status *500 Internal Server Error* ketika user tersebut mencoba untuk login kembali.

**Solusi:** RPC pembuatan admin sekarang otomatis mendaftarkan UUID pengguna ke dalam tabel `auth.identities` menggunakan provider `'email'` secara instan dan aman.
