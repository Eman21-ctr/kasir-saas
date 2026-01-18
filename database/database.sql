# DATABASE SCHEMA - KASIR UMKM APP

```sql
-- =====================================================
-- DATABASE SCHEMA: KASIR UMKM
-- Version: 1.0
-- Description: Complete database schema for POS system
-- =====================================================

-- =====================================================
-- 1. TABEL USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activation_code VARCHAR(20) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_activation_code (activation_code),
    INDEX idx_phone_number (phone_number)
);

-- =====================================================
-- 2. TABEL BUSINESS/USAHA
-- =====================================================

CREATE TABLE businesses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type ENUM('warung_sembako', 'kedai_kopi', 'warteg', 'toko_kelontong', 'lainnya') NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    logo_url VARCHAR(255),
    
    -- HPP Mode
    hpp_mode ENUM('sederhana', 'akurat') DEFAULT 'sederhana',
    
    -- Settings
    tax_percentage DECIMAL(5,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'IDR',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- 3. TABEL CATEGORIES (Kategori Barang)
-- =====================================================

CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id)
);

-- =====================================================
-- 4. TABEL PRODUCTS (Barang Dagangan)
-- =====================================================

CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    description TEXT,
    image_url VARCHAR(255),
    
    -- Pricing
    purchase_price DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Harga beli
    selling_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,  -- Harga jual
    
    -- Stock
    stock_quantity DECIMAL(10,2) DEFAULT 0.00,
    unit VARCHAR(20) DEFAULT 'pcs', -- pcs, botol, karton, kg, dll
    min_stock DECIMAL(10,2) DEFAULT 5.00, -- Minimum stock alert
    
    -- Additional
    is_favorite BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_business_id (business_id),
    INDEX idx_category_id (category_id),
    INDEX idx_barcode (barcode),
    INDEX idx_sku (sku),
    INDEX idx_name (name)
);

-- =====================================================
-- 5. TABEL STOCK MOVEMENTS (Riwayat Stok)
-- =====================================================

CREATE TABLE stock_movements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    
    -- Movement Details
    movement_type ENUM('purchase', 'sale', 'adjustment', 'return', 'damage') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    
    -- Pricing (untuk HPP calculation)
    purchase_price_per_unit DECIMAL(15,2),
    selling_price_per_unit DECIMAL(15,2),
    
    -- Reference
    reference_type VARCHAR(50), -- 'transaction', 'purchase_order', 'adjustment'
    reference_id BIGINT UNSIGNED,
    
    -- Stock Before/After
    stock_before DECIMAL(10,2),
    stock_after DECIMAL(10,2),
    
    notes TEXT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT UNSIGNED,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_product_id (product_id),
    INDEX idx_movement_date (movement_date),
    INDEX idx_reference (reference_type, reference_id)
);

-- =====================================================
-- 6. TABEL PURCHASE ORDERS (Pembelian Stok)
-- =====================================================

CREATE TABLE purchase_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    
    -- Order Info
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255),
    purchase_date DATE NOT NULL,
    
    -- Amounts
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_po_number (po_number),
    INDEX idx_purchase_date (purchase_date)
);

CREATE TABLE purchase_order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    
    quantity DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_purchase_order_id (purchase_order_id),
    INDEX idx_product_id (product_id)
);

-- =====================================================
-- 7. TABEL MEMBERS/CUSTOMERS
-- =====================================================

CREATE TABLE members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    
    -- Personal Info
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    
    -- Membership
    member_level ENUM('baru', 'silver', 'gold', 'platinum') DEFAULT 'baru',
    join_date DATE NOT NULL,
    
    -- Points & Stats
    total_points INT DEFAULT 0,
    total_transactions INT DEFAULT 0,
    total_spending DECIMAL(15,2) DEFAULT 0.00,
    
    -- Preferences
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_phone (phone),
    INDEX idx_name (name)
);

-- =====================================================
-- 8. TABEL TRANSACTIONS (Transaksi Penjualan)
-- =====================================================

CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    member_id BIGINT UNSIGNED,
    
    -- Transaction Info
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Payment Details
    payment_method ENUM('cash', 'qris', 'transfer', 'ewallet', 'debit') NOT NULL,
    payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'paid',
    
    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Cash Payment
    cash_received DECIMAL(15,2),
    cash_change DECIMAL(15,2),
    
    -- Member Points
    points_earned INT DEFAULT 0,
    points_used INT DEFAULT 0,
    
    -- HPP Calculation
    total_hpp DECIMAL(15,2) DEFAULT 0.00, -- Total Harga Pokok Penjualan
    gross_profit DECIMAL(15,2) DEFAULT 0.00, -- Laba Kotor
    
    notes TEXT,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_business_id (business_id),
    INDEX idx_member_id (member_id),
    INDEX idx_transaction_number (transaction_number),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_payment_method (payment_method)
);

CREATE TABLE transaction_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    
    -- Item Details
    product_name VARCHAR(255) NOT NULL, -- Snapshot nama produk
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    
    -- Pricing
    purchase_price DECIMAL(15,2) NOT NULL, -- HPP per unit (snapshot)
    selling_price DECIMAL(15,2) NOT NULL,  -- Harga jual per unit
    
    -- Calculations
    subtotal DECIMAL(15,2) NOT NULL, -- quantity * selling_price
    hpp_total DECIMAL(15,2) NOT NULL, -- quantity * purchase_price
    profit DECIMAL(15,2) NOT NULL, -- subtotal - hpp_total
    
    notes TEXT,
    
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_product_id (product_id)
);

-- =====================================================
-- 9. TABEL EXPENSES (Biaya Operasional)
-- =====================================================

CREATE TABLE expense_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id)
);

CREATE TABLE expenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    expense_category_id BIGINT UNSIGNED,
    
    -- Expense Info
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_period ENUM('daily', 'monthly', 'yearly'),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
    INDEX idx_business_id (business_id),
    INDEX idx_expense_date (expense_date),
    INDEX idx_category_id (expense_category_id)
);

-- =====================================================
-- 10. TABEL REPORTS CACHE (untuk performa)
-- =====================================================

CREATE TABLE daily_reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    report_date DATE NOT NULL,
    
    -- Sales
    total_transactions INT DEFAULT 0,
    total_sales DECIMAL(15,2) DEFAULT 0.00,
    total_discount DECIMAL(15,2) DEFAULT 0.00,
    
    -- HPP & Profit
    total_hpp DECIMAL(15,2) DEFAULT 0.00,
    gross_profit DECIMAL(15,2) DEFAULT 0.00,
    gross_margin DECIMAL(5,2) DEFAULT 0.00,
    
    -- Expenses
    total_expenses DECIMAL(15,2) DEFAULT 0.00,
    net_profit DECIMAL(15,2) DEFAULT 0.00,
    net_margin DECIMAL(5,2) DEFAULT 0.00,
    
    -- Items
    total_items_sold INT DEFAULT 0,
    
    -- Members
    total_member_transactions INT DEFAULT 0,
    new_members_count INT DEFAULT 0,
    
    -- Payment Methods
    cash_transactions DECIMAL(15,2) DEFAULT 0.00,
    digital_transactions DECIMAL(15,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_report (business_id, report_date),
    INDEX idx_business_id (business_id),
    INDEX idx_report_date (report_date)
);

-- =====================================================
-- 11. TABEL SETTINGS & PREFERENCES
-- =====================================================

CREATE TABLE business_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_setting (business_id, setting_key),
    INDEX idx_business_id (business_id)
);

-- =====================================================
-- 12. TABEL NOTIFICATIONS & REMINDERS
-- =====================================================

CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Notification Details
    type ENUM('stock_alert', 'report_reminder', 'payment_due', 'system', 'promotion') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related Data
    related_type VARCHAR(50), -- 'product', 'transaction', 'member'
    related_id BIGINT UNSIGNED,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
);

-- =====================================================
-- 13. TABEL AUDIT LOG (Track semua perubahan penting)
-- =====================================================

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED,
    
    -- Action Details
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT UNSIGNED,
    
    -- Changes
    old_values JSON,
    new_values JSON,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 14. TABEL PROMO & DISCOUNTS
-- =====================================================

CREATE TABLE promotions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT UNSIGNED NOT NULL,
    
    -- Promo Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promo_code VARCHAR(50),
    
    -- Discount
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(15,2) NOT NULL,
    
    -- Conditions
    min_purchase DECIMAL(15,2) DEFAULT 0.00,
    max_discount DECIMAL(15,2),
    
    -- Target
    member_level ENUM('all', 'baru', 'silver', 'gold', 'platinum') DEFAULT 'all',
    applicable_products JSON, -- Array of product IDs
    
    -- Validity
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_usage INT,
    current_usage INT DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_promo_code (promo_code),
    INDEX idx_dates (start_date, end_date)
);

-- =====================================================
-- 15. TABEL MEMBER POINTS HISTORY
-- =====================================================

CREATE TABLE member_points_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT UNSIGNED NOT NULL,
    transaction_id BIGINT UNSIGNED,
    
    -- Points Details
    points_change INT NOT NULL, -- Positive for earn, negative for redeem
    points_before INT NOT NULL,
    points_after INT NOT NULL,
    
    -- Reason
    type ENUM('earned', 'redeemed', 'expired', 'adjustment') NOT NULL,
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_member_id (member_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 16. TABEL ACTIVATION CODES (untuk kontrol akses)
-- =====================================================

CREATE TABLE activation_codes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Assignment
    assigned_to_phone VARCHAR(20),
    assigned_at TIMESTAMP NULL,
    
    -- Status
    is_used BOOLEAN DEFAULT FALSE,
    used_by_user_id BIGINT UNSIGNED,
    used_at TIMESTAMP NULL,
    
    -- Management
    created_by VARCHAR(100), -- 'system', 'admin', 'partner'
    partner_name VARCHAR(255), -- Nama partner UMKM
    
    expires_at TIMESTAMP NULL,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_assigned_phone (assigned_to_phone),
    INDEX idx_is_used (is_used)
);

-- =====================================================
-- VIEWS untuk Query yang Sering Dipakai
-- =====================================================

-- View: Product dengan Stock Alert
CREATE VIEW v_low_stock_products AS
SELECT 
    p.id,
    p.business_id,
    p.name,
    p.stock_quantity,
    p.min_stock,
    p.unit,
    p.selling_price,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock_quantity <= p.min_stock
  AND p.is_active = TRUE;

-- View: Top Selling Products
CREATE VIEW v_top_products AS
SELECT 
    p.id,
    p.business_id,
    p.name,
    COUNT(ti.id) as times_sold,
    SUM(ti.quantity) as total_quantity_sold,
    SUM(ti.subtotal) as total_revenue,
    SUM(ti.profit) as total_profit
FROM products p
INNER JOIN transaction_items ti ON p.id = ti.product_id
INNER JOIN transactions t ON ti.transaction_id = t.id
WHERE t.payment_status = 'paid'
GROUP BY p.id, p.business_id, p.name;

-- View: Member dengan Total Spending
CREATE VIEW v_member_stats AS
SELECT 
    m.id,
    m.business_id,
    m.name,
    m.phone,
    m.member_level,
    m.total_points,
    COUNT(DISTINCT t.id) as total_transactions,
    COALESCE(SUM(t.total_amount), 0) as total_spending,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction
FROM members m
LEFT JOIN transactions t ON m.id = t.member_id AND t.payment_status = 'paid'
GROUP BY m.id, m.business_id, m.name, m.phone, m.member_level, m.total_points;

-- =====================================================
-- STORED PROCEDURES untuk Perhitungan HPP
-- =====================================================

DELIMITER //

-- Procedure: Hitung HPP untuk satu transaksi
CREATE PROCEDURE sp_calculate_transaction_hpp(
    IN p_transaction_id BIGINT
)
BEGIN
    DECLARE v_total_hpp DECIMAL(15,2);
    DECLARE v_total_sales DECIMAL(15,2);
    DECLARE v_gross_profit DECIMAL(15,2);
    
    -- Hitung total HPP dari transaction items
    SELECT 
        COALESCE(SUM(hpp_total), 0),
        COALESCE(SUM(subtotal), 0)
    INTO v_total_hpp, v_total_sales
    FROM transaction_items
    WHERE transaction_id = p_transaction_id;
    
    -- Hitung gross profit
    SET v_gross_profit = v_total_sales - v_total_hpp;
    
    -- Update transaction
    UPDATE transactions
    SET 
        total_hpp = v_total_hpp,
        gross_profit = v_gross_profit
    WHERE id = p_transaction_id;
END //

-- Procedure: Generate Daily Report
CREATE PROCEDURE sp_generate_daily_report(
    IN p_business_id BIGINT,
    IN p_report_date DATE
)
BEGIN
    -- Delete existing report for the date
    DELETE FROM daily_reports 
    WHERE business_id = p_business_id 
      AND report_date = p_report_date;
    
    -- Insert new report
    INSERT INTO daily_reports (
        business_id,
        report_date,
        total_transactions,
        total_sales,
        total_discount,
        total_hpp,
        gross_profit,
        gross_margin,
        total_expenses,
        net_profit,
        net_margin,
        total_items_sold,
        total_member_transactions,
        cash_transactions,
        digital_transactions
    )
    SELECT 
        p_business_id,
        p_report_date,
        COUNT(DISTINCT t.id),
        COALESCE(SUM(t.total_amount), 0),
        COALESCE(SUM(t.discount_amount), 0),
        COALESCE(SUM(t.total_hpp), 0),
        COALESCE(SUM(t.gross_profit), 0),
        CASE 
            WHEN SUM(t.total_amount) > 0 
            THEN (SUM(t.gross_profit) / SUM(t.total_amount)) * 100
            ELSE 0 
        END,
        COALESCE((
            SELECT SUM(amount) 
            FROM expenses 
            WHERE business_id = p_business_id 
              AND expense_date = p_report_date
        ), 0),
        COALESCE(SUM(t.gross_profit), 0) - COALESCE((
            SELECT SUM(amount) 
            FROM expenses 
            WHERE business_id = p_business_id 
              AND expense_date = p_report_date
        ), 0),
        0, -- net_margin will be calculated
        COALESCE(SUM((
            SELECT SUM(quantity) 
            FROM transaction_items 
            WHERE transaction_id = t.id
        )), 0),
        COUNT(DISTINCT CASE WHEN t.member_id IS NOT NULL THEN t.id END),
        COALESCE(SUM(CASE WHEN t.payment_method = 'cash' THEN t.total_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN t.payment_method != 'cash' THEN t.total_amount ELSE 0 END), 0)
    FROM transactions t
    WHERE t.business_id = p_business_id
      AND DATE(t.transaction_date) = p_report_date
      AND t.payment_status = 'paid';
      
    -- Update net_margin
    UPDATE daily_reports
    SET net_margin = CASE 
        WHEN total_sales > 0 
        THEN (net_profit / total_sales) * 100
        ELSE 0 
    END
    WHERE business_id = p_business_id 
      AND report_date = p_report_date;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS untuk Automation
-- =====================================================

DELIMITER //

-- Trigger: Auto-update product stock setelah transaksi
CREATE TRIGGER trg_after_transaction_item_insert
AFTER INSERT ON transaction_items
FOR EACH ROW
BEGIN
    -- Kurangi stock
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Catat stock movement
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
        movement_date
    )
    SELECT 
        p.business_id,
        NEW.product_id,
        'sale',
        -NEW.quantity,
        NEW.purchase_price,
        NEW.selling_price,
        'transaction',
        NEW.transaction_id,
        p.stock_quantity + NEW.quantity,
        p.stock_quantity,
        NOW()
    FROM products p
    WHERE p.id = NEW.product_id;
END //

-- Trigger: Update member stats setelah transaksi
CREATE TRIGGER trg_after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.member_id IS NOT NULL AND NEW.payment_status = 'paid' THEN
        UPDATE members
        SET 
            total_transactions = total_transactions + 1,
            total_spending = total_spending + NEW.total_amount,
            total_points = total_points + NEW.points_earned - NEW.points_used
        WHERE id = NEW.member_id;
    END IF;
END //

-- Trigger: Auto-generate transaction number
CREATE TRIGGER trg_before_transaction_insert
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
        SET NEW.transaction_number = CONCAT(
            'INV-',
            DATE_FORMAT(NEW.transaction_date, '%Y%m%d'),
            '-',
            LPAD((
                SELECT COUNT(*) + 1 
                FROM transactions 
                WHERE business_id = NEW.business_id 
                  AND DATE(transaction_date) = DATE(NEW.transaction_date)
            ), 4, '0')
        );
    END IF;
END //

DELIMITER ;

-- =====================================================
-- INDEXES untuk Performance Optimization
-- =====================================================

-- Composite indexes untuk query yang sering dipakai
CREATE INDEX idx_transactions_business_date ON transactions(business_id, transaction_date);
CREATE INDEX idx_transactions_member_status ON transactions(member_id, payment_status);
CREATE INDEX idx_products_business_active ON products(business_id, is_active);
CREATE INDEX idx_stock_movements_product_date ON stock_movements(product_id, movement_date);

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Default Categories
INSERT INTO expense_categories (business_id, name, description) VALUES
(1, 'Listrik & Air', 'Biaya listrik dan air bulanan'),
(1, 'Sewa Tempat', 'Biaya sewa kios/warung'),
(1, 'Gaji/Upah', 'Gaji karyawan dan upah harian'),
(1, 'Transport & Bensin', 'Biaya transportasi dan BBM'),
(1, 'Lain-lain', 'Biaya operasional lainnya');

-- Sample Activation Codes (untuk testing)
INSERT INTO activation_codes (code, created_by, partner_name) VALUES
('UMKM2026', 'system', 'KasirKu Official'),
('DEMO1234', 'system', 'Demo Account');

```

**PENJELASAN DATABASE:**

1. **Users & Auth**: Sistem aktivasi kode + OTP verification
2. **Business**: Profil usaha dengan mode HPP (sederhana/akurat)
3. **Products**: Barang dengan tracking harga beli/jual untuk HPP
4. **Stock Movements**: Riwayat keluar-masuk stok dengan HP