# Admin Panel Views (`/src/components/admin/views`)

This directory contains the primary tab views rendering specific management modules inside the unified administrative back-office container (`AdminPanel.tsx`).

---

## Views Breakdown

### 1. `AdminDashboardView.tsx`
- **Purpose**: System dashboard aggregating real-time metrics, product stock readiness, and fast action triggers.
- **Key Features**:
  - Live metric counters: Total Products, In-Stock SKUs, and Pending Customer Inquiries.
  - Quick action buttons to add new products or create new categories.
  - Direct navigation dispatchers to jump into specific manager tabs.

### 2. `AdminProductsView.tsx`
- **Purpose**: Comprehensive inventory manager for all laser cutting spares, nozzles, and optical lenses.
- **Key Features**:
  - Searchable by SKU, title, OEM brand, and category.
  - Quick toggles for In-Stock status and popular/featured pins.
  - Full CRUD operations with Edit, Duplicate, and Delete capabilities.
  - CSV inventory export for external accounting.

### 3. `AdminCategoriesView.tsx`
- **Purpose**: Master category taxonomy editor with real-time subcategory chips and OEM brand bindings.
- **Key Features**:
  - Left pane category selector with icon representation.
  - Right pane subcategory manager allowing inline additions and removals.
  - Compatible OEM brands manager for each category.
  - Direct button to add a new spare part under the active category.

### 4. `AdminFiltersView.tsx`
- **Purpose**: Attribute and filter option configuration.
- **Key Features**:
  - **Laser Power Rating Manager**: Manage wattage ranges (1kW, 3kW, 6kW, 12kW, 20kW+).
  - **Registered OEM Brands Manager**: Manage OEM brands (RayTools, OSPRI, WSX, Precitec, BOCHU, Bodor, IPG, MaxPhotonics).

### 5. `AdminInquiriesView.tsx`
- **Purpose**: Inbound customer quotation requests and RFQ inbox.
- **Key Features**:
  - Filter inquiries by status (`New`, `In Progress`, `Quoted`, `Completed`).
  - Search customer by name, phone number, or requested part.
  - Securely displays customer phone numbers and emails decrypted on demand via authenticated backend API.
  - Direct 1-click WhatsApp reply launcher auto-formatting customer name and requested product.

### 6. `AdminSettingsView.tsx`
- **Purpose**: Store configuration, contact information, and dynamic theme customization.
- **Key Features**:
  - Business name, phone, WhatsApp dispatch number, address, and email settings.
  - **Dynamic Theme Engine**: Real-time color picker and curated preset palette buttons to set site-wide primary brand color.
  - Automatic WCAG contrast calculation ensuring all buttons and text maintain optimal readability.
  - Master `showPricing` toggle for commercial quotes.

### 7. `AdminSecurityView.tsx`
- **Purpose**: Administrative password management, customer PII encryption status, and Non-Product Brand Compliance Audits.
- **Key Features**:
  - Change master administrative password using `bcryptjs` with cost factor 12.
  - **Non-Product Brand Compliance Audit**: Automated scanner that checks non-product website content (Site Settings, Hero, Banner, Services, Categories, Reviews, Addresses) to verify that only "NKL" or "NK Laser" is referenced, flagging any unauthorized third-party mentions.
  - Verification of AES-256-GCM authenticated encryption for customer PII.
