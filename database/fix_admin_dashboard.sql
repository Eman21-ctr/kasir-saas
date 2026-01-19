-- Description: Add status column to activation_codes table for Super Admin management.

-- 1. Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activation_codes' AND column_name = 'status') THEN
        ALTER TABLE activation_codes ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;

-- 2. Update existing records to 'active' if null
UPDATE activation_codes SET status = 'active' WHERE status IS NULL;

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_activation_codes_status ON activation_codes(status);
