-- =====================================================
-- REVERSAL TRIGGERS FOR SALES REPORT DELETE
-- Description: Ensures stock items and member stats are reverted when a transaction is deleted.
-- =====================================================

-- 1. REVERSE STOCK when transaction_items are deleted
-- This handles stock_quantity increment back to the products.
CREATE OR REPLACE FUNCTION fn_on_transaction_item_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Return stock
    UPDATE products
    SET stock_quantity = stock_quantity + OLD.quantity
    WHERE id = OLD.product_id;
    
    -- Record reversal movement
    INSERT INTO stock_movements (
        business_id,
        product_id,
        movement_type,
        quantity,
        purchase_price_per_unit,
        selling_price_per_unit,
        reference_type,
        reference_id,
        stock_before,
        stock_after,
        movement_date,
        created_by
    )
    SELECT 
        p.business_id,
        OLD.product_id,
        'adjustment', -- Using adjustment for reversal
        OLD.quantity,
        OLD.purchase_price,
        OLD.selling_price,
        'transaction_delete',
        OLD.transaction_id,
        p.stock_quantity - OLD.quantity, -- Before the update it was p.stock_quantity, but trigger is AFTER? No, we use BEFORE/AFTER?
        -- Actually, better to do this in AFTER DELETE.
        p.stock_quantity,
        NOW(),
        NULL
    FROM products p
    WHERE p.id = OLD.product_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_on_transaction_item_delete ON transaction_items;
CREATE TRIGGER trg_on_transaction_item_delete
    BEFORE DELETE ON transaction_items
    FOR EACH ROW
    EXECUTE FUNCTION fn_on_transaction_item_delete();


-- 2. REVERSE MEMBER STATS when transaction is deleted
-- This handles points_earned, points_used, total_spending, etc.
CREATE OR REPLACE FUNCTION fn_on_transaction_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.member_id IS NOT NULL AND OLD.payment_status = 'paid' THEN
        UPDATE members
        SET 
            total_transactions = GREATEST(0, total_transactions - 1),
            total_spending = GREATEST(0, total_spending - OLD.total_amount),
            -- Revert points: subtract earned, add back used
            total_points = GREATEST(0, total_points - OLD.points_earned + OLD.points_used)
        WHERE id = OLD.member_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_on_transaction_delete ON transactions;
CREATE TRIGGER trg_on_transaction_delete
    BEFORE DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION fn_on_transaction_delete();
