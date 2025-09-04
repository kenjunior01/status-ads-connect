-- Create admin user manually (simplified approach)
-- This will be done via Supabase Auth UI for security
-- For now, create a simple function to assign admin role after signup

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Find user by email and assign admin role
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::app_role
  FROM auth.users
  WHERE email = user_email
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;