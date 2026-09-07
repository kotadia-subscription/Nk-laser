# Data Management, Modular Import/Export & Server Synchronization Manual

This guide documents the data persistence architecture, modular entity import/export capabilities, CSV/JSON specifications, and client-server synchronization protocols for **NK Laser**.

---

## 1. Architecture & Persistence Overview

NK Laser employs a **dual-layer, synchronized data architecture** designed for high reliability, offline resilience, and fast client-side performance:

```
┌──────────────────────────────────────────────────────────────────┐
│                   CLIENT (Browser / React 18)                    │
│                                                                  │
│  Admin UI (Products, Categories, Reviews, Settings)              │
│       │                                                          │
│       ├───> src/lib/storage.ts (Transforms, CSV Parser/Generator)│
│       ├───> localStorage (Instant local cache & offline state)   │
│       └───> src/lib/api.ts (Typed HTTP Client with Auth)         │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                 HTTPS (Cookies + Bearer Token)
                                │
┌───────────────────────────────▼──────────────────────────────────┐
│              AUTHORITATIVE SERVER (Node.js / Express)            │
│                                                                  │
│  server.ts (Port 3000)                                           │
│       ├───> requireAdminAuth (Bcrypt session security)          │
│       ├───> /api/admin/export/:entity                            │
│       ├───> /api/admin/import/:entity (Merge / Replace)          │
│       ├───> AES-256-GCM Encryption for Customer PII              │
│       └───> app-config.json (Authoritative JSON Database on disk)│
└──────────────────────────────────────────────────────────────────┘
```

### 1.1 Single Source of Truth
- **Authoritative Database**: The server file `app-config.json` stores master data across all collections:
  - `products`: Optical lenses, nozzles, ceramic rings, cutting heads, accessories.
  - `categories`: Main taxonomies, subcategories, and compatible brand filters.
  - `reviews`: Customer ratings, verified feedback, company names, and locations.
  - `settings`: Business name, WhatsApp numbers, multi-address list, theme, and `showPricing` policy.
  - `inquiries`: Inbound customer RFQs (with PII encrypted using AES-256-GCM).
- **Client Cache**: `src/lib/storage.ts` mirrors the data in `localStorage` for instant zero-latency UI rendering and seamless recovery if the connection drops.

### 1.2 How Server Synchronization Works
1. **Initial Boot**:
   - The React app loads initial data from `localStorage` or seed bundles in `src/data/` for immediate display.
   - An asynchronous request (`GET /api/config`) fetches the latest authoritative configuration from `server.ts` and updates the client cache.
2. **Admin Updates**:
   - When an administrator modifies an item or imports data, the client sends a typed API call (`api.ts`).
   - The server validates permissions, writes changes to `app-config.json` on disk, and responds with the updated data.
   - The client updates its local state and notifies parent components, triggering an immediate UI re-render across the storefront.
3. **Manual Sync**:
   - In **Admin Settings > Data & Backup**, clicking **"Sync with Server"** fetches the latest disk state from the backend and updates the browser cache, resolving any drift between multiple open tabs.

---

## 2. Modular Import & Export Capabilities

In addition to full-system backups, administrators can import and export data **per category/entity**:

| Entity | Supported Formats | Import Modes | Where Accessible |
|---|---|---|---|
| **Products** | JSON (`.json`), CSV / Excel (`.csv`) | Merge, Replace | Admin Products, Admin Settings |
| **Categories** | JSON (`.json`) | Merge, Replace | Admin Categories, Admin Settings |
| **Reviews** | JSON (`.json`) | Merge, Replace | Admin Reviews, Admin Settings |
| **Settings** | JSON (`.json`) | Merge, Replace | Admin Settings |
| **Full Backup** | JSON (`.json`) | Replace / Restore | Admin Settings |

---

## 3. Merge vs. Replace Modes

When importing data, administrators choose between two operations:

### 3.1 Merge Mode (Recommended for Updates)
- **Non-destructive upsert**:
  - If an item with matching identifier (`id` or `sku` for products; `id` or `slug` for categories; `id` for reviews) exists in the database, it is **updated** with incoming data.
  - If the identifier does not exist, it is **added** as a new entry.
  - All existing items not present in the imported file remain **untouched**.
- **Best for**:
  - Updating prices, stock statuses, or descriptions on a subset of products.
  - Adding a batch of new products without overwriting existing inventory.
  - Adding new customer reviews from an external spreadsheet.

### 3.2 Replace Mode (Full Overwrite)
- **Complete replacement**:
  - The entire existing collection (e.g. all products or all categories) is replaced by the items in the uploaded file.
  - An automatic rollback snapshot is captured in browser memory prior to replacement.
- **Best for**:
  - Migrating an entire catalog from staging to production.
  - Resetting a collection to a known clean backup file.

---

## 4. Product CSV / Excel Specification

The CSV parser supports standard Comma-Separated Values exported from Microsoft Excel, Google Sheets, or ERP software.

### 4.1 Required & Recommended Column Headers

