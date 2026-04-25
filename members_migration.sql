-- Non-destructive migration for member directory sync
-- Run this in Supabase SQL Editor (safe to rerun)

CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    nomor_anggota TEXT,
    nama_lengkap TEXT,
    nik_masked TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    alamat TEXT,
    telepon TEXT,
    jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')),
    tanggal_lahir TEXT,
    tanggal_daftar TEXT,
    avatar_color TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read members" ON public.members;
DROP POLICY IF EXISTS "Admin can manage members" ON public.members;
DROP POLICY IF EXISTS "Member can read own profile" ON public.members;
DROP POLICY IF EXISTS "Member can update own profile" ON public.members;

CREATE POLICY "Public can read members"
ON public.members
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage members"
ON public.members
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Member can read own profile"
ON public.members
FOR SELECT
TO authenticated
USING (id = auth.uid()::text);

CREATE POLICY "Member can update own profile"
ON public.members
FOR UPDATE
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.sync_member_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meta jsonb;
  v_email text;
  v_name text;
  v_nik_masked text;
  v_tel text;
  v_alamat text;
  v_jk text;
  v_lahir text;
  v_tanggal text;
BEGIN
  v_meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_email := lower(COALESCE(NEW.email, ''));
  v_name := COALESCE(v_meta ->> 'namaLengkap', split_part(v_email, '@', 1));
  v_nik_masked := COALESCE(v_meta ->> 'nik_masked', v_meta ->> 'nik', '************');
  v_tel := regexp_replace(COALESCE(v_meta ->> 'telepon', ''), '[^0-9]', '', 'g');
  v_alamat := COALESCE(v_meta ->> 'alamat', '');
  v_jk := CASE WHEN (v_meta ->> 'jenisKelamin') IN ('L', 'P') THEN (v_meta ->> 'jenisKelamin') ELSE 'L' END;
  v_lahir := COALESCE(v_meta ->> 'tanggalLahir', '');
  v_tanggal := to_char(COALESCE(NEW.created_at, now()), 'DD FMMonth YYYY');

  INSERT INTO public.members (
    id,
    nomor_anggota,
    nama_lengkap,
    nik_masked,
    email,
    password,
    alamat,
    telepon,
    jenis_kelamin,
    tanggal_lahir,
    tanggal_daftar,
    avatar_color,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id::text,
    CONCAT('PWK-', EXTRACT(YEAR FROM now())::int, '-', lpad((floor(random() * 9000) + 1000)::text, 4, '0')),
    v_name,
    v_nik_masked,
    v_email,
    'managed-by-supabase-auth',
    v_alamat,
    v_tel,
    v_jk,
    v_lahir,
    v_tanggal,
    '#0c2f3d',
    true,
    COALESCE(NEW.created_at, now()),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nama_lengkap = COALESCE(NULLIF(EXCLUDED.nama_lengkap, ''), public.members.nama_lengkap),
    nik_masked = COALESCE(NULLIF(EXCLUDED.nik_masked, ''), public.members.nik_masked),
    alamat = COALESCE(NULLIF(EXCLUDED.alamat, ''), public.members.alamat),
    telepon = COALESCE(NULLIF(EXCLUDED.telepon, ''), public.members.telepon),
    jenis_kelamin = COALESCE(NULLIF(EXCLUDED.jenis_kelamin, ''), public.members.jenis_kelamin),
    tanggal_lahir = COALESCE(NULLIF(EXCLUDED.tanggal_lahir, ''), public.members.tanggal_lahir),
    is_active = true,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_member_from_auth ON auth.users;
CREATE TRIGGER trg_sync_member_from_auth
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_member_from_auth();

INSERT INTO public.members (
  id,
  nomor_anggota,
  nama_lengkap,
  nik_masked,
  email,
  password,
  alamat,
  telepon,
  jenis_kelamin,
  tanggal_lahir,
  tanggal_daftar,
  avatar_color,
  is_active,
  created_at,
  updated_at
)
SELECT
  u.id::text,
  CONCAT('PWK-', EXTRACT(YEAR FROM COALESCE(u.created_at, now()))::int, '-', lpad((floor(random() * 9000) + 1000)::text, 4, '0')),
  COALESCE(u.raw_user_meta_data ->> 'namaLengkap', split_part(lower(COALESCE(u.email, '')), '@', 1)),
  COALESCE(u.raw_user_meta_data ->> 'nik_masked', u.raw_user_meta_data ->> 'nik', '************'),
  lower(COALESCE(u.email, '')),
  'managed-by-supabase-auth',
  COALESCE(u.raw_user_meta_data ->> 'alamat', ''),
  regexp_replace(COALESCE(u.raw_user_meta_data ->> 'telepon', ''), '[^0-9]', '', 'g'),
  CASE WHEN (u.raw_user_meta_data ->> 'jenisKelamin') IN ('L', 'P') THEN (u.raw_user_meta_data ->> 'jenisKelamin') ELSE 'L' END,
  COALESCE(u.raw_user_meta_data ->> 'tanggalLahir', ''),
  to_char(COALESCE(u.created_at, now()), 'DD FMMonth YYYY'),
  '#0c2f3d',
  true,
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE members;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
