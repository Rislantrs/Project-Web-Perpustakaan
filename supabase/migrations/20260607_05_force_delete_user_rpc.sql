-- Migration: Create function to force delete a user across auth.users, public.admins, public.members, borrows, and queue
-- File: supabase/migrations/20260607_05_force_delete_user_rpc.sql

CREATE OR REPLACE FUNCTION public.force_delete_user_by_email(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user ID by email
  SELECT id INTO target_user_id FROM auth.users WHERE lower(email) = lower(target_email);
  
  IF target_user_id IS NOT NULL THEN
    -- Delete associated records from borrows and queue to prevent foreign key errors
    DELETE FROM public.borrows WHERE "memberId" = target_user_id::text;
    DELETE FROM public.queue WHERE "memberId" = target_user_id::text;
    
    -- Delete from public.admins
    DELETE FROM public.admins WHERE id = target_user_id;
    
    -- Delete from public.members (cast target_user_id to text)
    DELETE FROM public.members WHERE id = target_user_id::text;
    
    -- Delete from auth.users (authentication table)
    DELETE FROM auth.users WHERE id = target_user_id;
  END IF;
END;
$$;
