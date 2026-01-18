-- ==========================================================
-- SCRIPT: DEBUG FIX ALL RLS (NUCLEAR OPTION)
-- Description: Buka ases untuk Authenticated User (Sementara untuk Debug)
-- ==========================================================

-- 1. Products: Allow ALL for Authenticated
DROP POLICY IF EXISTS "Users can create products for their business" ON public.products;
DROP POLICY IF EXISTS "Users can view products for their business" ON public.products;
DROP POLICY IF EXISTS "Users can update products for their business" ON public.products;
DROP POLICY IF EXISTS "Users can delete products for their business" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can do everything on products" ON public.products;

CREATE POLICY "Authenticated users can do everything on products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- 2. Categories
DROP POLICY IF EXISTS "Users can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can do everything on categories" ON public.categories;

CREATE POLICY "Authenticated users can do everything on categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- 3. Businesses (Just in case)
DROP POLICY IF EXISTS "Users can create their own business" ON public.businesses;
DROP POLICY IF EXISTS "Users can view their own business" ON public.businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON public.businesses;
DROP POLICY IF EXISTS "Authenticated users can do everything on businesses" ON public.businesses;

CREATE POLICY "Authenticated users can do everything on businesses" ON public.businesses
  FOR ALL USING (auth.role() = 'authenticated');

NOTIFY pgrst, 'reload';
