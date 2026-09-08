/**
 * Cloudflare Pages Function: Edge API Router for NK Laser Spares & Optics
 * Handles /api/* endpoints natively at Cloudflare's edge with:
 * - Admin authentication (Bcrypt verification & secure session cookies/tokens)
 * - Cloudflare D1 persistent document & relational storage (zero data loss across redeployments)
 * - Customer PII encryption at rest (AES-256-GCM using DATA_ENCRYPTION_KEY)
 * - Catalog configuration persistence (products, categories, settings, reviews)
 */

import bcrypt from 'bcryptjs';
import { 
  DEFAULT_SITE_SETTINGS, 
  INITIAL_PRODUCTS, 
  STORE_CATEGORIES, 
  INITIAL_BRANDS, 
  INITIAL_REVIEWS 
} from '../../src/data/initialData';

const DEFAULT_POWER_RANGES = ['1kW - 3kW', '3kW - 6kW', '6kW - 12kW', '12kW - 30kW', '30kW+'];

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

// Fallback in-memory session store if D1 is not yet bound
const inMemorySessions = new Map<string, { expiresAt: number; data: string }>();

// Bcrypt work factor for password changes
const BCRYPT_ROUNDS = 12;
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// Default fallback hash (Salt rounds 12)
const DEFAULT_ADMIN_HASH = '$2b$12$wg8vMaZ20mnLMvTpbtoIp.KOGx1Ot59sE/xwjCzwSxw8zFs8ycmpK';

// Standard CORS and Security JSON Response Helper
function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
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

