# Cloudflare Deployment & Hosting Guide: NK Laser Spares & Optics

This guide provides comprehensive, step-by-step instructions for hosting and deploying **NK Laser Spares & Optics** on **Cloudflare.com** using **Cloudflare Pages** and **Cloudflare Workers & D1** with zero data loss, automated CI/CD builds, dynamic schema support, edge bot pre-rendering for SEO, and enterprise-grade security hardening.

---

## 1. Architecture Overview

- **Platform**: Cloudflare Pages (Static & Functions) + Cloudflare Workers / D1 (Serverless Database)
- **Frontend**: Vite / React 18+ (SPA with deep linking via `public/_redirects`)
- **Backend / Edge Functions**: Cloudflare Pages Functions (`/functions/[[path]].ts`) & Node.js Express server (`server.ts`) for local/container runtimes
- **Persistence Model**: Dual client-side cache + serverless edge API & Cloudflare D1 database
- **Security**: 
  - Master Admin Password: Bcrypt hash (Cost 12) stored in Cloudflare Worker Secrets
  - Customer PII: AES-256-GCM encryption at rest for customer phone numbers and emails
  - Dynamic Bot Pre-Rendering: Generates semantic HTML5 and Schema.org JSON-LD for Googlebot, Bingbot, and AI crawlers

---

## 2. Option A: Git Continuous Deployment (Recommended)

Automatic builds and zero-downtime deployments every time you push code to GitHub or GitLab.

### Step-by-Step Setup:

1. **Push your repository** to GitHub or GitLab:
   ```bash
   git add .
   git commit -m "feat: complete NK Laser platform with security & SEO hardening"
   git push origin main
   ```

2. **Log into Cloudflare**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com/)
   - In the left sidebar, navigate to **Workers & Pages** > **Overview** > **Create application** > **Pages** > **Connect to Git**.

3. **Select Repository & Configure Build**:
   - Select your `nk-laser` repository.
   - Configure the build settings:
     - **Project name**: `nk-laser` (or your preferred name)
     - **Production branch**: `main`
     - **Framework preset**: `Vite`
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Environment variables**:
       - `NODE_VERSION` = `20`

4. **Deploy**:
   - Click **Save and Deploy**.
   - Cloudflare will build the Vite bundle and deploy it globally across 300+ edge data centers.
   - You will receive an instant live URL like `https://nk-laser.pages.dev`.

5. **Custom Domain (Free)**:
   - Go to your Pages project > **Custom domains** > **Set up a custom domain**.
   - Enter your domain (e.g. `nklaser.com` or `spares.nklaser.com`). Cloudflare provisions automatic SSL/TLS certificates for free.

---

## 3. Option B: Direct Terminal Deployment via Wrangler CLI

Deploy directly from your command line without connecting Git:

```bash
# 1. Install dependencies and build the bundle
npm install
npm run build

# 2. Deploy directly to Cloudflare Pages (Free)
npx wrangler pages deploy dist --project-name=nk-laser
```

Follow the browser prompt on first use to authenticate your Cloudflare account.

---

## 4. Configuring Cloudflare Secrets & Environment Variables

To protect sensitive keys, never commit plaintext credentials to Git. Use Cloudflare Worker Secrets:

### 1. Set Master Admin Password Hash (Bcrypt Cost 12):
Generate a Bcrypt hash with work factor 12 (e.g., using `bcryptjs` or standard CLI tools):
```bash
# Set secret via Wrangler CLI:
npx wrangler secret put ADMIN_PASSWORD_HASH --project-name=nk-laser
# Prompt: Enter the bcrypt hash (e.g. $2a$12$...)
```

### 2. Set Customer PII Encryption Key (AES-256-GCM):
Generate a 32-byte hexadecimal encryption key for encrypting customer contact details:
```bash
# Generate key in terminal:
openssl rand -hex 32

# Store in Cloudflare Secrets:
npx wrangler secret put ENCRYPTION_KEY --project-name=nk-laser
```

---

## 5. Cloudflare D1 Serverless Database Setup

Cloudflare D1 provides edge SQL storage with zero maintenance:

### 1. Create the D1 database:
```bash
npx wrangler d1 create nk_laser_db
```

### 2. Add binding in `wrangler.toml`:
```toml
name = "nk-laser"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "nk_laser_db"
database_id = "YOUR_D1_DATABASE_ID"
```

### 3. Initialize the D1 Schema:
Execute the schema containing encrypted customer PII columns and flexible JSON metadata:

