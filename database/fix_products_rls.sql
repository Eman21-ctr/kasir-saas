-- ==========================================================
-- SCRIPT: FIX PRODUCTS RLS
-- Description: Memberikan izin user untuk CRUD Produk mereka sendiri
-- ==========================================================

-- 1. Izin Buat Produk
DROP POLICY IF EXISTS "Users can create products for their business" ON public.products;
DROP POLICY IF EXISTS "Users can view products for their business" ON public.products;
DROP POLICY IF EXISTS "Users can update products for their business" ON public.products;
DROP POLICY IF EXISTS "Users can delete products for their business" ON public.products;

-- Policy untuk INSERT: Pastikan business_id milik user
CREATE POLICY "Users can create products for their business" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = business_id AND user_id = auth.uid()
    )
  );

-- Policy untuk SELECT: User bisa lihat produk dari bisnis miliknya
CREATE POLICY "Users can view products for their business" ON public.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = business_id AND user_id = auth.uid()
    )
  );

-- Policy untuk UPDATE
CREATE POLICY "Users can update products for their business" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = business_id AND user_id = auth.uid()
    )
  );

-- Policy untuk DELETE
CREATE POLICY "Users can delete products for their business" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = business_id AND user_id = auth.uid()
    )
  );

-- 2. Izin Kategori (Penting juga)
DROP POLICY IF EXISTS "Users can manage categories" ON public.categories;

CREATE POLICY "Users can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND user_id = auth.uid()
        )
    );

-- 3. Reload Config
NOTIFY pgrst, 'reload';
