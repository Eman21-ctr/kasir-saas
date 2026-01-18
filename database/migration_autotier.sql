-- Migration: Add Auto-Tier Settings to Businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS is_auto_tier_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tier_silver_threshold INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS tier_gold_threshold INT DEFAULT 200,
ADD COLUMN IF NOT EXISTS tier_platinum_threshold INT DEFAULT 500;

-- Update the after transaction trigger function for Auto-Tier
CREATE OR REPLACE FUNCTION fn_after_transaction_insert()
RETURNS TRIGGER AS $$
DECLARE
    biz_settings RECORD;
    new_points INT;
BEGIN
    IF NEW.member_id IS NOT NULL AND NEW.payment_status = 'paid' THEN
        -- Update member stats
        UPDATE members
        SET 
            total_transactions = total_transactions + 1,
            total_spending = total_spending + NEW.total_amount,
            total_points = total_points + NEW.points_earned - NEW.points_used
        WHERE id = NEW.member_id
        RETURNING total_points INTO new_points;

        -- Auto-tier logic
        SELECT is_auto_tier_enabled, tier_silver_threshold, tier_gold_threshold, tier_platinum_threshold 
        INTO biz_settings
        FROM businesses WHERE id = NEW.business_id;

        IF biz_settings.is_auto_tier_enabled THEN
            IF new_points >= biz_settings.tier_platinum_threshold THEN
                UPDATE members SET member_level = 'platinum' WHERE id = NEW.member_id;
            ELSIF new_points >= biz_settings.tier_gold_threshold THEN
                UPDATE members SET member_level = 'gold' WHERE id = NEW.member_id;
            ELSIF new_points >= biz_settings.tier_silver_threshold THEN
                UPDATE members SET member_level = 'silver' WHERE id = NEW.member_id;
            ELSE
                -- Keep at 'baru' if below silver
                UPDATE members SET member_level = 'baru' WHERE id = NEW.member_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
