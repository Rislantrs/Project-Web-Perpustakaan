-- ============================================================================
-- RPC FUNCTION TO UPDATE AN ADMIN PASSWORD IN BOTH AUTH.USERS AND PUBLIC.ADMINS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_admin_password(
  target_user_id uuid,
  new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  encrypted_pw text;
BEGIN
  -- 1. Validasi Keamanan: Pastikan hanya Super Admin atau user pemilik akun sendiri yang bisa memanggil fungsi ini
  IF NOT (public.is_super_admin_from_admins() OR auth.uid() = target_user_id) THEN
    RAISE EXCEPTION 'Akses ditolak: Anda tidak memiliki izin untuk mengubah password admin ini.';
  END IF;

  -- 2. Validasi input dasar
  IF new_password IS NULL OR length(new_password) < 6 THEN
    RAISE EXCEPTION 'Password minimal harus 6 karakter.';
  END IF;

  -- 3. Enkripsi password menggunakan crypt dari pgcrypto (Supabase default)
  encrypted_pw := crypt(new_password, gen_salt('bf', 10));

  -- 4. Update data di auth.users (Tabel Kredensial Supabase)
  UPDATE auth.users
  SET encrypted_password = encrypted_pw,
      updated_at = now()
  WHERE id = target_user_id;

  -- 5. Update data di public.admins
  UPDATE public.admins
  SET password_hash = encrypted_pw
  WHERE id = target_user_id;

  RETURN true;
END;
$$;

-- Cabut akses eksekusi dari publik dan berikan hanya untuk authenticated users (admin/member yang sudah login)
REVOKE ALL ON FUNCTION public.update_admin_password(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_admin_password(uuid, text) TO authenticated;
