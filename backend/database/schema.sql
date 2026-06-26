-- OilDesk users table
-- Run once against your Postgres database:
--   psql -U postgres -d "Vat Billing System" -f backend/database/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(255) NOT NULL,
  email              VARCHAR(255) NOT NULL UNIQUE,
  password           VARCHAR(255) NOT NULL,
  store_name         VARCHAR(255),
  vat_number         VARCHAR(50),
  reset_token        VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- If the users table already exists, add the new columns:
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vat_number VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token);
