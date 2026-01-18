-- ==========================================================
-- SCRIPT: CLEANUP & RESET
-- Description: Menghapus user Super Admin yang error (corrupt)
-- ==========================================================

-- 1. Hapus dari tabel public users
DELETE FROM public.users WHERE email = 'journalwarga@gmail.com';

-- 2. Hapus dari tabel auth users (Supabase Auth)
DELETE FROM auth.users WHERE email = 'journalwarga@gmail.com';

-- 3. Hapus trigger yang mungkin konflik (bersih-bersih)
DROP TRIGGER IF EXISTS on_user_role_updated ON public.users;
DROP FUNCTION IF EXISTS public.handle_user_role_update();

-- 4. Matikan semua policy RLS sementara agar tidak ada block
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
