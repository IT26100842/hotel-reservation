-- =====================================================================
-- SERENE STAY RESORT & HOTEL BOOKING SYSTEM
-- Complete MySQL Production Database Schema
-- Version: 2.0 (Full Web App + Comprehensive Admin Panel)
-- Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_activity_logs;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS housekeeping_tasks;
DROP TABLE IF EXISTS room_maintenance_logs;
DROP TABLE IF EXISTS saved_rooms;
DROP TABLE IF EXISTS review_reactions;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS promo_codes;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS booking_addon_items;
DROP TABLE IF EXISTS booking_addons;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_pricing_rules;
DROP TABLE IF EXISTS room_amenities;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS room_images;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS room_categories;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. USER ROLES & ACCESS CONTROL (RBAC)
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'super_admin, hotel_manager, front_desk, housekeeping, guest',
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSON COMMENT 'JSON array of permissions e.g. ["manage_rooms", "manage_bookings", "view_revenue"]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. USERS & GUEST PROFILES
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT UNSIGNED NOT NULL DEFAULT 5 COMMENT 'Default to guest',
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NULL,
    nic_passport VARCHAR(50) NULL COMMENT 'National Identity Card or Passport Number',
    city VARCHAR(100) NULL,
    country VARCHAR(100) NULL DEFAULT 'Sri Lanka',
    address TEXT NULL,
    avatar_url VARCHAR(500) NULL,
    preferred_currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
    status ENUM('active', 'inactive', 'suspended', 'banned') NOT NULL DEFAULT 'active',
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100) NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);

