-- Product Service Database Initialization Script
-- Database: product_database
-- User: product_user

-- ============================================================================
-- SCHEMA CREATION
-- ============================================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    slug VARCHAR(100) UNIQUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Categories Indexes
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE,
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    tags TEXT[],
    slug VARCHAR(255) UNIQUE,
    is_featured BOOLEAN DEFAULT FALSE,
    cost_price DECIMAL(10,2),
    margin_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Products Indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_uid VARCHAR(255) NOT NULL,
    order_id INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Product Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_uid ON product_reviews(user_uid);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert Sample Categories
INSERT INTO categories (name, description, status, sort_order, slug, image_url) VALUES
    ('Electronics', 'Electronic devices and accessories', 'active', 1, 'electronics', 'https://example.com/images/electronics.jpg'),
    ('Clothing', 'Fashion and apparel for all ages', 'active', 2, 'clothing', 'https://example.com/images/clothing.jpg'),
    ('Books', 'Books, magazines, and reading materials', 'active', 3, 'books', 'https://example.com/images/books.jpg'),
    ('Home & Garden', 'Home improvement and garden supplies', 'active', 4, 'home-garden', 'https://example.com/images/home-garden.jpg')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Products
INSERT INTO products (name, description, price, stock, category_id, sku, status, tags, slug, is_featured, cost_price, margin_percentage) VALUES
    -- Electronics
    ('Wireless Bluetooth Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 149.99, 50, 1, 'ELEC-HEAD-001', 'active', ARRAY['audio', 'wireless', 'bluetooth'], 'wireless-bluetooth-headphones', true, 75.00, 50.00),
    ('4K Smart TV 55"', 'Ultra HD Smart TV with HDR and built-in streaming apps', 599.99, 25, 1, 'ELEC-TV-001', 'active', ARRAY['tv', 'smart', '4k'], '4k-smart-tv-55', true, 350.00, 41.67),
    ('Laptop Stand Aluminum', 'Ergonomic aluminum laptop stand with adjustable height', 39.99, 100, 1, 'ELEC-ACC-001', 'active', ARRAY['accessories', 'ergonomic'], 'laptop-stand-aluminum', false, 15.00, 62.50),
    ('USB-C Hub 7-in-1', 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader', 49.99, 75, 1, 'ELEC-ACC-002', 'active', ARRAY['accessories', 'usb-c'], 'usb-c-hub-7-in-1', false, 20.00, 60.00),
    
    -- Clothing
    ('Men''s Cotton T-Shirt', 'Comfortable 100% cotton t-shirt in various colors', 24.99, 200, 2, 'CLTH-MEN-001', 'active', ARRAY['men', 'casual', 'cotton'], 'mens-cotton-tshirt', false, 8.00, 67.97),
    ('Women''s Yoga Pants', 'High-waist yoga pants with moisture-wicking fabric', 44.99, 150, 2, 'CLTH-WOM-001', 'active', ARRAY['women', 'activewear', 'yoga'], 'womens-yoga-pants', true, 18.00, 60.00),
    ('Unisex Hoodie', 'Warm fleece hoodie with kangaroo pocket', 54.99, 120, 2, 'CLTH-UNI-001', 'active', ARRAY['unisex', 'casual', 'winter'], 'unisex-hoodie', false, 22.00, 60.00),
    ('Kids Denim Jeans', 'Durable denim jeans for children ages 5-12', 34.99, 80, 2, 'CLTH-KID-001', 'active', ARRAY['kids', 'denim'], 'kids-denim-jeans', false, 14.00, 60.00),
    
    -- Books
    ('The Art of Programming', 'Comprehensive guide to software development best practices', 49.99, 60, 3, 'BOOK-TECH-001', 'active', ARRAY['programming', 'technology', 'education'], 'art-of-programming', true, 20.00, 60.00),
    ('Mystery Novel Collection', 'Box set of 5 bestselling mystery novels', 79.99, 40, 3, 'BOOK-FIC-001', 'active', ARRAY['fiction', 'mystery', 'collection'], 'mystery-novel-collection', false, 35.00, 56.25),
    ('Cooking Masterclass', 'Professional cooking techniques and recipes', 39.99, 70, 3, 'BOOK-COOK-001', 'active', ARRAY['cooking', 'recipes', 'lifestyle'], 'cooking-masterclass', false, 15.00, 62.50),
    ('Children''s Picture Book', 'Colorful illustrated book for ages 3-7', 19.99, 100, 3, 'BOOK-CHILD-001', 'active', ARRAY['children', 'illustrated', 'education'], 'childrens-picture-book', false, 8.00, 60.00),
    
    -- Home & Garden
    ('Indoor Plant Pot Set', 'Set of 3 ceramic plant pots with drainage holes', 34.99, 90, 4, 'HOME-GARD-001', 'active', ARRAY['plants', 'decor', 'ceramic'], 'indoor-plant-pot-set', false, 12.00, 65.71),
    ('LED Desk Lamp', 'Adjustable LED desk lamp with touch control and USB charging', 44.99, 110, 4, 'HOME-LIGHT-001', 'active', ARRAY['lighting', 'led', 'office'], 'led-desk-lamp', true, 18.00, 60.00),
    ('Kitchen Knife Set', 'Professional 8-piece stainless steel knife set with block', 129.99, 45, 4, 'HOME-KITCH-001', 'active', ARRAY['kitchen', 'knives', 'cooking'], 'kitchen-knife-set', false, 55.00, 57.69),
    ('Outdoor Garden Tools', 'Complete gardening tool set with trowel, pruner, and gloves', 59.99, 65, 4, 'HOME-GARD-002', 'active', ARRAY['garden', 'tools', 'outdoor'], 'outdoor-garden-tools', false, 25.00, 58.33)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Product Service database initialization completed successfully';
    RAISE NOTICE 'Created tables: categories, products, product_reviews';
    RAISE NOTICE 'Inserted % categories', (SELECT COUNT(*) FROM categories);
    RAISE NOTICE 'Inserted % products', (SELECT COUNT(*) FROM products);
END $$;
