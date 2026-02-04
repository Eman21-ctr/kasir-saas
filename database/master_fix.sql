-- ==========================================================
-- MASTER FIX: Reset RLS & Fix Owner-Business Relationships
-- ==========================================================

-- STEP 1: DISABLE RLS pada tabel-tabel yang bermasalah
ALTER TABLE public.business_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- STEP 2: Lihat semua data untuk debug
-- Hasilnya akan muncul di bawah setelah run

-- 2a. Semua users
SELECT 'USERS' as table_name, id, auth_id, email, role FROM public.users ORDER BY created_at;

-- 2b. Semua businesses
SELECT 'BUSINESSES' as table_name, id, business_name, user_id FROM public.businesses;

-- 2c. Semua business_staff
SELECT 'BUSINESS_STAFF' as table_name, bs.id, bs.business_id, bs.user_id, bs.staff_name, u.email
FROM public.business_staff bs
JOIN public.users u ON bs.user_id = u.id;

-- STEP 3: FIX - Set role berdasarkan kepemilikan bisnis
-- Siapa saja yang punya bisnis = shop_owner
UPDATE public.users 
SET role = 'shop_owner'
WHERE id IN (SELECT user_id FROM public.businesses);

-- Siapa saja yang ada di business_staff tapi BUKAN owner = staff
UPDATE public.users 
SET role = 'staff'
WHERE id IN (SELECT user_id FROM public.business_staff)
AND id NOT IN (SELECT user_id FROM public.businesses);

-- STEP 4: Hapus owner dari business_staff (owner bukan staf)
DELETE FROM public.business_staff 
WHERE user_id IN (SELECT user_id FROM public.businesses);

-- STEP 5: Re-enable RLS dengan policy yang lebih sederhana
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_staff ENABLE ROW LEVEL SECURITY;

-- Hapus semua policy lama
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies 
              WHERE schemaname = 'public' 
              AND tablename IN ('users', 'businesses', 'business_staff'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- STEP 6: Buat function helper yang PASTI bypass RLS
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT id FROM users WHERE auth_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.get_my_business_id()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT id FROM businesses WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
$$;

-- STEP 7: Policy untuk USERS (sederhana)
CREATE POLICY "users_read" ON public.users FOR SELECT 
    USING (auth.role() = 'authenticated');
CREATE POLICY "users_update_self" ON public.users FOR UPDATE 
    USING (auth_id = auth.uid());

-- STEP 8: Policy untuk BUSINESSES
CREATE POLICY "biz_owner_access" ON public.businesses FOR ALL 
    USING (user_id = public.get_current_user_id());
CREATE POLICY "biz_staff_read" ON public.businesses FOR SELECT 
    USING (id IN (SELECT business_id FROM business_staff WHERE user_id = public.get_current_user_id()));

-- STEP 9: Policy untuk BUSINESS_STAFF (KUNCI UTAMA)
-- Staff bisa baca record sendiri
CREATE POLICY "bs_staff_read_own" ON public.business_staff FOR SELECT 
    USING (user_id = public.get_current_user_id());

-- Owner bisa semua operasi di staff miliknya
CREATE POLICY "bs_owner_manage" ON public.business_staff FOR ALL 
    USING (business_id = public.get_my_business_id())
    WITH CHECK (business_id = public.get_my_business_id());

-- STEP 10: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_business_id() TO authenticated;

NOTIFY pgrst, 'reload schema';

-- VERIFIKASI AKHIR
SELECT 'FINAL CHECK - USERS' as info, email, role FROM public.users ORDER BY created_at;
SELECT 'FINAL CHECK - BUSINESSES' as info, b.business_name, u.email as owner_email 
FROM public.businesses b JOIN public.users u ON b.user_id = u.id;
SELECT 'FINAL CHECK - STAFF' as info, bs.staff_name, u.email, b.business_name
FROM public.business_staff bs 
JOIN public.users u ON bs.user_id = u.id
JOIN public.businesses b ON bs.business_id = b.id;