| Column Header | Type | Description | Example |
|---|---|---|---|
| `id` | String | Unique item identifier (optional; auto-generated if blank) | `opt-foc-d30-f100` |
| `title` | String | **Required**. Product display name | `Focusing Lens D30 F100 (Fused Silica)` |
| `sku` | String | Unique Stock Keeping Unit | `NKL-OPT-FL30100` |
| `category` | String | Category slug matching taxonomy | `optics-protective-windows` |
| `subCategory` | String | Specific subcategory | `Focusing Lenses` |
| `brand` | String | Compatible OEM brand | `RayTools` |
| `powerRating` | String | Laser power compatibility | `1kW - 6kW` |
| `price` | Number | Unit price in INR (omit currency symbol) | `4850` |
| `stockStatus` | String | `In Stock`, `Low Stock`, or `Out of Stock` | `In Stock` |
| `inStock` | Boolean | `true` or `false` | `true` |
| `leadTime` | String | Fulfillment time | `Same Day Dispatch` |
| `moq` | Number | Minimum Order Quantity | `1` |
| `material` | String | Substrate material | `Fused Silica (Corning)` |
| `description` | String | Detailed product overview | `High-damage threshold dual-side AR coated optic.` |
| `features` | String | Semicolon (`;`) or comma-separated list of bullet points | `Dual AR coated; 99.8% transmission; 1064nm` |
| `imageUrl` | String | Primary product image URL | `https://images.unsplash.com/...` |

### 4.2 CSV Example Format
```csv
title,sku,category,subCategory,brand,powerRating,price,stockStatus,inStock,leadTime,description,features
"Focusing Lens D30 F100","NKL-OPT-FL30100","optics-protective-windows","Focusing Lenses","RayTools","1kW - 6kW",4850,"In Stock",true,"Same Day Dispatch","Dual AR coated for 1064nm fiber laser cutting heads.","Fused Silica substrate;99.8% transmission;High damage threshold"
"Tellurium Copper Nozzle Single 1.5mm","NKL-NOZ-S15","copper-nozzles-accessories","Single Chrome Plated","Precitec","Up to 30kW",450,"In Stock",true,"Express Dispatch","High thermal conductivity Tellurium copper nozzle.","Tellurium copper;Anti-spatter chrome;Precision CNC orifice"
```

### 4.3 Tips for CSV Imports
1. **Commas inside text**: Wrap text containing commas in double quotation marks (`"..."`).
2. **Lists in features**: Separate multiple bullet points with a semicolon (`;`).
3. **Prices**: Do not include currency symbols (`₹`, `$`) or commas inside numbers (`4850`, not `4,850`).
4. **Encoding**: Save your file as **CSV UTF-8** in Excel to preserve special characters and degree/diameter symbols (e.g. `Ø`, `±`).

---

## 5. API Reference: Backend Endpoints

All admin data endpoints require an authenticated admin session via HttpOnly cookies or `Authorization: Bearer <token>` headers.

### 5.1 Export Entity
- **Endpoint**: `GET /api/admin/export/:entity`
- **Supported entities**: `products`, `categories`, `reviews`, `settings`
- **Response**:
  ```json
  {
    "success": true,
    "entity": "products",
    "count": 48,
    "data": [ ... ],
    "exportedAt": "2026-09-07T10:00:00.000Z"
  }
  ```

### 5.2 Import Entity
- **Endpoint**: `POST /api/admin/import/:entity`
- **Supported entities**: `products`, `categories`, `reviews`, `settings`
- **Request Body**:
  ```json
  {
    "data": [ ... ],
    "mode": "merge" // or "replace"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "entity": "products",
    "mode": "merge",
    "importedCount": 12,
    "totalCount": 60,
    "data": [ ... ]
  }
  ```

### 5.3 Global Configuration & Publish
- `GET /api/config`: Returns public catalog and settings.
- `POST /api/config`: Updates authoritative configuration (Admin only).
- `POST /api/publish`: Writes and persists changes to disk and notifies all client instances.

---

## 6. How to Use the Import/Export Features in the UI

### 6.1 Managing Products
1. Open the **Admin Panel** (`/?admin=true&tab=products`).
2. To **Export**:
   - Click the **"Export"** dropdown button in the header.
   - Select **"Export JSON (.json)"** for full technical fidelity or **"Export Excel/CSV (.csv)"** for spreadsheet editing.
3. To **Import**:
   - Click the **"Import"** button.
   - Choose your file (`.json` or `.csv`) or paste raw content directly into the text box.
   - Select **Merge** (to update/add items) or **Replace** (to overwrite catalog).
   - Click **"Confirm & Import"**. The UI and server will synchronize immediately.

### 6.2 Managing Categories
1. Open the **Admin Panel** (`/?admin=true&tab=categories`).
2. Click the **Download (Export)** icon next to the category count to export `categories.json`.
3. Click the **Upload (Import)** icon to upload updated taxonomies or subcategories.

### 6.3 Managing Reviews
1. Open the **Admin Panel** (`/?admin=true&tab=reviews`).
2. Click **"Export"** to download all testimonials as JSON.
3. Click **"Import"** to import verified customer ratings in bulk.

### 6.4 Centralized Data & Backup Hub (Settings View)
1. Open the **Admin Panel** (`/?admin=true&tab=settings`).
2. Scroll to the **Data & Backup** card:
   - **Sync with Server**: Click to instantly poll and sync with `app-config.json` on disk.
   - **Category & Collection Data Management**: Individual cards for Products, Categories, Reviews, and Settings with 1-click Export and Import modals.
   - **Full Backup**: Download complete multi-collection JSON backup or restore in full.
   - **Recent Local Auto-Snapshots**: 1-click rollback to any recent configuration state.

---

## 7. Security & Safeguards

1. **Authentication Enforcement**: Import and export operations are strictly blocked without an authenticated session (`requireAdminAuth`).
2. **PII Shielding**: Customer phone numbers and email addresses are never exported via public endpoints; inquiries are stored encrypted at rest using AES-256-GCM.
3. **Input Sanitization**: Imported strings are scrubbed of `<script>` tags and dangerous HTML attributes via `sanitizeString` to prevent stored XSS attacks.
4. **Local Rollback History**: Prior to executing any Replace operation, the client creates a local snapshot (`ConfigSnapshot`) in browser storage, allowing one-click rollback if unintended edits occur.
