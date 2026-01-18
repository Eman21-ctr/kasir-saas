-- ==========================================================
-- SCRIPT: CRITICAL DEBUG - DISABLE RLS
-- Description: Mematikan sementara satpam (RLS) di tabel users
-- ==========================================================

-- 1. Matikan RLS di tabel users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Pastikan permission grant public aman
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;

-- 3. Cek apakah user journalwarga ada dan terhubung ke auth
SELECT 
    u.id as public_id, 
    u.email, 
    u.role, 
    u.auth_id,
    au.id as auth_users_id
FROM public.users u
JOIN auth.users au ON u.auth_id = au.id
WHERE u.email = 'journalwarga@gmail.com';
