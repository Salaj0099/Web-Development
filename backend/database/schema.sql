-- OilDesk users table
-- Run once against your Postgres database:
--   psql -U postgres -d "Vat Billing System" -f backend/database/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(255) NOT NULL,
  email              VARCHAR(255) NOT NULL UNIQUE,
  password           VARCHAR(255) NOT NULL,
  reset_token        VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token);
