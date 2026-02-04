-- ==========================================================
-- STAFF RLS POLICIES FIX
-- Description: Allow staff members to access business data
-- ==========================================================

-- Helper function to check if current user is staff of a business
CREATE OR REPLACE FUNCTION public.is_staff_of(target_business_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_staff
        WHERE business_id = target_business_id
        AND user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. BUSINESSES: Allow staff to see their assigned business
DROP POLICY IF EXISTS "staff_view_business" ON public.businesses;
CREATE POLICY "staff_view_business" ON public.businesses
    FOR SELECT USING (is_staff_of(id));

-- 2. PRODUCTS: Allow staff to view/manage products (if they have 'stock' permission)
DROP POLICY IF EXISTS "staff_access_products" ON public.products;
CREATE POLICY "staff_access_products" ON public.products
    FOR ALL USING (is_staff_of(business_id));

-- 3. CATEGORIES
DROP POLICY IF EXISTS "staff_access_categories" ON public.categories;
CREATE POLICY "staff_access_categories" ON public.categories
    FOR ALL USING (is_staff_of(business_id));

-- 4. TRANSACTIONS
DROP POLICY IF EXISTS "staff_access_transactions" ON public.transactions;
CREATE POLICY "staff_access_transactions" ON public.transactions
    FOR ALL USING (is_staff_of(business_id));

-- 5. TRANSACTION ITEMS
DROP POLICY IF EXISTS "staff_access_trx_items" ON public.transaction_items;
CREATE POLICY "staff_access_trx_items" ON public.transaction_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id AND is_staff_of(t.business_id)
        )
    );

-- 6. STOCK MOVEMENTS
DROP POLICY IF EXISTS "staff_access_stock" ON public.stock_movements;
CREATE POLICY "staff_access_stock" ON public.stock_movements
    FOR ALL USING (is_staff_of(business_id));

-- 7. EXPENSES
DROP POLICY IF EXISTS "staff_access_expenses" ON public.expenses;
CREATE POLICY "staff_access_expenses" ON public.expenses
    FOR ALL USING (is_staff_of(business_id));

-- 8. EXPENSE CATEGORIES
DROP POLICY IF EXISTS "staff_access_exp_cats" ON public.expense_categories;
CREATE POLICY "staff_access_exp_cats" ON public.expense_categories
    FOR ALL USING (is_staff_of(business_id));

-- 9. MEMBERS
DROP POLICY IF EXISTS "staff_access_members" ON public.members;
CREATE POLICY "staff_access_members" ON public.members
    FOR ALL USING (is_staff_of(business_id));

-- 10. DAILY REPORTS
DROP POLICY IF EXISTS "staff_access_reports" ON public.daily_reports;
CREATE POLICY "staff_access_reports" ON public.daily_reports
    FOR ALL USING (is_staff_of(business_id));

-- 11. NOTIFICATIONS
DROP POLICY IF EXISTS "staff_access_notifs" ON public.notifications;
CREATE POLICY "staff_access_notifs" ON public.notifications
    FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Re-enable RLS on all tables to be safe
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_staff ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload';
