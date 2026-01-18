-- ==========================================================
-- SCRIPT: FIX RLS RECURSION (Infinite Loop)
-- ==========================================================

-- 1. Drop Policy Bermasalah (Penyebab Loop)
DROP POLICY IF EXISTS "Super Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- 2. Re-create "Read Own Data" (Aman)
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

-- 3. Update Metadata Super Admin agar RLS bisa baca dari JWT (Anti-Loop)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'super_admin')
WHERE email = 'journalwarga@gmail.com';

-- 4. Create Policy "Super Admin View All" menggunakan Metadata JWT
-- Ini tidak akan query ke tabel users, jadi tidak loop.
CREATE POLICY "Super Admins can view all users" ON public.users
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- 5. Helper Function: Sync Role ke Metadata (Untuk user baru nanti)
CREATE OR REPLACE FUNCTION public.handle_user_role_update() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.auth_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger saat role di public.users berubah/dibuat
DROP TRIGGER IF EXISTS on_user_role_updated ON public.users;
CREATE TRIGGER on_user_role_updated
  AFTER INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_role_update();

-- 6. Reload Config
NOTIFY pgrst, 'reload';
