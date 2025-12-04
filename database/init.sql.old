-- E-Commerce Platform - Single Database Schema
-- This file initializes the complete e-commerce database for all microservices

-- =============================================
-- E-COMMERCE DATABASE SCHEMA
-- =============================================

-- Users table (User Service)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    -- Meta fields
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended, deleted
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    source VARCHAR(50), -- web, mobile, api, admin
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Categories table (Product Service)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    -- Meta fields
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, archived
    sort_order INTEGER DEFAULT 0,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    slug VARCHAR(100) UNIQUE,
    image_url VARCHAR(500),
    seo_title VARCHAR(200),
    seo_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_by INTEGER, -- admin user who created this
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Products table (Product Service)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    -- Meta fields
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, out_of_stock, discontinued
    sku VARCHAR(100) UNIQUE, -- Stock Keeping Unit
    barcode VARCHAR(100),
    weight DECIMAL(8, 2), -- in kg
    dimensions VARCHAR(100), -- LxWxH in cm
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    material VARCHAR(100),
    tags TEXT[], -- Array of tags
    slug VARCHAR(255) UNIQUE,
    seo_title VARCHAR(200),
    seo_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_digital BOOLEAN DEFAULT FALSE,
    requires_shipping BOOLEAN DEFAULT TRUE,
    min_order_quantity INTEGER DEFAULT 1,
    max_order_quantity INTEGER,
    view_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    cost_price DECIMAL(10, 2), -- Cost to business
    margin_percentage DECIMAL(5, 2), -- Profit margin
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    created_by INTEGER, -- admin user who created this
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Orders table (Order Service)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    shipping_address TEXT,
    -- Meta fields
    order_number VARCHAR(50) UNIQUE, -- Human-readable order number
    currency VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    coupon_code VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(50), -- credit_card, paypal, stripe, etc.
    shipping_method VARCHAR(50), -- standard, express, overnight
    tracking_number VARCHAR(100),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    notes TEXT, -- Internal notes
    customer_notes TEXT, -- Customer notes
    source VARCHAR(50), -- web, mobile, api, admin
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Order items table (Order Service)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    -- Meta fields
    product_sku VARCHAR(100),
    product_image_url VARCHAR(500),
    product_weight DECIMAL(8, 2),
    product_dimensions VARCHAR(100),
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_rate DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    final_price DECIMAL(10, 2) NOT NULL, -- Price after discounts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (Order Service)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    -- Meta fields
    payment_id VARCHAR(100) UNIQUE, -- External payment ID
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_id VARCHAR(255), -- Bank/processor transaction ID
    gateway VARCHAR(50), -- stripe, paypal, square, etc.
    gateway_response JSONB, -- Full gateway response
    failure_reason TEXT,
    refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    refund_reason TEXT,
    processing_fee DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2), -- Amount after fees
    ip_address INET,
    user_agent TEXT,
    billing_address JSONB, -- Structured billing address
    shipping_address JSONB, -- Structured shipping address
    metadata JSONB, -- Additional payment metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL
);

-- =============================================
-- ADDITIONAL META TABLES
-- =============================================

-- User sessions table (User Service)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_type VARCHAR(50), -- desktop, mobile, tablet
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address INET,
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Product reviews table (Product Service)
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    order_id INTEGER, -- Optional: link to order
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- System logs table (All Services)
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL, -- user-service, product-service, etc.
    level VARCHAR(20) NOT NULL, -- info, warning, error, debug
    message TEXT NOT NULL,
    context JSONB, -- Additional context data
    user_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100), -- For tracing requests
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events table (All Services)
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL, -- page_view, product_view, add_to_cart, etc.
    user_id INTEGER,
    session_id VARCHAR(100),
    properties JSONB, -- Event properties
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating_average);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payments(gateway);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Product reviews indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved);

-- System logs indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_service ON system_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties ON analytics_events USING GIN(properties);

-- =============================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =============================================

-- Insert sample categories with meta fields
INSERT INTO categories (name, description, status, sort_order, slug, seo_title, is_featured) VALUES 
('Electronics', 'Electronic devices and accessories', 'active', 1, 'electronics', 'Electronics Store - Latest Tech Gadgets', true),
('Clothing', 'Apparel and fashion items', 'active', 2, 'clothing', 'Fashion Store - Trendy Clothing', true),
('Books', 'Books and educational materials', 'active', 3, 'books', 'Book Store - Educational Resources', false),
('Home & Garden', 'Home improvement and garden supplies', 'active', 4, 'home-garden', 'Home & Garden Store - DIY Supplies', false)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products with meta fields
INSERT INTO products (name, description, price, stock, category_id, sku, brand, color, weight, tags, slug, seo_title, is_featured, cost_price, margin_percentage) VALUES
('Laptop', 'High-performance laptop for work and gaming', 999.99, 10, 1, 'LAPTOP-001', 'TechBrand', 'Silver', 2.5, ARRAY['electronics', 'computers', 'laptops'], 'laptop-gaming', 'Best Gaming Laptop 2024', true, 600.00, 40.00),
('Smartphone', 'Latest model smartphone with advanced features', 699.99, 25, 1, 'PHONE-001', 'MobileTech', 'Black', 0.2, ARRAY['electronics', 'phones', 'mobile'], 'smartphone-pro', 'Latest Smartphone 2024', true, 400.00, 42.86),
('T-Shirt', 'Comfortable cotton t-shirt', 19.99, 50, 2, 'TSHIRT-001', 'FashionBrand', 'Blue', 0.3, ARRAY['clothing', 'shirts', 'cotton'], 'cotton-t-shirt', 'Comfortable Cotton T-Shirt', false, 8.00, 60.00),
('Jeans', 'Classic blue denim jeans', 49.99, 30, 2, 'JEANS-001', 'DenimCo', 'Blue', 0.8, ARRAY['clothing', 'jeans', 'denim'], 'classic-jeans', 'Classic Blue Jeans', false, 20.00, 60.00),
('Programming Book', 'Learn modern web development', 39.99, 15, 3, 'BOOK-001', 'TechBooks', 'Multi', 0.5, ARRAY['books', 'programming', 'education'], 'programming-book', 'Learn Web Development', false, 15.00, 62.50),
('Garden Tools Set', 'Complete set of gardening tools', 89.99, 8, 4, 'GARDEN-001', 'GardenPro', 'Green', 3.0, ARRAY['garden', 'tools', 'diy'], 'garden-tools-set', 'Professional Garden Tools', false, 35.00, 60.00)
ON CONFLICT DO NOTHING;

-- =============================================
-- DEVELOPMENT NOTES
-- =============================================

-- 1. Single database for all microservices
-- 2. Uses default postgres user for simplicity
-- 3. All services share the same database connection
-- 4. Tables are logically separated by service purpose
-- 5. No cross-service foreign keys (microservices best practice)
-- 6. Data consistency maintained through application logic

-- =============================================
-- PRODUCTION CONSIDERATIONS
-- =============================================

-- 1. Change default postgres password in production
-- 2. Use environment variables for database credentials
-- 3. Enable SSL/TLS for database connections
-- 4. Implement database backup strategies
-- 5. Monitor database performance and connections
-- 6. Consider read replicas for high-traffic services
