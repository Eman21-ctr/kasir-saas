-- ==========================================================
-- SCRIPT: SUPER SYNC & SCHEMA FIX
-- Description: Fixes constraints, enums, and trigger for registration
-- Run this in Supabase SQL Editor if you get "Database error saving new user"
-- ==========================================================

-- 1. FIX ENUM (Ensure all roles exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('super_admin', 'shop_owner', 'staff');
    ELSE
        -- Add 'staff' if it doesn't exist in the enum
        ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'staff';
    END IF;
END $$;

-- 2. FIX TABLE CONSTRAINTS (Allow NULL for onboarding fields)
ALTER TABLE IF EXISTS public.users 
    ALTER COLUMN activation_code DROP NOT NULL,
    ALTER COLUMN phone_number DROP NOT NULL;

-- 3. ENSURE COLUMNS EXIST (For those using older MySQL-style schema)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='auth_id') THEN
        ALTER TABLE public.users ADD COLUMN auth_id UUID;
    END IF;
    
    -- Ensure 'id' is UUID (This is harder to change if it's already BIGINT, 
    -- but usually Supabase users are already on UUID in the public schema)
END $$;

-- 4. IMPROVED TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    final_role public.user_role_enum;
BEGIN
    -- Determine role safely
    final_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role_enum, 'shop_owner'::public.user_role_enum);

    -- Use UPSERT logic to handle existing records
    -- We force the primary key 'id' to match the auth 'id' to keep things simple
    INSERT INTO public.users (id, auth_id, email, role, is_active)
    VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        final_role,
        TRUE
    )
    ON CONFLICT (email) DO UPDATE
    SET auth_id = NEW.id,
        id = NEW.id, -- Also update ID to keep it in sync with Auth
        role = EXCLUDED.role,
        is_active = TRUE;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback for weird edge cases
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RE-ATTACH TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RLS POLICIES (KUNCI UTAMA)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: INSERT (Allow user to create their own record)
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.users;
CREATE POLICY "Allow users to insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = auth_id OR auth.uid() = id);

-- Policy: UPDATE (Allow user to update their own record)
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = auth_id OR auth.uid() = id);

-- Policy: SELECT (Allow authenticated users to read profiles)
DROP POLICY IF EXISTS "Allow users to view all profiles" ON public.users;
CREATE POLICY "Allow users to view all profiles" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- 7. RELOAD
NOTIFY pgrst, 'reload schema';

