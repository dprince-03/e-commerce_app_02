-- Initial database setup for E-commerce Platform
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create indexes for better search performance
-- These will be created after tables are created by Sequelize

-- Function to generate product search vector
CREATE OR REPLACE FUNCTION generate_product_search_vector(name TEXT, description TEXT, keywords TEXT)
RETURNS tsvector AS $$
BEGIN
    RETURN to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(keywords, '')
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update product search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := generate_product_search_vector(
        NEW.name, 
        NEW.description, 
        NEW.search_keywords
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    -- This function can be called periodically to clean up expired cart sessions
    -- DELETE FROM "Carts" WHERE "expiresAt" < NOW();
    NULL; -- Placeholder for now
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO postgres;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'E-commerce database initialized successfully';
END $$;