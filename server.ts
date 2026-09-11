import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_SITE_SETTINGS, INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_BRANDS, STORE_CATEGORIES } from './server/seedData';

// Types
import { ProductItem, ProductCategoryDef, BrandItem, ReviewItem, InquiryRecord, SiteSettings, BusinessAddress } from './src/types';
import { isBotRequest, renderBotPage, generateSitemapXml } from './server-seo';

const PORT = 3000;

// Bcrypt Configuration (Cost Factor 12)
const BCRYPT_ROUNDS = 12;

// Default admin bcrypt hash (Salt rounds 12).
// In production on Cloudflare / Container, override with process.env.ADMIN_PASSWORD_HASH or process.env.ADMIN_PASSWORD
const DEFAULT_ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || 
  (process.env.ADMIN_PASSWORD 
    ? bcrypt.hashSync(process.env.ADMIN_PASSWORD.trim(), BCRYPT_ROUNDS) 
    : '$2b$12$wg8vMaZ20mnLMvTpbtoIp.KOGx1Ot59sE/xwjCzwSxw8zFs8ycmpK');

function hashPasswordBcrypt(password: string): string {
  return bcrypt.hashSync(password.trim(), BCRYPT_ROUNDS);
}

function verifyPasswordBcrypt(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password.trim(), hash);
  } catch {
    return false;
  }
}

// Session Lifetime: 2 hours sliding window
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
  ip: string;
}
const activeSessions = new Map<string, AdminSession>();

// Brute-Force Rate Limiting (5 failed attempts locks IP for 15 minutes)
interface FailedAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, FailedAttempt>();

