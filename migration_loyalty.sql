-- Migration: Add Loyalty Settings to Businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS point_value_requirement INT DEFAULT 10000,
ADD COLUMN IF NOT EXISTS discount_silver_percent DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS discount_gold_percent DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS discount_platinum_percent DECIMAL(5,2) DEFAULT 15.00;
