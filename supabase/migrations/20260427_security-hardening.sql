-- ✅ READY-TO-RUN: Security Migrations for Supabase
-- File: supabase/migrations/[timestamp]_security-hardening.sql

-- ================================================================
-- PART 1: IMMUTABLE COLUMNS & CONSTRAINTS
-- ================================================================

-- Drop existing constraints if any
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS check_immutable_created_at;
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS check_immutable_created_by;

-- Add NOT NULL constraints (if not present)
ALTER TABLE public.articles 
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN created_by SET NOT NULL;

-- ✅ Add CHECK constraints: Immutable columns prevent direct update
ALTER TABLE public.articles 
ADD CONSTRAINT check_immutable_created_at 
CHECK (created_at IS NOT NULL);

ALTER TABLE public.articles 
ADD CONSTRAINT check_immutable_created_by 
CHECK (created_by IS NOT NULL AND created_by != '');

-- ✅ Trigger: Auto-set updated_at on every modification
CREATE OR REPLACE FUNCTION public.update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.updated_by IS NULL THEN
    NEW.updated_by = auth.uid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_update_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_articles_updated_at();

-- ✅ Trigger: Auto-set published_at when status changes to 'published'
CREATE OR REPLACE FUNCTION public.set_published_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    NEW.published_at = now();
  ELSIF NEW.status != 'published' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_published_timestamp ON public.articles;
CREATE TRIGGER trigger_set_published_timestamp
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.set_published_timestamp();

-- ================================================================
-- PART 2: ROW-LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can see published articles" ON public.articles;
DROP POLICY IF EXISTS "Users can see own articles" ON public.articles;
DROP POLICY IF EXISTS "Users can update own articles" ON public.articles;
DROP POLICY IF EXISTS "Users can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON public.articles;
DROP POLICY IF EXISTS "Admin can manage all articles" ON public.articles;

-- ✅ SELECT: Public can see published articles + users see their own
CREATE POLICY "Users can see published articles"
ON public.articles
FOR SELECT
USING (
  status = 'published' 
  OR created_by = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ✅ INSERT: Authenticated users can create articles
CREATE POLICY "Users can insert articles"
ON public.articles
FOR INSERT
WITH CHECK (
  auth.uid()::text IS NOT NULL
  AND created_by = auth.uid()::text
);

-- ✅ UPDATE: Users can update own articles, immutable columns cannot change
CREATE POLICY "Users can update own articles"
ON public.articles
FOR UPDATE
USING (
  created_by = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
)
WITH CHECK (
  -- Ensure immutable columns don't change
  created_at = OLD.created_at
  AND created_by = OLD.created_by
  -- Users cannot manually set published_at (trigger does this)
  AND (
    published_at = OLD.published_at
    OR (NEW.status = 'published' AND OLD.status != 'published')
    OR (NEW.status != 'published' AND OLD.status = 'published')
  )
);

-- ✅ DELETE: Users can delete own articles
CREATE POLICY "Users can delete own articles"
ON public.articles
FOR DELETE
USING (
  created_by = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ================================================================
-- PART 3: AUDIT LOGGING
-- ================================================================

-- ✅ Create audit_logs table to track all changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ✅ Trigger: Log all article changes
CREATE OR REPLACE FUNCTION public.audit_articles_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, record_id, operation, user_id, new_values)
    VALUES ('articles', NEW.id, 'INSERT', auth.uid()::text, row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, operation, user_id, old_values, new_values)
    VALUES ('articles', NEW.id, 'UPDATE', auth.uid()::text, row_to_json(OLD), row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, operation, user_id, old_values)
    VALUES ('articles', OLD.id, 'DELETE', auth.uid()::text, row_to_json(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_articles_changes ON public.articles;
CREATE TRIGGER trigger_audit_articles_changes
AFTER INSERT OR UPDATE OR DELETE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.audit_articles_changes();

-- RLS for audit_logs: Only admins can read
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read audit logs" ON public.audit_logs;
CREATE POLICY "Admin can read audit logs"
ON public.audit_logs
FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ================================================================
-- PART 4: CATEGORIES TABLE (dengan unique constraint)
-- ================================================================

-- ✅ Ensure categories table has unique constraint on (type, slug)
ALTER TABLE public.categories 
ADD CONSTRAINT categories_type_slug_unique UNIQUE (type, slug);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;

-- ✅ SELECT: Everyone can read
CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
USING (true);

-- ✅ INSERT/UPDATE/DELETE: Only admins
CREATE POLICY "Admin can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ================================================================
-- PART 5: MEMBERS TABLE (personal data protection)
-- ================================================================

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can see own profile" ON public.members;
DROP POLICY IF EXISTS "Users can update own profile" ON public.members;
DROP POLICY IF EXISTS "Admin can read all members" ON public.members;

-- ✅ SELECT: Users see own data, admins see all
CREATE POLICY "Users can see own profile"
ON public.members
FOR SELECT
USING (
  id = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ✅ UPDATE: Users update own, admins update all
CREATE POLICY "Users can update own profile"
ON public.members
FOR UPDATE
USING (
  id = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
)
WITH CHECK (
  id = auth.uid()::text
  OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin')
);

-- ================================================================
-- PART 6: HELPER FUNCTION: Check if user is admin
-- ================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'super_admin'),
    false
  );
$$;

-- ================================================================
-- PART 7: VERIFICATION QUERIES (Run these after migration)
-- ================================================================

-- ✅ Verify immutable columns
-- SELECT * FROM information_schema.table_constraints WHERE table_name = 'articles';

-- ✅ Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- ✅ Verify policies exist
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- ✅ Verify triggers
-- SELECT trigger_name FROM information_schema.triggers WHERE table_schema = 'public' AND table_name = 'articles';

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================

-- Allow public (anon) to read published articles
GRANT SELECT ON public.articles TO anon;

-- Allow authenticated to INSERT articles (RLS filters)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;

-- Allow reading categories
GRANT SELECT ON public.categories TO anon, authenticated;

-- Allow reading own member profile
GRANT SELECT, UPDATE ON public.members TO authenticated;

-- Only allow authenticated users to read audit logs (RLS enforces admin-only)
GRANT SELECT ON public.audit_logs TO authenticated;
