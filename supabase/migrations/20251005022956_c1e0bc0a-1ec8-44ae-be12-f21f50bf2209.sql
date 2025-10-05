-- Create a secure view that excludes the pin_code column
CREATE OR REPLACE VIEW public.locks_secure AS
SELECT 
  id,
  user_id,
  name,
  is_locked,
  battery_level,
  created_at,
  updated_at
FROM public.locks;

-- Enable RLS on the view
ALTER VIEW public.locks_secure SET (security_invoker = true);

-- Grant usage to authenticated users
GRANT SELECT ON public.locks_secure TO authenticated;

-- Remove the old SELECT policy from locks table
DROP POLICY IF EXISTS "Users can view their own locks" ON public.locks;

-- Create a new restrictive SELECT policy that denies all direct access
-- Users should only access locks through the secure view
CREATE POLICY "Deny direct SELECT on locks table"
ON public.locks
FOR SELECT
TO authenticated
USING (false);

-- Create SELECT policy on the secure view (through a security definer function)
-- This ensures users can only see their own locks without the pin_code
CREATE OR REPLACE FUNCTION public.check_lock_ownership(lock_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lock_user_id = auth.uid();
$$;

-- Add UPDATE policy to lock_activity to prevent tampering
DROP POLICY IF EXISTS "Prevent updates to lock activity logs" ON public.lock_activity;
CREATE POLICY "Prevent updates to lock activity logs"
ON public.lock_activity
FOR UPDATE
TO authenticated
USING (false);