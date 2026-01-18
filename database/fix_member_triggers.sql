-- FUNCTION: Check and Upgrade Member Level
-- Description: Automatically upgrades member level based on points threshold defined in business settings.

CREATE OR REPLACE FUNCTION fn_check_member_level_upgrade()
RETURNS TRIGGER AS $$
DECLARE
    v_auto_tier BOOLEAN;
    v_silver INT;
    v_gold INT;
    v_platinum INT;
    v_new_level TEXT;
BEGIN
    -- 1. Fetch Business Settings
    SELECT 
        is_auto_tier_enabled,
        tier_silver_threshold,
        tier_gold_threshold,
        tier_platinum_threshold
    INTO 
        v_auto_tier, v_silver, v_gold, v_platinum
    FROM businesses
    WHERE id = NEW.business_id;

    -- 2. If Auto Tier is disabled, exit
    IF v_auto_tier IS NOT TRUE THEN
        RETURN NEW;
    END IF;

    -- 3. Determine New Level based on Total Points
    -- Logic: Always upgrade to the highest possible based on points
    
    IF NEW.total_points >= v_platinum THEN
        v_new_level := 'platinum';
    ELSIF NEW.total_points >= v_gold THEN
        v_new_level := 'gold';
    ELSIF NEW.total_points >= v_silver THEN
        v_new_level := 'silver';
    ELSE
        v_new_level := 'baru';
    END IF;

    -- 4. Apply Update if Level Changed
    -- Use text comparison for safety
    
    IF v_new_level = 'platinum' AND OLD.member_level != 'platinum' THEN
        NEW.member_level := 'platinum';
    ELSIF v_new_level = 'gold' AND OLD.member_level NOT IN ('platinum', 'gold') THEN
        NEW.member_level := 'gold';
    ELSIF v_new_level = 'silver' AND OLD.member_level NOT IN ('platinum', 'gold', 'silver') THEN
        NEW.member_level := 'silver';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ENSURE COLUMNS EXIST (Robustness Fix)
DO $$
BEGIN
    -- Add total_points if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'total_points') THEN
        ALTER TABLE members ADD COLUMN total_points INT DEFAULT 0;
    END IF;
END $$;

-- TRIGGER: Bind to Members Table
DROP TRIGGER IF EXISTS trg_check_member_level_upgrade ON members;

CREATE TRIGGER trg_check_member_level_upgrade
    BEFORE UPDATE OF total_points ON members
    FOR EACH ROW
    EXECUTE FUNCTION fn_check_member_level_upgrade();
