-- E-commerce Platform Database Initialization Script
-- This script creates the initial database structure and sample data

-- Create database if it doesn't exist
-- Note: This should be run as a superuser or database owner

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types (these will be handled by Prisma in the actual implementation)
-- The following are placeholders for the enum types that Prisma will create

-- Note: In the actual implementation, Prisma will handle the creation of these types
-- based on the schema.prisma file. This script is mainly for reference and
-- any additional database-level configurations.

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (these will be created by Prisma)
-- The following are examples of indexes that might be useful:

-- Full-text search index for products
-- CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));

-- Index for product categories
-- CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Index for product prices
-- CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Index for user emails
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for orders by user and date
-- CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders(user_id, created_at);

-- Index for cart items by user
-- CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

-- Index for reviews by product
-- CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- Index for product variants by product
-- CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- Index for product images by product
-- CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- Index for addresses by user
-- CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- Index for notifications by user
-- CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Index for coupons by code
-- CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Index for wishlist items by user
-- CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON wishlist_items(user_id);

-- Index for order items by order
-- CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Index for order items by product
-- CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Index for categories by parent
-- CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Index for categories by slug
-- CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Index for products by slug
-- CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Index for products by SKU
-- CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Index for product variants by SKU
-- CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Index for users by role
-- CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index for users by status
-- CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Index for orders by status
-- CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index for orders by payment_status
-- CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Index for orders by order_number
-- CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Index for reviews by rating
-- CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Index for reviews by verified status
-- CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified);

-- Index for products by featured status
-- CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- Index for products by active status
-- CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Index for products by digital status
-- CREATE INDEX IF NOT EXISTS idx_products_digital ON products(is_digital);

-- Index for products by brand
-- CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Index for products by model
-- CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);

-- Index for products by tags (GIN index for array search)
-- CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);

-- Index for products by dimensions (JSONB index)
-- CREATE INDEX IF NOT EXISTS idx_products_dimensions ON products USING gin(dimensions);

-- Index for product variants by attributes (JSONB index)
-- CREATE INDEX IF NOT EXISTS idx_product_variants_attributes ON product_variants USING gin(attributes);

-- Index for order items by attributes (JSONB index)
-- CREATE INDEX IF NOT EXISTS idx_order_items_attributes ON order_items USING gin(attributes);

-- Index for cart items by attributes (JSONB index)
-- CREATE INDEX IF NOT EXISTS idx_cart_items_attributes ON cart_items USING gin(attributes);

-- Index for notifications by type
-- CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Index for notifications by read status
-- CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Index for coupons by active status
-- CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- Index for coupons by expiration date
-- CREATE INDEX IF NOT EXISTS idx_coupons_expires ON coupons(expires_at);

-- Index for addresses by type
-- CREATE INDEX IF NOT EXISTS idx_addresses_type ON addresses(type);

-- Index for addresses by default status
-- CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(is_default);

-- Index for addresses by country
-- CREATE INDEX IF NOT EXISTS idx_addresses_country ON addresses(country);

-- Index for addresses by city
-- CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city);

-- Index for addresses by state
-- CREATE INDEX IF NOT EXISTS idx_addresses_state ON addresses(state);

-- Index for addresses by postal code
-- CREATE INDEX IF NOT EXISTS idx_addresses_postal_code ON addresses(postal_code);

-- Index for product images by primary status
-- CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(is_primary);

-- Index for product images by sort order
-- CREATE INDEX IF NOT EXISTS idx_product_images_sort ON product_images(sort_order);

-- Index for categories by sort order
-- CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Index for categories by active status
-- CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Index for products by stock quantity
-- CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);

-- Index for products by low stock threshold
-- CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(low_stock_threshold);

-- Index for products by weight
-- CREATE INDEX IF NOT EXISTS idx_products_weight ON products(weight);

-- Index for products by cost price
-- CREATE INDEX IF NOT EXISTS idx_products_cost ON products(cost_price);

