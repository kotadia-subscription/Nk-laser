-- Cloudflare D1 Database Schema: NK Laser Spares & Optics
-- Zero-Migration Document & Relational Model for Complete Data Preservation Across Code Redeployments

-- 1. Master Configuration Store (Settings, Products, Categories, Brands, Power Ranges)
-- Using JSON document persistence ensures any future property/field additions or deletions
-- never require SQL migrations or risk data corruption.
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer Inquiries & RFQ Leads
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  phone_encrypted TEXT,
  email_encrypted TEXT,
  company TEXT,
  laser_power TEXT,
  machine_model TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  raw_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Verified Customer Reviews & Testimonials
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author TEXT,
  rating INTEGER DEFAULT 5,
  comment TEXT,
  project_type TEXT,
  status TEXT DEFAULT 'approved',
  data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Active Admin Sessions (Server-side session validation)
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
