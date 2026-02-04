-- Quick fix untuk UPDATE permission pada business_staff

-- Hapus policy lama yang mungkin konflik
DROP POLICY IF EXISTS "bs_owner" ON public.business_staff;
DROP POLICY IF EXISTS "bs_owner_manage" ON public.business_staff;

-- Buat policy baru yang lebih jelas untuk owner
CREATE POLICY "bs_owner_all" ON public.business_staff FOR ALL 
    USING (
        business_id IN (
            SELECT b.id FROM public.businesses b 
            WHERE b.user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        )
    )
    WITH CHECK (
        business_id IN (
            SELECT b.id FROM public.businesses b 
            WHERE b.user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        )
    );

NOTIFY pgrst, 'reload schema';