-- Index for products by compare price
-- CREATE INDEX IF NOT EXISTS idx_products_compare ON products(compare_price);

-- Index for products by created date
-- CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);

-- Index for products by updated date
-- CREATE INDEX IF NOT EXISTS idx_products_updated ON products(updated_at);

-- Index for users by created date
-- CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);

-- Index for users by updated date
-- CREATE INDEX IF NOT EXISTS idx_users_updated ON users(updated_at);

-- Index for orders by created date
-- CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Index for orders by updated date
-- CREATE INDEX IF NOT EXISTS idx_orders_updated ON orders(updated_at);

-- Index for orders by estimated delivery
-- CREATE INDEX IF NOT EXISTS idx_orders_delivery ON orders(estimated_delivery);

-- Index for orders by delivered date
-- CREATE INDEX IF NOT EXISTS idx_orders_delivered ON orders(delivered_at);

-- Index for orders by cancelled date
-- CREATE INDEX IF NOT EXISTS idx_orders_cancelled ON orders(cancelled_at);

-- Index for orders by refunded date
-- CREATE INDEX IF NOT EXISTS idx_orders_refunded ON orders(refunded_at);

-- Index for reviews by created date
-- CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);

-- Index for reviews by updated date
-- CREATE INDEX IF NOT EXISTS idx_reviews_updated ON reviews(updated_at);

-- Index for cart items by created date
-- CREATE INDEX IF NOT EXISTS idx_cart_items_created ON cart_items(created_at);

-- Index for cart items by updated date
-- CREATE INDEX IF NOT EXISTS idx_cart_items_updated ON cart_items(updated_at);

-- Index for wishlist items by created date
-- CREATE INDEX IF NOT EXISTS idx_wishlist_items_created ON wishlist_items(created_at);

-- Index for notifications by created date
-- CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Index for notifications by read date
-- CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- Index for coupons by created date
-- CREATE INDEX IF NOT EXISTS idx_coupons_created ON coupons(created_at);

-- Index for coupons by updated date
-- CREATE INDEX IF NOT EXISTS idx_coupons_updated ON coupons(updated_at);

-- Index for coupons by start date
-- CREATE INDEX IF NOT EXISTS idx_coupons_starts ON coupons(starts_at);

-- Index for addresses by created date
-- CREATE INDEX IF NOT EXISTS idx_addresses_created ON addresses(created_at);

-- Index for addresses by updated date
-- CREATE INDEX IF NOT EXISTS idx_addresses_updated ON addresses(updated_at);

-- Index for product variants by created date
-- CREATE INDEX IF NOT EXISTS idx_product_variants_created ON product_variants(created_at);

-- Index for product variants by updated date
-- CREATE INDEX IF NOT EXISTS idx_product_variants_updated ON product_variants(updated_at);

-- Index for product images by created date
-- CREATE INDEX IF NOT EXISTS idx_product_images_created ON product_images(created_at);

-- Index for order items by created date
-- CREATE INDEX IF NOT EXISTS idx_order_items_created ON order_items(created_at);

-- Index for categories by created date
-- CREATE INDEX IF NOT EXISTS idx_categories_created ON categories(created_at);

-- Index for categories by updated date
-- CREATE INDEX IF NOT EXISTS idx_categories_updated ON categories(updated_at);

-- Note: The actual indexes will be created by Prisma based on the schema.prisma file
-- This script provides a reference for additional performance optimizations

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ecommerce_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ecommerce_user;

-- Grant necessary permissions to the ecommerce user
GRANT CONNECT ON DATABASE ecommerce_db TO ecommerce_user;
GRANT USAGE ON SCHEMA public TO ecommerce_user;
GRANT CREATE ON SCHEMA public TO ecommerce_user;

-- Note: After running this script, you should:
-- 1. Run Prisma migrations: npx prisma migrate dev
-- 2. Generate Prisma client: npx prisma generate
-- 3. Seed the database with sample data: npm run db:seed