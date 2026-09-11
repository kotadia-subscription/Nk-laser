-- Cloudflare D1 Database Schema
-- NK Laser Spares & Optics
-- To initialize schema on Cloudflare D1:
--   npx wrangler d1 execute nk-laser-db --file=./d1-schema.sql --remote
-- To inject full catalog & site configuration:
--   npx wrangler d1 execute nk-laser-db --file=./d1-seed.sql --remote

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  guid TEXT,
  sku TEXT,
  title TEXT NOT NULL,
  category TEXT,
  category_slug TEXT NOT NULL,
  sub_category TEXT,
  material TEXT,
  thickness TEXT,
  dimensions TEXT,
  image_url TEXT,
  description TEXT,
  brand TEXT,
  power_range TEXT,
  wavelength TEXT,
  stock_status TEXT DEFAULT 'In Stock',
  in_stock INTEGER DEFAULT 1,
  is_popular INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  estimated_price REAL DEFAULT 0,
  regular_price REAL DEFAULT 0,
  sale_price REAL DEFAULT 0,
  moq INTEGER DEFAULT 1,
  raw_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_title TEXT,
  description TEXT,
  icon_name TEXT,
  image_url TEXT,
  default_material TEXT,
  default_power TEXT,
  item_count INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 1,
  show_on_home INTEGER DEFAULT 1,
  sub_categories_json TEXT,
  oem_brands_json TEXT,
  power_ranges_json TEXT,
  raw_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BRANDS TABLE
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  series_json TEXT,
  raw_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author TEXT,
  company TEXT,
  location TEXT,
  rating INTEGER DEFAULT 5,
  comment TEXT,
  project_type TEXT,
  status TEXT DEFAULT 'approved',
  verified INTEGER DEFAULT 1,
  data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. INQUIRIES TABLE
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

-- 7. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. CONFIG / SYSTEM CACHE TABLE
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE & FAST QUERIES
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_sub_category ON products(sub_category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

