-- ==========================================================
-- FINAL PRODUCTION STABILIZATION SCRIPT
-- ==========================================================

-- 1. Pastikan perizinan tabel untuk role authenticated
GRANT ALL ON public.business_staff TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.businesses TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.members TO authenticated;
GRANT ALL ON public.stock_movements TO authenticated;
GRANT ALL ON public.expenses TO authenticated;
GRANT ALL ON public.daily_reports TO authenticated;

-- 2. Pastikan perizinan sequence (untuk auto-increment ID)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3. Reset RLS agar tidak ada recursion, tapi tetap aman
-- Kita buat satu function SECURITY DEFINER yang universal
CREATE OR REPLACE FUNCTION public.check_user_access(target_biz_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_role text;
BEGIN
    -- Ambil public.users.id dari current auth user
    SELECT id, role INTO v_user_id, v_role FROM users WHERE auth_id = auth.uid();
    
    IF v_user_id IS NULL THEN RETURN FALSE; END IF;
    
    -- Jika super_admin, izinkan semua
    IF v_role = 'super_admin' THEN RETURN TRUE; END IF;
    
    -- Jika shop_owner, cek apakah dia pemilik bisnis ini
    IF v_role = 'shop_owner' THEN
        RETURN EXISTS (SELECT 1 FROM businesses WHERE id = target_biz_id AND user_id = v_user_id);
    END IF;
    
    -- Jika staff, cek apakah dia terdaftar di bisnis ini
    IF v_role = 'staff' THEN
        RETURN EXISTS (SELECT 1 FROM business_staff WHERE business_id = target_biz_id AND user_id = v_user_id);
    END IF;
    
    RETURN FALSE;
END;
$$;

-- 4. Terapkan RLS Policy ke semua tabel data (Multi-tenancy)
DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY['products', 'categories', 'transactions', 'members', 'stock_movements', 'expenses', 'daily_reports'];
BEGIN
    FOR t IN SELECT unnest(tables) LOOP
        -- Hapus policy lama
        EXECUTE 'DROP POLICY IF EXISTS "data_access_policy" ON public.' || t;
        -- Aktifkan RLS
        EXECUTE 'ALTER TABLE public.' || t || ' ENABLE ROW LEVEL SECURITY';
        -- Buat policy baru menggunakan function helper
        EXECUTE 'CREATE POLICY "data_access_policy" ON public.' || t || ' FOR ALL USING (public.check_user_access(business_id))';
    END LOOP;
END $$;

-- 5. Policy khusus untuk business_staff (Owner bisa kelola, staff bisa lihat diri sendiri)
ALTER TABLE public.business_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bs_access_policy" ON public.business_staff;
CREATE POLICY "bs_access_policy" ON public.business_staff FOR ALL 
USING (
    public.check_user_access(business_id) OR 
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- 6. Policy untuk businesses (Owner bisa kelola, staff bisa lihat)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "biz_access_policy" ON public.businesses;
CREATE POLICY "biz_access_policy" ON public.businesses FOR SELECT 
USING (public.check_user_access(id));
CREATE POLICY "biz_owner_update" ON public.businesses FOR UPDATE 
USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- 7. Policy untuk users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_policy" ON public.users;
CREATE POLICY "users_read_policy" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "users_self_update" ON public.users FOR UPDATE USING (auth_id = auth.uid());

NOTIFY pgrst, 'reload schema';
