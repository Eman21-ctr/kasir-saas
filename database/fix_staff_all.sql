-- ==========================================================
-- DEFINITIVE STAFF FIX (V12): NO RECURSION POSSIBLE
-- Description: All checks via SECURITY DEFINER functions only
-- ==========================================================

-- STEP 1: Disable RLS on all tables first
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- STEP 3: Drop existing functions
DROP FUNCTION IF EXISTS public.get_my_user_id();
DROP FUNCTION IF EXISTS public.can_access_business(bigint);
DROP FUNCTION IF EXISTS public.check_access(bigint);
DROP FUNCTION IF EXISTS public.my_id();
DROP FUNCTION IF EXISTS public.has_access_to_business(bigint);
DROP FUNCTION IF EXISTS public.check_business_access(bigint);

-- STEP 4: Create THE ONLY helper function we need
-- This function bypasses ALL RLS because it's SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.auth_check(check_type text, target_id bigint DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    my_auth_id uuid;
    my_user_id uuid;
BEGIN
    -- Get current auth user
    my_auth_id := auth.uid();
    IF my_auth_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get public.users id
    SELECT id INTO my_user_id FROM public.users WHERE auth_id = my_auth_id;
    IF my_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Different check types
    CASE check_type
        WHEN 'is_authenticated' THEN
            RETURN TRUE;
            
        WHEN 'is_self_user' THEN
            -- For users table: can only see/edit own record
            RETURN EXISTS (SELECT 1 FROM public.users WHERE id = target_id AND auth_id = my_auth_id);
            
        WHEN 'owns_business' THEN
            -- Check if user owns this business
            RETURN EXISTS (SELECT 1 FROM public.businesses WHERE id = target_id AND user_id = my_user_id);
            
        WHEN 'works_at_business' THEN
            -- Check if user is active staff at this business
            RETURN EXISTS (SELECT 1 FROM public.business_staff WHERE business_id = target_id AND user_id = my_user_id AND is_active = true);
            
        WHEN 'can_access_business' THEN
            -- Check if user owns OR works at this business
            RETURN EXISTS (SELECT 1 FROM public.businesses WHERE id = target_id AND user_id = my_user_id)
                OR EXISTS (SELECT 1 FROM public.business_staff WHERE business_id = target_id AND user_id = my_user_id AND is_active = true);
                
        WHEN 'is_own_staff_record' THEN
            -- For business_staff: can see own record
            RETURN EXISTS (SELECT 1 FROM public.business_staff WHERE id = target_id AND user_id = my_user_id);
            
        WHEN 'is_staff_of_any' THEN
            -- For business_staff SELECT: staff can read their own records
            RETURN EXISTS (SELECT 1 FROM public.business_staff bs WHERE bs.user_id = my_user_id AND bs.id = target_id);
            
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;

-- Simpler function for business access
CREATE OR REPLACE FUNCTION public.user_can_access(biz_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    my_user_id uuid;
BEGIN
    SELECT id INTO my_user_id FROM public.users WHERE auth_id = auth.uid();
    
    RETURN EXISTS (SELECT 1 FROM public.businesses WHERE id = biz_id AND user_id = my_user_id)
        OR EXISTS (SELECT 1 FROM public.business_staff WHERE business_id = biz_id AND user_id = my_user_id AND is_active = true);
END;
$$;

-- Function to get current user's public ID
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT id FROM public.users WHERE auth_id = auth.uid()
$$;

-- STEP 5: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create simple policies for USERS
CREATE POLICY "users_select" ON public.users FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "users_update" ON public.users FOR UPDATE 
    USING (auth_id = auth.uid());

-- STEP 7: Create policies for BUSINESS_STAFF
-- Staff can see their own record (NO reference to businesses table here!)
CREATE POLICY "bs_own" ON public.business_staff FOR SELECT 
    USING (user_id = public.current_user_id());

-- Owner can manage staff (uses function to avoid recursion)
CREATE POLICY "bs_owner" ON public.business_staff FOR ALL 
    USING (public.auth_check('owns_business', business_id));

-- STEP 8: Create policies for BUSINESSES
-- Owner has full access
CREATE POLICY "biz_owner" ON public.businesses FOR ALL 
    USING (user_id = public.current_user_id());

-- Staff can view their assigned business (NO reference to business_staff in the policy itself!)
CREATE POLICY "biz_staff" ON public.businesses FOR SELECT 
    USING (public.auth_check('works_at_business', id));

-- STEP 9: Create policies for data tables using the safe function
CREATE POLICY "products_policy" ON public.products FOR ALL 
    USING (public.user_can_access(business_id));

CREATE POLICY "categories_policy" ON public.categories FOR ALL 
    USING (public.user_can_access(business_id));

CREATE POLICY "transactions_policy" ON public.transactions FOR ALL 
    USING (public.user_can_access(business_id));

CREATE POLICY "members_policy" ON public.members FOR ALL 
    USING (public.user_can_access(business_id));

-- STEP 10: Fix staff data
UPDATE public.users SET role = 'staff' WHERE email LIKE '%@kasirku.local';

-- Link orphaned staff to first business
DO $$
DECLARE
    first_biz_id bigint;
    staff_rec RECORD;
BEGIN
    SELECT id INTO first_biz_id FROM public.businesses LIMIT 1;
    
    IF first_biz_id IS NOT NULL THEN
        FOR staff_rec IN 
            SELECT id, email FROM public.users 
            WHERE role = 'staff' 
            AND id NOT IN (SELECT user_id FROM public.business_staff)
        LOOP
            INSERT INTO public.business_staff (business_id, user_id, staff_name, permissions, is_active)
            VALUES (first_biz_id, staff_rec.id, split_part(staff_rec.email, '@', 1), 
                    '{"pos": true, "stock": true, "reports": false, "settings": false}'::jsonb, true)
            ON CONFLICT (business_id, user_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';

-- Verification
SELECT u.email, u.role, bs.staff_name, bs.is_active, b.business_name
FROM public.users u
LEFT JOIN public.business_staff bs ON u.id = bs.user_id
LEFT JOIN public.businesses b ON bs.business_id = b.id
WHERE u.email LIKE '%@kasirku.local';
