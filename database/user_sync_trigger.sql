-- =====================================================
-- AUTH SYNC TRIGGER
-- Description: Automatically syncs Supabase Auth users to public.users
-- =====================================================

-- 1. Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_id, email, role, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role_enum, 'shop_owner'::user_role_enum),
        TRUE
    )
    ON CONFLICT (email) DO UPDATE
    SET auth_id = NEW.id,
        role = EXCLUDED.role,
        is_active = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing users (Optional but recommended)
-- Note: This is safe to run multiple times because of ON CONFLICT
INSERT INTO public.users (auth_id, email, role, is_active)
SELECT 
    id, 
    email, 
    COALESCE((raw_user_meta_data->>'role')::user_role_enum, 'shop_owner'::user_role_enum),
    TRUE
FROM auth.users
ON CONFLICT (email) DO UPDATE
SET auth_id = EXCLUDED.auth_id,
    role = EXCLUDED.role,
    is_active = TRUE;
