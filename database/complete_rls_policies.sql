-- ==========================================================
-- COMPLETE RLS POLICIES FOR KASIRKU SHOP OWNER
-- Version: Final
-- Run this in Supabase SQL Editor
-- ==========================================================

-- ===== 1. BUSINESSES =====
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_business_all" ON public.businesses;
CREATE POLICY "shop_owner_business_all" ON public.businesses
  FOR ALL USING (auth.uid() = user_id);

-- ===== 2. PRODUCTS =====
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_product_all" ON public.products;
CREATE POLICY "shop_owner_product_all" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ===== 3. CATEGORIES =====
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_category_all" ON public.categories;
CREATE POLICY "shop_owner_category_all" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ===== 4. TRANSACTIONS =====
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_transaction_all" ON public.transactions;
CREATE POLICY "shop_owner_transaction_all" ON public.transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ===== 5. TRANSACTION ITEMS =====
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_transaction_item_all" ON public.transaction_items;
CREATE POLICY "shop_owner_transaction_item_all" ON public.transaction_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      JOIN public.businesses b ON t.business_id = b.id
      WHERE t.id = transaction_id AND b.user_id = auth.uid()
    )
  );

-- ===== 6. STOCK MOVEMENTS =====
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_stock_all" ON public.stock_movements;
CREATE POLICY "shop_owner_stock_all" ON public.stock_movements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ===== 7. EXPENSES =====
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_expense_all" ON public.expenses;
CREATE POLICY "shop_owner_expense_all" ON public.expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ===== 8. EXPENSE CATEGORIES =====
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_expense_cat_all" ON public.expense_categories;
CREATE POLICY "shop_owner_expense_cat_all" ON public.expense_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ===== 9. MEMBERS =====
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_member_all" ON public.members;
CREATE POLICY "shop_owner_member_all" ON public.members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ===== 10. DAILY REPORTS =====
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_report_all" ON public.daily_reports;
CREATE POLICY "shop_owner_report_all" ON public.daily_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid())
  );

-- ===== 11. NOTIFICATIONS =====
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_owner_notif_all" ON public.notifications;
CREATE POLICY "shop_owner_notif_all" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- ===== 12. ACTIVATION CODES (Super Admin & Authenticated) =====
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_view_unused_codes" ON public.activation_codes;
DROP POLICY IF EXISTS "auth_update_codes" ON public.activation_codes;
CREATE POLICY "anyone_view_unused_codes" ON public.activation_codes FOR SELECT USING (true);
CREATE POLICY "auth_update_codes" ON public.activation_codes FOR UPDATE USING (auth.role() = 'authenticated');

-- ===== 13. USERS TABLE =====
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_self_all" ON public.users;
CREATE POLICY "users_self_all" ON public.users
  FOR ALL USING (auth_id = auth.uid());

-- Force PostgREST to reload
NOTIFY pgrst, 'reload';

-- ===== DONE =====
SELECT 'RLS Policies Applied Successfully!' as result;
