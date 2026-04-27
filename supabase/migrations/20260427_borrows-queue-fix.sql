-- ✅ FIX: Row-Level Security for Borrows and Queue tables
-- This fills the gap left by the initial security hardening migration.

-- ================================================================
-- PART 1: BORROWS TABLE (Peminjaman)
-- ================================================================

ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can see own borrows" ON public.borrows;
DROP POLICY IF EXISTS "Admin can manage all borrows" ON public.borrows;

-- ✅ SELECT: Users see own, admins see all
CREATE POLICY "Users can see own borrows"
ON public.borrows
FOR SELECT
USING (
  memberId = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ✅ INSERT: Users can create borrow request, admins can insert any
CREATE POLICY "Users can insert own borrows"
ON public.borrows
FOR INSERT
WITH CHECK (
  memberId = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ✅ UPDATE: ONLY ADMINS can confirm/update borrow status
-- This is where the error "new row violates RLS" was coming from.
CREATE POLICY "Admin can update borrows"
ON public.borrows
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ================================================================
-- PART 2: QUEUE TABLE (Antrian)
-- ================================================================

ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see own queue" ON public.queue;
DROP POLICY IF EXISTS "Public can see queue for books" ON public.queue;
DROP POLICY IF EXISTS "Admin can manage all queue" ON public.queue;

-- ✅ SELECT: Public can see queue list (to see position), but admins see all
CREATE POLICY "Everyone can see queue"
ON public.queue
FOR SELECT
USING (true);

-- ✅ INSERT: Users join queue, admins can manage
CREATE POLICY "Users can join queue"
ON public.queue
FOR INSERT
WITH CHECK (
  memberId = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ✅ UPDATE/DELETE: Users can cancel own queue, admins can manage
CREATE POLICY "Users can cancel own queue"
ON public.queue
FOR UPDATE
USING (
  memberId = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.borrows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queue TO authenticated;
GRANT SELECT ON public.queue TO anon;
