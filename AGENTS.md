# AI Agent Guidelines & Architecture Manual: NK Laser Spares & Optics

This document defines the core architecture, rules, engineering standards, component tree structure, and functional contracts for AI coding agents and human developers maintaining and extending the **NK Laser Spares & Optics** application.

---

## 1. Project Mission & Identity
**NK Laser Spares & Optics** is an industrial-grade B2B web application for fiber laser cutting spare parts (optics, Tellurium copper nozzles, ceramic sensor bodies, cutting heads, focusing/collimating lenses, CNC pendants, and consumables).

### Key Stakeholders & Workflows:
1. **B2B Industrial Clients / CNC Operators**:
   - Search, filter by machine OEM/power rating, configure custom RFQs, and request quotations via WhatsApp.
   - Download official, letterhead-styled PDF quotations generated client-side via `jspdf`.
   - Deep link directly to products, categories, search queries, and specific filter presets via URL synchronization.
2. **Shop Owners / Sales Managers (Admin Console)**:
   - Manage products, SKU inventory, categories/subcategories, view/update incoming RFQ leads.
   - Toggle pricing visibility (`showPricing`) and customize branding, theme colors, and company information.
   - Access tabbed admin tools (`/?admin=true&tab=...`) protected by backend authentication and Bcrypt hashing.
   - Run automated Non-Product Brand Compliance Integrity Scans.

---

## 2. Complete Repository Tree Structure

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
├── PROJECT_STRUCTURE.md                 # Detailed project architecture & file index
├── README.md                            # Comprehensive project overview & documentation
└── src/
    ├── App.tsx                          # Root orchestrator: state, view routing, URL popstate sync
    ├── main.tsx                         # React 18 DOM entry point
    ├── index.css                        # Global Tailwind CSS and CSS Variable design system
    ├── types.ts                         # Global TypeScript interfaces, types & data contracts
    ├── lib/
    │   ├── api.ts                       # Secure typed API client for frontend-to-backend communication
    │   └── storage.ts                   # Client-side cache, local persistence & multi-device sync
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
        ├── README.md                    # Component tree architecture guide
        ├── common/                      # Reusable UI primitives & brand marks
        │   ├── README.md                # Common components overview
        │   ├── NKLogo.tsx               # High-contrast industrial SVG logo & brand badge
        │   ├── SectionHeading.tsx       # Standardized section titles with accent bars
        │   ├── ThemeToggle.tsx          # Dark / Light theme toggle button
        │   ├── WhatsAppIcon.tsx         # Official WhatsApp SVG brand icon
        │   ├── SEOHead.tsx              # React Helmet dynamic page titles, meta tags & Schema.org JSON-LD
        │   └── ImageUploadField.tsx     # Reusable image uploader with preview & URL fallback
        ├── client/                      # Public storefront & B2B customer UI
        │   ├── README.md                # Storefront documentation
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
            ├── README.md                # Admin panel architecture & specs
            ├── AdminPanel.tsx           # Master admin modal, tab routing & PIN security
            ├── AdminHeader.tsx          # Admin top bar: live publish status, search & theme
            ├── AdminSidebar.tsx         # Sidebar navigation with item counter badges
            ├── CategoryAutocomplete.tsx # Fuzzy subcategory input helper
            ├── modals/                  # Admin creation and editing dialogs
            │   ├── README.md            # Modal specifications
            │   ├── ProductEditModal.tsx # Full product SKU, specs, pricing, compatibility editor
            │   ├── CategoryEditModal.tsx# Category and subcategory taxonomy editor
            │   └── BrandEditModal.tsx   # OEM brand and cutting head model editor
            └── views/                   # Tab views for admin console
                ├── README.md            # Admin views documentation
                ├── AdminDashboardView.tsx # Metrics overview, quick actions & system health
                ├── AdminProductsView.tsx  # Product inventory CRUD, batch actions & stock toggle
                ├── AdminCategoriesView.tsx# Category taxonomy & subcategory manager
                ├── AdminFiltersView.tsx   # Brand mappings, power ranges & filter facets
                ├── AdminInquiriesView.tsx # Inbound customer RFQ leads, status & notes
                ├── AdminSettingsView.tsx  # Business profile, contact, theme colors & showPricing
                └── AdminSecurityView.tsx  # Admin PIN change, session manager & data audit
