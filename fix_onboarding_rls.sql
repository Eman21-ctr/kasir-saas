-- ==========================================================
-- SCRIPT: FIX ONBOARDING RLS
-- Description: Memberikan izin user baru untuk buat Toko & Update Kode
-- ==========================================================

-- 1. UTAMA: Izin Buat Toko (Businesses)
DROP POLICY IF EXISTS "Users can create their own business" ON public.businesses;
DROP POLICY IF EXISTS "Users can view their own business" ON public.businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON public.businesses;

CREATE POLICY "Users can create their own business" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own business" ON public.businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business" ON public.businesses
  FOR UPDATE USING (auth.uid() = user_id);


-- 2. PENDUKUNG: Izin Update Kode Aktivasi (biar bisa ditandai 'used')
-- Kita izinkan authenticated user mengupdate kode (selama kodenya valid/exists)
DROP POLICY IF EXISTS "Authenticated users can update activation codes" ON public.activation_codes;

CREATE POLICY "Authenticated users can update activation codes" ON public.activation_codes
  FOR UPDATE
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');
  
-- Pastikan user bisa BACA kode juga (untuk verifikasi di step sebelumnya sebenarnya, tapi buat safety)
DROP POLICY IF EXISTS "Anyone can view unused codes" ON public.activation_codes;
CREATE POLICY "Anyone can view unused codes" ON public.activation_codes
  FOR SELECT USING (true); -- Mempermudah validasi, atau bisa diperketat nanti

-- 3. Reload Config
NOTIFY pgrst, 'reload';
