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

-- OilDesk stock tanks
CREATE TABLE IF NOT EXISTS stocks (
  id               SERIAL PRIMARY KEY,
  product          VARCHAR(50) NOT NULL UNIQUE,
  name             VARCHAR(80) NOT NULL,
  tank             VARCHAR(40),
  current_litres   NUMERIC(12,2) NOT NULL DEFAULT 0,
  capacity_litres  NUMERIC(12,2) NOT NULL,
  threshold_litres NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed the three tanks (only if they don't exist yet):
INSERT INTO stocks (product, name, tank, current_litres, capacity_litres, threshold_litres)
VALUES
  ('petrol',   'Petrol',   'Tank 01', 16400, 20000, 4000),
  ('diesel',   'Diesel',   'Tank 02',  3600, 20000, 4000),
  ('kerosene', 'Kerosene', 'Tank 03',  8100, 15000, 3000)
ON CONFLICT (product) DO NOTHING;
