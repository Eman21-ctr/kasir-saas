-- ==========================================================
-- SCRIPT: FIX PERMISSIONS & RELOAD CACHE
-- Description: Memperbaiki error "Database error querying schema"
-- ==========================================================

-- 1. Reload PostgREST Schema Cache (Wajib setelah perubahan struktur table)
NOTIFY pgrst, 'reload';

-- 2. Pastikan permission Schema Public terbuka untuk Auth Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Pastikan RLS Policies applied
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Verifikasi User (Optional, hanya untuk memastikan data masuk)
SELECT id, email, role FROM public.users WHERE email = 'journalwarga@gmail.com';
