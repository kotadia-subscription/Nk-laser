-- Cloudflare D1 Database Schema
-- NK Laser Spares & Optics
-- To initialize schema on Cloudflare D1:
--   npx wrangler d1 execute nk-laser-db --file=./d1-schema.sql --remote
-- To inject full catalog & site configuration:
--   npx wrangler d1 execute nk-laser-db --file=./d1-seed.sql --remote

CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
