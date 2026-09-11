/**
 * NK Laser Spares & Optics - D1 Seed Script Generator
 * Reads app-config.json and generates d1-seed.sql with individual INSERT statements
 * for relational tables (categories, brands, settings, products, reviews, config).
 * Ensures zero statements exceed SQLite's 1MB limit (preventing SQLITE_TOOBIG).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const configPath = path.join(__dirname, '..', 'app-config.json');
const outputPath = path.join(__dirname, '..', 'd1-seed.sql');
const extractedImagesDir = path.join(__dirname, '..', 'public', 'images', 'extracted');

if (!fs.existsSync(configPath)) {
  console.error('app-config.json not found at', configPath);
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// D1's bulk SQL import rejects any single statement over ~100KB (SQLITE_TOOBIG).
// A base64 image accidentally embedded inline (e.g. via an upload field with no
// hosting configured) can blow a single product/category/brand row past that
// limit. Walk the config and swap any large inline data: URI for a real file
// under public/images/extracted, so it deploys as a normal static asset instead.
const DATA_URI_SIZE_THRESHOLD = 15000;
let extractedCount = 0;

function extractLargeDataUris(node, keyPath) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => extractLargeDataUris(item, keyPath.concat(i)));
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const key of Object.keys(node)) {
    const val = node[key];
    if (typeof val === 'string' && val.length > DATA_URI_SIZE_THRESHOLD) {
      const match = val.match(/^data:image\/(\w+);base64,([\s\S]+)$/);
      if (match) {
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
        const buf = Buffer.from(match[2], 'base64');
        const hash = crypto.createHash('md5').update(val).digest('hex').slice(0, 8);
        const slugBase = String(node.id || node.slug || keyPath.join('-'))
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 60);
        const fileName = `${slugBase}-${hash}.${ext}`;
        fs.mkdirSync(extractedImagesDir, { recursive: true });
        fs.writeFileSync(path.join(extractedImagesDir, fileName), buf);
        const publicPath = `/images/extracted/${fileName}`;
        node[key] = publicPath;
        extractedCount++;
        console.log(`  Extracted embedded image at ${keyPath.concat(key).join('.')} (${(buf.length / 1024).toFixed(1)} KB) -> ${publicPath}`);
      }
    } else if (val && typeof val === 'object') {
      extractLargeDataUris(val, keyPath.concat(key));
    }
  }
}

extractLargeDataUris(cfg, []);
if (extractedCount > 0) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  console.log(`Rewrote app-config.json: ${extractedCount} inline image(s) moved to public/images/extracted/ (remember to deploy these new files).`);
}

function sqlStr(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

let sql = `-- Cloudflare D1 Database Seed Script
-- NK Laser Spares & Optics
-- Generated for Cloudflare D1 with Dedicated Relational Tables
-- Run with: npx wrangler d1 execute nk-laser-db --file=./d1-seed.sql --remote

-- Clean existing data before seeding
DELETE FROM products;
DELETE FROM categories;
DELETE FROM brands;
DELETE FROM settings;
DELETE FROM reviews;
DELETE FROM config;

`;

// 1. CATEGORIES
sql += `-- =========================================================================\n`;
sql += `-- 1. CATEGORIES (${cfg.categories?.length || 0} entries)\n`;
sql += `-- =========================================================================\n`;
if (Array.isArray(cfg.categories)) {
  for (const cat of cfg.categories) {
    const rawJson = JSON.stringify(cat);
    sql += `INSERT INTO categories (id, slug, name, short_title, description, icon_name, image_url, default_material, default_power, item_count, featured, show_on_home, sub_categories_json, oem_brands_json, power_ranges_json, raw_json) VALUES (${sqlStr(cat.id)}, ${sqlStr(cat.slug)}, ${sqlStr(cat.name)}, ${sqlStr(cat.shortTitle)}, ${sqlStr(cat.description)}, ${sqlStr(cat.iconName)}, ${sqlStr(cat.imageUrl)}, ${sqlStr(cat.defaultMaterial)}, ${sqlStr(cat.defaultPower)}, ${cat.itemCount || 0}, ${cat.featured !== false ? 1 : 0}, ${cat.showOnHome !== false ? 1 : 0}, ${sqlStr(JSON.stringify(cat.subCategories || []))}, ${sqlStr(JSON.stringify(cat.oemBrands || []))}, ${sqlStr(JSON.stringify(cat.powerRanges || []))}, ${sqlStr(rawJson)});\n`;
  }
}

// 2. BRANDS
sql += `\n-- =========================================================================\n`;
sql += `-- 2. BRANDS (${cfg.brands?.length || 0} entries)\n`;
sql += `-- =========================================================================\n`;
if (Array.isArray(cfg.brands)) {
  for (const b of cfg.brands) {
    const rawJson = JSON.stringify(b);
    sql += `INSERT INTO brands (id, name, logo_url, description, series_json, raw_json) VALUES (${sqlStr(b.id)}, ${sqlStr(b.name)}, ${sqlStr(b.logoUrl)}, ${sqlStr(b.description)}, ${sqlStr(JSON.stringify(b.series || []))}, ${sqlStr(rawJson)});\n`;
  }
}

// 3. SETTINGS
sql += `\n-- =========================================================================\n`;
sql += `-- 3. SETTINGS\n`;
sql += `-- =========================================================================\n`;
if (cfg.settings && typeof cfg.settings === 'object') {
  for (const [k, v] of Object.entries(cfg.settings)) {
    const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
    sql += `INSERT INTO settings (key, value) VALUES (${sqlStr(k)}, ${sqlStr(valStr)});\n`;
  }
  sql += `INSERT INTO settings (key, value) VALUES ('_full_settings', ${sqlStr(JSON.stringify(cfg.settings))});\n`;
}

// 4. PRODUCTS
sql += `\n-- =========================================================================\n`;
sql += `-- 4. PRODUCTS (${cfg.products?.length || 0} entries)\n`;
sql += `-- =========================================================================\n`;
if (Array.isArray(cfg.products)) {
  for (const p of cfg.products) {
    const rawJson = JSON.stringify(p);
    sql += `INSERT INTO products (id, guid, sku, title, category, category_slug, sub_category, material, thickness, dimensions, image_url, description, brand, power_range, wavelength, stock_status, in_stock, is_popular, is_featured, estimated_price, regular_price, sale_price, moq, raw_json) VALUES (${sqlStr(p.id)}, ${sqlStr(p.guid || p.id)}, ${sqlStr(p.sku)}, ${sqlStr(p.title)}, ${sqlStr(p.category)}, ${sqlStr(p.categorySlug || p.category)}, ${sqlStr(p.subCategory)}, ${sqlStr(p.material)}, ${sqlStr(p.thickness)}, ${sqlStr(p.dimensions)}, ${sqlStr(p.imageUrl)}, ${sqlStr(p.description)}, ${sqlStr(p.brand)}, ${sqlStr(p.powerRange)}, ${sqlStr(p.wavelength)}, ${sqlStr(p.stockStatus || 'In Stock')}, ${p.inStock !== false ? 1 : 0}, ${p.isPopular ? 1 : 0}, ${p.isFeatured ? 1 : 0}, ${p.estimatedPrice || 0}, ${p.regularPrice || 0}, ${p.salePrice || 0}, ${p.moq || 1}, ${sqlStr(rawJson)});\n`;
  }
}

// 5. REVIEWS
sql += `\n-- =========================================================================\n`;
sql += `-- 5. REVIEWS (${cfg.reviews?.length || 0} entries)\n`;
sql += `-- =========================================================================\n`;
if (Array.isArray(cfg.reviews)) {
  for (const r of cfg.reviews) {
    const rawJson = JSON.stringify(r);
    sql += `INSERT INTO reviews (id, author, company, location, rating, comment, project_type, status, verified, data) VALUES (${sqlStr(r.id)}, ${sqlStr(r.author)}, ${sqlStr(r.company)}, ${sqlStr(r.location)}, ${r.rating || 5}, ${sqlStr(r.comment)}, ${sqlStr(r.projectType)}, ${sqlStr(r.status || 'approved')}, ${r.verified !== false ? 1 : 0}, ${sqlStr(rawJson)});\n`;
  }
}

// 6. CONFIG METADATA
sql += `\n-- =========================================================================\n`;
sql += `-- 6. CONFIG & SYSTEM METADATA\n`;
sql += `-- =========================================================================\n`;
sql += `INSERT INTO config (key, value) VALUES ('lastPublishedAt', ${sqlStr(new Date().toISOString())});\n`;
sql += `INSERT INTO config (key, value) VALUES ('powerRanges', ${sqlStr(JSON.stringify(cfg.powerRanges || ['1kW - 3kW', '3kW - 6kW', '6kW - 12kW', '12kW - 30kW', '30kW+']))});\n`;
sql += `INSERT INTO config (key, value) VALUES ('version', '2.0');\n`;

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Successfully generated d1-seed.sql (${sql.length} bytes, ${(sql.length / 1024).toFixed(1)} KB)`);
