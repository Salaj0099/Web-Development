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

-- Deliveries received from Nepal Oil Corporation (the only supplier)
CREATE TABLE IF NOT EXISTS deliveries (
  id            SERIAL PRIMARY KEY,
  product       VARCHAR(50) NOT NULL,
  name          VARCHAR(80) NOT NULL,
  quantity      NUMERIC(12,2) NOT NULL,
  rate          NUMERIC(12,2) NOT NULL,
  total_amount  NUMERIC(14,2) NOT NULL,
  invoice_no    VARCHAR(80) NOT NULL UNIQUE,
  delivery_date DATE NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'received',
  remarks       TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries (delivery_date DESC);

-- Audit trail for every stock change (delivery, sale, adjustment).
-- One row per movement; `balance` is the remaining stock right after it.
CREATE TABLE IF NOT EXISTS stock_movements (
  id         SERIAL PRIMARY KEY,
  product    VARCHAR(50) NOT NULL,
  name       VARCHAR(80) NOT NULL,
  type       VARCHAR(20) NOT NULL,           -- delivery | sale | adjustment
  qty_in     NUMERIC(12,2) NOT NULL DEFAULT 0,
  qty_out    NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance    NUMERIC(12,2) NOT NULL,
  reference  VARCHAR(120),
  reason     VARCHAR(120),
  remarks    TEXT,
  staff      VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movements_created ON stock_movements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements (product);

-- Fuel sales. Bill numbers come from a sequence so they're always unique.
-- (Named `sales` to avoid an unused legacy `bills` scaffold table.)
CREATE SEQUENCE IF NOT EXISTS bill_no_seq START 1;

CREATE TABLE IF NOT EXISTS sales (
  id            SERIAL PRIMARY KEY,
  bill_no       VARCHAR(40) NOT NULL UNIQUE,
  customer      VARCHAR(200),
  pan           VARCHAR(40),
  address       VARCHAR(255),
  vehicle       VARCHAR(60),
  payment       VARCHAR(20) NOT NULL,        -- Cash | Credit | Cheque | QR Payment
  status        VARCHAR(20) NOT NULL,        -- paid | credit | cancelled
  taxable       NUMERIC(14,2) NOT NULL DEFAULT 0,
  vat           NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount      NUMERIC(14,2) NOT NULL DEFAULT 0,
  amount        NUMERIC(14,2) NOT NULL,
  litres        NUMERIC(14,2) NOT NULL DEFAULT 0,
  remarks       TEXT,
  bank_name     VARCHAR(120),
  cheque_no     VARCHAR(60),
  cheque_date   DATE,
  cheque_status VARCHAR(20),                 -- pending | cleared
  collected_at  TIMESTAMP,
  cleared       BOOLEAN,
  staff         VARCHAR(120),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  cancelled_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
  id       SERIAL PRIMARY KEY,
  sale_id  INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product  VARCHAR(50) NOT NULL,
  name     VARCHAR(80) NOT NULL,
  qty      NUMERIC(12,2) NOT NULL,
  rate     NUMERIC(12,2) NOT NULL,
  amount   NUMERIC(14,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_created ON sales (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items (sale_id);
