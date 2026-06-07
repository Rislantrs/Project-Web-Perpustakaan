-- Migration to add increment_article_views RPC function
-- File: supabase/migrations/20260607_01_increment_views_rpc.sql

CREATE OR REPLACE FUNCTION public.increment_article_views(article_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.articles
  SET views = COALESCE(views, 0) + 1
  WHERE id = article_id;
END;
$$;

-- Revoke all permissions first, then grant to anon and authenticated
REVOKE ALL ON FUNCTION public.increment_article_views(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_article_views(TEXT) TO anon, authenticated;
