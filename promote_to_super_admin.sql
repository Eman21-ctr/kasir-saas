-- ==========================================================
-- SCRIPT: PROMOTE TO SUPER ADMIN
-- Description: Mengubah user biasa menjadi Super Admin
-- ==========================================================

-- 1. Update role di tabel public.users
UPDATE public.users 
SET role = 'super_admin' 
WHERE email = 'journalwarga@gmail.com';

-- 2. Update metadata di auth.users (untuk jaga-jaga ke depannya)
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'super_admin')
WHERE email = 'journalwarga@gmail.com';

-- 3. Cek hasil update
SELECT email, role FROM public.users WHERE email = 'journalwarga@gmail.com';
