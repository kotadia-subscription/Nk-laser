# Cloudflare Deployment & Production Hosting Guide: NK Laser

This guide provides authoritative, production-ready, first-time setup instructions for hosting and deploying **NK Laser Spares & Optics** on Cloudflare.

It covers:
- **The 4 Environment Secrets** (why admin login fails without them and how to set them)
- **Zero-Data-Loss Server Persistence with Cloudflare D1** (preserving catalog changes across redeployments and handling future column/field additions without data loss)
- **Automated CLI Deployment Scripts** for both **Method 1 (Cloudflare Pages)** and **Method 2 (Cloudflare Workers)**
- **Edge API Architecture** (`functions/api/[[route]].ts`) & Search Engine Bot Pre-rendering (`functions/[[path]].ts`)

---

## 0. Quick Start: One-Click Interactive Deploy (Recommended)

```bash
npm run deploy
```

This runs `scripts/cf-deploy.cjs`, an interactive, dependency-free deployment
wizard that works **identically on Windows, macOS, and Linux** (no bash
required — it's pure Node, invoked directly, never through a shell). It walks
you through, and is safe to re-run any time (every step detects existing
state and skips or repairs rather than duplicating work):

1. Confirms Cloudflare login (offers `wrangler login` if needed).
2. Asks Pages or Workers, and the project name.
3. Creates the D1 database if it doesn't exist, and binds it in the right
   `wrangler*.toml`.
4. Applies `d1-schema.sql`, then **automatically repairs schema drift** -
   diffing every table's live columns against the schema file and adding any
   that are missing (safe no-op if nothing is missing).
5. Offers to (re)generate and run the catalog seed (`d1-seed.sql`) - and the
   generator itself now auto-extracts any inline base64 image accidentally
   embedded in `app-config.json` into a real file under
   `public/images/extracted/`, so a single oversized product photo can no
   longer break the whole seed with `SQLITE_TOOBIG`.
6. Offers to configure the 4 secrets, auto-generating `SESSION_SECRET` /
   `DATA_ENCRYPTION_KEY` if you leave them blank.
7. Builds (`vite build` + `esbuild`) and deploys.
8. Verifies the live deployment's `/api/health` reports `d1Connected: true`
   before declaring success - this is the check that would have caught the
   "site returns 200 but the catalog is empty because D1 was never actually
   bound in production" failure mode described in section 8 below.

The `deploy-pages.sh` / `deploy-worker.sh` bash scripts (section 3) still
work and now include the same drift-repair and seeding steps, but require
bash - use them if you're already a bash user or wiring this into a
Linux/macOS CI job; use `npm run deploy` everywhere else, including plain
Windows PowerShell/cmd with no Git Bash installed.

---

## 1. The 4 Cloudflare Secrets (Admin Login & Security)

If you were unable to log into the Admin Console (`/?admin=true`), this occurs when the edge runtime has no secret configured to verify your password against, or when API requests are not handled by an edge function.

The application requires **4 secrets** in Cloudflare:

| Secret Name | Purpose | Example Value | Required? |
|---|---|---|---|
| `ADMIN_PASSWORD` | **Master Admin Password** used to authenticate into `/?admin=true`. When you enter your password in the admin login dialog, the edge function validates it against this value (or its bcrypt hash). | `MySecureAdminPass2026!` | **Yes** (For Admin) |
| `SESSION_SECRET` | **Cryptographic Session Secret** used to sign 256-bit session cookies (`admin_session`) and verify admin tokens. Prevents session hijacking. | `a9f82d1c7e4b5683...` *(32+ hex chars)* | **Yes** (For Admin) |
| `DATA_ENCRYPTION_KEY` | **AES-256-GCM Key** used to encrypt customer personal identifiable information (PII) at rest (customer phone numbers and email addresses submitted in RFQ forms). Stored encrypted in the database and only decrypted when an authenticated admin views leads. | `e4b5683a9f82d1c7...` *(32+ hex chars)* | **Yes** (For RFQ PII) |
| `GEMINI_API_KEY` | **Google Gemini API Key** used for server-side AI quote estimation and spare parts categorization. | `AIzaSy...` | Optional |

> **Alternative for Password**: Instead of plaintext `ADMIN_PASSWORD`, you can provide `ADMIN_PASSWORD_HASH` containing a pre-computed salted Bcrypt hash (`$2b$12$...`). If neither is set, the edge API falls back to the default initial hash.

---

### How to Set Secrets via Cloudflare Dashboard

#### For Cloudflare Pages (Method 1):
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Select your Pages project: **`nk-laser`**.
3. Navigate to **Settings** > **Environment variables**.
4. In the **Production** section, click **Add variable**:
   - `ADMIN_PASSWORD`: enter your desired admin password (click **Encrypt** to protect it).
   - `SESSION_SECRET`: click **Encrypt** and enter a 32-character random string (or generated hex).
   - `DATA_ENCRYPTION_KEY`: click **Encrypt** and enter a 32-character key.
   - `GEMINI_API_KEY`: click **Encrypt** and paste your Google Gemini key (optional).
5. Click **Save**.

#### For Cloudflare Workers (Method 2):
1. Go to **Workers & Pages** > select your worker **`nk-laser`**.
2. Navigate to **Settings** > **Variables and Secrets**.
3. Click **Add** under **Worker Secrets** to add each of the 4 secrets.

---

### How to Set Secrets via Wrangler CLI

You can also set secrets directly from your terminal using Wrangler:

```bash
# Method 1 (Cloudflare Pages):
npx wrangler pages secret put ADMIN_PASSWORD --project-name=nk-laser
npx wrangler pages secret put SESSION_SECRET --project-name=nk-laser
npx wrangler pages secret put DATA_ENCRYPTION_KEY --project-name=nk-laser
npx wrangler pages secret put GEMINI_API_KEY --project-name=nk-laser

# Method 2 (Cloudflare Workers):
npx wrangler secret put ADMIN_PASSWORD --config wrangler.worker.toml
npx wrangler secret put SESSION_SECRET --config wrangler.worker.toml
npx wrangler secret put DATA_ENCRYPTION_KEY --config wrangler.worker.toml
npx wrangler secret put GEMINI_API_KEY --config wrangler.worker.toml
```

---

## 2. Server Data Persistence & Zero Data Loss (Cloudflare D1)

### Real-Time Live Synchronization Across All Devices
When you make changes in the Admin Console (e.g. updating product pricing, stock status, categories, or site contact information) and click **Publish**:
1. The changes are sent via `/api/admin/publish` directly into the remote Cloudflare D1 database and stored permanently in the dedicated relational tables (`products`, `categories`, `brands`, `settings`, `reviews`, `config`).
2. A new `lastPublishedAt` ISO timestamp is recorded in D1.
3. Every open client tab or mobile device running your site polls `/api/version` every 12 seconds in the background (a tiny ~50-byte lightweight check with zero DB overhead).
4. When a new `lastPublishedAt` timestamp is detected, the client automatically synchronizes with `/api/config` and re-renders the latest catalog data seamlessly.
5. In the same browser across multiple open tabs, a native `BroadcastChannel('nk_laser_realtime_sync')` instantly updates other open tabs in 0ms!
6. **No manual browser reload is required by your visitors or customers** — updates appear automatically everywhere.

### Static Data (`src/data`) vs Cloudflare D1 Relational Database
- **Cloudflare D1 is the authoritative single source of truth**: As soon as your site connects to D1, all catalog reads, search filters, and updates are served dynamically from the D1 relational database.
- Initial seed data is injected via `d1-seed.sql` using `npm run db:seed`.
- You can manage everything directly through the Admin Console (`/?admin=true`) or by synchronizing D1.

### Future Database Schema Changes & Automated Migration
When you want to add new columns, tables, or database indexes in the future:
1. Initialize tables or update schema:
   ```bash
   npm run db:init
   # or:
   npx wrangler d1 execute nk-laser-db --file=./d1-schema.sql --remote
   ```
2. If you updated `app-config.json` locally and want to regenerate the seed script:
   ```bash
   npm run db:seed:generate
   ```
3. Inject/seed the full relational catalog into Cloudflare D1:
   ```bash
   npm run db:seed
   # or:
   npx wrangler d1 execute nk-laser-db --file=./d1-seed.sql --remote
   ```
4. All SQL statements are generated atomically and bounded (under 1MB SQLite limits), completely preventing `SQLITE_TOOBIG` errors. Additionally, edge functions batch inserts in chunks of 50 items.

### Automated GitHub CI/CD Deployment with Cloudflare D1
The repository includes a complete GitHub Actions workflow at `.github/workflows/deploy.yml`.
Whenever you push changes or pull requests to your `main` branch on GitHub:
1. GitHub Actions checks out the code and runs `npm run build`.
2. It automatically executes any database schema changes in `d1-schema.sql` against your remote Cloudflare D1 database (`nk-laser-db`).
3. It deploys the compiled application to Cloudflare Pages automatically.

To enable GitHub Actions deployment:
1. Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions**.
2. Add the following repository secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API Token (with Cloudflare Pages and D1 permissions).
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (found on your dashboard home page).

---

### Fixing "Error 8000022: Invalid database UUID ()"
If your Cloudflare Pages build log displays:
`Error: Failed to publish your Function. Got error: Error 8000022: Invalid database UUID ()`
This occurs when `wrangler.toml` contains `[[d1_databases]]` with an empty string `database_id = ""`. Cloudflare's Function compiler validates database IDs against the standard 36-character UUID format (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

**How to configure D1 correctly:**
- **For GitHub Git-connected Cloudflare Pages (Recommended)**:
  Leave `[[d1_databases]]` commented out in `wrangler.toml`. Instead, bind the database in the Cloudflare Dashboard:
  1. Go to **Cloudflare Dashboard** > **Workers & Pages** > **`nk-laser`**.
  2. Click **Settings** > **Functions**.
  3. Scroll down to **D1 database bindings** and click **Add binding**:
     - **Variable name**: `DB`
     - **D1 database**: Select `nk-laser-db` from the dropdown.
  4. Click **Save**. Any subsequent push to GitHub will deploy cleanly!
- **For Wrangler / CLI Deployments**:
  Run `./deploy-pages.sh`, which automatically runs `npx wrangler d1 create nk-laser-db`, grabs the real UUID, updates `wrangler.toml`, applies `d1-schema.sql`, and deploys.

### Fixing "Infinite loop detected in this rule: /* /index.html 200"
Cloudflare Pages automatically normalizes URLs by stripping `.html`. A rewrite rule in `_redirects` matching `/*` to `/index.html` causes an infinite rewrite loop that Cloudflare detects and ignores.
We fixed this by removing `_redirects` and generating `dist/200.html` during `npm run build`. Cloudflare Pages natively uses `200.html` to serve all client-side Single Page Application (SPA) routes without warnings or loops.

---

### Why Local JSON Files Do Not Persist on Cloudflare
In containerized environments (like Google Cloud Run or Docker), the backend writes to `app-config.json` on the disk. On Cloudflare (both Pages and Workers), the edge runtime is **ephemeral and immutable**:
- Static assets in `dist/` are read-only.
- Any writes to the local filesystem are discarded on redeployment.
- **Solution**: The application uses **Cloudflare D1**, Cloudflare's serverless SQLite database, to persist all catalog items, settings, inquiries, and reviews.

### Future-Proof Schema: How Field/Column Changes Deploy Without Data Loss
In traditional SQL databases, adding or deleting columns requires running complex `ALTER TABLE` migrations that can fail or corrupt data. 

To solve this permanently, the NK Laser D1 database (`d1-schema.sql`) utilizes a **Hybrid Document & Relational Model**:
1. The `config` table stores the master datasets (`products`, `categories`, `brands`, `settings`, `powerRanges`) as validated JSON document strings.
2. **Adding New Fields**: When you add new properties to products in the future (e.g., `clearancePrice`, `cadDrawingUrl`, `opticalCoatingType`, `warrantyMonths`), they serialize and deserialize automatically. **Zero SQL migrations are needed.**
3. **Deleting or Renaming Fields**: Old records remain intact and never trigger database constraint errors.
4. **Independent Lifecycle**: Cloudflare D1 lives completely outside your Git deployments. Redeploying your frontend or edge code **never resets or deletes your D1 data**.

---

## 3. Automated CLI Deployment: Fast 1-Command Setup

The repository includes two automated bash deployment scripts that handle everything in one command: CLI verification, D1 provisioning, schema migration, secret configuration, Vite compilation, project creation, and deployment.

### Method 1: Cloudflare Pages + Edge Functions (Recommended)

This deploys your static Vite application to Cloudflare Pages with native edge functions in `functions/api/` for the backend API and `functions/[[path]].ts` for bot SEO.

#### Run the Automated Script:
```bash
./deploy-pages.sh
```

#### What `deploy-pages.sh` Does Automatically:
1. Verifies your Cloudflare authentication via `wrangler whoami`.
2. Checks if the D1 database `nk-laser-db` exists; if not, creates it via `npx wrangler d1 create nk-laser-db`.
3. Automatically extracts the `database_id` and binds it to `wrangler.toml`.
4. Executes `d1-schema.sql` on Cloudflare's edge to initialize tables (`config`, `inquiries`, `reviews`, `sessions`).
5. Prompts you to set the 4 secrets (`ADMIN_PASSWORD`, `SESSION_SECRET`, `DATA_ENCRYPTION_KEY`, `GEMINI_API_KEY`).
6. Runs `npm run build` to compile the Vite SPA into `dist/`.
7. Checks if the Pages project `nk-laser` exists (creating it with `npx wrangler pages project create nk-laser` if missing, preventing the *"Pages project does not exist"* error).
8. Deploys the application via `npx wrangler pages deploy dist --project-name=nk-laser`.

---

### Method 2: Cloudflare Workers with Static Assets & D1

If your Cloudflare account is configured strictly for Cloudflare Workers (or you prefer deploying as a standalone worker with static assets):

#### Run the Automated Script:
```bash
./deploy-worker.sh
```

#### What `deploy-worker.sh` Does Automatically:
1. Verifies authentication and ensures `nk-laser-db` D1 database exists.
2. Applies `d1-schema.sql` on the remote database.
3. Configures `wrangler.worker.toml` with the D1 database ID.
4. Sets the 4 secrets via `npx wrangler secret put`.
5. Compiles the Vite SPA with `npm run build`.
6. Deploys the worker entrypoint (`worker.ts`) and static assets via `npx wrangler deploy --config wrangler.worker.toml`.

---

## 4. Manual Step-by-Step CLI Walkthrough

If you prefer to run each command manually instead of using the automated scripts, follow these steps:

### Step 1: Log in to Cloudflare
```bash
npx wrangler login
```

### Step 2: Create Cloudflare D1 Database
```bash
npx wrangler d1 create nk-laser-db
```
*Note the `database_id` printed in the console (e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).*

### Step 3: Configure `wrangler.toml` with your Database ID
Open `wrangler.toml` and update the `database_id`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "nk-laser-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### Step 4: Apply Database Schema
```bash
npx wrangler d1 execute nk-laser-db --file=./d1-schema.sql --remote
```

### Step 5: Set Your 4 Secrets
```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name=nk-laser
npx wrangler pages secret put SESSION_SECRET --project-name=nk-laser
npx wrangler pages secret put DATA_ENCRYPTION_KEY --project-name=nk-laser
npx wrangler pages secret put GEMINI_API_KEY --project-name=nk-laser
```

### Step 6: Initialize Pages Project (Prevents "Project Does Not Exist" Error)
```bash
npx wrangler pages project create nk-laser --production-branch=main
```

### Step 7: Build and Deploy
```bash
npm run build
npx wrangler pages deploy dist --project-name=nk-laser
```

---

## 5. Architecture & File Reference

| File | Role & Description |
|---|---|
| `scripts/cf-deploy.cjs` | **Interactive, cross-platform deploy wizard** (`npm run deploy`) - Windows/macOS/Linux, no bash required. Covers D1 create/bind/drift-repair/seed, Pages or Workers project + secrets, build, deploy, and a post-deploy `/api/health` check. |
| `deploy-pages.sh` | **Automated deployment script** for Cloudflare Pages (Method 1), bash only. |
| `deploy-worker.sh` | **Automated deployment script** for Cloudflare Workers (Method 2), bash only. |
| `scripts/generate-d1-seed.cjs` | Generates `d1-seed.sql` from `app-config.json`; auto-extracts any oversized inline base64 image into `public/images/extracted/` first (see 8.2). |
| `d1-schema.sql` | **Cloudflare D1 SQL Schema** creating `config`, `inquiries`, `reviews`, and `sessions` tables. |
| `functions/api/[[route]].ts` | **Edge API Router**: handles `/api/auth/*`, `/api/config`, `/api/products`, `/api/inquiries`, and `/api/reviews` with D1 persistence and PII encryption. |
| `functions/[[path]].ts` | **Edge Bot Pre-Renderer**: detects search crawlers (Googlebot, Bingbot, WhatsApp) and returns rich Schema.org HTML. |
| `worker.ts` | **Worker Entrypoint** for Method 2: routes `/api/*`, bot SSR, and static asset serving. |
| `wrangler.toml` | Cloudflare Pages configuration declaring D1 binding and Node compatibility flags. |
| `wrangler.worker.toml` | Cloudflare Worker configuration declaring asset directories, D1 database, and worker entrypoint. |
| `public/_redirects` | Single Page Application deep linking redirect (`/* /index.html 200`). |
| `public/_headers` | Security headers (`nosniff`, `SAMEORIGIN`, Cache-Control). |

---

## 6. Real-Time Debugging & Edge Logging

If issues arise on your live Cloudflare deployment (e.g., authentication failures, database query errors, or unhandled exceptions):

### 6.1 Stream Live Edge Logs
Run the Wrangler Tail command from your terminal:
```bash
# For Cloudflare Pages
npx wrangler pages deployment tail --project-name=nk-laser

# For Cloudflare Workers
npx wrangler tail --config wrangler.worker.toml
```
Keep this window open while interacting with your site in the browser to view real-time request payloads, status codes, and server-side stack traces.

### 6.2 Inspect D1 Database Directly from CLI
```bash
# Check D1 database details and metrics
npx wrangler d1 info nk-laser-db

# Check existing tables
npx wrangler d1 execute nk-laser-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote

# Inspect stored configuration timestamp
npx wrangler d1 execute nk-laser-db --command="SELECT key, updated_at, length(value) FROM config;" --remote
```

For complete database lifecycle, zero-loss deployment strategies, and synchronization mechanics, consult **`DATA_MANAGEMENT.md`**.

---

## 7. Post-Deployment Verification Checklist

After deploying your application:

1. **Verify D1 Is Actually Connected**:
   - Open `https://nk-laser.pages.dev/api/health` and confirm `"d1Connected": true`.
   - Do this every time you deploy, not just the first time. A `200` homepage
     and a plausible-looking `/api/config` response are **not** proof the
     catalog is live - see section 8 for why.
2. **Verify Storefront**:
   - Open `https://nk-laser.pages.dev/store`.
   - Verify product catalog loads with quick search, OEM brand filtering, and power rating facets.
3. **Verify Admin Console Login**:
   - Open `https://nk-laser.pages.dev/?admin=true`.
   - Enter your `ADMIN_PASSWORD`.
   - Verify you are authenticated and redirected to the Admin Dashboard.
4. **Verify Data Persistence (Redeployment Test)**:
   - In the Admin Console, edit a product or change site settings (e.g., update phone number or tagline).
   - Click **Publish Changes**.
   - Trigger a redeployment using `npm run deploy`, `./deploy-pages.sh`, or `git push`.
   - Refresh `https://nk-laser.pages.dev`. Notice your changes remain **100% preserved in Cloudflare D1**!
5. **Verify Customer RFQ Encryption**:
   - Submit a test inquiry via the storefront Quote Calculator or Product page.
   - In the Admin Console under **Inquiries / Leads**, verify that the lead appears with full contact details decrypted for you.
6. **Connect Custom Domain**:
   - In the Cloudflare Dashboard: **Workers & Pages** > **`nk-laser`** > **Custom domains** > **Set up a custom domain**.
   - Enter your domain (e.g., `spares.nklaser.com` or `nklaser.in`).
   - Cloudflare will automatically provision free SSL/TLS certificates and manage DNS routing.

---

## 8. Troubleshooting: Real Incidents We Fixed

These are actual failures hit while operating this project, kept here so
they're diagnosable in under a minute instead of re-discovered from scratch.

### 8.1 "It returns 200 and looks fine, but the catalog is empty"
`/api/config` can return `200` with a plausible-looking `settings` object
(business name, phone, address) while `products`/`categories`/`brands` are
silently empty arrays. That's because `loadFullConfig()` in
`functions/api/[[route]].ts` falls back to hardcoded `DEFAULT_SITE_SETTINGS`
and `EMPTY_PRODUCTS`/`EMPTY_CATEGORIES`/... whenever `env.DB` is falsy - a
missing D1 binding fails *silently* into fallback data, not with an error.
**Diagnosis**: check `GET /api/health` - if `d1Connected` is `false`, the
Pages Function has no D1 binding at all, regardless of what `wrangler.toml`
or the Dashboard say should be bound. **Fix**: either bind D1 in the
Dashboard (Settings > Functions > D1 database bindings) and trigger a new
build, or run `npm run deploy` / `./deploy-pages.sh`, which deploy directly
via `wrangler pages deploy` using `wrangler.toml`'s binding - bypassing
whatever the git-connected build path is or isn't picking up. Always re-check
`/api/health` after any deploy method change.

### 8.2 `SQLITE_TOOBIG` when running the catalog seed
D1's bulk `--file` import rejects any single SQL statement over roughly
100KB. A product/category/brand image accidentally saved as an inline
`data:image/...;base64,...` string (e.g. an upload that fell back to
embedding because no image host was configured) can push that one row's
`INSERT` well past the limit - and it appears *twice* per row (once in its
own column, once again inside `raw_json`), so even a ~100KB image is enough.
**Fix**: `scripts/generate-d1-seed.cjs` now scans the whole config for any
string over 15KB that looks like a `data:image/...;base64,` URI, decodes it
to a real file under `public/images/extracted/`, rewrites `app-config.json`
to reference that file's path instead, and logs what it did. This runs
automatically on every `npm run db:seed:generate` / `npm run deploy` - you
do not need to hunt for the offending row by hand.

### 8.3 `table reviews has no column named company` (or similar)
`CREATE TABLE IF NOT EXISTS` is a no-op against a table that already exists -
it will **not** add columns that were added to `d1-schema.sql` after the
table was first created remotely. If the remote database predates a schema
change, you'll get a `SQLITE_ERROR` naming the missing column the first time
a query touches it. **Fix**: `npm run deploy`, `deploy-pages.sh`,
`deploy-worker.sh`, and `scripts/sync-database.sh` all now run a drift check
after applying the schema - `npm run deploy` does it generically for every
table by diffing `PRAGMA table_info` against `d1-schema.sql`; the bash
scripts run the three known `reviews` columns (`company`, `location`,
`verified`) as `ALTER TABLE ... ADD COLUMN` statements that silently no-op if
the column already exists. Safe to run on every deploy.

### 8.4 `npm run <script>` fails with "not recognized as an internal or
external command" / `Cannot find module '...wrangler\bin\wrangler.js'` on
Windows
This happens when the project's folder path contains an `&` character (as
this repo's does). `npm run` on Windows always executes scripts through
`cmd.exe`, even from a PowerShell prompt. npm's auto-generated `.cmd` shims
in `node_modules\.bin\` splice their own folder path into a batch line that
already uses `&` as a control operator - the literal `&` in the path breaks
`cmd.exe`'s parsing and truncates the resolved module path. This affects
*any* `.cmd`-shimmed binary (`vite`, `esbuild`, `tsc`, `tsx`, `wrangler`),
not just one of them. **Fix**: every `package.json` script and
`scripts/cf-deploy.cjs` now invoke tools as `node ./node_modules/<pkg>/<entry>`
directly - bypassing the `.cmd` shim entirely - which behaves identically on
Windows, macOS, and Linux. If you add a new script that shells out to a CLI
tool, follow the same pattern rather than calling the bare command name.
