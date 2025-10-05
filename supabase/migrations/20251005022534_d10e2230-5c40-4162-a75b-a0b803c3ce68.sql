-- Enable pgcrypto extension for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to hash PIN codes
CREATE OR REPLACE FUNCTION public.hash_pin(pin_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN crypt(pin_text, gen_salt('bf', 10));
END;
$$;

-- Create a function to verify PIN codes
CREATE OR REPLACE FUNCTION public.verify_pin(lock_uuid UUID, pin_attempt TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  -- Get the hashed PIN for this lock
  SELECT pin_code INTO stored_hash
  FROM public.locks
  WHERE id = lock_uuid AND user_id = auth.uid();
  
  -- If no lock found or user doesn't own it, return false
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Compare the attempt with the stored hash
  RETURN stored_hash = crypt(pin_attempt, stored_hash);
END;
$$;

-- Add DELETE policy to prevent audit log tampering
CREATE POLICY "Prevent deletion of lock activity logs"
ON public.lock_activity
FOR DELETE
TO authenticated
USING (false);

-- Update existing locks to have hashed PINs (if any exist with plain text)
-- This will hash the default '1234' PIN if it exists
UPDATE public.locks
SET pin_code = public.hash_pin(pin_code)
WHERE pin_code IS NOT NULL 
  AND length(pin_code) < 30; -- Only hash if it looks like plain text (bcrypt hashes are 60 chars)