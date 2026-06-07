-- Migration: Add extensions to search_path in admin RPCs
-- File: supabase/migrations/20260607_07_fix_search_path_extensions.sql

-- 1. Redefine create_new_admin_user with extensions in search_path
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
  -- Validasi keamanan
  IF NOT public.is_super_admin_from_admins() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Super Admin yang dapat membuat admin baru.';
  END IF;

  -- Validasi input dasar
  IF admin_email IS NULL OR admin_email = '' THEN
    RAISE EXCEPTION 'Email tidak boleh kosong.';
  END IF;
  IF admin_password IS NULL OR length(admin_password) < 6 THEN
    RAISE EXCEPTION 'Password minimal harus 6 karakter.';
  END IF;

  -- Cek apakah email sudah ada di tabel public.admins
  IF EXISTS (SELECT 1 FROM public.admins WHERE lower(email) = lower(admin_email)) THEN
    RAISE EXCEPTION 'Email admin sudah terdaftar di database.';
  END IF;

  -- Generate UUID baru untuk User
  new_user_id := gen_random_uuid();
  
  -- Enkripsi password menggunakan crypt dari pgcrypto
  encrypted_pw := crypt(admin_password, gen_salt('bf', 10));

  -- Sisipkan data ke auth.users
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
    now(), -- Auto-Confirm
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

  -- Sisipkan data ke auth.identities (Mencegah error 500 di GoTrue/Supabase Auth)
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

  -- Sisipkan data ke public.admins
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

-- 2. Redefine update_admin_password with extensions in search_path
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

  -- Enkripsi password
  encrypted_pw := crypt(new_password, gen_salt('bf', 10));

  -- Update data di auth.users
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

-- Permissions
REVOKE ALL ON FUNCTION public.create_new_admin_user(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_new_admin_user(text, text, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.update_admin_password(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_admin_password(uuid, text) TO authenticated;
