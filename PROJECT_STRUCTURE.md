# Project Architecture & Structure Overview: NK Laser Spares & Optics

## 1. Project Introduction
**NK Laser Spares & Optics** is an industrial-grade B2B e-commerce catalog, quotation platform, and RFQ inquiry management system dedicated to high-precision fiber laser cutting spares, protective optical windows, tellurium copper nozzles, ceramic sensor bodies, laser cutting heads, wireless CNC pendants, and consumables.

The application pairs a high-conversion client-facing product catalog with a password-protected administrative back-office management console for real-time inventory adjustments, categories/subcategories customization, pricing visibility toggles, WhatsApp RFQ routing, customer PII encryption, and automated brand compliance scanning.

---

## 2. Tech Stack & Key Libraries
- **Framework**: React 18+ with TypeScript (Strict Mode)
- **Bundler & Tooling**: Vite with full TypeScript type-checking
- **Styling**: Tailwind CSS with industrial dark/light color palette and dynamic CSS custom properties
- **Icons**: `lucide-react` exclusively
- **PDF Generation**: `jspdf` & `jspdf-autotable` (client-side native letterhead PDF quotations)
- **State Management & Persistence**: Server-side persistence via Express backend (`server.ts` and `app-config.json`) with client-side cache and fallback seed data in `/src/data/`
- **Backend / Production Server**: Express.js server (`server.ts`) operating on port 3000, bundled with `esbuild` to `dist/server.cjs`
- **Security Suite**: `bcryptjs` (Cost 12), `cookie-parser`, Node crypto AES-256-GCM authenticated encryption

---

## 3. Directory Layout & File Map

