/**
 * ============================================================================
 * CONSOLIDATED SCHEMAS & POLICIES FOR SUPABASE - PART 2: FUNCTIONS & TRIGGERS
 * File: supabase/migrations/20260530_02_consolidated_triggers.sql
 * ============================================================================
 */

BEGIN;

-- ============================================================================
-- FUNCTIONS FOR TRIGGERS
-- ============================================================================

-- Function: Auto-set updated_at & updated_by
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

-- Function: Auto-set published_at when status changes to 'published'
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

-- Function: Audit articles changes
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

-- ============================================================================
-- TRIGGERS CREATION (Safe against missing tables)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_articles_updated_at ON public.articles';
    EXECUTE 'CREATE TRIGGER trigger_update_articles_updated_at
      BEFORE UPDATE ON public.articles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_articles_updated_at()';

    EXECUTE 'DROP TRIGGER IF EXISTS trigger_set_published_timestamp ON public.articles';
    EXECUTE 'CREATE TRIGGER trigger_set_published_timestamp
      BEFORE UPDATE ON public.articles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_published_timestamp()';

    EXECUTE 'DROP TRIGGER IF EXISTS trigger_audit_articles_changes ON public.articles';
    EXECUTE 'CREATE TRIGGER trigger_audit_articles_changes
      AFTER INSERT OR UPDATE OR DELETE ON public.articles
      FOR EACH ROW
      EXECUTE FUNCTION public.audit_articles_changes()';
  END IF;
END $$;

COMMIT;
