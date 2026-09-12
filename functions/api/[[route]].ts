/**
 * Cloudflare Pages Function: Edge API Router for NK Laser Spares & Optics
 * Handles /api/* endpoints natively at Cloudflare's edge with:
 * - Admin authentication (Bcrypt verification & secure session cookies/tokens)
 * - Cloudflare D1 persistent document & relational storage (zero data loss across redeployments)
 * - Customer PII encryption at rest (AES-256-GCM using DATA_ENCRYPTION_KEY)
 * - Catalog configuration persistence (products, categories, settings, reviews)
 * - Real-time synchronization across all live devices via /api/version & /api/config
 */

import bcrypt from 'bcryptjs';
import { DEFAULT_SITE_SETTINGS } from '../../src/lib/storage';
import { ProductItem, ProductCategoryDef, BrandItem, ReviewItem, SiteSettings } from '../../src/types';

const DEFAULT_POWER_RANGES = ['1kW - 3kW', '3kW - 6kW', '6kW - 12kW', '12kW - 30kW', '30kW+'];
const EMPTY_PRODUCTS: ProductItem[] = [];
const EMPTY_CATEGORIES: ProductCategoryDef[] = [];
const EMPTY_BRANDS: BrandItem[] = [];
const EMPTY_REVIEWS: ReviewItem[] = [];

interface Env {
  DB?: any; // Cloudflare D1 Database binding
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
  DATA_ENCRYPTION_KEY?: string;
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

interface PagesContext {
  request: Request;
  env: Env;
  params: {
    route?: string[];
  };
}

// Fallback in-memory session and cache store if D1 is not yet bound
const inMemorySessions = new Map<string, { expiresAt: number; data: string }>();
let memoryConfigCache: {
  settings: SiteSettings;
  products: ProductItem[];
  categories: ProductCategoryDef[];
  brands: BrandItem[];
  powerRanges: string[];
  reviews: ReviewItem[];
  lastPublishedAt: string;
} | null = null;

// Bcrypt work factor for password changes
const BCRYPT_ROUNDS = 12;
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// Default fallback hash (Salt rounds 12)
const DEFAULT_ADMIN_HASH = '$2b$12$wg8vMaZ20mnLMvTpbtoIp.KOGx1Ot59sE/xwjCzwSxw8zFs8ycmpK';

// =========================================================================
// STRUCTURED LOGGING HELPER FOR CLOUDFLARE PAGES & WORKERS
// Visible in Cloudflare Dashboard -> Pages -> Functions -> Real-time logs
// and via CLI: `wrangler pages deployment tail`
// =========================================================================
function logCloudflare(type: 'ENTRY' | 'AUTH' | 'D1_QUERY' | 'D1_INSERT' | 'D1_UPDATE' | 'D1_DELETE' | 'D1_BATCH' | 'ERROR' | 'INFO', message: string, details?: any) {
  const timestamp = new Date().toISOString();
  const tag = `[CF:${type}]`;
  if (details !== undefined) {
    const formatted = typeof details === 'object' ? JSON.stringify(details) : details;
    console.log(`${tag} ${timestamp} - ${message} | ${formatted}`);
  } else {
    console.log(`${tag} ${timestamp} - ${message}`);
  }
}

// Standard CORS and Security JSON Response Helper
function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
      ...headers
    }
  });
}

// Extract bearer token or cookie from request
function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  return cookies['admin_session'] || null;
}

// Verify Admin Authentication
async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  const token = extractToken(request);
  if (!token) return false;

  const now = Date.now();

  // 1. Check D1 session table if database is available
  if (env.DB) {
    try {
      const row = await env.DB.prepare(
        'SELECT expires_at FROM sessions WHERE token = ? AND expires_at > ?'
      ).bind(token, now).first();
      if (row) return true;
    } catch {
      // Fall through to memory check
    }
  }

  // 2. Fallback to memory session store
  const session = inMemorySessions.get(token);
  if (session && session.expiresAt > now) {
    return true;
  }

  return false;
}