```
.
├── public/                               # Static public assets (favicons, site manifest, _redirects)
├── index.html                            # Single page HTML entry point
├── metadata.json                         # Application metadata, capabilities & permissions
├── package.json                          # Project dependencies, build scripts & metadata
├── tsconfig.json                         # TypeScript strict compiler configuration
├── vite.config.ts                        # Vite bundler & Tailwind plugin config
├── server.ts                             # Authoritative Node.js / Express backend server (Port 3000)
├── app-config.json                       # Persistent database store on disk (products, categories, settings, PII)
├── d1-schema.sql                         # Cloudflare D1 relational database schema (8 dedicated tables & indexes)
├── d1-seed.sql                           # Production SQL seed script with atomic bounded statements
├── scripts/
│   └── generate-d1-seed.cjs              # Automated D1 relational seed generator (prevents SQLITE_TOOBIG)
├── functions/                            # Cloudflare Pages Edge Functions (/api/* & bot pre-rendering)
│   ├── api/[[route]].ts                  # D1 relational queries, authentication, RFQ routing & CORS
│   └── [[path]].ts                       # Dynamic OpenGraph & bot meta pre-rendering
├── AGENTS.md                             # AI Agent guidelines, architecture & rules (Auto-injected)
├── CLOUDFLARE.md                         # Complete Cloudflare Pages & D1 deployment instructions
├── DATA_MANAGEMENT.md                    # Data persistence, modular import/export & server sync guide
├── PROJECT_STRUCTURE.md                  # Detailed architectural blueprint & component tree
├── README.md                             # Comprehensive project overview & documentation
└── src/
    ├── App.tsx                           # Master layout orchestrator, state manager & client router
    ├── main.tsx                          # React 18 DOM entry point
    ├── index.css                         # Global Tailwind CSS and CSS Variable design system
    ├── types.ts                          # Global TypeScript interfaces, types & data contracts
    ├── lib/
    │   ├── api.ts                        # Secure typed API client with HttpOnly cookie & bearer fallback
    │   └── storage.ts                    # Client-side cache, local persistence & brand audit engine
    ├── utils/
    │   ├── navigation.ts                 # URL query parsing, buildAppUrl & updateBrowserUrl helpers
    │   ├── themeColors.ts                # Dynamic primary/accent generator & WCAG contrast engine
    │   ├── whatsapp.ts                   # WhatsApp URL builder & message markdown formatters
    │   ├── instagram.ts                  # Social sharing helpers
    │   └── storage.ts                    # Storage bridge helper
    ├── data/
    │   ├── index.ts                      # Data exports barrel
    │   ├── materialsData.ts              # Material specs & cutting capability data
    │   └── siteImages.ts                 # Curated high-res asset references & CDNs
    └── components/
        ├── common/                       # Reusable UI primitives & brand marks
        │   ├── NKLogo.tsx                # High-contrast industrial SVG logo & brand badge
        │   ├── SectionHeading.tsx        # Standardized section titles with accent bars
        │   ├── ThemeToggle.tsx           # Dark / Light theme toggle button
        │   ├── WhatsAppIcon.tsx          # Official WhatsApp SVG brand icon
        │   ├── SEOHead.tsx               # React Helmet dynamic page titles, meta tags & Schema.org JSON-LD
        │   └── ImageUploadField.tsx      # Reusable image uploader with preview & URL fallback
        ├── client/                       # Public storefront & B2B customer UI
        │   ├── Navbar.tsx                # Sticky header: SKU search, category mega-menu, cart trigger
        │   ├── Hero.tsx                  # Industrial hero banner with quick CTA triggers
        │   ├── SparesShopBanner.tsx      # Direct catalog entrance & express dispatch notice
        │   ├── CategoryHub.tsx           # Interactive bento-grid category showcase
        │   ├── FeaturedDiscovery.tsx     # Highlighting top-selling optical spares & heads
        │   ├── StoreCatalogView.tsx      # Faceted product catalog with live filters & search
        │   ├── ShareCatalogModal.tsx     # PDF quote generator, WhatsApp proposal & link copier
        │   ├── ProductDetailView.tsx     # Technical specs sheet, related spares & RFQ actions
        │   ├── ProductGallery.tsx        # High-res zoomable gallery
        │   ├── CartDrawer.tsx            # Multi-item RFQ builder & WhatsApp checkout
        │   ├── InquiryModal.tsx          # Single-item quote modal with OEM fitment
        │   ├── QuoteCalculator.tsx       # Interactive fiber laser spare parts & job cost estimator
        │   ├── MaterialSpecs.tsx         # Material cutting tolerance & capability charts
        │   ├── BrandsSection.tsx         # OEM brand compatibility showcase
        │   ├── ServiceShowcase.tsx       # Engineering, refurbishment & custom fabrication services
        │   ├── ReviewsSection.tsx        # Verified buyer reviews & rating submission
        │   ├── ContactSection.tsx        # Direct message form, workshop coordinates & map
        │   └── Footer.tsx                # Company details, quick category links & admin entrance
        └── admin/                        # Password-protected back-office admin console
            ├── AdminPanel.tsx            # Master admin modal, tab routing & PIN security
            ├── AdminHeader.tsx           # Admin top bar: live publish status, search & theme
            ├── AdminSidebar.tsx          # Sidebar navigation with item counter badges
            ├── CategoryAutocomplete.tsx  # Fuzzy subcategory input helper
            ├── modals/                   # Admin creation and editing dialogs
            │   ├── ProductEditModal.tsx  # Full product SKU, specs, pricing, compatibility editor
            │   ├── CategoryEditModal.tsx # Category and subcategory taxonomy editor
            │   └── BrandEditModal.tsx    # OEM brand and cutting head model editor
            └── views/                    # Tab views for admin console
                ├── AdminDashboardView.tsx # Metrics overview, quick actions & system health
                ├── AdminProductsView.tsx  # Product inventory CRUD, batch actions & stock toggle
                ├── AdminCategoriesView.tsx# Category taxonomy & subcategory manager
                ├── AdminFiltersView.tsx   # Brand mappings, power ranges & filter facets
                ├── AdminInquiriesView.tsx # Inbound customer RFQ leads, status & notes
                ├── AdminSettingsView.tsx  # Business profile, contact, theme colors & showPricing
                └── AdminSecurityView.tsx  # Admin PIN change, session manager & brand compliance scan
```

---

## 4. Key Functional Modules

### 4.1 Client Storefront
- **Store Catalog (`StoreCatalogView.tsx`)**:
  - Live search across product names, SKUs, OEM brands, and specifications.
  - Multi-attribute filtering (Category, Subcategory, OEM Brand, Laser Power Rating, In-Stock).
  - Sorting by popularity, price (low-high / high-low), and alphabetical order.
  - Deep-link synchronization via URL search query parameters.
- **Product Details (`ProductDetailView.tsx`)**:
  - Technical specification tables (dimensions, power rating, material, OEM fitment).
  - Direct WhatsApp order trigger and Quick RFQ modal launcher.
  - Related spare parts recommendation engine.
