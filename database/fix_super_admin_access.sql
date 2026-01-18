-- ==========================================================
-- SCRIPT: FIX SUPER ADMIN ACCESS
-- Description: Sinkronisasi user dari Auth ke Public + Promote
-- ==========================================================

-- 1. Insert ke public.users kalau belum ada (ambil dari auth.users)
INSERT INTO public.users (id, auth_id, email, role, is_active)
SELECT 
    id, -- Pakai ID yang sama dengan Auth
    id, 
    email, 
    'super_admin', 
    TRUE
FROM auth.users
WHERE email = 'journalwarga@gmail.com'
ON CONFLICT (email) DO UPDATE
SET 
    role = 'super_admin',
    auth_id = EXCLUDED.auth_id;

-- 2. Pastikan Metadata Auth juga Super Admin (untuk RLS)
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'super_admin')
WHERE email = 'journalwarga@gmail.com';

-- 3. Cek hasil akhir (Harus ada data muncul)
SELECT * FROM public.users WHERE email = 'journalwarga@gmail.com';