// AES-256-GCM Encryption / Decryption Helpers for Customer PII
async function getCryptoKey(secretKey: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.digest('SHA-256', enc.encode(secretKey));
  return crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptPii(plainText: string, secretKey?: string): Promise<string> {
  if (!plainText || !secretKey) return plainText;
  try {
    const key = await getCryptoKey(secretKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const cipherHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `enc:${ivHex}:${cipherHex}`;
  } catch {
    return plainText;
  }
}

async function decryptPii(cipherText: string, secretKey?: string): Promise<string> {
  if (!cipherText || !secretKey || !cipherText.startsWith('enc:')) return cipherText;
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText;
    const ivBytes = new Uint8Array(parts[1].match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const cipherBytes = new Uint8Array(parts[2].match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const key = await getCryptoKey(secretKey);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, key, cipherBytes);
    return new TextDecoder().decode(decrypted);
  } catch {
    return cipherText;
  }
}

// Auto-initialize D1 schema tables if not yet created (zero-friction deployment)
let d1TablesInitialized = false;
async function ensureD1Tables(env: Env): Promise<void> {
  if (!env.DB || d1TablesInitialized) return;
  try {
    await env.DB.batch([
      // 1. Relational Products Table
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS products (
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
      )`),
      // 2. Relational Categories Table
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS categories (
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
      )`),
      // 3. Relational Brands Table
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS brands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo_url TEXT,
        description TEXT,
        series_json TEXT,
        raw_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`),
      // 4. Relational Settings Table
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`),
      // 5. Relational Reviews Table
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS reviews (
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
      )`),
      // 6. Relational Inquiries Table
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS inquiries (
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
      )`),
      // 7. Sessions Table
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`),
      // 8. Config / System Cache Table
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)
    ]);

    // Create Indexes
    await env.DB.batch([
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)'),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_products_category_slug ON products(category_slug)'),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)'),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)'),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status)'),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status)')
    ]);

    d1TablesInitialized = true;
    logCloudflare('D1_QUERY', 'Cloudflare D1 relational tables initialized and verified.');
  } catch (e: any) {
    logCloudflare('ERROR', `D1 auto-table bootstrap warning: ${e?.message || e}`);
  }
}

// Helper to load master configuration from D1 (or fallback)
async function loadFullConfig(env: Env) {
  let settings = DEFAULT_SITE_SETTINGS;
  let products = EMPTY_PRODUCTS;
  let categories = EMPTY_CATEGORIES;
  let brands = EMPTY_BRANDS;
  let powerRanges = DEFAULT_POWER_RANGES;
  let reviews = EMPTY_REVIEWS;
  let lastPublishedAt = new Date().toISOString();

  if (env.DB) {
    try {
      logCloudflare('D1_QUERY', 'Loading data from Cloudflare D1 relational tables...');
      
      // 1. Check products table first
      let loadedFromRelational = false;
      try {
        const prodRows = await env.DB.prepare('SELECT raw_json FROM products ORDER BY id ASC').all();
        if (prodRows && prodRows.results && prodRows.results.length > 0) {
          products = prodRows.results.map((r: any) => JSON.parse(r.raw_json));
          loadedFromRelational = true;
        }
      } catch (err: any) {
        logCloudflare('INFO', `Products table query: ${err?.message || err}`);
      }

      // 2. Load categories from categories table
      if (loadedFromRelational) {
        try {
          const catRows = await env.DB.prepare('SELECT raw_json FROM categories ORDER BY id ASC').all();
          if (catRows && catRows.results && catRows.results.length > 0) {
            categories = catRows.results.map((r: any) => JSON.parse(r.raw_json));
          }
        } catch (err: any) {
          logCloudflare('INFO', `Categories table query: ${err?.message || err}`);
        }

        // 3. Load brands from brands table
        try {
          const brandRows = await env.DB.prepare('SELECT raw_json FROM brands ORDER BY id ASC').all();
          if (brandRows && brandRows.results && brandRows.results.length > 0) {
            brands = brandRows.results.map((r: any) => JSON.parse(r.raw_json));
          }
        } catch (err: any) {
          logCloudflare('INFO', `Brands table query: ${err?.message || err}`);
        }

        // 4. Load settings from settings table
        try {
          const settingsRows = await env.DB.prepare('SELECT key, value FROM settings').all();
          if (settingsRows && settingsRows.results && settingsRows.results.length > 0) {
            const fullSettingsRow = settingsRows.results.find((r: any) => r.key === '_full_settings');
            if (fullSettingsRow && fullSettingsRow.value) {
              settings = JSON.parse(fullSettingsRow.value);
            } else {
              const assembled: Record<string, any> = { ...DEFAULT_SITE_SETTINGS };
              for (const row of settingsRows.results) {
                if (row.key === '_full_settings') continue;
                try {
                  assembled[row.key] = JSON.parse(row.value);
                } catch {
                  assembled[row.key] = row.value;
                }
              }
              settings = assembled as SiteSettings;
            }
          }
        } catch (err: any) {
          logCloudflare('INFO', `Settings table query: ${err?.message || err}`);
        }

        // 5. Load reviews from reviews table
        try {
          const reviewRows = await env.DB.prepare('SELECT data, id, author, company, location, rating, comment, project_type, status, verified, created_at FROM reviews ORDER BY created_at DESC').all();
          if (reviewRows && reviewRows.results && reviewRows.results.length > 0) {
            reviews = reviewRows.results.map((r: any) => {
              if (r.data) {
                try { return JSON.parse(r.data); } catch {}
              }
              return {
                id: r.id,
                clientName: r.author || 'Verified Buyer',
                companyName: r.company || '',
                location: r.location || '',
                rating: r.rating || 5,
                comment: r.comment || '',
                date: r.created_at || new Date().toISOString().split('T')[0],
                projectType: r.project_type || '',
                verified: Boolean(r.verified),
                status: r.status || 'approved'
              } as ReviewItem;
            });
          }
        } catch (err: any) {
          logCloudflare('INFO', `Reviews table query: ${err?.message || err}`);
        }

        // 6. Load metadata from config table
        try {
          const metaRows = await env.DB.prepare('SELECT key, value FROM config WHERE key IN ("lastPublishedAt", "powerRanges")').all();
          if (metaRows && metaRows.results) {
            for (const row of metaRows.results) {
              if (row.key === 'lastPublishedAt') lastPublishedAt = row.value;
              if (row.key === 'powerRanges') {
                try { powerRanges = JSON.parse(row.value); } catch {}
              }
            }
          }
        } catch {}

        logCloudflare('D1_QUERY', `Loaded catalog from Cloudflare D1 Relational Tables: ${products.length} products, ${categories.length} categories, ${brands.length} brands, ${reviews.length} reviews`);
      } else {
        // Fallback: Check legacy config table
        logCloudflare('D1_QUERY', 'Products table empty; checking fallback config table on Cloudflare D1...');
        const rows = await env.DB.prepare('SELECT key, value FROM config').all();
        if (rows && rows.results && rows.results.length > 0) {
          for (const row of rows.results) {
            try {
              if (row.key === 'settings') settings = JSON.parse(row.value);
              if (row.key === 'products') products = JSON.parse(row.value);
              if (row.key === 'categories') categories = JSON.parse(row.value);
              if (row.key === 'brands') brands = JSON.parse(row.value);
              if (row.key === 'powerRanges') powerRanges = JSON.parse(row.value);
              if (row.key === 'reviews') reviews = JSON.parse(row.value);
              if (row.key === 'lastPublishedAt') lastPublishedAt = row.value;
            } catch (parseErr: any) {
              logCloudflare('ERROR', `Error parsing JSON for config key "${row.key}": ${parseErr?.message || parseErr}`);
            }
          }
        }
      }
    } catch (err: any) {
      logCloudflare('ERROR', `Could not read from D1, using fallback: ${err?.message || err}`);
    }
  } else if (memoryConfigCache) {
    return memoryConfigCache;
  }

  const loaded = {
    settings,
    products,
    categories,
    brands,
    powerRanges,
    reviews,
    lastPublishedAt
  };
  memoryConfigCache = loaded;
  return loaded;
}

// Deletes rows from a relational D1 table whose id is not present in the incoming array,
// so that removals made client-side (delete category/product/brand/review) are actually
// reflected in D1 instead of the stale row being resurrected on the next load.
async function deleteStaleRows(env: Env, table: string, incomingIds: string[]): Promise<void> {
  if (incomingIds.length > 0) {
    const placeholders = incomingIds.map(() => '?').join(',');
    await env.DB.prepare(`DELETE FROM ${table} WHERE id NOT IN (${placeholders})`).bind(...incomingIds).run();
  } else {
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }
}

// Helper to persist master configuration to D1
async function saveFullConfig(env: Env, configData: any): Promise<string> {
  const publishedAt = new Date().toISOString();
  
  logCloudflare('D1_BATCH', 'Preparing D1 relational save for master configuration...', {
    hasSettings: Boolean(configData.settings),
    productsCount: Array.isArray(configData.products) ? configData.products.length : undefined,
    categoriesCount: Array.isArray(configData.categories) ? configData.categories.length : undefined,
    brandsCount: Array.isArray(configData.brands) ? configData.brands.length : undefined,
    powerRangesCount: Array.isArray(configData.powerRanges) ? configData.powerRanges.length : undefined,
    reviewsCount: Array.isArray(configData.reviews) ? configData.reviews.length : undefined,
    publishedAt
  });

  if (env.DB) {
    try {
      // 1. Save Settings to settings table
      if (configData.settings) {
        const settingStatements = [];
        settingStatements.push(env.DB.prepare(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
        ).bind('_full_settings', JSON.stringify(configData.settings)));

        for (const [k, v] of Object.entries(configData.settings)) {
          const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
          settingStatements.push(env.DB.prepare(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
          ).bind(k, valStr));
        }
        await env.DB.batch(settingStatements);
      }

      // 2. Save Categories to categories table (and remove rows for deleted categories)
      if (Array.isArray(configData.categories)) {
        await deleteStaleRows(env, 'categories', configData.categories.map((c: ProductCategoryDef) => c.id));
        if (configData.categories.length > 0) {
          const catStatements = configData.categories.map((c: ProductCategoryDef) => {
            return env.DB.prepare(`
              INSERT OR REPLACE INTO categories (
                id, slug, name, short_title, description, icon_name, image_url,
                default_material, default_power, item_count, featured, show_on_home,
                sub_categories_json, oem_brands_json, power_ranges_json, raw_json, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              c.id, c.slug, c.name, c.shortTitle || '', c.description || '', c.iconName || '', c.imageUrl || '',
              c.defaultMaterial || '', c.defaultPower || '', c.itemCount || 0,
              c.featured !== false ? 1 : 0, c.showOnHome !== false ? 1 : 0,
              JSON.stringify(c.subCategories || []), JSON.stringify(c.oemBrands || []),
              JSON.stringify(c.powerRanges || []), JSON.stringify(c)
            );
          });
          await env.DB.batch(catStatements);
        }
      }

      // 3. Save Brands to brands table (and remove rows for deleted brands)
      if (Array.isArray(configData.brands)) {
        await deleteStaleRows(env, 'brands', configData.brands.map((b: BrandItem) => b.id));
        if (configData.brands.length > 0) {
          const brandStatements = configData.brands.map((b: BrandItem) => {
            const series = (b as any).seriesList || (b as any).series || [];
            return env.DB.prepare(`
              INSERT OR REPLACE INTO brands (
                id, name, logo_url, description, series_json, raw_json, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              b.id, b.name, b.logoUrl || '', b.description || '', JSON.stringify(series), JSON.stringify(b)
            );
          });
          await env.DB.batch(brandStatements);
        }
      }

      // 4. Save Products to products table (in safe chunks of 50 to avoid any D1 statement limits)
      // and remove rows for deleted products.
      if (Array.isArray(configData.products)) {
        await deleteStaleRows(env, 'products', configData.products.map((p: ProductItem) => p.id));
        const CHUNK_SIZE = 50;
        for (let i = 0; i < configData.products.length; i += CHUNK_SIZE) {
          const chunk = configData.products.slice(i, i + CHUNK_SIZE);
          const prodStatements = chunk.map((p: ProductItem) => {
            return env.DB.prepare(`
              INSERT OR REPLACE INTO products (
                id, guid, sku, title, category, category_slug, sub_category, material,
                thickness, dimensions, image_url, description, brand, power_range, wavelength,
                stock_status, in_stock, is_popular, is_featured, estimated_price, regular_price,
                sale_price, moq, raw_json, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              p.id, p.guid || p.id, p.sku || '', p.title, p.category || '', p.categorySlug || p.category || '',
              p.subCategory || '', p.material || '', p.thickness || '', p.dimensions || '', p.imageUrl || '',
              p.description || '', p.brand || '', p.powerRange || '', p.wavelength || '',
              p.stockStatus || 'In Stock', p.inStock !== false ? 1 : 0, p.isPopular ? 1 : 0, p.isFeatured ? 1 : 0,
              p.estimatedPrice || 0, p.regularPrice || 0, p.salePrice || 0, p.moq || 1, JSON.stringify(p)
            );
          });
          await env.DB.batch(prodStatements);
        }
      }

      // 5. Save Reviews to reviews table (and remove rows for deleted reviews)
      if (Array.isArray(configData.reviews)) {
        await deleteStaleRows(env, 'reviews', configData.reviews.map((r: ReviewItem) => r.id));
        const CHUNK_SIZE = 50;
        for (let i = 0; i < configData.reviews.length; i += CHUNK_SIZE) {
          const chunk = configData.reviews.slice(i, i + CHUNK_SIZE);
          const reviewStatements = chunk.map((r: ReviewItem) => {
            const author = (r as any).clientName || (r as any).author || 'Verified Buyer';
            const company = (r as any).companyName || (r as any).company || '';
            const status = (r as any).status || 'approved';
            return env.DB.prepare(`
              INSERT OR REPLACE INTO reviews (
                id, author, company, location, rating, comment, project_type, status, verified, data
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              r.id, author, company, r.location || '', r.rating || 5,
              r.comment || '', r.projectType || '', status, r.verified !== false ? 1 : 0,
              JSON.stringify(r)
            );
          });
          await env.DB.batch(reviewStatements);
        }
      }

      // 6. Save metadata to config table
      const metaStatements = [
        env.DB.prepare('INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
          .bind('lastPublishedAt', publishedAt),
        env.DB.prepare('INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
          .bind('version', '2.0')
      ];
      if (Array.isArray(configData.powerRanges)) {
        metaStatements.push(
          env.DB.prepare('INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
            .bind('powerRanges', JSON.stringify(configData.powerRanges))
        );
      }
      await env.DB.batch(metaStatements);

      logCloudflare('D1_INSERT', `Cloudflare D1 relational save SUCCESS: committed permanently to D1.`, {
        publishedAt,
        productsCount: configData.products?.length,
        categoriesCount: configData.categories?.length
      });
    } catch (d1BatchErr: any) {
      logCloudflare('ERROR', `Cloudflare D1 batch write FAILED: ${d1BatchErr?.message || d1BatchErr}`);
      throw d1BatchErr;
    }
  } else {
    logCloudflare('INFO', 'env.DB binding not active; saved to in-memory config store.');
  }

  // Update in-memory fallback
  memoryConfigCache = {
    settings: configData.settings || memoryConfigCache?.settings || DEFAULT_SITE_SETTINGS,
    products: Array.isArray(configData.products) ? configData.products : (memoryConfigCache?.products || EMPTY_PRODUCTS),
    categories: Array.isArray(configData.categories) ? configData.categories : (memoryConfigCache?.categories || EMPTY_CATEGORIES),
    brands: Array.isArray(configData.brands) ? configData.brands : (memoryConfigCache?.brands || EMPTY_BRANDS),
    powerRanges: Array.isArray(configData.powerRanges) ? configData.powerRanges : (memoryConfigCache?.powerRanges || DEFAULT_POWER_RANGES),
    reviews: Array.isArray(configData.reviews) ? configData.reviews : (memoryConfigCache?.reviews || EMPTY_REVIEWS),
    lastPublishedAt: publishedAt
  };

  return publishedAt;
}

// Master Handler for all /api/* requests on Cloudflare Pages & Workers
export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const pathname = url.pathname.replace(/\/$/, '') || '/api';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Request entry logging for Cloudflare Pages / Workers
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || '127.0.0.1';
  const rayId = request.headers.get('cf-ray') || 'local';
  const token = extractToken(request);
  const hasAuthToken = Boolean(token);

  logCloudflare('ENTRY', `--> ${method} ${pathname}`, {
    ip: clientIp,
    rayId,
    hasAuthToken,
    hasD1: Boolean(env.DB)
  });

  // Ensure database tables exist if D1 is bound
  await ensureD1Tables(env);

  // =========================================================================
  // 1. HEALTH & REAL-TIME VERSION SYNCHRONIZATION ENDPOINTS
  // =========================================================================

  // GET /api/health
  if (pathname === '/api/health' && method === 'GET') {
    return jsonResponse({
      status: 'ok',
      service: 'NK Laser Edge API',
      d1Connected: Boolean(env.DB),
      timestamp: new Date().toISOString()
    });
  }

  // GET /api/version - Lightweight endpoint polled by clients for real-time live sync
  if (pathname === '/api/version' && method === 'GET') {
    const config = await loadFullConfig(env);
    return jsonResponse({
      success: true,
      version: '2.0',
      lastPublishedAt: config.lastPublishedAt,
      d1Connected: Boolean(env.DB)
    });
  }

  // =========================================================================
  // 2. AUTHENTICATION ENDPOINTS
  // =========================================================================

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({})) as { password?: string };
      const inputPass = String(body.password || '').trim();

      logCloudflare('AUTH', `Login attempt received from IP ${clientIp}`);

      if (!inputPass) {
        logCloudflare('AUTH', `Login FAILED from IP ${clientIp}: empty password provided`);
        return jsonResponse({ success: false, error: 'Administrator password is required' }, 400);
      }

      let isValid = false;

      // 1. Direct environment variable comparison (if ADMIN_PASSWORD secret is configured)
      if (env.ADMIN_PASSWORD && inputPass === env.ADMIN_PASSWORD.trim()) {
        isValid = true;
      }

      // 2. Stored D1 password hash check (if changed via admin panel)
      if (!isValid && env.DB) {
        try {
          const dbHash = await env.DB.prepare('SELECT value FROM config WHERE key = "adminPasswordHash"').first();
          if (dbHash && dbHash.value) {
            isValid = bcrypt.compareSync(inputPass, dbHash.value);
          }
        } catch {}
      }

      // 3. Bcrypt comparison against ADMIN_PASSWORD_HASH secret
      if (!isValid && env.ADMIN_PASSWORD_HASH) {
        isValid = bcrypt.compareSync(inputPass, env.ADMIN_PASSWORD_HASH.trim());
      }

      // 4. Default fallback hash check
      if (!isValid && !env.ADMIN_PASSWORD && !env.ADMIN_PASSWORD_HASH) {
        isValid = bcrypt.compareSync(inputPass, DEFAULT_ADMIN_HASH);
      }

      if (!isValid) {
        logCloudflare('AUTH', `Login FAILED from IP ${clientIp}: password rejected`);
        return jsonResponse({
          success: false,
          error: 'Access Denied: Invalid Administrator Password.'
        }, 401);
      }

      // Authentication succeeded - Generate secure 256-bit session token
      const tokenArray = new Uint8Array(32);
      crypto.getRandomValues(tokenArray);
      const sessionToken = Array.from(tokenArray).map(b => b.toString(16).padStart(2, '0')).join('');
      const expiresAt = Date.now() + SESSION_MAX_AGE_MS;

      logCloudflare('AUTH', `Login SUCCESS for administrator from IP ${clientIp}`);

      // Persist session to Cloudflare D1 if available
      if (env.DB) {
        try {
          await env.DB.prepare(
            'INSERT OR REPLACE INTO sessions (token, data, expires_at) VALUES (?, ?, ?)'
          ).bind(sessionToken, JSON.stringify({ role: 'Administrator' }), expiresAt).run();
          logCloudflare('D1_INSERT', `Stored active admin session in D1. Token: ${sessionToken.substring(0, 8)}...`);
        } catch (sessErr: any) {
          logCloudflare('ERROR', `Could not persist session to D1: ${sessErr?.message || sessErr}`);
        }
      }

      inMemorySessions.set(sessionToken, { expiresAt, data: JSON.stringify({ role: 'Administrator' }) });

      // Return session cookie and token response
      const isHttps = url.protocol === 'https:';
      const cookieVal = `admin_session=${sessionToken}; Path=/; Max-Age=${SESSION_MAX_AGE_MS / 1000}; HttpOnly; ${isHttps ? 'SameSite=None; Secure' : 'SameSite=Lax'}`;

      return jsonResponse({
        success: true,
        token: sessionToken,
        expiresAt: new Date(expiresAt).toISOString(),
        user: { role: 'Administrator', name: 'NK Laser Master Admin' }
      }, 200, { 'Set-Cookie': cookieVal });
    } catch (err: any) {
      logCloudflare('ERROR', `Login exception: ${err?.message || err}`);
      return jsonResponse({ success: false, error: err.message || 'Login failed' }, 500);
    }
  }

  // GET /api/auth/verify
  if (pathname === '/api/auth/verify' && method === 'GET') {
    const valid = await isAuthenticated(request, env);
    return jsonResponse({ success: true, authenticated: valid });
  }

  // POST /api/auth/logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const token = extractToken(request);
    if (token) {
      if (env.DB) {
        try {
          await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
        } catch {}
      }
      inMemorySessions.delete(token);
    }

    const clearCookie = `admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`;
    return jsonResponse({ success: true, message: 'Signed out successfully' }, 200, { 'Set-Cookie': clearCookie });
  }

  // POST /api/auth/change-password
  if (pathname === '/api/auth/change-password' && method === 'POST') {
    if (!await isAuthenticated(request, env)) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await request.json().catch(() => ({})) as { oldPassword?: string; newPassword?: string };
    const { oldPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return jsonResponse({ success: false, error: 'New password must be at least 8 characters long' }, 400);
    }

    // Verify old password
    let oldValid = false;
    if (env.ADMIN_PASSWORD && oldPassword === env.ADMIN_PASSWORD.trim()) oldValid = true;
    if (!oldValid && env.ADMIN_PASSWORD_HASH) oldValid = bcrypt.compareSync(oldPassword || '', env.ADMIN_PASSWORD_HASH.trim());
    if (!oldValid && env.DB) {
      try {
        const stored = await env.DB.prepare('SELECT value FROM config WHERE key = "adminPasswordHash"').first();
        if (stored?.value) oldValid = bcrypt.compareSync(oldPassword || '', stored.value);
      } catch {}
    }
    if (!oldValid && !env.ADMIN_PASSWORD && !env.ADMIN_PASSWORD_HASH) {
      oldValid = bcrypt.compareSync(oldPassword || '', DEFAULT_ADMIN_HASH);
    }

    if (!oldValid) {
      return jsonResponse({ success: false, error: 'Current password is incorrect' }, 400);
    }

    // Hash and store new password in D1
    const newHash = bcrypt.hashSync(newPassword.trim(), BCRYPT_ROUNDS);
    if (env.DB) {
      try {
        await env.DB.prepare(
          'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ("adminPasswordHash", ?, CURRENT_TIMESTAMP)'
        ).bind(newHash).run();
      } catch (err: any) {
        return jsonResponse({ success: false, error: 'Failed to persist new password: ' + err.message }, 500);
      }
    }

    return jsonResponse({ success: true, message: 'Administrator password updated successfully' });
  }

  // =========================================================================
  // 3. MASTER CONFIGURATION & PUBLISH ENDPOINTS
  // =========================================================================

  // GET /api/config - Complete master configuration
  if (pathname === '/api/config' && method === 'GET') {
    const config = await loadFullConfig(env);
    return jsonResponse({
      success: true,
      config: {
        version: '2.0',
        ...config
      }
    });
  }

  // POST /api/admin/publish, POST /api/publish, POST /api/config
  // Authoritative publish endpoint called when saving settings, products, or clicking Publish
  if ((pathname === '/api/admin/publish' || pathname === '/api/publish' || pathname === '/api/config') && method === 'POST') {
    if (!await isAuthenticated(request, env)) {
      return jsonResponse({ success: false, error: 'Unauthorized: Admin authentication required' }, 401);
    }

    const payload = await request.json().catch(() => ({})) as any;
    const configData = payload.config || payload;

    try {
      const publishedAt = await saveFullConfig(env, configData);
      return jsonResponse({
        success: true,
        message: 'Configuration and catalog saved permanently in Cloudflare D1',
        publishedAt
      });
    } catch (err: any) {
      return jsonResponse({ success: false, error: 'D1 Save Error: ' + err.message }, 500);
    }
  }

  // =========================================================================
  // 4. PUBLIC CATALOG & CONSUMER ENDPOINTS
  // =========================================================================

  // GET /api/settings - Public sanitized site settings
  if (pathname === '/api/settings' && method === 'GET') {
    const config = await loadFullConfig(env);
    return jsonResponse({
      success: true,
      settings: config.settings
    });
  }

  // GET /api/products - Faceted product search and catalog listing
  if (pathname === '/api/products' && method === 'GET') {
    const config = await loadFullConfig(env);
    let filtered = config.products;

    const categoryParam = url.searchParams.get('category');
    const brandParam = url.searchParams.get('brand');
    const powerParam = url.searchParams.get('power');
    const searchParam = url.searchParams.get('search')?.toLowerCase().trim();
    const inStockOnly = url.searchParams.get('inStock') === 'true' || url.searchParams.get('inStock') === '1';
    const sortParam = url.searchParams.get('sort');

    if (categoryParam && categoryParam !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === categoryParam || p.category?.toLowerCase() === categoryParam.toLowerCase());
    }
    if (brandParam && brandParam !== 'all') {
      filtered = filtered.filter(p => p.brand?.toLowerCase() === brandParam.toLowerCase() || p.compatibleBrands?.some(b => b.toLowerCase() === brandParam.toLowerCase()));
    }
    if (powerParam && powerParam !== 'all') {
      filtered = filtered.filter(p => p.powerRange === powerParam || p.powerRange?.includes(powerParam));
    }
    if (inStockOnly) {
      filtered = filtered.filter(p => p.stockStatus === 'In Stock' || p.inStock === true);
    }
    if (searchParam) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchParam) ||
        p.sku?.toLowerCase().includes(searchParam) ||
        p.categorySlug.toLowerCase().includes(searchParam) ||
        p.category?.toLowerCase().includes(searchParam) ||
        p.description?.toLowerCase().includes(searchParam)
      );
    }

    if (sortParam === 'price-asc') {
      filtered = [...filtered].sort((a, b) => (a.estimatedPrice || 0) - (b.estimatedPrice || 0));
    } else if (sortParam === 'price-desc') {
      filtered = [...filtered].sort((a, b) => (b.estimatedPrice || 0) - (a.estimatedPrice || 0));
    } else if (sortParam === 'name') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return jsonResponse({ success: true, count: filtered.length, products: filtered });
  }

  // GET /api/products/:identifier (Single product detail + related spares)
  if (pathname.startsWith('/api/products/') && method === 'GET') {
    const identifier = decodeURIComponent(pathname.replace('/api/products/', '')).toLowerCase();
    const config = await loadFullConfig(env);
    const product = config.products.find(p => 
      p.id.toLowerCase() === identifier || 
      (p.sku && p.sku.toLowerCase() === identifier) ||
      (p.guid && p.guid.toLowerCase() === identifier)
    );

    if (!product) {
      return jsonResponse({ success: false, error: 'Product not found' }, 404);
    }

    const related = config.products
      .filter(p => p.id !== product.id && (p.categorySlug === product.categorySlug || p.brand === product.brand))
      .slice(0, 4);

    return jsonResponse({ success: true, product, related });
  }

  // GET /api/categories
  if (pathname === '/api/categories' && method === 'GET') {
    const config = await loadFullConfig(env);
    return jsonResponse({ success: true, categories: config.categories });
  }

  // GET /api/brands
  if (pathname === '/api/brands' && method === 'GET') {
    const config = await loadFullConfig(env);
    return jsonResponse({ success: true, brands: config.brands });
  }

  // GET /api/power-ranges
  if (pathname === '/api/power-ranges' && method === 'GET') {
    const config = await loadFullConfig(env);
    return jsonResponse({ success: true, powerRanges: config.powerRanges });
  }

  // GET /api/reviews
  if (pathname === '/api/reviews' && method === 'GET') {
    const config = await loadFullConfig(env);
    return jsonResponse({ success: true, reviews: config.reviews });
  }

  // =========================================================================
  // 5. INBOUND CUSTOMER LEADS & REVIEWS
  // =========================================================================

  // POST /api/inquiries (Customer submits RFQ)
  if (pathname === '/api/inquiries' && method === 'POST') {
    try {
      const data = await request.json().catch(() => ({})) as any;
      const id = 'inq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const secretKey = env.DATA_ENCRYPTION_KEY || env.SESSION_SECRET || 'nk-laser-default-secret-key-32b!';
      const phoneEncrypted = await encryptPii(data.customerPhone || data.phone || '', secretKey);
      const emailEncrypted = await encryptPii(data.customerEmail || data.email || '', secretKey);

      if (env.DB) {
        await env.DB.prepare(`
          INSERT INTO inquiries (
            id, customer_name, phone_encrypted, email_encrypted, company, 
            laser_power, machine_model, notes, status, raw_data
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        `).bind(
          id,
          data.customerName || data.name || 'Anonymous Client',
          phoneEncrypted,
          emailEncrypted,
          data.companyName || data.company || '',
          data.laserPower || '',
          data.machineModel || '',
          data.notes || data.message || '',
          JSON.stringify(data)
        ).run();
      }

      return jsonResponse({
        success: true,
        message: 'Inquiry received successfully. Our technical sales team will review fitment and reply via WhatsApp.',
        inquiryId: id
      });
    } catch (err: any) {
      return jsonResponse({ success: false, error: err.message || 'Failed to submit inquiry' }, 500);
    }
  }

  // POST /api/reviews (Visitor submits review)
  if (pathname === '/api/reviews' && method === 'POST') {
    try {
      const data = await request.json().catch(() => ({})) as any;
      const id = 'rev_' + Date.now();
      const newReview: ReviewItem = {
        id,
        clientName: data.clientName || data.author || 'Laser Machine Operator',
        companyName: data.companyName || 'Industrial Fabrication',
        location: data.location || 'India',
        rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
        date: 'Just now',
        comment: data.comment || '',
        projectType: data.projectType || 'Fiber Laser Spares',
        verified: true
      };

      const config = await loadFullConfig(env);
      const updatedReviews = [newReview, ...config.reviews];
      await saveFullConfig(env, { ...config, reviews: updatedReviews });

      return jsonResponse({ success: true, message: 'Review submitted successfully', review: newReview });
    } catch (err: any) {
      return jsonResponse({ success: false, error: err.message }, 500);
    }
  }

  // =========================================================================
  // 6. PROTECTED ADMIN CRUD ENDPOINTS
  // =========================================================================

  // All routes below require Admin Authentication
  if (pathname.startsWith('/api/admin/')) {
    if (!await isAuthenticated(request, env)) {
      return jsonResponse({ success: false, error: 'Unauthorized: Administrator session required' }, 401);
    }

    // GET /api/admin/inquiries (View RFQ leads with decrypted PII)
    if (pathname === '/api/admin/inquiries' && method === 'GET') {
      if (!env.DB) {
        return jsonResponse({ success: true, inquiries: [] });
      }

      try {
        const rows = await env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
        const secretKey = env.DATA_ENCRYPTION_KEY || env.SESSION_SECRET || 'nk-laser-default-secret-key-32b!';
        const inquiries = [];

        if (rows && rows.results) {
          for (const row of rows.results) {
            const raw = row.raw_data ? JSON.parse(row.raw_data) : {};
            const phone = await decryptPii(row.phone_encrypted, secretKey);
            const email = await decryptPii(row.email_encrypted, secretKey);

            inquiries.push({
              ...raw,
              id: row.id,
              customerName: row.customer_name,
              customerPhone: phone,
              customerEmail: email,
              companyName: row.company,
              laserPower: row.laser_power,
              machineModel: row.machine_model,
              notes: row.notes,
              status: row.status,
              createdAt: row.created_at
            });
          }
        }

        return jsonResponse({ success: true, inquiries });
      } catch (err: any) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // PUT /api/admin/inquiries/:id (Update lead status or notes)
    if (pathname.startsWith('/api/admin/inquiries/') && method === 'PUT') {
      const id = pathname.replace('/api/admin/inquiries/', '');
      const body = await request.json().catch(() => ({})) as any;
      if (env.DB) {
        try {
          await env.DB.prepare('UPDATE inquiries SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(body.status || 'pending', body.notes || '', id).run();
        } catch {}
      }
      return jsonResponse({ success: true, message: 'Inquiry updated' });
    }

    // DELETE /api/admin/inquiries/:id (Delete lead)
    if (pathname.startsWith('/api/admin/inquiries/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/inquiries/', '');
      if (env.DB) {
        try {
          await env.DB.prepare('DELETE FROM inquiries WHERE id = ?').bind(id).run();
        } catch {}
      }
      return jsonResponse({ success: true, message: 'Inquiry deleted' });
    }

    // GET /api/admin/products
    if (pathname === '/api/admin/products' && method === 'GET') {
      logCloudflare('D1_QUERY', 'Admin requested full product list');
      const config = await loadFullConfig(env);
      return jsonResponse({ success: true, total: config.products.length, products: config.products });
    }

    // POST /api/admin/products (Add product)
    if (pathname === '/api/admin/products' && method === 'POST') {
      const prod = await request.json().catch(() => ({})) as ProductItem;
      const config = await loadFullConfig(env);
      const newProduct: ProductItem = {
        ...prod,
        id: prod.id || ('prod-' + Date.now().toString(36)),
        guid: prod.guid || crypto.randomUUID(),
        sku: prod.sku || `NK-${Math.floor(1000 + Math.random() * 9000)}`
      };
      logCloudflare('D1_INSERT', `Admin creating new product in D1: SKU="${newProduct.sku}", Title="${newProduct.title}", ID="${newProduct.id}", GUID="${newProduct.guid}"`);
      const updatedProducts = [newProduct, ...config.products];
      await saveFullConfig(env, { ...config, products: updatedProducts });
      logCloudflare('D1_INSERT', `Product SKU="${newProduct.sku}" successfully saved to Cloudflare D1.`);
      return jsonResponse({ success: true, product: newProduct });
    }

    // PUT /api/admin/products/:id (Update product)
    if (pathname.startsWith('/api/admin/products/') && method === 'PUT') {
      const id = pathname.replace('/api/admin/products/', '');
      const updates = await request.json().catch(() => ({})) as Partial<ProductItem>;
      logCloudflare('D1_UPDATE', `Admin updating product ID="${id}" in D1. Fields: ${Object.keys(updates).join(', ')}`);
      const config = await loadFullConfig(env);
      const updatedProducts = config.products.map(p => {
        if (p.id === id || p.guid === id) {
          return {
            ...p,
            ...updates,
            id: p.id,
            guid: p.guid || updates.guid || crypto.randomUUID()
          };
        }
        return p;
      });
      await saveFullConfig(env, { ...config, products: updatedProducts });
      const target = updatedProducts.find(p => p.id === id || p.guid === id);
      logCloudflare('D1_UPDATE', `Product ID="${id}" updated successfully in Cloudflare D1.`);
      return jsonResponse({ success: true, product: target });
    }

    // DELETE /api/admin/products/:id (Delete product)
    if (pathname.startsWith('/api/admin/products/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/products/', '');
      logCloudflare('D1_DELETE', `Admin deleting product ID="${id}" from D1.`);
      const config = await loadFullConfig(env);
      const updatedProducts = config.products.filter(p => p.id !== id && p.guid !== id);
      await saveFullConfig(env, { ...config, products: updatedProducts });
      logCloudflare('D1_DELETE', `Product ID="${id}" deleted successfully from Cloudflare D1.`);
      return jsonResponse({ success: true, message: 'Product deleted' });
    }

    // GET /api/admin/categories
    if (pathname === '/api/admin/categories' && method === 'GET') {
      logCloudflare('D1_QUERY', 'Admin requested category taxonomy');
      const config = await loadFullConfig(env);
      return jsonResponse({ success: true, categories: config.categories });
    }

    // POST /api/admin/categories (Add category)
    if (pathname === '/api/admin/categories' && method === 'POST') {
      const cat = await request.json().catch(() => ({})) as ProductCategoryDef;
      const config = await loadFullConfig(env);
      // The D1 `categories` table enforces a UNIQUE constraint on slug; INSERT OR REPLACE
      // resolves a slug collision by silently deleting the pre-existing row, so a duplicate
      // slug here would destroy another category. Guard against that by de-duplicating first.
      if (cat.slug && config.categories.some(c => c.slug === cat.slug && c.id !== cat.id)) {
        const taken = new Set(config.categories.filter(c => c.id !== cat.id).map(c => c.slug));
        let suffix = 2;
        let candidate = `${cat.slug}-${suffix}`;
        while (taken.has(candidate)) { suffix++; candidate = `${cat.slug}-${suffix}`; }
        cat.slug = candidate;
      }
      logCloudflare('D1_INSERT', `Admin creating category in D1: Name="${cat.name}", Slug="${cat.slug}", ID="${cat.id}"`);
      const updatedCategories = [...config.categories, cat];
      await saveFullConfig(env, { ...config, categories: updatedCategories });
      logCloudflare('D1_INSERT', `Category Name="${cat.name}" successfully committed to Cloudflare D1.`);
      return jsonResponse({ success: true, category: cat });
    }

    // PUT /api/admin/categories/:id (Update category)
    if (pathname.startsWith('/api/admin/categories/') && method === 'PUT') {
      const id = pathname.replace('/api/admin/categories/', '');
      const updates = await request.json().catch(() => ({})) as Partial<ProductCategoryDef>;
      const config = await loadFullConfig(env);
      // Same UNIQUE-slug safeguard as category creation, applied to renames.
      if (updates.slug && config.categories.some(c => c.slug === updates.slug && c.id !== id)) {
        const taken = new Set(config.categories.filter(c => c.id !== id).map(c => c.slug));
        let suffix = 2;
        let candidate = `${updates.slug}-${suffix}`;
        while (taken.has(candidate)) { suffix++; candidate = `${updates.slug}-${suffix}`; }
        updates.slug = candidate;
      }
      logCloudflare('D1_UPDATE', `Admin updating category ID="${id}" in D1. Fields: ${Object.keys(updates).join(', ')}`);
      const updatedCategories = config.categories.map(c => c.id === id ? { ...c, ...updates } : c);
      await saveFullConfig(env, { ...config, categories: updatedCategories });
      logCloudflare('D1_UPDATE', `Category ID="${id}" updated successfully in Cloudflare D1.`);
      return jsonResponse({ success: true, category: updatedCategories.find(c => c.id === id) });
    }

    // DELETE /api/admin/categories/:id (Delete category)
    if (pathname.startsWith('/api/admin/categories/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/categories/', '');
      logCloudflare('D1_DELETE', `Admin deleting category ID="${id}" from D1.`);
      const config = await loadFullConfig(env);
      const updatedCategories = config.categories.filter(c => c.id !== id);
      await saveFullConfig(env, { ...config, categories: updatedCategories });
      logCloudflare('D1_DELETE', `Category ID="${id}" deleted successfully from Cloudflare D1.`);
      return jsonResponse({ success: true, message: 'Category deleted' });
    }

    // POST /api/admin/settings (Save site settings)
    if (pathname === '/api/admin/settings' && method === 'POST') {
      const newSettings = await request.json().catch(() => ({})) as Partial<SiteSettings>;
      logCloudflare('D1_UPDATE', `Admin saving site settings in D1: BusinessName="${newSettings.businessName}", showPricing=${newSettings.showPricing}`);
      const config = await loadFullConfig(env);
      const mergedSettings = { ...config.settings, ...newSettings };
      await saveFullConfig(env, { ...config, settings: mergedSettings });
      logCloudflare('D1_UPDATE', 'Site settings committed successfully to Cloudflare D1.');
      return jsonResponse({ success: true, settings: mergedSettings });
    }

    // POST /api/admin/brands
    if (pathname === '/api/admin/brands' && method === 'POST') {
      const body = await request.json().catch(() => ({})) as { brands?: BrandItem[] };
      const config = await loadFullConfig(env);
      const brands = Array.isArray(body.brands) ? body.brands : config.brands;
      logCloudflare('D1_UPDATE', `Admin saving brands list in D1. Total count: ${brands.length}`);
      await saveFullConfig(env, { ...config, brands });
      logCloudflare('D1_UPDATE', 'OEM brands committed successfully to Cloudflare D1.');
      return jsonResponse({ success: true, brands });
    }

    // POST /api/admin/power-ranges
    if (pathname === '/api/admin/power-ranges' && method === 'POST') {
      const body = await request.json().catch(() => ({})) as { powerRanges?: string[] };
      const config = await loadFullConfig(env);
      const powerRanges = Array.isArray(body.powerRanges) ? body.powerRanges : config.powerRanges;
      logCloudflare('D1_UPDATE', `Admin saving power ranges in D1. Total count: ${powerRanges.length}`);
      await saveFullConfig(env, { ...config, powerRanges });
      logCloudflare('D1_UPDATE', 'Power ranges committed successfully to Cloudflare D1.');
      return jsonResponse({ success: true, powerRanges });
    }

    // Admin Reviews Management
    if (pathname === '/api/admin/reviews' && method === 'POST') {
      const revData = await request.json().catch(() => ({})) as Partial<ReviewItem>;
      const config = await loadFullConfig(env);
      const newRev: ReviewItem = {
        id: revData.id || ('rev-' + Date.now().toString(36)),
        clientName: revData.clientName || 'Client',
        companyName: revData.companyName || 'Laser Facility',
        location: revData.location || 'India',
        rating: Number(revData.rating) || 5,
        date: revData.date || 'Just now',
        comment: revData.comment || '',
        projectType: revData.projectType || 'Spares',
        verified: revData.verified !== false
      };
      logCloudflare('D1_INSERT', `Admin adding review in D1: ID="${newRev.id}", Author="${newRev.clientName}"`);
      const updatedReviews = [newRev, ...config.reviews];
      await saveFullConfig(env, { ...config, reviews: updatedReviews });
      logCloudflare('D1_INSERT', `Review ID="${newRev.id}" committed to Cloudflare D1.`);
      return jsonResponse({ success: true, review: newRev, reviews: updatedReviews });
    }

    if (pathname.startsWith('/api/admin/reviews/') && method === 'PUT') {
      const id = pathname.replace('/api/admin/reviews/', '');
      const revData = await request.json().catch(() => ({})) as Partial<ReviewItem>;
      logCloudflare('D1_UPDATE', `Admin updating review ID="${id}" in D1`);
      const config = await loadFullConfig(env);
      const updatedReviews = config.reviews.map(r => r.id === id ? { ...r, ...revData, id } : r);
      await saveFullConfig(env, { ...config, reviews: updatedReviews });
      logCloudflare('D1_UPDATE', `Review ID="${id}" updated successfully in Cloudflare D1.`);
      return jsonResponse({ success: true, review: updatedReviews.find(r => r.id === id), reviews: updatedReviews });
    }

    if (pathname.startsWith('/api/admin/reviews/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/reviews/', '');
      logCloudflare('D1_DELETE', `Admin deleting review ID="${id}" from D1`);
      const config = await loadFullConfig(env);
      const updatedReviews = config.reviews.filter(r => r.id !== id);
      await saveFullConfig(env, { ...config, reviews: updatedReviews });
      logCloudflare('D1_DELETE', `Review ID="${id}" deleted successfully from Cloudflare D1.`);
      return jsonResponse({ success: true, reviews: updatedReviews });
    }

    // POST /api/admin/restore (Restore configuration snapshot)
    if (pathname === '/api/admin/restore' && method === 'POST') {
      const body = await request.json().catch(() => ({})) as { backup?: any };
      logCloudflare('D1_BATCH', 'Admin restoring database from backup snapshot...');
      if (body.backup) {
        await saveFullConfig(env, body.backup);
        logCloudflare('D1_BATCH', 'Backup snapshot restored successfully in Cloudflare D1.');
        return jsonResponse({ success: true, message: 'Configuration restored successfully' });
      }
      return jsonResponse({ success: false, error: 'Invalid backup payload' }, 400);
    }
  }

  // Fallback for unmatched API routes
  return jsonResponse({ success: false, error: `API endpoint ${pathname} not found` }, 404);
}