-- User active authentication sessions
CREATE TABLE user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password resets token storage
CREATE TABLE password_resets (
    email VARCHAR(191) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_password_resets_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. ROOM CATEGORIES & INVENTORY MANAGEMENT
-- ---------------------------------------------------------------------
CREATE TABLE room_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'standard, deluxe, suite, villa',
    short_description VARCHAR(255) NULL,
    base_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rooms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL,
    room_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'e.g. 101, 102, V-01',
    name VARCHAR(150) NOT NULL COMMENT 'e.g. Deluxe Oceanfront Suite',
    slug VARCHAR(191) NOT NULL UNIQUE COMMENT 'e.g. deluxe-oceanfront',
    price_per_night DECIMAL(12, 2) NOT NULL DEFAULT 12000.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
    rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    review_count INT UNSIGNED NOT NULL DEFAULT 0,
    location VARCHAR(200) NOT NULL DEFAULT 'Bentota Beach, Sri Lanka',
    max_guests INT UNSIGNED NOT NULL DEFAULT 2,
    bed_type VARCHAR(100) NOT NULL DEFAULT 'King Bed',
    beds_description VARCHAR(100) NOT NULL DEFAULT '1 King or 2 Single Beds',
    baths_count INT UNSIGNED NOT NULL DEFAULT 1,
    size_sq_ft INT UNSIGNED NOT NULL DEFAULT 450,
    tag VARCHAR(50) NULL COMMENT 'Guest Favorite, Best Seller, New',
    view_type VARCHAR(100) NOT NULL DEFAULT 'Oceanfront Panoramic View',
    cancellation_policy TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_description LONGTEXT NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    popular BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('available', 'occupied', 'cleaning', 'maintenance', 'reserved') NOT NULL DEFAULT 'available',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rooms_category FOREIGN KEY (category_id) REFERENCES room_categories (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_rooms_slug ON rooms(slug);
CREATE INDEX idx_rooms_price ON rooms(price_per_night);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_featured ON rooms(featured);
CREATE INDEX idx_rooms_category ON rooms(category_id);

-- Room High-Resolution Image Gallery
CREATE TABLE room_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(150) NULL,
    display_order INT UNSIGNED NOT NULL DEFAULT 1,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_images_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_room_images_room_order ON room_images(room_id, display_order);

-- Amenities Master List
CREATE TABLE amenities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NULL COMMENT 'Lucide icon identifier e.g. wifi, coffee, wind',
    category VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT 'general, room, bathroom, wellness, entertainment',
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Room & Amenities Junction Table (Many-to-Many)
CREATE TABLE room_amenities (
    room_id BIGINT UNSIGNED NOT NULL,
    amenity_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT fk_ra_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_ra_amenity FOREIGN KEY (amenity_id) REFERENCES amenities (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dynamic Seasonal / Holiday Pricing Rules (Admin managed)
CREATE TABLE room_pricing_rules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED NULL COMMENT 'Null applies to all rooms in category or resort',
    category_id INT UNSIGNED NULL,
    title VARCHAR(150) NOT NULL COMMENT 'e.g. December Peak Holiday Surcharge',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pricing_type ENUM('fixed', 'percentage_increase', 'percentage_decrease') NOT NULL DEFAULT 'percentage_increase',
    adjustment_value DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pricing_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_pricing_category FOREIGN KEY (category_id) REFERENCES room_categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. PROMO CODES & DISCOUNTS
-- ---------------------------------------------------------------------
CREATE TABLE promo_codes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. SERENE10, VILLA20',
    description VARCHAR(255) NULL,
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    min_spend DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    max_discount_amount DECIMAL(12, 2) NULL,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    usage_limit INT UNSIGNED NULL COMMENT 'Total allowed bookings with this code',
    used_count INT UNSIGNED NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. RESERVATIONS & BOOKINGS (Core Business Table)
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(32) NOT NULL UNIQUE COMMENT 'Unique ref e.g. SS-LK-48291',
    user_id BIGINT UNSIGNED NULL COMMENT 'Null for guest bookings before registration',
    room_id BIGINT UNSIGNED NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INT UNSIGNED NOT NULL DEFAULT 1,
    adults INT UNSIGNED NOT NULL DEFAULT 1,
    children INT UNSIGNED NOT NULL DEFAULT 0,
    total_guests INT UNSIGNED NOT NULL DEFAULT 1,
    
    -- Guest Info Snapshot
    guest_full_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(191) NOT NULL,
    guest_phone VARCHAR(30) NOT NULL,
    guest_nic_passport VARCHAR(50) NULL,
    special_requests TEXT NULL,
    
    -- Financial Breakdown
    payment_method ENUM('payhere', 'card', 'paypal', 'pay_at_hotel', 'cash', 'bank_transfer') NOT NULL DEFAULT 'pay_at_hotel',
    room_price_per_night DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    service_charge DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '10% Resort Service Charge',
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '2.5% SSCL & Local Taxes',
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    promo_code_id INT UNSIGNED NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
    
    -- Status & Lifecycle
    status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show') NOT NULL DEFAULT 'confirmed',
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_in_at DATETIME NULL,
    checked_out_at DATETIME NULL,
    cancelled_at DATETIME NULL,
    cancellation_reason TEXT NULL,
    
    -- Admin & Front Desk Notes
    admin_notes TEXT NULL COMMENT 'Internal staff notes, VIP status, dietary remarks',
    checked_in_by BIGINT UNSIGNED NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_promo FOREIGN KEY (promo_code_id) REFERENCES promo_codes (id) ON DELETE SET NULL,
    CONSTRAINT fk_bookings_staff FOREIGN KEY (checked_in_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_guest_email ON bookings(guest_email);
CREATE INDEX idx_bookings_room_status ON bookings(room_id, status);

-- ---------------------------------------------------------------------
-- 6. BOOKING EXTRA ADD-ONS / EXPERIENCES (Spa, Airport Pickup, Dining)
-- ---------------------------------------------------------------------
CREATE TABLE booking_addons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL COMMENT 'e.g. Airport Private Van Transfer, Ayurvedic Massage',
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
    pricing_model ENUM('per_person', 'per_booking', 'per_night') NOT NULL DEFAULT 'per_booking',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE booking_addon_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    addon_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bai_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_bai_addon FOREIGN KEY (addon_id) REFERENCES booking_addons (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. PAYMENTS & TRANSACTIONS
-- ---------------------------------------------------------------------
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE COMMENT 'Gateway transaction ID (PayHere/PayPal)',
    payment_method VARCHAR(50) NOT NULL COMMENT 'payhere, card, paypal, cash, bank_transfer',
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
    status ENUM('pending', 'successful', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    gateway_name VARCHAR(50) NOT NULL COMMENT 'PayHere Sri Lanka, Stripe, PayPal, Manual Front-Desk',
    gateway_response_json LONGTEXT NULL COMMENT 'Full payload from payment gateway webhook',
    paid_at DATETIME NULL,
    refunded_at DATETIME NULL,
    refund_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Invoices generated for corporate / tax compliance
CREATE TABLE invoices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. INV-2026-00492',
    booking_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    service_charge DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
    status ENUM('draft', 'issued', 'paid', 'cancelled') NOT NULL DEFAULT 'issued',
    issued_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    pdf_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. GUEST REVIEWS & SOCIAL INTERACTIONS
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NULL,
    room_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_location VARCHAR(100) NULL,
    avatar_url VARCHAR(500) NULL,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
    comment TEXT NOT NULL,
    room_booked_name VARCHAR(100) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    admin_reply TEXT NULL COMMENT 'Hotel Manager response shown publicly',
    admin_replied_at DATETIME NULL,
    likes_count INT UNSIGNED NOT NULL DEFAULT 0,
    hearts_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reviews_room_status ON reviews(room_id, status);

CREATE TABLE review_reactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    reaction_type ENUM('like', 'heart') NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_reaction (review_id, ip_address, reaction_type),
    CONSTRAINT fk_reactions_review FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. USER BOOKMARKS (SAVED ROOMS)
-- ---------------------------------------------------------------------
CREATE TABLE saved_rooms (
    user_id BIGINT UNSIGNED NOT NULL,
    room_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, room_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. ADMIN PANEL: HOUSEKEEPING & MAINTENANCE WORKFLOW
-- ---------------------------------------------------------------------
CREATE TABLE housekeeping_tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL,
    assigned_to BIGINT UNSIGNED NULL COMMENT 'Housekeeping staff user id',
    task_type ENUM('daily_cleaning', 'deep_cleaning', 'turn_down', 'post_checkout_turnaround') NOT NULL DEFAULT 'daily_cleaning',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'inspected', 'completed') NOT NULL DEFAULT 'pending',
    scheduled_date DATE NOT NULL,
    completed_at DATETIME NULL,
    inspected_by BIGINT UNSIGNED NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_housekeeping_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_housekeeping_staff FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_housekeeping_inspector FOREIGN KEY (inspected_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE room_maintenance_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL,
    reported_by BIGINT UNSIGNED NOT NULL,
    issue_title VARCHAR(150) NOT NULL COMMENT 'e.g. AC cooling leak, balcony sliding door lock',
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'emergency') NOT NULL DEFAULT 'medium',
    status ENUM('reported', 'in_progress', 'awaiting_parts', 'resolved') NOT NULL DEFAULT 'reported',
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    resolved_at DATETIME NULL,
    resolution_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_maint_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_maint_reporter FOREIGN KEY (reported_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. ADMIN AUDIT TRAIL & SYSTEM SETTINGS
-- ---------------------------------------------------------------------
CREATE TABLE audit_activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL COMMENT 'Admin/Staff performing action',
    action VARCHAR(100) NOT NULL COMMENT 'room_created, booking_cancelled, price_updated, role_changed',
    module VARCHAR(50) NOT NULL COMMENT 'rooms, bookings, rates, users, settings',
    record_id VARCHAR(50) NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_module_action ON audit_activity_logs(module, action);

CREATE TABLE system_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value LONGTEXT NOT NULL,
    setting_group VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT 'general, hotel_info, payment, tax, notification',
    display_name VARCHAR(150) NOT NULL,
    field_type ENUM('text', 'number', 'boolean', 'json', 'textarea') NOT NULL DEFAULT 'text',
    updated_by BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_user FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. USEFUL ANALYTICS VIEWS FOR ADMIN DASHBOARD
-- ---------------------------------------------------------------------

-- View: Quick Resort Occupancy Overview
CREATE OR REPLACE VIEW v_room_occupancy_overview AS
SELECT 
    r.id AS room_id,
    r.room_number,
    r.name AS room_name,
    c.name AS category_name,
    r.price_per_night,
    r.status AS room_status,
    b.id AS current_booking_id,
    b.booking_reference,
    b.guest_full_name,
    b.check_in_date,
    b.check_out_date
FROM rooms r
JOIN room_categories c ON r.category_id = c.id
LEFT JOIN bookings b ON r.id = b.room_id 
    AND b.status IN ('confirmed', 'checked_in')
    AND CURRENT_DATE BETWEEN b.check_in_date AND b.check_out_date;

-- View: Financial Revenue Monthly Summary
CREATE OR REPLACE VIEW v_monthly_revenue_summary AS
SELECT 
    DATE_FORMAT(b.booked_at, '%Y-%m') AS booking_month,
    COUNT(b.id) AS total_reservations,
    SUM(CASE WHEN b.status != 'cancelled' THEN b.total_amount ELSE 0 END) AS total_revenue_lkr,
    SUM(CASE WHEN b.status != 'cancelled' THEN b.service_charge ELSE 0 END) AS total_service_charges_lkr,
    SUM(CASE WHEN b.status != 'cancelled' THEN b.tax_amount ELSE 0 END) AS total_taxes_collected_lkr,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings_count
FROM bookings b
GROUP BY DATE_FORMAT(b.booked_at, '%Y-%m')
ORDER BY booking_month DESC;

-- =====================================================================
-- SEED DATA (INITIAL HOTEL DATA MATCHING SERENE STAY WEBSITE)
-- =====================================================================

-- Roles
INSERT INTO roles (id, name, display_name, description, permissions) VALUES
(1, 'super_admin', 'Super Administrator', 'Full system access and financial controls', '["*"]'),
(2, 'hotel_manager', 'General Manager', 'Manage rooms, pricing, staff and reports', '["manage_rooms","manage_bookings","manage_pricing","view_reports","manage_reviews"]'),
(3, 'front_desk', 'Front Desk Officer', 'Check-in, Check-out, and create guest reservations', '["view_rooms","create_booking","check_in_guest","check_out_guest"]'),
(4, 'housekeeping', 'Housekeeping Lead', 'Update room cleaning status and report maintenance', '["view_rooms","update_cleaning_status","report_maintenance"]'),
(5, 'guest', 'Registered Guest', 'Make bookings, save sanctuaries, manage personal profile', '["book_room","save_room","write_review"]');

-- Initial Users (Admin + Guest)
INSERT INTO users (id, role_id, full_name, email, password_hash, phone, city, country, avatar_url, preferred_currency) VALUES
(1, 1, 'Thilina Kavishan', 'admin@serenestay.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+94 77 123 4567', 'Bentota', 'Sri Lanka', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'LKR'),
(2, 5, 'Kavishan Perera', 'guest@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+94 71 987 6543', 'Colombo', 'Sri Lanka', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', 'LKR');

-- Room Categories
INSERT INTO room_categories (id, name, slug, short_description, base_price, sort_order) VALUES
(1, 'Standard Room', 'standard', 'Artisanal tropical teak garden retreat', 12500.00, 1),
(2, 'Deluxe Oceanfront', 'deluxe', 'Four-poster canopy bed overlooking the Indian Ocean', 18000.00, 2),
(3, 'Presidential Suite', 'suite', 'Panoramic corner penthouse with private plunge pool', 32000.00, 3),
(4, 'Coconut Grove Villa', 'villa', 'Secluded standalone pool villa hidden within palm groves', 45000.00, 4);

-- Amenities
INSERT INTO amenities (id, name, slug, icon, category, is_popular, sort_order) VALUES
(1, 'High-Speed Wi-Fi', 'wifi', 'wifi', 'general', TRUE, 1),
(2, 'Air Conditioning', 'air-conditioning', 'wind', 'room', TRUE, 2),
(3, 'Rain Shower', 'rain-shower', 'bath', 'bathroom', TRUE, 3),
(4, 'Private Ocean Balcony', 'private-balcony', 'maximize', 'room', TRUE, 4),
(5, 'Artisanal Ceylon Tea Station', 'ceylon-tea', 'coffee', 'room', TRUE, 5),
(6, 'Smart TV 55"', 'smart-tv', 'tv', 'entertainment', TRUE, 6),
(7, 'In-room Electronic Safe', 'safe', 'lock', 'room', TRUE, 7),
(8, 'Organic Ayurveda Toiletries', 'organic-toiletries', 'flower', 'bathroom', TRUE, 8),
(9, 'Private Plunge Pool', 'private-plunge-pool', 'waves', 'room', TRUE, 9),
(10, '24/7 Dedicated Butler Service', 'butler-service', 'clock', 'general', TRUE, 10);

-- Rooms (Matches INITIAL_ROOMS in Serene Stay)
INSERT INTO rooms (id, category_id, room_number, name, slug, price_per_night, currency, rating, review_count, location, max_guests, bed_type, beds_description, baths_count, size_sq_ft, tag, view_type, cancellation_policy, description, detailed_description, featured, popular, status) VALUES
(1, 1, '101', 'Standard Room', 'standard-room', 12500.00, 'LKR', 4.80, 64, 'Bentota Beach, Sri Lanka', 2, 'King Bed or 2 Twins', '1 King Bed or 2 Twins', 1, 380, 'Most Affordable', 'Lush Garden & Coconut Palm View', 'Free cancellation up to 48 hours before check-in', 'Bright and minimalist tropical retreat with artisanal teak accents and garden breeze.', 'Step into a serene private haven crafted from native teak timber and handwoven rattan. Featuring floor-to-ceiling glass doors opening onto a private verandah framed by tropical greenery, luxurious rain shower, plush king bed, and artisanal Ceylon tea station.', TRUE, TRUE, 'available'),
(2, 2, '201', 'Deluxe Oceanfront', 'deluxe-oceanfront', 18000.00, 'LKR', 4.95, 98, 'Bentota Beach, Sri Lanka', 3, 'Four-Poster Canopy King Bed', '1 Handcrafted Four-Poster King Bed', 1, 540, 'Guest Favorite', 'Unobstructed Panoramic Ocean View', 'Free cancellation up to 48 hours before check-in', 'Bespoke four-poster canopy bed overlooking azure waves with private sunset terrace.', 'Perched directly above the shoreline, our Deluxe Oceanfront sanctuary blends timeless tropical architecture with understated contemporary luxury. Wake up to the rhythmic sound of the Indian Ocean, rest under sheer canopy drapery, and soak in an oversized terrazzo tub overlooking the horizon.', TRUE, TRUE, 'available'),
(3, 3, '301', 'Presidential Suite', 'presidential-suite', 32000.00, 'LKR', 4.98, 42, 'Bentota Beach, Sri Lanka', 4, 'Emperor King & Daybed Lounge', '1 Emperor King + Daybed Lounge', 2, 920, 'Pure Luxury', '360° Coastal Sunset & Ocean View', 'Free cancellation up to 72 hours before check-in', 'Expansive panoramic penthouse with private outdoor plunge pool and personal butler care.', 'Our crown jewel residence occupies the top floor corner of the ocean wing. Features expansive open-concept living quarters, wraparound timber decking, private ocean-facing infinity plunge pool, walk-in dressing room, and dedicated 24-hour butler assistance.', TRUE, TRUE, 'available'),
(4, 4, 'V-01', 'Coconut Grove Villa', 'coconut-grove-villa', 45000.00, 'LKR', 5.00, 27, 'Bentota Beach, Sri Lanka', 5, '2 King Bedrooms', '2 Handcrafted Teak King Beds', 2, 1250, 'Exclusive Sanctuary', 'Private Palm Forest & Riverfront View', 'Free cancellation up to 7 days before check-in', 'Standalone double-bedroom villa surrounded by ancient coconut palms with private courtyard pool.', 'Hidden within a secluded century-old coconut grove, this private single-story villa offers absolute tranquility. Boasting its own walled tropical courtyard with a private swimming pool, two king master suites, outdoor rainfall showers, and open-air dining pavilion.', FALSE, TRUE, 'available');

-- Room Images
INSERT INTO room_images (room_id, image_url, caption, display_order, is_cover) VALUES
(1, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'Standard Room Bedroom', 1, TRUE),
(1, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'Standard Room Balcony', 2, FALSE),
(2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'Deluxe Oceanfront Bedroom', 1, TRUE),
(2, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', 'Deluxe Oceanfront Sunset View', 2, FALSE),
(3, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'Presidential Suite Master Living', 1, TRUE),
(3, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'Presidential Suite Terrace', 2, FALSE),
(4, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', 'Coconut Grove Villa Exterior Pool', 1, TRUE),
(4, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', 'Coconut Grove Villa Living Lounge', 2, FALSE);

-- Room Amenities Linking
INSERT INTO room_amenities (room_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8), (4, 9), (4, 10);

-- Promo Codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_spend, valid_from, valid_until, usage_limit, is_active) VALUES
('SERENE10', '10% Discount on any coastal room booking', 'percentage', 10.00, 10000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 500, TRUE),
('VILLA20', '20% Discount on exclusive pool villas', 'percentage', 20.00, 35000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 100, TRUE);

-- Sample Bookings (Matching mockData.ts)
INSERT INTO bookings (id, booking_reference, user_id, room_id, check_in_date, check_out_date, nights, adults, children, total_guests, guest_full_name, guest_email, guest_phone, guest_nic_passport, special_requests, payment_method, room_price_per_night, subtotal, service_charge, tax_amount, discount_amount, promo_code_id, total_amount, currency, status, booked_at) VALUES
(1, 'SS-LK-48291', 1, 2, '2026-10-18', '2026-10-21', 3, 2, 0, 2, 'Thilina Kavishan', 'thilinakavishan42@gmail.com', '+94 77 123 4567', '941829304V', 'High floor sunset view requested if possible.', 'payhere', 18000.00, 54000.00, 5400.00, 1350.00, 5400.00, 1, 55350.00, 'LKR', 'confirmed', '2026-10-01 10:30:00'),
(2, 'SS-LK-21940', 1, 1, '2026-08-12', '2026-08-15', 3, 2, 0, 2, 'Thilina Kavishan', 'thilinakavishan42@gmail.com', '+94 77 123 4567', '941829304V', 'Late check-in around 8 PM.', 'card', 12500.00, 37500.00, 3750.00, 937.50, 0.00, NULL, 42187.50, 'LKR', 'checked_out', '2026-07-28 14:15:00');

-- Guest Reviews (Matching mockData.ts)
INSERT INTO reviews (id, booking_id, room_id, guest_name, guest_location, avatar_url, rating, comment, room_booked_name, status, is_featured, likes_count, hearts_count) VALUES
(1, 1, 2, 'Ayesha Fernando', 'Colombo, Sri Lanka', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 5.0, '“Waking up to the Indian Ocean right outside our four-poster bed was completely magical. The attention to detail, organic herbal tea, and barefoot luxury feel in Bentota made this our favorite anniversary getaway.”', 'Deluxe Oceanfront', 'approved', TRUE, 18, 24),
(2, 2, 3, 'David & Sarah Jenkins', 'Melbourne, Australia', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 5.0, '“The Presidential Suite exceeded all our expectations. The private plunge pool looking over the sunset coast was pristine. The concierge arranged an unforgettable river safari and private beachfront dinner.”', 'Presidential Suite', 'approved', TRUE, 29, 35),
(3, NULL, 1, 'Dr. Ruwan Wickramasinghe', 'Kandy, Sri Lanka', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 4.9, '“A genuine sanctuary of calm. Modern amenities seamlessly integrated with artisanal teak wood and lush coconut palms. The staff hospitality was authentic Sri Lankan warmth at its finest.”', 'Standard Room', 'approved', TRUE, 14, 21);

-- System Settings (Hotel Configuration)
INSERT INTO system_settings (setting_key, setting_value, setting_group, display_name, field_type) VALUES
('hotel_name', 'Serene Stay Resort & Sanctuary', 'hotel_info', 'Hotel Name', 'text'),
('hotel_address', 'Galle Road, Bentota 80500, Sri Lanka', 'hotel_info', 'Hotel Physical Address', 'textarea'),
('hotel_contact_phone', '+94 34 227 5000', 'hotel_info', 'Front Desk Contact Phone', 'text'),
('hotel_contact_email', 'reservations@serenestay.com', 'hotel_info', 'Reservations Email', 'text'),
('service_charge_percentage', '10.0', 'tax', 'Resort Service Charge (%)', 'number'),
('government_tax_percentage', '2.5', 'tax', 'Government SSCL / Local Tax (%)', 'number'),
('currency_symbol', 'LKR', 'payment', 'Primary Display Currency', 'text'),
('payhere_merchant_id', '1224920', 'payment', 'PayHere Merchant ID', 'text'),
('free_cancellation_hours', '48', 'general', 'Free Cancellation Grace Period (Hours)', 'number');

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