```

---

## 3. Core Architecture & Tech Stack
- **Frontend Architecture**: React 18+ with TypeScript in strict mode, Vite, and Tailwind CSS.
- **Backend Architecture**: Node.js + Express (`server.ts`) operating on port `3000` with strict authentication middleware (`requireAdminAuth`).
- **Data Communication**: Client components communicate through typed API client methods in `src/lib/api.ts`.
- **Styling**: Tailwind CSS with industrial high-contrast dark and light modes.
- **Icons**: `lucide-react` exclusively. Do not introduce custom SVGs unless required for specific brand marks (e.g. `WhatsAppIcon.tsx`).
- **PDF Generation**: `jspdf` and `jspdf-autotable` for client-side PDF quote and catalog generation.
- **State Management & Persistence**: Server-side persistence via Express backend (`/server.ts`) with client-side cache and fallback seed data in `/src/data/`.
- **Navigation & URL Routing**: Synchronized query parameters and hash routing in `src/utils/navigation.ts` supporting browser Back/Forward (`popstate`) and deep linking.
- **Server Bundler**: `esbuild` compiling `server.ts` to `dist/server.cjs` for standalone production execution.

---

## 4. Security & Hardening Architecture

All developers and AI agents must uphold the following security rules:

### 4.1 Backend-Enforced Authentication & Sessions
- **No Client-Side-Only Security**: All administrative endpoints (`/api/admin/*`, `/api/config`, `/api/publish`, `/api/auth/change-password`) must be strictly protected on the backend using `requireAdminAuth`.
- **Session Architecture**:
  - Primary authentication uses a random 256-bit session token in an `HttpOnly` cookie (`admin_session`).
  - Cookie flags: `SameSite=None; Secure` when running on HTTPS (to support embedded preview iframes), or `SameSite=Lax` in local development.
  - Fallback authentication supports `Authorization: Bearer <token>` in headers (held in memory by `api.ts`) for environments where third-party iframe cookies are partitioned.
  - Never store master passwords or persistent auth tokens in `localStorage`.

### 4.2 Password Security & Brute-Force Rate Limiting
- **Bcrypt Work Factor**: Master administrator passwords must be hashed using `bcryptjs` with a minimum of 12 rounds (`BCRYPT_ROUNDS = 12`).
- **Brute-Force Protection**: The `/api/auth/login` endpoint enforces IP-based rate limiting. After 5 consecutive failed login attempts from an IP address, that IP is locked out for 15 minutes.

### 4.3 Customer PII Shielding (Encryption at Rest)
- Customer phone numbers and email addresses submitted via RFQ forms, Quick Quotes, or the Quote Calculator are confidential personal identifiable information (PII).
- **AES-256-GCM Encryption**: PII is encrypted at rest using AES-256-GCM before saving to disk in `app-config.json`.
- **Decryption Scope**: Decryption occurs exclusively on the backend when requested by an authenticated administrator through `GET /api/admin/inquiries`. Public endpoints never expose customer PII.

### 4.4 Input Validation & Sanitization
- All state-modifying requests (Products, Categories, Reviews, Inquiries) must sanitize text inputs with `sanitizeString` to truncate excessive payloads and strip script/HTML tags.
- All image URLs must be validated using `validateImageUrl` to reject unsafe protocols (`javascript:`, `data:` script vectors).

### 4.5 Defense-in-Depth HTTP Headers
`server.ts` injects standard OWASP headers:
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy`: Configured with explicit `frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app` to permit legitimate previews while defending against unauthorized framing.
- **API 404 Isolation**: Any unmatched `/api/*` request must return a JSON 404 response (`{"success": false, "error": "API endpoint ... not found"}`), never falling through to the frontend Single Page Application (SPA) HTML fallback.

---

## 5. Non-Product Brand Compliance Audit Policy

The Admin Console incorporates an automated compliance scanner (`runAutoBrandAudit` in `src/lib/storage.ts` and `AdminSecurityView.tsx`).

### Strict Compliance Rule:
1. **Non-Product Content (Strictly NKL Only)**:
   - All website content outside of product listings (Site Settings, Hero Titles, Subheadings, Notice Banners, DXF notices, Services, Category names/subcategories, Customer Reviews & Testimonials, Workshop Addresses) must reference **only "NKL" or "NK Laser"**.
   - If any third-party brand (e.g., RayTools, Precitec, Bodor, Trumpf, Nova, WSX, BOCHU, OSPRI, etc.) appears in non-product content, the audit scanner **MUST flag it**.
2. **Product Catalog (Exempt for OEM Fitment)**:
   - Product listings (SKUs, titles, descriptions, specifications) are **exempt** from this restriction because they describe replacement compatibility and OEM fitment for laser cutting machinery.
   - However, unauthorized competitor branding (e.g. "Nova") in products is flagged.

---

## 6. Strict Coding Conventions & Rules for AI Agents

### 6.1 AI Tool Autofill & Context Awareness
- **Always read before editing**: AI agents must call `view_file` on target files prior to making surgical changes.
- **Reference existing data files**: When creating or modifying products, categories, or settings, pull types from `src/types.ts` and initial structures from `src/data/`.
- **No Mock or Phantom Modules**: Do not create unrequested background servers, separate databases, or phantom APIs.

### 6.2 URL Routing & Navigation Contract
Every navigation change in the UI MUST synchronize with the browser URL using `updateBrowserUrl` from `src/utils/navigation.ts`:
- **Home**: `/?view=home` (with optional anchors `#contact`, `#reviews`, `#categories`).
- **Store Catalog**: `/?view=store&cat={slug}&brand={brand}&power={power}&q={query}&stock={1}&sort={sort}`.
- **Product Details**: `/?view=product-detail&product={SKU_OR_ID}`.
- **Reviews & Contact**: `/?view=reviews` and `/?view=contact`.
- **Admin Console**: `/?admin=true&tab={dashboard|products|categories|filters|inquiries|settings|security}`.
- **Browser History**: The app must handle `popstate` events to support browser back/forward buttons seamlessly.

### 6.3 Pricing Visibility Policy (`showPricing`)
- The admin setting `settings.showPricing` is the single source of truth for pricing visibility throughout the app.
- When `showPricing` is `false`:
  - Product cards must display `"Quote on Request"` or `"Inquire"` instead of numeric prices.
  - In `ShareCatalogModal.tsx`, the PDF table **MUST NOT** include the Price column or price amounts.
  - In WhatsApp messages and clipboard copy texts, price lines **MUST NOT** be included.
  - The `"Show Prices"` toggle in sharing dialogs **MUST NOT** be shown when `showPricing` is `false`.

### 6.4 Theme & Typography Synchronization
- Dialogs and modals (including `ShareCatalogModal.tsx`, `InquiryModal.tsx`, and `CartDrawer.tsx`) must inherit and respect the website's primary theme color (`var(--primary)`).
- Ensure high contrast in both light (`bg-white`/`bg-slate-50`) and dark (`bg-zinc-900`/`bg-zinc-950`) modes.

### 6.5 WhatsApp Integration
- Always sanitize telephone numbers before generating `https://wa.me/{number}` URLs by stripping non-numeric characters: `(settings.whatsappNumber || '').replace(/[^0-9]/g, '')`.
- Format messages with clean markdown (`*Bold*`, bullet points, and separator lines).

---

## 7. Verification & Quality Assurance
After making any codebase modifications, always run:
1. `lint_applet` (`npm run lint`) to verify TypeScript type-safety without compilation errors.
2. `compile_applet` (`npm run build`) to ensure the Vite production bundle and backend server bundle build successfully.
