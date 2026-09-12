# NK Laser Spares & Optics — Industrial Fiber Laser B2B E-Commerce & Workshop Management

A high-performance B2B digital catalog, RFQ quotation engine, and secure workshop management platform for **NK Laser Spares & Optics**, specializing in industrial fiber laser cutting consumables, RayTools / OSPRI cutting heads, optical quartz protective windows, Tellurium copper cutting nozzles, ceramic sensor rings, focusing/collimator lenses, and wireless CypCut CNC remote pendants.

---

## 📁 Complete Repository Architecture & File Tree

```
.
├── index.html                           # Single page HTML entry point
├── metadata.json                        # Application metadata, capabilities & permissions
├── package.json                         # Project dependencies, build scripts & metadata
├── tsconfig.json                        # TypeScript strict compiler configuration
├── vite.config.ts                       # Vite bundler & Tailwind plugin config
├── server.ts                            # Authoritative Node.js / Express backend server (Port 3000)
├── app-config.json                      # Persistent database store on disk (products, categories, settings, PII)
├── AGENTS.md                            # AI Agent guidelines, architecture & rules (Auto-injected)
├── CLOUDFLARE.md                        # Complete Cloudflare Pages & D1 deployment instructions
├── DATA_MANAGEMENT.md                   # Data persistence, modular import/export & server sync guide
├── LOCAL_SETUP.md                       # One-time setup + every-time run guide for local testing
├── PROJECT_STRUCTURE.md                 # Detailed architectural blueprint & component tree
├── README.md                            # Comprehensive project overview & documentation
└── src/
    ├── App.tsx                          # Root orchestrator: state, view routing, URL popstate sync
    ├── main.tsx                         # React 18 DOM entry point
    ├── index.css                        # Global Tailwind CSS and CSS Variable design system
    ├── types.ts                         # Global TypeScript interfaces, types & data contracts
    ├── lib/
    │   ├── api.ts                       # Secure typed API client with HttpOnly cookie & bearer fallback
    │   └── storage.ts                   # Client-side cache, local persistence & brand audit engine
    ├── utils/
    │   ├── navigation.ts                # URL query parsing, buildAppUrl & updateBrowserUrl helpers
    │   ├── themeColors.ts               # Dynamic primary/accent generator & WCAG contrast engine
    │   ├── whatsapp.ts                  # WhatsApp URL builder & message markdown formatters
    │   ├── instagram.ts                 # Social sharing helpers
    │   └── storage.ts                   # Storage bridge helper
    ├── data/
    │   ├── index.ts                     # Data exports barrel
    │   ├── materialsData.ts             # Material specs & cutting capability data
    │   └── siteImages.ts                # Curated high-res asset references & CDNs
    └── components/
        ├── common/                      # Reusable UI primitives & brand marks
        │   ├── NKLogo.tsx               # High-contrast industrial SVG logo & brand badge
        │   ├── SectionHeading.tsx       # Standardized section titles with accent bars
        │   ├── ThemeToggle.tsx          # Dark / Light theme toggle button
        │   ├── WhatsAppIcon.tsx         # Official WhatsApp SVG brand icon
        │   ├── SEOHead.tsx              # React Helmet dynamic page titles, meta tags & Schema.org JSON-LD
        │   └── ImageUploadField.tsx     # Reusable image uploader with preview & URL fallback
        ├── client/                      # Public storefront & B2B customer UI
        │   ├── Navbar.tsx               # Sticky header: SKU search, category mega-menu, cart trigger
        │   ├── Hero.tsx                 # Industrial hero banner with quick CTA triggers
        │   ├── SparesShopBanner.tsx     # Direct catalog entrance & express dispatch notice
        │   ├── CategoryHub.tsx          # Interactive bento-grid category showcase
        │   ├── FeaturedDiscovery.tsx    # Highlighting top-selling optical spares & heads
        │   ├── StoreCatalogView.tsx     # Faceted product catalog with live filters & search
        │   ├── ShareCatalogModal.tsx    # PDF quote generator, WhatsApp proposal & link copier
        │   ├── ProductDetailView.tsx    # Technical specs sheet, related spares & RFQ actions
        │   ├── ProductGallery.tsx       # High-res zoomable gallery
        │   ├── CartDrawer.tsx           # Multi-item RFQ builder & WhatsApp checkout
        │   ├── InquiryModal.tsx         # Single-item quote modal with OEM fitment
        │   ├── QuoteCalculator.tsx      # Interactive fiber laser spare parts & job cost estimator
        │   ├── MaterialSpecs.tsx        # Material cutting tolerance & capability charts
        │   ├── BrandsSection.tsx        # OEM brand compatibility showcase
        │   ├── ServiceShowcase.tsx      # Engineering, refurbishment & custom fabrication services
        │   ├── ReviewsSection.tsx       # Verified buyer reviews & rating submission
        │   ├── ContactSection.tsx       # Direct message form, workshop coordinates & map
        │   └── Footer.tsx               # Company details, quick category links & admin entrance
        └── admin/                       # Password-protected back-office admin console
            ├── AdminPanel.tsx           # Master admin modal, tab routing & PIN security
            ├── AdminHeader.tsx          # Admin top bar: live publish status, search & theme
            ├── AdminSidebar.tsx         # Sidebar navigation with item counter badges
            ├── CategoryAutocomplete.tsx # Fuzzy subcategory input helper
            ├── modals/                  # Admin creation and editing dialogs
            │   ├── ProductEditModal.tsx # Full product SKU, specs, pricing, compatibility editor
            │   ├── CategoryEditModal.tsx# Category and subcategory taxonomy editor
            │   └── BrandEditModal.tsx   # OEM brand and cutting head model editor
            └── views/                   # Tab views for admin console
                ├── AdminDashboardView.tsx # Metrics overview, quick actions & system health
                ├── AdminProductsView.tsx  # Product inventory CRUD, batch actions & stock toggle
                ├── AdminCategoriesView.tsx# Category taxonomy & subcategory manager
                ├── AdminFiltersView.tsx   # Brand mappings, power ranges & filter facets
                ├── AdminInquiriesView.tsx # Inbound customer RFQ leads, status & notes
                ├── AdminSettingsView.tsx  # Business profile, contact, theme colors & showPricing
                └── AdminSecurityView.tsx  # Admin PIN change, session manager & brand compliance scan
```

