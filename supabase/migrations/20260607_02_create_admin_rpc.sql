-- ============================================================================
-- RPC FUNCTION TO CREATE A CONFIRMED AUTH USER AND ADMIN RECORD IN ONE ATOMIC OPERATION
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
  
  -- 5. Enkripsi password menggunakan crypt dari pgcrypto (Supabase default)
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
    is_super_admin
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
    false
  );

  -- 7. Sisipkan data ke public.admins
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

-- Cabut akses eksekusi dari publik dan berikan hanya untuk authenticated users (admin yang sudah login)
REVOKE ALL ON FUNCTION public.create_new_admin_user(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_new_admin_user(text, text, text, text, text) TO authenticated;
