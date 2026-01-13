-- ==========================================================
-- SCRIPT: SEED SUPER ADMIN
-- Description: Mendaftarkan user Super Admin langsung ke Auth
-- ==========================================================

-- 1. Enable Extension pgcrypto (Wajib untuk generate hash password)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Proses Insert ke Table Auth & Public
DO $$
DECLARE
    new_user_id UUID;
    v_email TEXT := 'journalwarga@gmail.com';
    v_password TEXT := 'Oliver160422#';
BEGIN
    -- Cek apakah user sudah ada di auth.users
    SELECT id INTO new_user_id FROM auth.users WHERE email = v_email;
    
    -- Jika belum ada, buat user baru di auth.users
    IF new_user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', -- Default instance UUID
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt(v_password, gen_salt('bf')), -- Hash Password
            NOW(), -- Langsung confirm email
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            NOW(),
            NOW()
        ) RETURNING id INTO new_user_id;
        
        -- Wajib: Insert juga ke auth.identities (supaya login jalan di versi baru)
        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            v_email,
            format('{"sub": "%s", "email": "%s"}', new_user_id::text, v_email)::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
        );
    END IF;

    -- 3. Insert atau Update ke public.users
    -- Ini menghubungkan tabel bisnis kita dengan tabel login Supabase
    INSERT INTO public.users (auth_id, email, role, is_active)
    VALUES (new_user_id, v_email, 'super_admin', TRUE)
    ON CONFLICT (email) DO UPDATE 
    SET 
        role = 'super_admin', 
        auth_id = new_user_id,
        is_active = TRUE;
    
    RAISE NOTICE 'Super Admin % berhasil dibuat!', v_email;
END $$;