---

## 🔒 Enterprise Security & Data Hardening Architecture

The system enforces strict multi-layered security controls across both the client and server:

### 1. Backend-Enforced Authentication & Sessions
- **Gatekeeping**: Every administrative endpoint (`/api/admin/*`, `/api/config`, `/api/publish`, `/api/auth/change-password`) is guarded on the backend by the `requireAdminAuth` middleware.
- **Dual Session Mechanism**:
  - **HttpOnly Cookie**: Issues a 256-bit cryptographic token in an `HttpOnly`, `Secure` (in HTTPS), `SameSite=None` (or `Lax` local) cookie (`admin_session`), immune to client-side XSS token theft.
  - **In-Memory Bearer Fallback**: For partitioned iframe environments (such as the AI Studio live preview window), `src/lib/api.ts` maintains an in-memory session token passed via `Authorization: Bearer <token>`.
- **Brute-Force Rate Limiting**: The `/api/auth/login` endpoint automatically locks out an IP address for 15 minutes after 5 consecutive failed attempts.
- **Bcrypt Password Security**: Admin credentials are authenticated against a salted `bcryptjs` hash with cost factor 12 (`BCRYPT_ROUNDS = 12`).

### 2. Customer PII Shielding (Encryption at Rest)
- Customer phone numbers and email addresses submitted through RFQ forms and the Quote Calculator are sensitive Personal Identifiable Information (PII).
- **AES-256-GCM Encryption**: Stored on disk (`app-config.json`) using authenticated AES-256-GCM encryption (`ciphertext:iv:tag`).
- **Decryption Isolation**: Plaintext contact details are never exposed to public endpoints and are decrypted only when an authenticated administrator queries `GET /api/admin/inquiries`.

### 3. Input Validation & HTML Sanitization
- All product, category, and review mutation endpoints pass incoming strings through `sanitizeString` to enforce length constraints and strip executable HTML/script tags.
- Image URLs are verified with `validateImageUrl` to reject unsafe protocols (`javascript:`, `data:` scripts).

### 4. Defense-in-Depth HTTP Headers
- `Content-Security-Policy`: Configured with explicit `frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app` to prevent clickjacking while permitting authorized embedding in AI Studio and container previews.
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **API 404 Isolation**: Unmatched `/api/*` routes return a JSON 404 response instead of falling through to the frontend Single Page Application (SPA) HTML fallback.

---

## 🔍 Non-Product Brand Compliance Audit

The Admin Console (`AdminSecurityView.tsx` and `src/lib/storage.ts`) includes an automated compliance scanner:
- **Strict Non-Product Rule**: Website content outside product listings (Site Settings, Hero titles & subheadings, notice banners, Services, Categories, Subcategories, Customer Reviews, and Workshop Addresses) must reference **only "NKL" / "NK Laser"**.
- Any third-party brand (RayTools, Precitec, Bodor, Trumpf, Nova, WSX, BOCHU, OSPRI, etc.) detected in non-product content is flagged with contextual excerpts and source locations.
- **Product Exemption**: Product listings remain permitted to list OEM brands for replacement compatibility and machine fitment.

---

## 🚀 Setup & Startup Instructions

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher

### 1. Installation
Install all project dependencies directly in the project root:
```bash
npm install
```

### 2. Running the Development Server
Start the full-stack development environment:
```bash
npm run dev
```
The dev server launches on `http://localhost:3000` with the Express API and Vite middleware.

> For `.env` setup, the admin login password, a repeatable test checklist, and troubleshooting,
> see **[LOCAL_SETUP.md](./LOCAL_SETUP.md)**.

### 3. Production Build & Execution
Build the static frontend bundle and compile the backend server bundle:
```bash
npm run build
npm start
```

---

## ☁️ Deployment & Production Data Management
- **One-click, cross-platform (Windows/macOS/Linux) deploy**: `npm run deploy` — an interactive wizard that provisions/binds Cloudflare D1, repairs schema drift, seeds catalog data, configures secrets, builds, and deploys, with a post-deploy health check. No bash required.
- For complete Cloudflare Pages, Cloudflare Workers, and Cloudflare D1 database setup instructions (including the bash-based alternative scripts and troubleshooting for real incidents), refer to **[CLOUDFLARE.md](./CLOUDFLARE.md)**.
- For data persistence, "Sync with Server" mechanics, zero-data-loss deployments, safe schema migrations, and live debugging, refer to **[DATA_MANAGEMENT.md](./DATA_MANAGEMENT.md)**.
