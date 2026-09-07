# Admin Panel Architecture & Specifications (`/src/components/admin`)

The Admin Panel provides a comprehensive, password-protected back-office management console for **NK Laser Spares & Optics**. It allows site owners to manage products, categories, subcategories, OEM brands, customer inquiries, and site configuration directly from the browser.

---

## 1. Authentication & Security
- **Entry Points**: 
  - Shield icon in the top header (`Navbar.tsx`).
  - "Admin Portal" link in the footer (`Footer.tsx`).
  - URL parameter: `/?admin=true`
- **Backend Authentication**: Enforced via `requireAdminAuth` on all admin endpoints (`/api/admin/*`).
- **Password Security**: Authenticated against a salted `bcryptjs` hash with cost factor 12 (`BCRYPT_ROUNDS = 12`).
- **Session Architecture**:
  - `HttpOnly` cookie (`admin_session`) with `SameSite=None; Secure` in HTTPS environments.
  - In-memory fallback token in `src/lib/api.ts` for iframe preview environments.
- **Brute-Force Protection**: IP lockout for 15 minutes after 5 failed login attempts.
- **Customer PII Shielding**: Customer phone and email are encrypted at rest using AES-256-GCM and decrypted on demand only for authenticated administrators.

---

## 2. Core Architecture & Files

```
src/components/admin/
├── AdminPanel.tsx            # Master container & authentication state guard
├── AdminHeader.tsx           # Admin topbar with theme toggle, preview button & logout
├── AdminSidebar.tsx          # Navigation sidebar with badges & tab switching
├── CategoryAutocomplete.tsx  # Dynamic subcategory input with fuzzy suggestion list
├── modals/                   # Edit dialogues for entities
│   ├── ProductEditModal.tsx  # Create / Edit product SKU details & specs table
│   ├── CategoryEditModal.tsx # Manage category names, slugs, icons & subcategories
│   └── BrandEditModal.tsx    # Manage OEM laser brands (RayTools, WSX, etc.)
└── views/                    # Individual tab views
    ├── AdminDashboardView.tsx   # Overview metrics, quick stats & system health
    ├── AdminProductsView.tsx    # Product table with search, filters, CRUD & CSV export
    ├── AdminCategoriesView.tsx  # Category tree manager with subcategory pill tags
    ├── AdminFiltersView.tsx     # Brand & Laser Power Range attribute manager
    ├── AdminInquiriesView.tsx   # RFQ inquiry inbox with decrypted customer PII
    ├── AdminSettingsView.tsx    # WhatsApp number, contact details & pricing display toggles
    └── AdminSecurityView.tsx    # Change admin password (Bcrypt 12) & Non-Product Brand Audit
```

---

## 3. Detailed Tab View Breakdown

### 3.1 Dashboard (`AdminDashboardView.tsx`)
- **Key Metrics**:
  - Total SKU count in catalog.
  - Total active Categories & Subcategories.
  - Active OEM Brands supported.
  - Total Inbound Customer Inquiries.
- **Quick Actions**: Add New Product, View Pending Inquiries, Update WhatsApp Phone Number.

### 3.2 Product Inventory (`AdminProductsView.tsx`)
- **Features**:
  - Full tabular view of all SKUs with thumbnail images, brand, category, price, and stock status.
  - Search by title or SKU.
  - Filter by Category and Brand.
  - Action buttons: Add New Product, Edit, Duplicate, and Delete.
  - "Popular" and "Featured" toggle switches.

### 3.3 Category Management (`AdminCategoriesView.tsx`)
- **Features**:
  - Visual cards for all spare part categories.
  - Subcategory chip editor (add/remove subcategories on the fly).
  - Slug generator and icon selector.
  - Direct filtering of products belonging to a specific category.

### 3.4 Attributes & OEM Brands (`AdminFiltersView.tsx`)
- **Features**:
  - **OEM Brands Manager**: Add/edit supported laser head brands (e.g., RayTools, OSPRI, WSX, Precitec, BOCHU).
  - **Power Ranges Manager**: Add/edit power ratings (e.g., 1kW, 3kW, 6kW, 12kW, 20kW+).

### 3.5 Inquiries Inbox (`AdminInquiriesView.tsx`)
- **Features**:
  - Logs customer inquiries submitted through the website.
  - Displays decrypted customer name, phone number, email, requested product SKU, and message.
  - Status updates: `New` ➔ `In Progress` ➔ `Quoted` ➔ `Completed`.
  - Direct 1-click WhatsApp reply button opening chat with customer.

### 3.6 Store Settings (`AdminSettingsView.tsx`)
- **Features**:
  - Business Name, Contact Phone, Dispatch Email, and Physical Workshop Address.
  - **WhatsApp Order Dispatch Number**: Primary routing number for all cart and inquiry messages.
  - **Store Preferences**:
    - Master `showPricing` toggle (controls price visibility across catalog, PDFs, and WhatsApp quotes).

### 3.7 Security & Compliance (`AdminSecurityView.tsx`)
- **Features**:
  - Update Master Admin Password with Bcrypt (Cost 12) hashing.
  - **Non-Product Brand Compliance Audit**: Scans site content outside products (Settings, Hero, Banner, Services, Categories, Reviews, Addresses) and flags any brand other than "NKL" / "NK Laser".
  - Displays Customer PII AES-256-GCM encryption status.
  - Session activity and logout.

---

## 4. Theme & Layout Support
The Admin Panel features a high-contrast **Light Mode by default** with clean borders, clear typography, and an instant toggle to **Dark Mode** via the top bar in `AdminHeader.tsx`.