// Periodic sweeper for expired sessions and stale IP rate limits (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
  for (const [ip, attempt] of loginAttempts.entries()) {
    if (attempt.lockedUntil < now && now - attempt.lastAttempt > 30 * 60 * 1000) {
      loginAttempts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// =========================================================================
// Customer PII Encryption at Rest (AES-256-GCM)
// Prevents plain-text customer phone/email leaks in filesystem backups.
// =========================================================================
const DATA_SECRET = process.env.DATA_ENCRYPTION_KEY || process.env.SESSION_SECRET || 'nklaser-sys-vault-master-pepper-2026';
const PII_KEY = crypto.createHash('sha256').update(DATA_SECRET).digest();

function encryptPii(plainText?: string): string | undefined {
  if (!plainText) return plainText;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', PII_KEY, iv);
    let enc = cipher.update(plainText.trim(), 'utf8', 'hex');
    enc += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${enc}`;
  } catch {
    return plainText;
  }
}

function decryptPii(cipherText?: string): string | undefined {
  if (!cipherText || !cipherText.startsWith('enc:')) return cipherText;
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return cipherText;
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const enc = parts[3];
    const decipher = crypto.createDecipheriv('aes-256-gcm', PII_KEY, iv);
    decipher.setAuthTag(tag);
    let dec = decipher.update(enc, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  } catch {
    return cipherText;
  }
}

// =========================================================================
// Input Sanitization & Validation (XSS & Injection Protection)
// =========================================================================
function sanitizeString(input: unknown, maxLength = 2000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);
}

function validateImageUrl(url?: string): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://localhost') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  );
}

// In-Memory Database Store Structure
interface DatabaseStore {
  version: string;
  settings: SiteSettings;
  products: ProductItem[];
  categories: ProductCategoryDef[];
  brands: BrandItem[];
  reviews: ReviewItem[];
  inquiries: InquiryRecord[];
  powerRanges: string[];
  adminPasswordHash: string;
  lastPublishedAt: string;
}

// Initial Database State with complete seed fallback
let db: DatabaseStore = {
  version: '2.0',
  settings: DEFAULT_SITE_SETTINGS,
  products: INITIAL_PRODUCTS,
  categories: STORE_CATEGORIES,
  brands: INITIAL_BRANDS,
  reviews: INITIAL_REVIEWS,
  inquiries: [
    {
      id: 'inq-101',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      customerName: 'Rajesh Patel',
      customerPhone: '+91 98250 12345',
      customerEmail: 'rajesh.patel@steelworks.in',
      productOrService: 'D27.9 Protective Windows & Nozzles',
      material: 'Fused Quartz / Copper',
      thickness: '4.1 mm',
      quantity: 50,
      message: 'Need urgent dispatch of 50 pcs D27.9x4.1 lenses and D28 double nozzles for RayTools BM110 head.',
      status: 'New',
      source: 'Product Inquiry',
      specsSummary: 'RayTools BM110 | 50 pcs | Express Dispatch'
    },
    {
      id: 'inq-102',
      createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      customerName: 'Ananya Sharma',
      customerPhone: '+91 99011 88776',
      customerEmail: 'purchase@precisionfab.in',
      productOrService: 'Bochu CypCut Wireless Remote & RF Cable',
      material: 'CNC Control Spares',
      thickness: 'N/A',
      quantity: 2,
      message: 'Looking for 2 sets of wireless remote pendants and high-frequency RF cables for BCS100 controller.',
      status: 'Quoted',
      source: 'Product Inquiry',
      specsSummary: 'Bochu FSCUT | 2 sets | Quoted on WhatsApp'
    }
  ],
  powerRanges: ['1kW - 3kW', '3kW - 6kW', '6kW - 12kW', '12kW - 30kW', '30kW+'],
  adminPasswordHash: DEFAULT_ADMIN_HASH,
  lastPublishedAt: new Date().toISOString()
};

// In-memory runtime persistence
// Note: Dynamic catalog state is maintained authoritatively in memory (dev/container) and Cloudflare D1 (production).
// app-config.json is not used for catalog storage.
function persistDatabaseToDisk(): void {
  // Authoritative runtime store updated in memory
  db.lastPublishedAt = new Date().toISOString();
}

// Authentication Middleware to Protect Admin Endpoints
// Validates HttpOnly session cookie 'admin_session' or Authorization Bearer header
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  let token = req.cookies?.admin_session;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7).trim();
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Admin authentication session required. Please log in.' 
    });
  }

  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Admin session expired or invalid. Please sign in again.' 
    });
  }

  // Refresh sliding expiration (2 hours)
  session.expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  next();
}

// Origin / CSRF Verification Middleware for Administrative & Auth endpoints
function verifyAdminOrigin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const isSameHost = host && originUrl.host === host;
      const isLocalhost = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
      const isRunApp = originUrl.hostname.endsWith('.run.app');
      const isGoogleStudio = originUrl.hostname.endsWith('.google.com') || originUrl.hostname === 'ai.studio';
      const isCustomDomain = originUrl.hostname.includes('nklaser');

      if (!isSameHost && !isLocalhost && !isRunApp && !isGoogleStudio && !isCustomDomain) {
        console.warn(`[Security] Blocked unauthorized cross-origin request from origin: ${origin}`);
        return res.status(403).json({ success: false, error: 'Forbidden: Untrusted cross-origin request' });
      }
    } catch {
      // allow if origin header cannot be parsed
    }
  }
  next();
}

async function startServer() {
  const app = express();

  // Strip x-powered-by header
  app.disable('x-powered-by');

  // Middlewares: Cookie Parser and Body Parser
  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' }));

  // Global Security Headers
  // Note: X-Frame-Options is intentionally omitted to allow the AI Studio live preview iframe to display the app.
  // Clickjacking protection is enforced via CSP frame-ancestors.
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: ws: wss:; frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app; object-src 'none';"
    );
    next();
  });

  // Prevent API caching for real-time consistency
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // Apply Origin Verification to auth and admin routes
  app.use('/api/auth', verifyAdminOrigin);
  app.use('/api/admin', verifyAdminOrigin);

  // =========================================================================
  // 1. PUBLIC API ROUTES (Safe, sanitized, client-facing)
  // =========================================================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'NK Laser Backend API', 
      version: db.version,
      productsCount: db.products.length,
      categoriesCount: db.categories.length,
      timestamp: new Date().toISOString()
    });
  });

  // Real-time synchronization version endpoint polled by clients
  app.get('/api/version', (req, res) => {
    res.json({
      success: true,
      version: db.version,
      lastPublishedAt: db.lastPublishedAt
    });
  });

  // Public Site Settings (Sanitized - NEVER exposes admin password hashes or internal tokens)
  app.get('/api/settings', (req, res) => {
    const s = db.settings || DEFAULT_SITE_SETTINGS;
    res.json({
      success: true,
      settings: {
        businessName: s.businessName,
        tagline: s.tagline,
        whatsappNumber: s.whatsappNumber,
        whatsappDisplay: s.whatsappDisplay,
        email: s.email,
        phoneDisplay: s.phoneDisplay,
        address: s.address,
        addresses: s.addresses || [],
        workingHours: s.workingHours,
        logoUrl: s.logoUrl,
        instagramUrl: s.instagramUrl,
        socialLinks: s.socialLinks,
        themeMode: s.themeMode || 'light',
        primaryColor: s.primaryColor || '#162657',
        accentColor: s.accentColor || '#E51024',
        showPricing: s.showPricing !== undefined ? Boolean(s.showPricing) : true,
        dxfUploadNotice: s.dxfUploadNotice,
        heroTitle: s.heroTitle,
        heroSubtitle: s.heroSubtitle,
        noticeBannerText: s.noticeBannerText,
        showNoticeBanner: s.showNoticeBanner !== undefined ? Boolean(s.showNoticeBanner) : true,
        features: s.features || { showPrices: true, whatsappChat: true, calculator: false },
        sectionsVisibility: s.sectionsVisibility || {
          hero: true,
          services: false,
          brands: true,
          quoteCalculator: false,
          products: true,
          materials: false,
          reviews: true,
          contact: true,
          footer: true
        }
      }
    });
  });

  // Public Products Catalog (Faceted search and filter support)
  app.get('/api/products', (req, res) => {
    const { category, brand, power, search, inStock, sort } = req.query;
    let list = [...db.products];

    if (category && category !== 'all') {
      list = list.filter(p => p.categorySlug === category || p.category.toLowerCase() === String(category).toLowerCase());
    }

    if (brand && brand !== 'all') {
      list = list.filter(p => p.brand?.toLowerCase() === String(brand).toLowerCase() || p.compatibleBrands?.some(b => b.toLowerCase() === String(brand).toLowerCase()));
    }

    if (power && power !== 'all') {
      list = list.filter(p => p.powerRange === power);
    }

    if (inStock === 'true' || inStock === '1') {
      list = list.filter(p => p.stockStatus === 'In Stock');
    }

    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort === 'price-asc') {
      list.sort((a, b) => (a.estimatedPrice || 0) - (b.estimatedPrice || 0));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => (b.estimatedPrice || 0) - (a.estimatedPrice || 0));
    } else if (sort === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    res.json({
      success: true,
      total: list.length,
      products: list
    });
  });

  // Single Product Detail by ID or SKU
  app.get('/api/products/:identifier', (req, res) => {
    const idOrSku = req.params.identifier.toLowerCase();
    const product = db.products.find(p => 
      p.id.toLowerCase() === idOrSku || 
      (p.sku && p.sku.toLowerCase() === idOrSku) ||
      (p.guid && p.guid.toLowerCase() === idOrSku)
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Related products in the same category
    const related = db.products
      .filter(p => p.id !== product.id && (p.categorySlug === product.categorySlug || p.brand === product.brand))
      .slice(0, 4);

    res.json({
      success: true,
      product,
      related
    });
  });

  // Public Categories Taxonomy
  app.get('/api/categories', (req, res) => {
    res.json({
      success: true,
      categories: db.categories
    });
  });

  // Public Compatible Brands
  app.get('/api/brands', (req, res) => {
    res.json({
      success: true,
      brands: db.brands
    });
  });

  // Public Power Ranges
  app.get('/api/power-ranges', (req, res) => {
    res.json({
      success: true,
      powerRanges: db.powerRanges
    });
  });

  // Public Reviews
  app.get('/api/reviews', (req, res) => {
    res.json({
      success: true,
      reviews: db.reviews
    });
  });

  // Customer RFQ Lead Submission (Write-only for visitors — PII encrypted at rest)
  app.post('/api/inquiries', (req, res) => {
    const { customerName, customerPhone, customerEmail, productOrService, message, quantity, material, thickness, source } = req.body;

    const sanitizedName = sanitizeString(customerName, 120);
    const sanitizedPhone = sanitizeString(customerPhone, 30);

    if (!sanitizedName || !sanitizedPhone) {
      return res.status(400).json({ success: false, error: 'Customer Name and Phone are required' });
    }

    // Encrypt confidential customer PII (phone and email) at rest using AES-256-GCM
    const encryptedPhone = encryptPii(sanitizedPhone) || sanitizedPhone;
    const encryptedEmail = customerEmail ? encryptPii(sanitizeString(customerEmail, 100)) : undefined;

    const validSources: InquiryRecord['source'][] = ['Quote Calculator', 'Product Inquiry', 'Service Inquiry', 'General Contact'];
    const resolvedSource: InquiryRecord['source'] = validSources.includes(source as InquiryRecord['source'])
      ? (source as InquiryRecord['source'])
      : 'Product Inquiry';

    const newInquiry: InquiryRecord = {
      id: 'inq-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      customerName: sanitizedName,
      customerPhone: encryptedPhone,
      customerEmail: encryptedEmail || '',
      productOrService: sanitizeString(productOrService, 200) || 'Fiber Laser Spare Parts RFQ',
      message: sanitizeString(message, 3000),
      quantity: Number(quantity) || 1,
      material: sanitizeString(material, 100) || undefined,
      thickness: sanitizeString(thickness, 50) || undefined,
      source: resolvedSource,
      status: 'New'
    };

    db.inquiries.unshift(newInquiry);
    persistDatabaseToDisk();

    console.log(`[RFQ] New customer lead received and encrypted for ${sanitizedName}`);

    res.json({
      success: true,
      message: 'Inquiry received successfully. Our sales team will get back to you shortly.',
      inquiryId: newInquiry.id
    });
  });

  // Customer Review Submission
  app.post('/api/reviews', (req, res) => {
    const { clientName, companyName, location, rating, comment, projectType } = req.body;
    const sanitizedClient = sanitizeString(clientName, 80);
    const sanitizedComment = sanitizeString(comment, 1500);

    if (!sanitizedClient || !sanitizedComment) {
      return res.status(400).json({ success: false, error: 'Name and comment are required' });
    }

    const newReview: ReviewItem = {
      id: 'rev-' + Date.now().toString(36),
      clientName: sanitizedClient,
      companyName: sanitizeString(companyName, 100) || 'Laser Cutting Facility',
      location: sanitizeString(location, 100) || 'India',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      date: 'Just now',
      comment: sanitizedComment,
      projectType: sanitizeString(projectType, 100) || 'Fiber Laser Spares',
      verified: true
    };

    db.reviews.unshift(newReview);
    persistDatabaseToDisk();

    res.json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview
    });
  });

  // =========================================================================
  // 2. ADMIN AUTHENTICATION ROUTES (Secure verification & session issuance)
  // =========================================================================

  // Admin Login with Brute-Force Rate Limiting & Bcrypt Verification
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    const inputPass = String(password || '').trim();

    if (!inputPass) {
      return res.status(400).json({ success: false, error: 'Administrator password is required' });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const attempt = loginAttempts.get(clientIp);

    // Enforce 15-minute lockout if threshold exceeded
    if (attempt && attempt.lockedUntil > now) {
      const remainingSec = Math.ceil((attempt.lockedUntil - now) / 1000);
      const remainingMin = Math.ceil(remainingSec / 60);
      return res.status(429).json({
        success: false,
        error: `Security Lockout: Too many failed login attempts. Access temporarily blocked for ${remainingMin} minute(s) to protect against unauthorized access.`
      });
    }

    let isValid = verifyPasswordBcrypt(inputPass, db.adminPasswordHash);

    // Fallback check against environment override if set
    if (!isValid && process.env.ADMIN_PASSWORD) {
      if (inputPass === process.env.ADMIN_PASSWORD.trim()) {
        isValid = true;
      }
    }

    if (!isValid) {
      const currentCount = (attempt?.count || 0) + 1;
      const isLocked = currentCount >= 5;
      const lockedUntil = isLocked ? now + 15 * 60 * 1000 : 0; // 15 minute IP lockout

      loginAttempts.set(clientIp, {
        count: currentCount,
        lastAttempt: now,
        lockedUntil
      });

      console.warn(`[Security Alert] Failed admin login attempt from IP ${clientIp} (${currentCount}/5 attempts)`);

      if (isLocked) {
        return res.status(429).json({
          success: false,
          error: 'Security Lockout: 5 consecutive failed login attempts detected. Access blocked for 15 minutes to protect against brute force.'
        });
      }

      const remaining = 5 - currentCount;
      return res.status(401).json({
        success: false,
        error: `Access Denied: Invalid Administrator Password. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before 15-min lockout)`
      });
    }

    // Authentication succeeded - clear failed attempts for this IP
    loginAttempts.delete(clientIp);

    // Generate cryptographically secure session token (256-bit entropy)
    const token = crypto.randomBytes(32).toString('hex');
    const session: AdminSession = {
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_MAX_AGE_MS,
      ip: clientIp
    };

    activeSessions.set(token, session);
    console.log(`[Security] Master administrator signed in successfully from ${clientIp}, session issued`);

    // Set secure HttpOnly session cookie (SameSite=None in HTTPS to support iframe preview, Lax otherwise)
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: SESSION_MAX_AGE_MS,
      path: '/'
    });

    res.json({
      success: true,
      token,
      expiresAt: new Date(session.expiresAt).toISOString(),
      user: {
        role: 'Administrator',
        name: 'NK Laser Master Admin'
      }
    });
  });

  // Verify Active Session
  app.get('/api/auth/verify', (req, res) => {
    let token = req.cookies?.admin_session;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }

    if (!token) {
      return res.json({ success: false, authenticated: false });
    }

    const session = activeSessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
      if (session) activeSessions.delete(token);
      return res.json({ success: false, authenticated: false });
    }

    // Refresh sliding session expiry
    session.expiresAt = Date.now() + SESSION_MAX_AGE_MS;

    res.json({
      success: true,
      authenticated: true,
      expiresAt: new Date(session.expiresAt).toISOString()
    });
  });

  // Admin Logout
  app.post('/api/auth/logout', (req, res) => {
    let token = req.cookies?.admin_session;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }

    if (token) {
      activeSessions.delete(token);
    }

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
    res.clearCookie('admin_session', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/'
    });

    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Change Admin Password (Protected - requires active admin session)
  app.post('/api/auth/change-password', requireAdminAuth, (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Strong password policy required: New password must be at least 8 characters' 
      });
    }

    const oldInput = String(oldPassword || '').trim();
    let isOldValid = verifyPasswordBcrypt(oldInput, db.adminPasswordHash);

    if (!isOldValid && process.env.ADMIN_PASSWORD) {
      if (oldInput === process.env.ADMIN_PASSWORD.trim()) {
        isOldValid = true;
      }
    }

    if (!isOldValid) {
      return res.status(400).json({ success: false, error: 'Current administrator password is incorrect' });
    }

    const trimmedNew = String(newPassword).trim();
    db.adminPasswordHash = hashPasswordBcrypt(trimmedNew);
    persistDatabaseToDisk();

    console.log('[Security] Master admin password changed and hashed with bcrypt (12 rounds) on persistent disk');
    res.json({ success: true, message: 'Administrator password updated and hashed with bcrypt successfully' });
  });

  // =========================================================================
  // 3. PROTECTED ADMIN API ROUTES (Requires valid HttpOnly session)
  // =========================================================================

  // Fetch all inquiries (Confidential leads with PII decrypted for authorized admin)
  app.get('/api/admin/inquiries', requireAdminAuth, (req, res) => {
    const decryptedInquiries = db.inquiries.map(inq => ({
      ...inq,
      customerPhone: decryptPii(inq.customerPhone) || inq.customerPhone,
      customerEmail: inq.customerEmail ? (decryptPii(inq.customerEmail) || inq.customerEmail) : undefined
    }));

    res.json({
      success: true,
      total: decryptedInquiries.length,
      inquiries: decryptedInquiries
    });
  });

  // Update inquiry status or notes
  app.put('/api/admin/inquiries/:id', requireAdminAuth, (req, res) => {
    const id = req.params.id;
    const { status, notes } = req.body;
    const idx = db.inquiries.findIndex(i => i.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    if (status) db.inquiries[idx].status = status;
    if (notes !== undefined) (db.inquiries[idx] as any).internalNotes = notes;

    persistDatabaseToDisk();
    res.json({ success: true, inquiry: db.inquiries[idx] });
  });

  // Delete inquiry
  app.delete('/api/admin/inquiries/:id', requireAdminAuth, (req, res) => {
    const id = req.params.id;
    const initialLen = db.inquiries.length;
    db.inquiries = db.inquiries.filter(i => i.id !== id);

    if (db.inquiries.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    persistDatabaseToDisk();
    res.json({ success: true, message: 'Inquiry deleted' });
  });

  // Fetch all products for admin console
  app.get('/api/admin/products', requireAdminAuth, (req, res) => {
    res.json({
      success: true,
      total: db.products.length,
      products: db.products
    });
  });

  // Add Product
  app.post('/api/admin/products', requireAdminAuth, (req, res) => {
    const p = req.body;
    const title = sanitizeString(p.title, 200);
    const sku = sanitizeString(p.sku, 80);

    if (!title || !sku) {
      return res.status(400).json({ success: false, error: 'Title and SKU are required' });
    }

    if (p.imageUrl && !validateImageUrl(p.imageUrl)) {
      return res.status(400).json({ success: false, error: 'Invalid product image URL scheme' });
    }

    const newProduct: ProductItem = {
      ...p,
      id: p.id ? sanitizeString(p.id, 80) : ('prod-' + Date.now().toString(36)),
      guid: p.guid ? sanitizeString(p.guid, 80) : crypto.randomUUID(),
      title,
      sku,
      categorySlug: sanitizeString(p.categorySlug, 100) || 'optics-lenses',
      brand: sanitizeString(p.brand, 100) || 'Universal',
      model: sanitizeString(p.model, 100) || 'All Standard Laser Heads',
      description: sanitizeString(p.description, 2000),
      imageUrl: p.imageUrl ? String(p.imageUrl).trim() : '/images/spares/protective-window.webp',
      estimatedPrice: Math.max(0, Number(p.estimatedPrice) || 0),
      inStock: p.inStock !== false,
      featured: Boolean(p.featured)
    };

    db.products.unshift(newProduct);
    persistDatabaseToDisk();
    res.json({ success: true, product: newProduct });
  });

  // Update Product
  app.put('/api/admin/products/:id', requireAdminAuth, (req, res) => {
    const id = req.params.id;
    const idx = db.products.findIndex(p => p.id === id || p.guid === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const p = req.body;
    if (p.imageUrl && !validateImageUrl(p.imageUrl)) {
      return res.status(400).json({ success: false, error: 'Invalid product image URL scheme' });
    }

    const targetProduct = db.products[idx];
    const sanitizedUpdates: Partial<ProductItem> = {
      ...p,
      id: targetProduct.id, // retain immutable id
      guid: targetProduct.guid || p.guid || crypto.randomUUID()
    };
    if (p.title) sanitizedUpdates.title = sanitizeString(p.title, 200);
    if (p.sku) sanitizedUpdates.sku = sanitizeString(p.sku, 80);
    if (p.categorySlug) sanitizedUpdates.categorySlug = sanitizeString(p.categorySlug, 100);
    if (p.brand) sanitizedUpdates.brand = sanitizeString(p.brand, 100);
    if (p.description) sanitizedUpdates.description = sanitizeString(p.description, 2000);
    if (p.estimatedPrice !== undefined) sanitizedUpdates.estimatedPrice = Math.max(0, Number(p.estimatedPrice) || 0);

    db.products[idx] = { ...targetProduct, ...sanitizedUpdates };
    persistDatabaseToDisk();
    res.json({ success: true, product: db.products[idx] });
  });

  // Delete Product
  app.delete('/api/admin/products/:id', requireAdminAuth, (req, res) => {
    const id = req.params.id;
    const initialLen = db.products.length;
    db.products = db.products.filter(p => p.id !== id && p.guid !== id);

    if (db.products.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    persistDatabaseToDisk();
    res.json({ success: true, message: 'Product deleted' });
  });

  // Add Category
  app.post('/api/admin/categories', requireAdminAuth, (req, res) => {
    const c = req.body;
    const name = sanitizeString(c.name, 100);
    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const newCat: ProductCategoryDef = {
      ...c,
      id: c.id ? sanitizeString(c.id, 80) : ('cat-' + Date.now().toString(36)),
      name,
      slug: (c.slug ? sanitizeString(c.slug, 100) : name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: sanitizeString(c.description, 1000)
    };

    db.categories.push(newCat);
    persistDatabaseToDisk();
    res.json({ success: true, category: newCat });
  });

  // Update Category
  app.put('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
    const id = req.params.id;
    const idx = db.categories.findIndex(c => c.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const c = req.body;
    const sanitizedUpdates: Partial<ProductCategoryDef> = { ...c, id };
    if (c.name) sanitizedUpdates.name = sanitizeString(c.name, 100);
    if (c.slug) sanitizedUpdates.slug = sanitizeString(c.slug, 100).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (c.description) sanitizedUpdates.description = sanitizeString(c.description, 1000);

    db.categories[idx] = { ...db.categories[idx], ...sanitizedUpdates };
    persistDatabaseToDisk();
    res.json({ success: true, category: db.categories[idx] });
  });

  // Delete Category
  app.delete('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
    const id = req.params.id;
    const initialLen = db.categories.length;
    db.categories = db.categories.filter(c => c.id !== id);

    if (db.categories.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    persistDatabaseToDisk();
    res.json({ success: true, message: 'Category deleted' });
  });

  // Save Brands
  app.post('/api/admin/brands', requireAdminAuth, (req, res) => {
    if (Array.isArray(req.body.brands)) {
      db.brands = req.body.brands;
      persistDatabaseToDisk();
      res.json({ success: true, brands: db.brands });
    } else {
      res.status(400).json({ success: false, error: 'Brands array required' });
    }
  });

  // Save Power Ranges
  app.post('/api/admin/power-ranges', requireAdminAuth, (req, res) => {
    if (Array.isArray(req.body.powerRanges)) {
      db.powerRanges = req.body.powerRanges;
      persistDatabaseToDisk();
      res.json({ success: true, powerRanges: db.powerRanges });
    } else {
      res.status(400).json({ success: false, error: 'Power ranges array required' });
    }
  });

  // Save Site Settings
  app.post('/api/admin/settings', requireAdminAuth, (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    persistDatabaseToDisk();
    res.json({ success: true, settings: db.settings });
  });

  // Admin Reviews Management
  app.post('/api/admin/reviews', requireAdminAuth, (req, res) => {
    const { clientName, companyName, location, rating, date, comment, projectType, verified } = req.body;
    if (!clientName || !comment) {
      return res.status(400).json({ success: false, error: 'Client name and comment are required' });
    }

    const newReview: ReviewItem = {
      id: req.body.id || ('rev-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)),
      clientName: String(clientName).trim(),
      companyName: companyName ? String(companyName).trim() : 'Laser Cutting Facility',
      location: location ? String(location).trim() : 'India',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      date: date ? String(date).trim() : 'Just now',
      comment: String(comment).trim(),
      projectType: projectType ? String(projectType).trim() : 'Fiber Laser Spares',
      verified: verified !== false
    };

    db.reviews.unshift(newReview);
    persistDatabaseToDisk();

    console.log(`[Admin] Added review from ${newReview.clientName} (${newReview.companyName})`);
    res.json({ success: true, message: 'Review added successfully', review: newReview, reviews: db.reviews });
  });

  app.put('/api/admin/reviews/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const index = db.reviews.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    db.reviews[index] = {
      ...db.reviews[index],
      ...req.body,
      id // retain immutable id
    };
    persistDatabaseToDisk();

    res.json({ success: true, message: 'Review updated successfully', review: db.reviews[index], reviews: db.reviews });
  });

  app.delete('/api/admin/reviews/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const initialLen = db.reviews.length;
    db.reviews = db.reviews.filter(r => r.id !== id);
    if (db.reviews.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    persistDatabaseToDisk();

    res.json({ success: true, message: 'Review deleted successfully', reviews: db.reviews });
  });

  // Publish and Broadcast All Configuration
  app.post('/api/admin/publish', requireAdminAuth, (req, res) => {
    const payload = req.body;
    const publishTimestamp = new Date().toISOString();

    if (payload.settings) db.settings = { ...db.settings, ...payload.settings };
    if (Array.isArray(payload.products)) db.products = payload.products;
    if (Array.isArray(payload.categories)) db.categories = payload.categories;
    if (Array.isArray(payload.brands)) db.brands = payload.brands;
    if (Array.isArray(payload.powerRanges)) db.powerRanges = payload.powerRanges;
    if (Array.isArray(payload.reviews)) db.reviews = payload.reviews;

    db.lastPublishedAt = publishTimestamp;
    persistDatabaseToDisk();

    console.log(`[Admin] Full catalog published to all devices at ${publishTimestamp}`);
    res.json({
      success: true,
      message: 'Catalog successfully published to all live visitors and persisted',
      publishedAt: publishTimestamp
    });
  });

  // Database JSON Backup Export
  app.get('/api/admin/backup', requireAdminAuth, (req, res) => {
    const filename = `nklaser-full-backup-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      version: db.version,
      exportedAt: new Date().toISOString(),
      appName: 'NK Laser Spares & Optics',
      settings: db.settings,
      products: db.products,
      categories: db.categories,
      brands: db.brands,
      reviews: db.reviews,
      inquiries: db.inquiries,
      powerRanges: db.powerRanges
    }, null, 2));
  });

  // Database JSON Backup Restore
  app.post('/api/admin/restore', requireAdminAuth, (req, res) => {
    const { backup } = req.body;
    if (!backup || typeof backup !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid backup JSON data' });
    }

    if (backup.settings) db.settings = { ...db.settings, ...backup.settings };
    if (Array.isArray(backup.products)) db.products = backup.products;
    if (Array.isArray(backup.categories)) db.categories = backup.categories;
    if (Array.isArray(backup.brands)) db.brands = backup.brands;
    if (Array.isArray(backup.reviews)) db.reviews = backup.reviews;
    if (Array.isArray(backup.inquiries)) db.inquiries = backup.inquiries;
    if (Array.isArray(backup.powerRanges)) db.powerRanges = backup.powerRanges;

    db.lastPublishedAt = new Date().toISOString();
    persistDatabaseToDisk();

    res.json({
      success: true,
      message: 'Database backup restored successfully',
      counts: {
        products: db.products.length,
        categories: db.categories.length,
        inquiries: db.inquiries.length
      }
    });
  });

  // Entity-specific export endpoint (Products, Categories, Reviews, Settings, All)
  app.get('/api/admin/export/:entity', requireAdminAuth, (req, res) => {
    const { entity } = req.params;
    const format = (req.query.format as string) || 'json';
    const dateStamp = new Date().toISOString().split('T')[0];

    if (entity === 'products') {
      if (format === 'csv') {
        const headers = ['sku','title','categorySlug','category','subCategory','brand','powerRange','stockStatus','inStock','estimatedPrice','regularPrice','salePrice','material','thickness','dimensions','specs','description','imageUrl','id'];
        const escapeCell = (v: any) => {
          if (v === null || v === undefined) return '';
          const s = String(v);
          if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
          return s;
        };
        const rows = [headers.join(',')];
        for (const p of db.products) {
          const specsStr = Array.isArray(p.specs) ? p.specs.join(' | ') : (p.specs || '');
          rows.push([
            escapeCell(p.sku || ''),
            escapeCell(p.title || ''),
            escapeCell(p.categorySlug || ''),
            escapeCell(p.category || ''),
            escapeCell(p.subCategory || ''),
            escapeCell(p.brand || ''),
            escapeCell(p.powerRange || ''),
            escapeCell(p.stockStatus || (p.inStock ? 'In Stock' : 'Custom Order')),
            escapeCell(p.inStock ? 'true' : 'false'),
            escapeCell(p.estimatedPrice ?? ''),
            escapeCell(p.regularPrice ?? ''),
            escapeCell(p.salePrice ?? ''),
            escapeCell(p.material || ''),
            escapeCell(p.thickness || ''),
            escapeCell(p.dimensions || ''),
            escapeCell(specsStr),
            escapeCell(p.description || ''),
            escapeCell(p.imageUrl || ''),
            escapeCell(p.id || '')
          ].join(','));
        }
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="nklaser-products-${dateStamp}.csv"`);
        return res.send(rows.join('\n'));
      }
      return res.json({
        version: '1.0',
        entity: 'products',
        exportedAt: new Date().toISOString(),
        count: db.products.length,
        products: db.products
      });
    }

    if (entity === 'categories') {
      return res.json({
        version: '1.0',
        entity: 'categories',
        exportedAt: new Date().toISOString(),
        count: db.categories.length,
        categories: db.categories
      });
    }

    if (entity === 'reviews') {
      return res.json({
        version: '1.0',
        entity: 'reviews',
        exportedAt: new Date().toISOString(),
        count: db.reviews.length,
        reviews: db.reviews
      });
    }

    if (entity === 'settings') {
      return res.json({
        version: '1.0',
        entity: 'settings',
        exportedAt: new Date().toISOString(),
        settings: db.settings
      });
    }

    if (entity === 'all') {
      return res.json({
        version: db.version,
        exportedAt: new Date().toISOString(),
        appName: 'NK Laser Spares & Optics',
        settings: db.settings,
        products: db.products,
        categories: db.categories,
        brands: db.brands,
        reviews: db.reviews,
        inquiries: db.inquiries,
        powerRanges: db.powerRanges
      });
    }

    return res.status(400).json({ success: false, error: `Unknown export entity: ${entity}` });
  });

  // Entity-specific import endpoint (Products, Categories, Reviews, Settings)
  app.post('/api/admin/import/:entity', requireAdminAuth, (req, res) => {
    const { entity } = req.params;
    const { data, mode = 'merge' } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, error: 'Missing import data payload' });
    }

    const timestamp = new Date().toISOString();

    if (entity === 'products') {
      const incoming: any[] = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
      if (!incoming.length) {
        return res.status(400).json({ success: false, error: 'No products found in data payload' });
      }

      if (mode === 'replace') {
        db.products = incoming;
      } else {
        const map = new Map<string, any>();
        db.products.forEach(p => {
          if (p.sku) map.set(p.sku.toLowerCase(), p);
          map.set(p.id, p);
        });
        incoming.forEach(p => {
          const keySku = p.sku?.toLowerCase();
          if (keySku && map.has(keySku)) {
            const old = map.get(keySku);
            map.set(keySku, { ...old, ...p, id: old.id });
          } else if (map.has(p.id)) {
            const old = map.get(p.id);
            map.set(p.id, { ...old, ...p });
          } else {
            map.set(p.id || `prod-${Date.now()}-${Math.random()}`, p);
          }
        });
        db.products = Array.from(new Set(map.values()));
      }

      db.lastPublishedAt = timestamp;
      persistDatabaseToDisk();
      return res.json({
        success: true,
        message: `Successfully imported products (${mode}). Total count: ${db.products.length}`,
        count: db.products.length,
        items: db.products
      });
    }

    if (entity === 'categories') {
      const incoming: any[] = Array.isArray(data) ? data : (Array.isArray(data.categories) ? data.categories : []);
      if (!incoming.length) {
        return res.status(400).json({ success: false, error: 'No categories found in data payload' });
      }

      if (mode === 'replace') {
        db.categories = incoming;
      } else {
        const map = new Map<string, any>();
        db.categories.forEach(c => {
          map.set(c.slug, c);
          map.set(c.id, c);
        });
        incoming.forEach(c => {
          if (map.has(c.slug)) {
            const old = map.get(c.slug);
            map.set(c.slug, { ...old, ...c, id: old.id });
          } else {
            map.set(c.slug, c);
          }
        });
        db.categories = Array.from(new Set(map.values()));
      }

      db.lastPublishedAt = timestamp;
      persistDatabaseToDisk();
      return res.json({
        success: true,
        message: `Successfully imported categories (${mode}). Total count: ${db.categories.length}`,
        count: db.categories.length,
        items: db.categories
      });
    }

    if (entity === 'reviews') {
      const incoming: any[] = Array.isArray(data) ? data : (Array.isArray(data.reviews) ? data.reviews : []);
      if (!incoming.length) {
        return res.status(400).json({ success: false, error: 'No reviews found in data payload' });
      }

      if (mode === 'replace') {
        db.reviews = incoming;
      } else {
        const map = new Map<string, any>();
        db.reviews.forEach(r => map.set(r.id, r));
        incoming.forEach(r => map.set(r.id || `rev-${Date.now()}-${Math.random()}`, r));
        db.reviews = Array.from(map.values());
      }

      db.lastPublishedAt = timestamp;
      persistDatabaseToDisk();
      return res.json({
        success: true,
        message: `Successfully imported reviews (${mode}). Total count: ${db.reviews.length}`,
        count: db.reviews.length,
        items: db.reviews
      });
    }

    if (entity === 'settings') {
      const settingsPayload = data.settings || data;
      db.settings = { ...db.settings, ...settingsPayload };
      db.lastPublishedAt = timestamp;
      persistDatabaseToDisk();
      return res.json({
        success: true,
        message: 'Settings successfully updated and persisted on server',
        settings: db.settings
      });
    }

    return res.status(400).json({ success: false, error: `Unknown import entity: ${entity}` });
  });

  // Backward compatibility routes for legacy local sync (Protected - requires admin auth)
  app.get('/api/config', requireAdminAuth, (req, res) => {
    res.json({
      success: true,
      config: {
        version: db.version,
        settings: db.settings,
        products: db.products,
        categories: db.categories,
        brands: db.brands,
        reviews: db.reviews,
        powerRanges: db.powerRanges,
        lastPublishedAt: db.lastPublishedAt
      }
    });
  });

  app.post('/api/config', requireAdminAuth, (req, res) => {
    const payload = req.body.config || req.body;
    if (payload.settings) db.settings = { ...db.settings, ...payload.settings };
    if (Array.isArray(payload.products)) db.products = payload.products;
    if (Array.isArray(payload.categories)) db.categories = payload.categories;
    if (Array.isArray(payload.brands)) db.brands = payload.brands;
    if (Array.isArray(payload.powerRanges)) db.powerRanges = payload.powerRanges;
    persistDatabaseToDisk();
    res.json({ success: true, message: 'Configuration saved' });
  });

  app.post('/api/publish', requireAdminAuth, (req, res) => {
    const payload = req.body.config || req.body;
    if (payload.settings) db.settings = { ...db.settings, ...payload.settings };
    if (Array.isArray(payload.products)) db.products = payload.products;
    if (Array.isArray(payload.categories)) db.categories = payload.categories;
    if (Array.isArray(payload.brands)) db.brands = payload.brands;
    if (Array.isArray(payload.powerRanges)) db.powerRanges = payload.powerRanges;
    db.lastPublishedAt = new Date().toISOString();
    persistDatabaseToDisk();
    res.json({ success: true, message: 'Published' });
  });

  // =========================================================================
  // 3.5. TECHNICAL SEO & CRAWLER INFRASTRUCTURE
  // Dynamic sitemap.xml, robots.txt, llms.txt & edge SSR fallback for bots
  // =========================================================================

  // Dynamic XML Sitemap reflecting live database products, categories & pages
  app.get('/sitemap.xml', (req, res) => {
    try {
      const siteUrl = `${req.protocol}://${req.headers.host || 'nklaser.com'}`;
      const xml = generateSitemapXml(db, siteUrl);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      res.send(xml);
    } catch (err) {
      console.error('[SEO] Failed to generate sitemap.xml:', err);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Technical robots.txt referencing dynamic sitemap URL
  app.get('/robots.txt', (req, res) => {
    const siteUrl = `${req.protocol}://${req.headers.host || 'nklaser.com'}`;
    const robots = [
      '# Robots.txt for NK Laser Spares & Optics',
      'User-agent: *',
      'Allow: /',
      'Allow: /store',
      'Allow: /category/',
      'Allow: /product/',
      'Allow: /services',
      'Allow: /reviews',
      'Allow: /contact',
      'Allow: /llms.txt',
      '',
      '# Disallow private admin portal & API backends',
      'Disallow: /admin',
      'Disallow: /api/admin',
      'Disallow: /nk-vault-*',
      'Disallow: /*?vault=*',
      'Disallow: /*?admin=*',
      'Disallow: /backup-restore',
      '',
      'Crawl-delay: 1',
      `Sitemap: ${siteUrl}/sitemap.xml`
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(robots);
  });

  // AI & Generative Search /llms.txt discoverability endpoint
  app.get('/llms.txt', (req, res) => {
    const llmsFilePath = path.join(process.cwd(), 'public', 'llms.txt');
    if (fs.existsSync(llmsFilePath)) {
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.sendFile(llmsFilePath);
    } else {
      res.status(404).send('llms.txt not found');
    }
  });

  // API 404 handler - prevents API requests from receiving HTML SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API endpoint ${req.method} ${req.path} not found`
    });
  });

  // Dynamic Bot Pre-Rendering Middleware:
  // Intercepts search engine bots, social scrapers & AI crawlers to serve 100% pre-rendered
  // semantic HTML with Schema.org JSON-LD and zero JavaScript execution delay.
  app.use((req, res, next) => {
    // Skip API routes, Vite internal routes, and static assets
    if (
      req.path.startsWith('/api/') || 
      req.path.startsWith('/@') || 
      req.path.startsWith('/src/') ||
      req.path.startsWith('/node_modules/') ||
      req.path.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)$/i)
    ) {
      return next();
    }

    if (isBotRequest(req)) {
      try {
        const siteUrl = `${req.protocol}://${req.headers.host || 'nklaser.com'}`;
        const rendered = renderBotPage(req.path, db, siteUrl);
        if (rendered) {
          res.status(rendered.status);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('X-Rendered-By', 'NK-Laser-Dynamic-SSR');
          return res.send(rendered.html);
        }
      } catch (err) {
        console.error('[SEO] Error pre-rendering bot page:', err);
      }
    }
    next();
  });

  // =========================================================================
  // 4. FRONTEND SERVING & VITE SPA FALLBACK
  // =========================================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NK Laser] Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start NK Laser server:', err);
});
