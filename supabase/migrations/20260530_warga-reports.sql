BEGIN;

CREATE TABLE IF NOT EXISTS public.warga_reports (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  telepon TEXT NOT NULL,
  kategori TEXT NOT NULL,
  pesan TEXT NOT NULL,
  alamat TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Baru',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warga_reports_created_at
  ON public.warga_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_warga_reports_status
  ON public.warga_reports (status);

ALTER TABLE public.warga_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "warga_reports_public_insert" ON public.warga_reports;
CREATE POLICY "warga_reports_public_insert"
ON public.warga_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(nama)) > 0
  AND char_length(trim(email)) > 0
  AND char_length(trim(telepon)) > 0
  AND char_length(trim(kategori)) > 0
  AND char_length(trim(pesan)) > 0
  AND char_length(trim(alamat)) > 0
);

DROP POLICY IF EXISTS "warga_reports_admin_read" ON public.warga_reports;
CREATE POLICY "warga_reports_admin_read"
ON public.warga_reports
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "warga_reports_admin_update" ON public.warga_reports;
CREATE POLICY "warga_reports_admin_update"
ON public.warga_reports
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "warga_reports_admin_delete" ON public.warga_reports;
CREATE POLICY "warga_reports_admin_delete"
ON public.warga_reports
FOR DELETE
TO authenticated
USING (public.is_admin());

COMMIT;