- **Quick RFQ Modal (`InquiryModal.tsx`)**:
  - Compact quick quote modal with auto-filled product metadata.
  - Encrypts customer phone/email at rest via backend API.
- **Share Custom Catalog Results (`ShareCatalogModal.tsx`)**:
  - Generates branded PDF quotation with letterhead, active filter criteria, product list, and SKU table.
  - Formats quotation proposal to dispatch via WhatsApp or clipboard.
  - Respects master `showPricing` setting (omits price columns and totals when disabled).
- **RFQ Cart Drawer (`CartDrawer.tsx`)**:
  - Persistent slide-over cart with MOQ verification.
  - Formats multi-item orders into an itemized WhatsApp RFQ message.

### 4.2 Admin Management Console (`AdminPanel.tsx`)
- **Backend-Enforced Authentication**: Protected by `requireAdminAuth` middleware using Bcrypt (Cost 12) and `HttpOnly` sessions with in-memory fallback.
- **Products Manager**: Full CRUD for inventory, SKU codes, OEM brands, subcategories, stock levels, and MOQ.
- **Categories & Subcategories**: Add/Edit categories and assign searchable subcategory tags.
- **OEM Brands**: Manage laser head manufacturer partnerships (RayTools, OSPRI, WSX, Precitec, Bodor, etc.).
- **Inbound Inquiries**: Real-time log of customer RFQ submissions with status workflows and CSV export. Confidential phone and email fields are decrypted only for authorized sessions.
- **Store Settings**: Control business name, WhatsApp helpline, pan-India delivery badges, primary theme accent color, and master `showPricing` toggle.
- **Security & Brand Compliance (`AdminSecurityView.tsx`)**:
  - Update admin master password with Bcrypt hashing (12 rounds).
  - Run Non-Product Brand Compliance Integrity Scan.
  - Monitor PII encryption status (AES-256-GCM).

---

## 5. Backend REST API Endpoints (`server.ts`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status, inventory counts & server timestamp |
| `GET` | `/api/settings` | Public | Public business information & theme configuration |
| `GET` | `/api/products` | Public | Catalog products list & filtering |
| `GET` | `/api/categories` | Public | Product category taxonomy |
| `GET` | `/api/brands` | Public | OEM compatibility brands list |
| `GET` | `/api/power-ranges` | Public | Available laser power rating ranges |
| `GET` | `/api/reviews` | Public | Verified customer reviews |
| `POST` | `/api/inquiries` | Public | Inbound customer RFQ submission (PII encrypted at rest) |
| `POST` | `/api/auth/login` | Public | Master admin login (Rate limited: 5 attempts/15 min) |
| `POST` | `/api/auth/verify` | Authenticated | Validate active session token |
| `POST` | `/api/auth/logout` | Authenticated | Terminate session and clear session cookie |
| `POST` | `/api/auth/change-password` | Authenticated | Update master password hash (Bcrypt Cost 12) |
| `GET` | `/api/admin/products` | Authenticated | Admin products inventory list |
| `POST` | `/api/admin/products` | Authenticated | Create new product SKU (input sanitized) |
| `PUT` | `/api/admin/products/:id` | Authenticated | Update product details (input sanitized) |
| `DELETE` | `/api/admin/products/:id` | Authenticated | Delete product SKU |
| `POST` | `/api/admin/categories` | Authenticated | Create category (input sanitized) |
| `PUT` | `/api/admin/categories/:id` | Authenticated | Update category (input sanitized) |
| `DELETE` | `/api/admin/categories/:id` | Authenticated | Delete category |
| `PUT` | `/api/admin/brands` | Authenticated | Update OEM brand list & logo URLs |
| `PUT` | `/api/admin/settings` | Authenticated | Update company profile, theme colors & `showPricing` |
| `GET` | `/api/admin/inquiries` | Authenticated | Fetch RFQs with decrypted customer PII |
| `PATCH` | `/api/admin/inquiries/:id/status` | Authenticated | Update RFQ workflow status |
| `DELETE` | `/api/admin/inquiries/:id` | Authenticated | Remove RFQ record |
| `POST` | `/api/admin/publish` | Authenticated | Broadcast complete catalog update |

---

## 6. Build & Verification Commands
- **Lint Codebase**: `npm run lint` (runs `tsc --noEmit`)
- **Compile & Build**: `npm run build` (builds client with Vite and bundles server to `dist/server.cjs`)
- **Start Production Server**: `npm start`
