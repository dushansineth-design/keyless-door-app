-- CRITICAL SECURITY FIX: Block direct access to pin_code by denying SELECT on locks table
-- Users must use locks_secure view instead, which excludes pin_code via get_user_locks() function

-- Step 1: Create a deny-all SELECT policy on locks table to prevent direct queries
-- This prevents anyone from accessing pin_code, even in hashed form
CREATE POLICY "Deny all direct SELECT on locks table"
ON public.locks
FOR SELECT
TO authenticated
USING (false);

-- Step 2: Revoke any default SELECT grants on the locks table
REVOKE SELECT ON public.locks FROM authenticated;
REVOKE SELECT ON public.locks FROM anon;

-- Step 3: Ensure locks_secure view is accessible
GRANT SELECT ON public.locks_secure TO authenticated;

-- Step 4: Add explanatory comments
COMMENT ON POLICY "Deny all direct SELECT on locks table" ON public.locks IS 
  'Prevents direct SELECT queries on locks table to protect pin_code. Users must query locks_secure view instead, which excludes sensitive PIN data.';

COMMENT ON TABLE public.locks IS 
  'Stores lock data including sensitive pin_code. Direct SELECT is blocked - use locks_secure view for safe access without pin_code exposure.';