```sql
-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT NOT NULL,
  estimated_price REAL DEFAULT 0,
  min_order_qty INTEGER DEFAULT 1,
  stock_status TEXT DEFAULT 'In Stock',
  is_popular INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  image_url TEXT,
  description TEXT,
  specifications_json TEXT, -- JSON key-value specs
  created_at TEXT
);

-- Inquiries Table (Customer PII Encrypted at Rest)
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone_encrypted TEXT NOT NULL, -- AES-256-GCM ciphertext:iv:tag
  customer_email_encrypted TEXT,          -- AES-256-GCM ciphertext:iv:tag
  company_name TEXT,
  city TEXT,
  product_or_service TEXT,
  sku TEXT,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'New',
  source TEXT DEFAULT 'Storefront',
  created_at TEXT
);

-- Categories & Site Settings Table
CREATE TABLE IF NOT EXISTS site_configuration (
  key TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  updated_at TEXT
);
```

---

## 6. Single Page Application (SPA) Routing Rule

The project includes `public/_redirects` with the following rule:

```text
/*   /index.html   200
```

This guarantees that all deep-link URLs reload properly without 404 errors on Cloudflare:
- Catalog filtering: `/?view=store&cat=protective-lenses&brand=RayTools`
- Direct product pages: `/?view=product-detail&product=NK-PW-37x7`
- Admin Console: `/?admin=true&tab=products`

---

## 7. Edge Dynamic Bot Pre-Rendering & Technical SEO

Search engines and AI indexing bots are dynamically served pre-rendered semantic HTML via Cloudflare Pages Functions (`/functions/[[path]].ts`):

### How it works:
1. **Human Browsers**: Served the lightweight static client bundle (`dist/index.html`) from Cloudflare's CDN cache with instantaneous load times.
2. **Search Crawlers & AI Engines** (`Googlebot`, `Bingbot`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, social crawlers):
   - Edge function intercepts the crawler request.
   - Generates complete semantic HTML5 (`<article>`, `<h1>`, specs tables, internal links).
   - Injects complete **Schema.org JSON-LD** graphs (`LocalBusiness`, `Product`, `Offer`, `BreadcrumbList`, `FAQPage`).
   - Returns true HTTP `404` status for deleted/non-existent items to avoid soft 404 indexing penalties.
3. **Dynamic XML Sitemap & Robots.txt**:
   - `/sitemap.xml`: Auto-generated from database inventory including all products, categories, services, and image URLs.
   - `/robots.txt`: Grants universal crawl access, disallowing private admin vaults.
   - `/llms.txt`: Plaintext structured documentation providing AI engines (ChatGPT, Claude, Gemini, Perplexity) with comprehensive specs, brand compatibilities, material tolerances, and RFQ workflows.

### Edge Verification Commands:
```bash
# Test bot pre-rendering locally or on Pages URL
curl -s -i -H "User-Agent: Googlebot/2.1" https://nk-laser.pages.dev/product/nkl-clk-101

# Verify dynamic sitemap
curl -s https://nk-laser.pages.dev/sitemap.xml | head -n 30

# Verify AI documentation
curl -s https://nk-laser.pages.dev/llms.txt
```

---

## 8. Security Headers Configuration (`_headers`)

To enforce security headers on Cloudflare Pages, include a `public/_headers` file:

```http
/*
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: ws: wss:; frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app; object-src 'none';
```

*(Note: `frame-ancestors` permits authorized embedding in Google AI Studio and production containers while blocking clickjacking elsewhere).*

---

## 9. Non-Product Brand Compliance Scan

Before deploying major releases:
1. Log into the **Admin Console** (`/?admin=true&tab=security`).
2. Run the **Non-Product Brand Compliance & Catalog Audit**.
3. Confirm that all non-product content (Settings, Services, Categories, Reviews, Addresses) strictly uses **"NKL" / "NK Laser"**.
4. Third-party brand references in product listings remain permitted for OEM fitment.

---

## 10. Google Search Console Checklist

After connecting your custom domain (e.g. `nklaser.com`):

1. **Domain Verification**:
   - In Cloudflare DNS, add the `TXT` record provided by Google Search Console (`google-site-verification=...`).
2. **Submit XML Sitemap**:
   - In Google Search Console > **Sitemaps** > Enter `sitemap.xml` > Click **Submit**.
   - Repeat in Bing Webmaster Tools.
3. **Inspect URLs**:
   - Test `https://nklaser.com/product/nkl-clk-101` in the **URL Inspection** tool. Click **Test Live URL** to confirm Googlebot receives pre-rendered HTML and Schema.org rich results.
