-- Fix security definer view warning by using security_invoker = true
-- The security is properly handled by the get_user_locks() SECURITY DEFINER function
-- which already filters by auth.uid(), so the view itself can use security_invoker

DROP VIEW IF EXISTS public.locks_secure;

CREATE VIEW public.locks_secure 
WITH (security_invoker = true)
AS
  SELECT * FROM public.get_user_locks();

COMMENT ON VIEW public.locks_secure IS 'Secure view that excludes pin_code column. Uses security_invoker=true as security is enforced by the underlying get_user_locks() function.';