// Master Handler for all /api/* requests
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

  // =========================================================================
  // 1. AUTHENTICATION ENDPOINTS
  // =========================================================================

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({})) as { password?: string };
      const inputPass = String(body.password || '').trim();

      if (!inputPass) {
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
        } catch {
          // Ignore
        }
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
        return jsonResponse({
          success: false,
          error: 'Access Denied: Invalid Administrator Password.'
        }, 401);
      }

      // Authentication succeeded - Generate secure 256-bit session token
      const tokenArray = new Uint8Array(32);
      crypto.getRandomValues(tokenArray);
      const token = Array.from(tokenArray).map(b => b.toString(16).padStart(2, '0')).join('');
      const expiresAt = Date.now() + SESSION_MAX_AGE_MS;

      // Persist session to Cloudflare D1 if available
      if (env.DB) {
        try {
          await env.DB.prepare(
            'INSERT OR REPLACE INTO sessions (token, data, expires_at) VALUES (?, ?, ?)'
          ).bind(token, JSON.stringify({ role: 'Administrator' }), expiresAt).run();
        } catch {
          // Fallback to memory
        }
      }

      inMemorySessions.set(token, { expiresAt, data: JSON.stringify({ role: 'Administrator' }) });

      // Return session cookie and token response
      const isHttps = url.protocol === 'https:';
      const cookieVal = `admin_session=${token}; Path=/; Max-Age=${SESSION_MAX_AGE_MS / 1000}; HttpOnly; ${isHttps ? 'SameSite=None; Secure' : 'SameSite=Lax'}`;

      return jsonResponse({
        success: true,
        token,
        expiresAt: new Date(expiresAt).toISOString(),
        user: { role: 'Administrator', name: 'NK Laser Master Admin' }
      }, 200, { 'Set-Cookie': cookieVal });
    } catch (err: any) {
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
  // 2. CONFIGURATION & CATALOG PERSISTENCE (D1 DATABASE)
  // =========================================================================

  // GET /api/config
  if (pathname === '/api/config' && method === 'GET') {
    let settings = DEFAULT_SITE_SETTINGS;
    let products = INITIAL_PRODUCTS;
    let categories = STORE_CATEGORIES;
    let brands = INITIAL_BRANDS;
    let powerRanges = DEFAULT_POWER_RANGES;
    let reviews = INITIAL_REVIEWS;
    let lastPublishedAt = new Date().toISOString();

    if (env.DB) {
      try {
        const rows = await env.DB.prepare('SELECT key, value FROM config').all();
        if (rows && rows.results) {
          for (const row of rows.results) {
            try {
              if (row.key === 'settings') settings = JSON.parse(row.value);
              if (row.key === 'products') products = JSON.parse(row.value);
              if (row.key === 'categories') categories = JSON.parse(row.value);
              if (row.key === 'brands') brands = JSON.parse(row.value);
              if (row.key === 'powerRanges') powerRanges = JSON.parse(row.value);
              if (row.key === 'reviews') reviews = JSON.parse(row.value);
              if (row.key === 'lastPublishedAt') lastPublishedAt = row.value;
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Could not read from D1, using initial seed data:', err);
      }
    }

    return jsonResponse({
      success: true,
      config: {
        version: '1.0',
        settings,
        products,
        categories,
        brands,
        powerRanges,
        reviews,
        lastPublishedAt
      }
    });
  }

  // POST /api/config OR POST /api/publish
  if ((pathname === '/api/config' || pathname === '/api/publish') && method === 'POST') {
    if (!await isAuthenticated(request, env)) {
      return jsonResponse({ success: false, error: 'Unauthorized: Admin authentication required' }, 401);
    }

    const payload = await request.json().catch(() => ({})) as any;
    const configData = payload.config || payload;

    if (env.DB) {
      try {
        const statements = [];
        if (configData.settings) {
          statements.push(env.DB.prepare(
            'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ("settings", ?, CURRENT_TIMESTAMP)'
          ).bind(JSON.stringify(configData.settings)));
        }
        if (Array.isArray(configData.products)) {
          statements.push(env.DB.prepare(
            'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ("products", ?, CURRENT_TIMESTAMP)'
          ).bind(JSON.stringify(configData.products)));
        }
        if (Array.isArray(configData.categories)) {
          statements.push(env.DB.prepare(
            'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ("categories", ?, CURRENT_TIMESTAMP)'
          ).bind(JSON.stringify(configData.categories)));
        }
        if (Array.isArray(configData.brands)) {
          statements.push(env.DB.prepare(
            'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ("brands", ?, CURRENT_TIMESTAMP)'
          ).bind(JSON.stringify(configData.brands)));
        }
        if (Array.isArray(configData.powerRanges)) {
          statements.push(env.DB.prepare(
            'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ("powerRanges", ?, CURRENT_TIMESTAMP)'
          ).bind(JSON.stringify(configData.powerRanges)));
        }
        if (Array.isArray(configData.reviews)) {
          statements.push(env.DB.prepare(
            'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ("reviews", ?, CURRENT_TIMESTAMP)'
          ).bind(JSON.stringify(configData.reviews)));
        }
        statements.push(env.DB.prepare(
          'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ("lastPublishedAt", ?, CURRENT_TIMESTAMP)'
        ).bind(new Date().toISOString()));

        if (statements.length > 0) {
          await env.DB.batch(statements);
        }
      } catch (err: any) {
        return jsonResponse({ success: false, error: 'D1 Save Error: ' + err.message }, 500);
      }
    }

    return jsonResponse({ success: true, message: 'Configuration and catalog saved permanently in Cloudflare D1' });
  }

  // =========================================================================
  // 3. CATALOG CONSUMER ENDPOINTS (Products, Categories, Brands)
  // =========================================================================

  // GET /api/products
  if (pathname === '/api/products' && method === 'GET') {
    let products = INITIAL_PRODUCTS;
    if (env.DB) {
      try {
        const row = await env.DB.prepare('SELECT value FROM config WHERE key = "products"').first();
        if (row?.value) products = JSON.parse(row.value);
      } catch {}
    }

    const categoryParam = url.searchParams.get('category');
    const brandParam = url.searchParams.get('brand');
    const powerParam = url.searchParams.get('power');
    const searchParam = url.searchParams.get('search')?.toLowerCase().trim();
    const inStockOnly = url.searchParams.get('inStock') === 'true';

    let filtered = products;

    if (categoryParam && categoryParam !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === categoryParam);
    }
    if (brandParam && brandParam !== 'all') {
      filtered = filtered.filter(p => p.compatibleBrands?.includes(brandParam));
    }
    if (powerParam && powerParam !== 'all') {
      filtered = filtered.filter(p => p.powerRange?.includes(powerParam));
    }
    if (inStockOnly) {
      filtered = filtered.filter(p => p.stockStatus === 'In Stock');
    }
    if (searchParam) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchParam) ||
        p.sku?.toLowerCase().includes(searchParam) ||
        p.categorySlug.toLowerCase().includes(searchParam) ||
        p.description?.toLowerCase().includes(searchParam)
      );
    }

    return jsonResponse({ success: true, count: filtered.length, products: filtered });
  }

  // GET /api/categories
  if (pathname === '/api/categories' && method === 'GET') {
    let categories = STORE_CATEGORIES;
    if (env.DB) {
      try {
        const row = await env.DB.prepare('SELECT value FROM config WHERE key = "categories"').first();
        if (row?.value) categories = JSON.parse(row.value);
      } catch {}
    }
    return jsonResponse({ success: true, categories });
  }

  // GET /api/brands
  if (pathname === '/api/brands' && method === 'GET') {
    let brands = INITIAL_BRANDS;
    if (env.DB) {
      try {
        const row = await env.DB.prepare('SELECT value FROM config WHERE key = "brands"').first();
        if (row?.value) brands = JSON.parse(row.value);
      } catch {}
    }
    return jsonResponse({ success: true, brands });
  }

  // GET /api/power-ranges
  if (pathname === '/api/power-ranges' && method === 'GET') {
    let powerRanges = DEFAULT_POWER_RANGES;
    if (env.DB) {
      try {
        const row = await env.DB.prepare('SELECT value FROM config WHERE key = "powerRanges"').first();
        if (row?.value) powerRanges = JSON.parse(row.value);
      } catch {}
    }
    return jsonResponse({ success: true, powerRanges });
  }

  // =========================================================================
  // 4. INQUIRIES & REVIEWS (With PII Encryption)
  // =========================================================================

  // POST /api/inquiries (Customer submits RFQ)
  if (pathname === '/api/inquiries' && method === 'POST') {
    try {
      const data = await request.json().catch(() => ({})) as any;
      const id = 'inq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const secretKey = env.DATA_ENCRYPTION_KEY || env.SESSION_SECRET;
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

  // GET /api/admin/inquiries (Admin views all RFQ leads with decrypted PII)
  if (pathname === '/api/admin/inquiries' && method === 'GET') {
    if (!await isAuthenticated(request, env)) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    if (!env.DB) {
      return jsonResponse({ success: true, inquiries: [] });
    }

    try {
      const rows = await env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
      const secretKey = env.DATA_ENCRYPTION_KEY || env.SESSION_SECRET;

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

  // POST /api/reviews (Submit review)
  if (pathname === '/api/reviews' && method === 'POST') {
    try {
      const data = await request.json().catch(() => ({})) as any;
      const id = 'rev_' + Date.now();

      if (env.DB) {
        await env.DB.prepare(`
          INSERT INTO reviews (id, author, rating, comment, project_type, status, data)
          VALUES (?, ?, ?, ?, ?, 'approved', ?)
        `).bind(
          data.author || 'Industrial CNC Operator',
          Number(data.rating) || 5,
          data.comment || '',
          data.projectType || '',
          JSON.stringify(data)
        ).run();
      }

      return jsonResponse({ success: true, message: 'Review submitted successfully', review: { ...data, id } });
    } catch (err: any) {
      return jsonResponse({ success: false, error: err.message }, 500);
    }
  }

  // GET /api/reviews (Public reviews)
  if (pathname === '/api/reviews' && method === 'GET') {
    let reviews = INITIAL_REVIEWS;
    if (env.DB) {
      try {
        const rows = await env.DB.prepare('SELECT * FROM reviews WHERE status = "approved" ORDER BY created_at DESC').all();
        if (rows && rows.results && rows.results.length > 0) {
          reviews = rows.results.map(r => r.data ? JSON.parse(r.data) : { id: r.id, author: r.author, rating: r.rating, comment: r.comment });
        }
      } catch {}
    }
    return jsonResponse({ success: true, reviews });
  }

  // Fallback for unmatched API routes
  return jsonResponse({ success: false, error: `API endpoint ${pathname} not found` }, 404);
}
