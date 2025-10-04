-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create locks table
CREATE TABLE public.locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_locked BOOLEAN DEFAULT true,
  battery_level INTEGER DEFAULT 100,
  pin_code TEXT DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own locks"
  ON public.locks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locks"
  ON public.locks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locks"
  ON public.locks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locks"
  ON public.locks FOR DELETE
  USING (auth.uid() = user_id);

-- Create lock activity table
CREATE TABLE public.lock_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lock_id UUID REFERENCES public.locks(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lock_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity for their locks"
  ON public.lock_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.locks
      WHERE locks.id = lock_activity.lock_id
      AND locks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activity for their locks"
  ON public.lock_activity FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.locks
      WHERE locks.id = lock_activity.lock_id
      AND locks.user_id = auth.uid()
    )
  );

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_locks_updated_at
  BEFORE UPDATE ON public.locks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for locks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.locks;