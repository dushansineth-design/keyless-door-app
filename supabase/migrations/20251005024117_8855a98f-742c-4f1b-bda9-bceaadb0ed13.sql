-- CRITICAL SECURITY FIX: Prevent PIN code exposure through SELECT queries
-- Even hashed PINs should never be accessible to prevent offline brute-force attacks

-- Step 1: Drop the problematic SELECT policy that exposes pin_code
DROP POLICY IF EXISTS "Users can SELECT their own locks for view access" ON public.locks;

-- Step 2: Create a security definer function that returns locks WITHOUT pin_code
-- This function runs with elevated privileges and safely filters out sensitive data
CREATE OR REPLACE FUNCTION public.get_user_locks()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  is_locked boolean,
  battery_level integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    user_id,
    name,
    is_locked,
    battery_level,
    created_at,
    updated_at
  FROM public.locks
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
$$;

-- Step 3: Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_locks() TO authenticated;

-- Step 4: Update locks_secure view to use the security definer function
DROP VIEW IF EXISTS public.locks_secure;
CREATE VIEW public.locks_secure 
WITH (security_invoker = false)
AS
  SELECT * FROM public.get_user_locks();

-- Step 5: Grant SELECT on the view to authenticated users
GRANT SELECT ON public.locks_secure TO authenticated;

-- Step 6: Add explanatory comment
COMMENT ON VIEW public.locks_secure IS 'Secure view that excludes pin_code column. Uses security definer function to prevent any direct access to sensitive PIN data.';
COMMENT ON FUNCTION public.get_user_locks() IS 'Security definer function that safely returns lock data without exposing pin_code column, even in hashed form.';