-- Migration: Delete user from auth.users when corresponding member is deleted from public.members
-- File: supabase/migrations/20260607_04_delete_auth_user_trigger.sql

CREATE OR REPLACE FUNCTION public.handle_member_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete user from auth.users where ID matches the deleted member ID
  DELETE FROM auth.users WHERE id = OLD.id::uuid;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on public.members
DROP TRIGGER IF EXISTS trigger_handle_member_deleted ON public.members;
CREATE TRIGGER trigger_handle_member_deleted
  AFTER DELETE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_member_deleted();
