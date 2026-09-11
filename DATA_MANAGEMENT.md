# NK Laser — Data Management, Cloudflare D1 Architecture, Server Sync & Debugging Manual

This authoritative manual provides complete documentation on how data is stored, synchronized, protected, migrated, and debugged across **NK Laser Spares & Optics**, covering both local development (Node.js/Express) and production edge deployment (Cloudflare Pages / Workers + Cloudflare D1).

---

## Table of Contents
1. [Why Is My Site Working Without a Database? (Where Does Data Come From?)](#1-why-is-my-site-working-without-a-database-where-does-data-come-from)
2. [Phase 1: One-Time Setup (Creating & Connecting Cloudflare D1 to Your Site)](#2-phase-1-one-time-setup-creating--connecting-cloudflare-d1-to-your-site)
3. [Phase 2: Subsequent Setup, Safe Deployments & Ongoing Maintenance](#3-phase-2-subsequent-setup-safe-deployments--ongoing-maintenance)
4. [The "Sync with Server" Button: Exact Mechanics & Storage](#4-the-sync-with-server-button-exact-mechanics--storage)
5. [Protecting Data During Code Deployments (Zero Data Loss)](#5-protecting-data-during-code-deployments-zero-data-loss)
6. [Comprehensive Debugging Guide: How to Diagnose & Fix Issues](#6-comprehensive-debugging-guide-how-to-diagnose--fix-issues)
7. [Modular Entity Import & Export (JSON & CSV/Excel)](#7-modular-entity-import--export-json--csvexcel)
8. [Customer PII Encryption at Rest (AES-256-GCM)](#8-customer-pii-encryption-at-rest-aes-256-gcm)

---

## 1. Why Is My Site Working Without a Database? (Where Does Data Come From?)

If you have not yet created a Cloudflare D1 SQLite database, you may notice that your website already renders full spare parts, categories, prices, images, and company contact details. 

**Here is exactly where that data comes from and why the site works without a database:**

### 1.1 The 3-Tier Resilient Fallback Engine
The application was engineered with an **offline-first, fault-tolerant architecture** so visitors never see a blank screen or a broken 500 error page:

1. **Tier 1: Bundled Seed Data (`src/data/` & `server/seedData.ts`)**:
   - When Vite builds the application, an initial catalog of spare parts (ceramics, lenses, nozzles, cutting heads), taxonomies, OEM brands, and company settings is compiled directly into the client JavaScript bundle.
2. **Tier 2: Browser Local Storage (`localStorage`)**:
   - On the very first visit, the frontend transfers the bundled seed data into the visitor's browser `localStorage` under keys `nk_laser_products`, `nk_laser_categories`, and `nk_laser_settings`. Subsequent views load from `localStorage` in less than 1 millisecond.
3. **Tier 3: Graceful Edge Function Fallback (`functions/api/[[route]].ts`)**:
   - The Cloudflare Pages edge function includes built-in safety guards: if `env.DB` (the D1 database binding) is not yet connected, the edge function **does not crash**. It serves fallback seed data from memory and allows the site to function smoothly.

### 1.2 The Critical Catch: Why You Still Need Cloudflare D1
While the site appears to work without D1, **changes you make are not yet universal or permanent**:
- **Without D1**: Any changes you make in the Admin Console (adding a new product, editing prices, updating phone numbers or warehouse addresses) are **only saved in YOUR current browser's local storage**.
- **The Problem**: A customer visiting from another computer, smartphone, or incognito browser window will **NOT** see your changes—they will only see the original static seed data. Furthermore, customer RFQ inquiries cannot be stored centrally.
- **With D1 Connected**: When you click **"Publish Changes"** in the Admin Console, your entire updated catalog is written to Cloudflare's distributed D1 SQLite database in the cloud. **All customers worldwide immediately see your live updates across every device.**

---

## 2. Phase 1: One-Time Setup (Creating & Connecting Cloudflare D1 to Your Site)

Follow these steps once to provision and connect your persistent Cloudflare D1 database.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             ONE-TIME SETUP PIPELINE                              │
│                                                                                  │
│  [1. Create D1 Database]  ──>  [2. Initialize Tables]  ──>  [3. Bind to Pages]   │
│  `wrangler d1 create`          `d1-schema.sql`              `Settings > Bindings` │
│                                                                      │           │
│  [6. Verify Connection]   <──  [5. Seed Database]      <──  [4. Add Secrets]     │
│  `SELECT * FROM config`        `Admin > Publish Changes`    `ADMIN_PASSWORD`     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Step 1: Create the Cloudflare D1 Database
Open your terminal in the project root and run:
```bash
npx wrangler d1 create nk-laser-db
```

Wrangler will output details similar to:
```
✅ Successfully created DB 'nk-laser-db'!
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
database_name = "nk-laser-db"
```

### Step 2: Initialize Database Schema & Tables
Execute the provided `d1-schema.sql` to create the required tables (`config`, `inquiries`, `reviews`, `sessions`) on your remote Cloudflare database:
```bash
npx wrangler d1 execute nk-laser-db --file=./d1-schema.sql --remote
```

*Note: You can verify the tables were created successfully:*
```bash
npx wrangler d1 execute nk-laser-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```
You should see: `config`, `inquiries`, `reviews`, `sessions`.

### Step 3: Bind the D1 Database to Your Cloudflare Pages Project
Connect your new database to your Cloudflare Pages application:
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > select your project (**`nk-laser`**).
3. Go to **Settings** > **Functions**.
4. Scroll down to **D1 database bindings** and click **Add binding**.
5. Fill in the fields:
   - **Variable name**: `DB` *(Must be uppercase `DB` exactly)*
   - **D1 database**: Select `nk-laser-db`
6. Click **Save**.

### Step 4: Configure Production Environment Secrets
In the Cloudflare Dashboard under **Workers & Pages** > **`nk-laser`** > **Settings** > **Environment variables**, click **Add variable** under **Production**:

| Variable Name | Type | Value / Description |
|---|---|---|
| `ADMIN_PASSWORD` | Secret / Encrypted | Your secure master password for logging into `/?admin=true`. |
| `SESSION_SECRET` | Secret / Encrypted | A long random string (e.g., 32+ characters) used to sign admin session tokens. |
| `DATA_ENCRYPTION_KEY` | Secret / Encrypted | A 32-character encryption key for AES-256-GCM encryption of customer RFQ contacts. |

*Alternative via CLI:*
```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name=nk-laser
npx wrangler pages secret put SESSION_SECRET --project-name=nk-laser
npx wrangler pages secret put DATA_ENCRYPTION_KEY --project-name=nk-laser
```

### Step 5: Seed the Master Database (1-Click from Admin)
Now that your database is bound and your secrets are saved:
1. Trigger a fresh deployment in Cloudflare Pages (or deploy via `npm run deploy:pages`) so the new `DB` binding takes effect.
2. Open your live website and log into the Admin Console at `/?admin=true`.
3. Go to **Settings** > **Data & Backup**.
4. Click **"Publish Changes"** (or **"Sync with Server"**).
5. The application will instantly upload your active catalog (products, categories, brands, settings, and addresses) into the D1 `config` table.

### Step 6: Verify Database Connection & Records
Run this command from your terminal to confirm your data is live in Cloudflare D1:
```bash
npx wrangler d1 execute nk-laser-db --command="SELECT key, updated_at, length(value) as bytes FROM config;" --remote
```
You should see rows for `master`, `products`, `settings`, or `categories` with active timestamps. **Your one-time setup is now complete!**

---

## 3. Phase 2: Subsequent Setup, Safe Deployments & Ongoing Maintenance

Once your database is created and connected, how do you handle future updates safely without losing data?

### 3.1 Normal Code Deployments (HTML, React, CSS, Features)
When you update UI components, add new filters, tweak styling, or fix bugs:
- **Action**: Run `git push` or `npx wrangler pages deploy dist/`.
- **Database Safety**: **100% Safe**. Deploying code to Cloudflare Pages deploys static assets and edge functions. **It never touches, resets, or modifies existing rows in your D1 database.**
- **Customer Impact**: Zero downtime. Customers immediately receive the new UI, while all product inventory and inquiries remain intact in D1.

### 3.2 Adding New Product Attributes (Zero SQL Migrations Needed!)
NK Laser uses a **Document Store** model for the catalog (`config` table):
- If you add a new attribute to products (e.g., `cadDrawingUrl`, `warrantyYears`, `laserType`, `weight`):
  1. Add the attribute to `src/types.ts` (`ProductItem` interface).
  2. Add the input field in `src/components/admin/modals/ProductEditModal.tsx`.
  3. Deploy your code!
  - **No SQL Migration Required**: The new fields serialize directly into the master JSON document in D1.

### 3.3 Adding New Relational Tables or Columns
If you introduce a brand-new feature requiring a dedicated SQL table (e.g., `shipment_tracking` or `vendor_suppliers`):
1. **Never use `DROP TABLE`**: Always use additive, non-destructive SQL.
2. Add the table definition to `d1-schema.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS shipment_tracking (
     id TEXT PRIMARY KEY,
     inquiry_id TEXT NOT NULL,
     tracking_number TEXT NOT NULL,
     courier_name TEXT NOT NULL,
     status TEXT DEFAULT 'dispatched',
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   CREATE INDEX IF NOT EXISTS idx_shipment_inquiry ON shipment_tracking(inquiry_id);
   ```
3. Apply the migration remotely without touching existing tables:
   ```bash
   npx wrangler d1 execute nk-laser-db --file=./d1-schema.sql --remote
   ```

---

## 4. The "Sync with Server" Button: Exact Mechanics & Storage

Located in **Admin Panel > Settings > Data & Backup**, the **"Sync with Server"** button provides manual, deterministic synchronization between your browser and the authoritative backend.

### 4.1 What Happens When You Click "Sync with Server"
Here is the exact step-by-step execution path:

```
[User clicks "Sync with Server"]
                 │
                 ▼
1. Storage Engine captures an automatic rollback snapshot of current localStorage.
                 │
                 ▼
2. Client API calls GET /api/config with authentication headers.
                 │
                 ▼
3. Cloudflare Edge Function queries D1 database (config table where key = 'master')
   and retrieves the authoritative cloud catalog.
                 │
                 ▼
4. Client validates payload integrity (verifies products, categories, and settings exist).
                 │
                 ▼
5. Client writes updated datasets to browser localStorage:
   - 'nk_laser_config'
   - 'nk_laser_products'
   - 'nk_laser_categories'
   - 'nk_laser_settings'
   - 'nk_laser_reviews'
                 │
                 ▼
6. Client updates React state across all views (App.tsx, AdminPanel.tsx, StoreCatalogView.tsx).
                 │
                 ▼
7. BroadcastChannel('nk_laser_realtime_sync') transmits an instant update event 
   to all other browser tabs open on the same device.
                 │
                 ▼
8. Toast notification confirms sync success with live item count and timestamp.
```

### 4.2 Where is the Data Stored?
- **Server Storage**: Cloudflare D1 SQLite database in the cloud (specifically the `config` table row with `key = 'master'`). In local development, it is stored in `app-config.json` at the project root.
- **Client Storage**: Browser `localStorage` on the user's device under keys prefixed with `nk_laser_*`.
- **Memory Storage**: Active React Component State in `src/App.tsx`, providing instant reactivity across the user interface.

### 4.3 When Should You Use It?
- When you have edited catalog items or settings in another browser tab, device, or directly in Cloudflare D1.
- If you notice a disparity between the storefront display and recent admin changes.
- After running a database restore or migration script from the CLI.

---

## 5. Protecting Data During Code Deployments (Zero Data Loss)

### 5.1 Why Your Data is Protected by Default
- **Independent Database Lifecycle**: Cloudflare D1 is a standalone cloud database hosted independently of your web assets. Running `git push` or `npx wrangler pages deploy` only deploys your compiled static files (`dist/`) and edge functions (`functions/`). **It does not touch or overwrite existing D1 database rows.**
- **Document Store Flexibility**: Because product catalogs are stored as structured JSON documents in D1, adding new code that expects new product attributes will never cause SQL parsing errors or table crashes.

### 5.2 The 4 Golden Rules of Safe Deployments
Before deploying code changes:
1. **Export a 1-Click Backup**: In **Admin Settings > Data & Backup**, click **"Export Backup"** under Full System Backup. Save the generated `.json` file to your computer.
2. **Never Run Destructive SQL in CI/CD**: Never include `DROP TABLE` or `DELETE FROM` statements in deployment scripts or GitHub Actions workflows.
3. **Use Idempotent Schema Statements**: In `d1-schema.sql`, always use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.
4. **Verify D1 Binding**: Ensure your Cloudflare Pages project has the `DB` binding linked to `nk-laser-db`. If the binding name is missing, edge functions cannot communicate with your database.

---

## 6. Comprehensive Debugging Guide: How to Diagnose & Fix Issues

If an issue arises on your live website or during local development, follow this troubleshooting workflow.

### 6.1 Real-Time Edge Logs (Cloudflare Wrangler Tail)
To see live server-side error messages, console logs, and SQL exceptions in real time as requests hit your site:

```bash
# Stream live logs from Cloudflare Pages Edge Functions
npx wrangler pages deployment tail --project-name=nk-laser
```

Leave this terminal window open while reproducing the issue in your browser. Any backend exception will print directly in your terminal with full stack traces.

---

### 6.2 Common Issues & Step-by-Step Solutions

#### Issue 1: "Admin Login Fails" or "Invalid Session Token" (401 Unauthorized)
- **Root Cause**: The Cloudflare Edge environment is missing the `ADMIN_PASSWORD` or `SESSION_SECRET` environment variables.
- **Solution**:
  1. Go to Cloudflare Dashboard > **Workers & Pages** > **`nk-laser`** > **Settings** > **Environment variables**.
  2. Ensure `ADMIN_PASSWORD` and `SESSION_SECRET` are defined under **Production**.
  3. Or run via Wrangler CLI:
     ```bash
     npx wrangler pages secret put ADMIN_PASSWORD --project-name=nk-laser
     npx wrangler pages secret put SESSION_SECRET --project-name=nk-laser
     ```
  4. Redeploy or restart the deployment for secrets to take effect.

---

#### Issue 2: "Error 8000022: Invalid database UUID ()"
- **Root Cause**: Cloudflare Pages encountered an empty `database_id = ""` in `wrangler.toml` during build.
- **Solution**:
  - In `wrangler.toml`, leave `[[d1_databases]]` commented out, and bind the database inside Cloudflare Dashboard:
    1. Go to **Settings** > **Functions** > **D1 database bindings**.
    2. Add binding with Variable name `DB` and select `nk-laser-db`.

---

#### Issue 3: "no such table: config" or "no such table: inquiries" (500 Internal Server Error)
- **Root Cause**: The D1 database was created, but the initial SQL schema was never executed on Cloudflare's remote server.
- **Solution**:
  Execute `d1-schema.sql` on the remote database:
  ```bash
  npx wrangler d1 execute nk-laser-db --file=./d1-schema.sql --remote
  ```

---

#### Issue 4: "Changes published in Admin do not show up for customers"
- **Root Cause**: The customer's browser is displaying older cached data, or the background version polling has not fired.
- **Solution**:
  1. Have the administrator verify that they clicked **"Publish Changes"** (not just saved locally).
  2. The background poller `/api/version` runs every 12 seconds; wait 15 seconds or hard-refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`).
  3. In **Admin Settings > Data & Backup**, click **"Sync with Server"** to force an authoritative pull from D1.

---

#### Issue 5: "IP Locked Out" (429 Too Many Requests)
- **Root Cause**: More than 5 consecutive incorrect passwords were submitted from your IP address. The rate limiter locks the IP for 15 minutes.
- **Solution**:
  - Wait 15 minutes for the lockout to expire automatically.
  - Or restart the Edge Function / server process to clear the in-memory lockout map.

---

#### Issue 6: Accidentally Overwrote or Deleted Catalog Data
- **Root Cause**: An administrator accidentally imported a file in "Replace" mode or deleted essential products.
- **Solution**:
  1. Open **Admin Panel > Settings > Data & Backup**.
  2. Scroll to **Recent Local Auto-Snapshots**.
  3. Find the snapshot timestamp immediately preceding the mistake and click **"Restore Snapshot"**.
  4. Click **"Publish Changes"** to commit the restored data back into Cloudflare D1.

---

## 7. Modular Entity Import & Export (JSON & CSV/Excel)

Administrators can export and import data per collection without affecting other datasets:

| Entity | Formats | Import Modes | Location |
|---|---|---|---|
| **Products** | JSON (`.json`), CSV / Excel (`.csv`) | Merge, Replace | Admin Products, Admin Settings |
| **Categories** | JSON (`.json`) | Merge, Replace | Admin Categories, Admin Settings |
| **Reviews** | JSON (`.json`) | Merge, Replace | Admin Reviews, Admin Settings |
| **Settings** | JSON (`.json`) | Merge, Replace | Admin Settings |
| **Full Backup** | JSON (`.json`) | Full Restore | Admin Settings |

### 7.1 Merge vs. Replace Modes
- **Merge Mode (Safe / Recommended)**: Matches existing records by `id` or `sku`. Existing items are updated; new items are appended. Unmentioned records remain untouched.
- **Replace Mode (Full Overwrite)**: Completely replaces the collection with the uploaded file. An automatic rollback snapshot is captured in browser memory prior to execution.

---

## 8. Customer PII Encryption at Rest (AES-256-GCM)

All customer inquiries submitted via Quote Calculator, RFQ forms, or single-product quote modals contain confidential Personal Identifiable Information (PII).

### 8.1 Cryptographic Standards
- **Algorithm**: AES-256-GCM (Galois/Counter Mode).
- **Key Derivation**: 256-bit symmetric key configured in `DATA_ENCRYPTION_KEY`.
- **Initialization Vector (IV)**: A cryptographically unique 96-bit (12-byte) IV is generated for each encrypted field to prevent replay attacks and pattern analysis.
- **Storage**: Phone numbers and email addresses are stored in D1 as encrypted ciphertext strings formatted as `iv:authTag:ciphertext`.
- **Decryption**: Contact details are decrypted strictly on-demand in edge function memory when an authenticated administrator accesses `GET /api/admin/inquiries`. Public endpoints never expose customer PII.
