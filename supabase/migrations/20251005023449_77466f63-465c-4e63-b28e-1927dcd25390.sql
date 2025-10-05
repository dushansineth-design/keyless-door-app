-- Fix the locks_secure view access issue
-- The view needs the underlying locks table to allow SELECT for owned rows
-- but we use GRANT/REVOKE to control direct access

-- Step 1: Drop the overly restrictive SELECT policy
DROP POLICY IF EXISTS "Deny direct SELECT on locks table" ON public.locks;

-- Step 2: Add a proper SELECT policy that allows users to see their own locks
-- This is needed for the locks_secure view to function with security_invoker = true
CREATE POLICY "Users can SELECT their own locks for view access"
ON public.locks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 3: Revoke direct table access and grant only view access
-- This ensures users can ONLY access locks through the secure view
REVOKE SELECT ON public.locks FROM authenticated;
GRANT SELECT ON public.locks_secure TO authenticated;

-- Step 4: Add RLS policy to locks_secure view for explicit access control
-- Even though it's a view, we document the access pattern clearly
COMMENT ON VIEW public.locks_secure IS 'Secure view of locks table that excludes pin_code column. Users can only SELECT their own locks through this view.';