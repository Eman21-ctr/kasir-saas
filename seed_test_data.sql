-- ==========================================================
-- SEED DATA FOR TESTING
-- Run this AFTER a user has registered and has a business
-- Replace BUSINESS_ID with the actual business ID from the database
-- ==========================================================

-- First, get the business ID of the test user:
-- SELECT id FROM businesses LIMIT 1;

-- Replace '1' below with the actual business_id
DO $$
DECLARE
    v_business_id BIGINT := 1; -- CHANGE THIS!
    v_cat_sembako BIGINT;
    v_cat_minuman BIGINT;
    v_cat_snack BIGINT;
BEGIN
    -- Insert Categories
    INSERT INTO categories (business_id, name, is_active) VALUES (v_business_id, 'Sembako', true) RETURNING id INTO v_cat_sembako;
    INSERT INTO categories (business_id, name, is_active) VALUES (v_business_id, 'Minuman', true) RETURNING id INTO v_cat_minuman;
    INSERT INTO categories (business_id, name, is_active) VALUES (v_business_id, 'Snack & Camilan', true) RETURNING id INTO v_cat_snack;

    -- Insert Products - Sembako
    INSERT INTO products (business_id, category_id, name, purchase_price, selling_price, stock_quantity, unit, is_active, is_favorite) VALUES
    (v_business_id, v_cat_sembako, 'Beras Premium 5kg', 60000, 75000, 20, 'karung', true, true),
    (v_business_id, v_cat_sembako, 'Minyak Goreng Bimoli 2L', 28000, 35000, 15, 'botol', true, false),
    (v_business_id, v_cat_sembako, 'Gula Pasir 1kg', 12000, 15000, 30, 'kg', true, false),
    (v_business_id, v_cat_sembako, 'Telur Ayam 1kg', 22000, 28000, 25, 'kg', true, true),
    (v_business_id, v_cat_sembako, 'Indomie Goreng', 2500, 3500, 100, 'pcs', true, true),
    (v_business_id, v_cat_sembako, 'Indomie Soto', 2500, 3500, 80, 'pcs', true, false),
    (v_business_id, v_cat_sembako, 'Kecap Manis Bango 135ml', 8000, 12000, 20, 'botol', true, false);

    -- Insert Products - Minuman
    INSERT INTO products (business_id, category_id, name, purchase_price, selling_price, stock_quantity, unit, is_active, is_favorite) VALUES
    (v_business_id, v_cat_minuman, 'Aqua 600ml', 2500, 4000, 50, 'botol', true, true),
    (v_business_id, v_cat_minuman, 'Teh Pucuk 350ml', 3000, 5000, 40, 'botol', true, false),
    (v_business_id, v_cat_minuman, 'Coca Cola 390ml', 5000, 7000, 30, 'botol', true, false),
    (v_business_id, v_cat_minuman, 'Kopi Kapal Api Sachet', 1000, 2000, 100, 'pcs', true, false),
    (v_business_id, v_cat_minuman, 'Susu Frisian Flag 225ml', 4000, 6000, 24, 'kotak', true, false);

    -- Insert Products - Snack
    INSERT INTO products (business_id, category_id, name, purchase_price, selling_price, stock_quantity, unit, is_active, is_favorite) VALUES
    (v_business_id, v_cat_snack, 'Chitato 68g', 8000, 12000, 20, 'pcs', true, true),
    (v_business_id, v_cat_snack, 'Oreo 137g', 7000, 10000, 15, 'pcs', true, false),
    (v_business_id, v_cat_snack, 'Tango Wafer 176g', 9000, 13000, 12, 'pcs', true, false),
    (v_business_id, v_cat_snack, 'Beng Beng', 2000, 3000, 50, 'pcs', true, false),
    (v_business_id, v_cat_snack, 'Permen Milkita', 500, 1000, 100, 'pcs', true, false);

    RAISE NOTICE 'Seed data inserted successfully!';
END $$;

-- Verify
SELECT 'Categories:' as info, COUNT(*) FROM categories;
SELECT 'Products:' as info, COUNT(*) FROM products;
