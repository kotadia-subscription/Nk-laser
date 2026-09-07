# Cloudflare Deployment & Production Hosting Guide: NK Laser

This guide provides clean, authoritative, first-time setup instructions for hosting and deploying **NK Laser Spares & Optics** on Cloudflare. It covers all permissions, build configurations, edge functions, and deployment workflows without requiring any backend architectural changes.

---

## 1. Architecture Overview (Why No Code Rewrite is Needed)

You **do not need to rewrite your application or migrate Express to Hono** to host your website on Cloudflare.

Here is how the architecture works:

1. **Client-Side React SPA (`dist/`)**:
   - The user-facing storefront, 40+ laser spare parts catalog, facet filters, interactive quote calculator, multi-item RFQ cart drawer, verified reviews, client-side PDF quotation generator (`jspdf`), and admin catalog tools are compiled into a pure, high-performance static Single Page Application (SPA).
   - When built with `npm run build`, all assets are placed cleanly into the `dist/` directory.

2. **Native Cloudflare Pages Hosting**:
   - Cloudflare Pages is built specifically to host Vite SPAs on Cloudflare's global edge network across 300+ data centers with instant loading and automated SSL.
   - It requires **no Node.js server** or Docker container running in the background.

3. **Edge SSR for Search Engines (`functions/[[path]].ts`)**:
   - The repository includes a Cloudflare Pages Edge Function in `functions/[[path]].ts`.
   - For human visitors: The edge serves the ultra-fast Vite SPA.
   - For search crawlers (Googlebot, Bingbot, WhatsApp, LinkedIn, AI bots): The edge function intercepts the request and serves server-rendered HTML with full Schema.org JSON-LD structured data and OpenGraph tags.

4. **Companion Express Server (`server.ts`)**:
   - The Express backend (`server.ts`) in the repository exists for running in traditional containerized environments (like Google Cloud Run or Docker).
   - On Cloudflare Pages, the frontend runs standalone from `dist/` and connects directly to WhatsApp and client-side storage, so Express is completely bypassed and no Hono rewrite is needed.

---

## 2. Deployment Method 1: Cloudflare Pages Git Integration (Recommended)

This is the standard, zero-maintenance method. Cloudflare connects directly to your GitHub or GitLab repository, builds the application, and deploys it automatically on every `git push`.

### Step 1: Ensure Code is Pushed to Git
```bash
git add .
git commit -m "feat: complete production build configuration"
git push origin main
```

### Step 2: Create a Pages Project in Cloudflare Dashboard
1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation sidebar, select **Workers & Pages**.
3. Click the **Create application** button.
4. **IMPORTANT**: Click on the **Pages** tab (do **not** select the Workers tab).
5. Click **Connect to Git**.
6. Select your Git provider (GitHub or GitLab) and choose your repository: `nk-laser`.

### Step 3: Configure Build & Output Settings
Configure the build settings as follows:

| Field | Setting / Value | Notes |
|---|---|---|
| **Project name** | `nk-laser` | Sets your free subdomain: `nk-laser.pages.dev` |
| **Production branch** | `main` | Deploys automatically when pushed to this branch |
| **Framework preset** | `Vite` *(or `None`)* | Standard Vite preset |
| **Build command** | `npm run build` | Builds static assets and bundles the dist folder |
| **Build output directory** | `dist` | The folder containing `index.html` and assets |
| **Deploy command** | *(Leave empty / blank)* | Cloudflare Pages deploys `dist` automatically |

### Step 4: Add Environment Variables
Under the **Environment variables (advanced)** section in the build setup:
1. Click **Add variable**.
2. Set:
   - **Variable name**: `NODE_VERSION`
   - **Value**: `20`
   *(This ensures Cloudflare uses Node.js 20 during the Vite build phase).*

### Step 5: Save and Deploy
1. Click **Save and Deploy**.
2. Cloudflare will install dependencies, run `npm run build`, and deploy your site across all global edge locations.
3. Your live production URL will be ready immediately at `https://nk-laser.pages.dev`.

---

## 3. Deployment Method 2: Wrangler CLI or Automated CI/CD (GitHub Actions)

If you prefer to deploy from your terminal, custom CI/CD runner, or GitHub Actions using the `wrangler` CLI, follow these steps:

### Step 1: Create a Cloudflare API Token with Required Permissions
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Click **Create Token**.
3. Scroll to the bottom and click **Create Custom Token**.
4. Configure the token:
   - **Token name**: `NK Laser Pages Deployment Token`
   - **Permissions**:
     - `Account` → `Cloudflare Pages` → `Edit` **(Mandatory)**
     - `Account` → `Account Settings` → `Read` **(Mandatory)**
     - `Account` → `Workers Scripts` → `Edit` *(Optional, if using custom edge workers)*
   - **Account Resources**:
     - `Include` → `All accounts` (or select your specific account)
5. Click **Continue to summary** → **Create Token**.
6. Copy the generated token string.

### Step 2: Set Environment Variables
In your terminal, CI/CD pipeline, or GitHub Repository Secrets (`Settings > Secrets and variables > Actions`), define:

```bash
export CLOUDFLARE_API_TOKEN="your_generated_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
```
*(Your Cloudflare Account ID is visible in the Cloudflare Dashboard URL or right sidebar under Workers & Pages).*

### Step 3: One-Time Project Creation
Before running a Pages deploy command for the first time, initialize the Pages project on your Cloudflare account:

```bash
npx wrangler pages project create nk-laser --production-branch=main
```

### Step 4: Build and Deploy
```bash
# 1. Build the production bundle
npm run build

# 2. Deploy the dist directory to Cloudflare Pages
npx wrangler pages deploy dist --project-name=nk-laser
```

#### Fail-Safe Deploy Command (Single-Line CI/CD):
If your build script requires a single self-healing command that initializes the project if missing and then deploys:
```bash
npx wrangler pages project create nk-laser --production-branch=main || true && npx wrangler pages deploy dist --project-name=nk-laser
```

---

## 4. Alternative Method: Cloudflare Workers with Static Assets

If your Cloudflare account is strictly restricted to Workers and you must deploy as a **Worker** service instead of Pages, you still do **not** need to rewrite Express to Hono. You can use Cloudflare's native **Workers with Static Assets**:

### Configuration (`wrangler.toml` for Workers):
```toml
name = "nk-laser"
compatibility_date = "2024-09-01"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./dist"
binding = "ASSETS"
```

### Edge Worker Entrypoint (`worker.js`):
Create a minimal edge router that serves the static assets:
```javascript
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};
```

### Deploy Command for Workers:
```bash
npm run build
npx wrangler deploy
```

*(Note: Method 1 via Cloudflare Pages is still the recommended and simplest path because it natively supports both static files and `/functions/` edge SSR without maintaining a custom worker entrypoint).*

---

## 5. Repository Configuration Files

The repository includes pre-configured files to guarantee smooth routing, edge SSR, and security on Cloudflare:

### 1. `wrangler.toml` (Pages Project Declaration)
```toml
name = "nk-laser"
compatibility_date = "2024-09-01"
pages_build_output_dir = "dist"
compatibility_flags = ["nodejs_compat"]
```
This tells Wrangler that this project outputs its deployment bundle into `dist/` with Node.js compatibility enabled for edge functions.

### 2. `public/_redirects` (Single Page Application Deep-Linking)
```text
/*    /index.html   200
```
This ensures that direct deep links (e.g. `https://nk-laser.pages.dev/store?cat=focusing-collimating-lenses` or `/?admin=true`) resolve directly to `index.html` without returning a 404 on page refresh.

### 3. `public/_headers` (Production Security & Performance Headers)
Enforces industry-standard OWASP security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Cache policies: Immutable 1-year caching for hashed assets (`/assets/*`), and no-cache revalidation for `/index.html` to ensure users immediately receive new updates.

### 4. `functions/[[path]].ts` (Bot & Social Crawler Edge SSR)
- Automatically recognized by Cloudflare Pages.
- Detects Googlebot, Bingbot, WhatsApp, Facebook, LinkedIn, Twitter, and AI crawlers.
- Serves dynamic server-side rendered HTML with Schema.org `Product`, `Organization`, and `FAQPage` metadata for maximum search engine indexability.

---

## 6. Data Storage & Persistence Model

You **do not need to provision an external SQL database or Cloudflare D1 tables** to host and run this website.

- **Catalog Seed Data (`src/data/`)**: All 40+ laser optical spares, Tellurium copper nozzles, cutting heads, OEM compatibility matrices, categories, and business profiles are pre-compiled into the application bundle.
- **Client-Side Persistence**: Modifications made in the back-office Admin Console persist in client-side storage (`localStorage`).
- **Data Portability**: Full support for modular CSV and JSON data export and import (Products, Categories, Reviews, Settings) with merge and replace modes.
- **RFQ Quote Dispatch**: Quotations and inquiries are transmitted directly to sales representatives via the WhatsApp Business API and generated on-the-fly as client-side PDFs via `jspdf`.

---

## 7. Connecting a Custom Domain

Once your site is deployed on `*.pages.dev`, connect your custom domain (e.g., `nklaser.in` or `spares.nklaser.com`):

1. In the Cloudflare Dashboard, go to **Workers & Pages** > select **nk-laser**.
2. Click on the **Custom domains** tab.
3. Click **Set up a custom domain**.
4. Enter your domain name (e.g., `spares.nklaser.in`).
5. If your domain's DNS is already on Cloudflare, Cloudflare will automatically configure the CNAME records with zero downtime.
6. Cloudflare automatically generates and provisions a free SSL/TLS certificate.

---

## 8. First-Time Setup Verification Checklist

- [ ] Repository pushed to GitHub / GitLab.
- [ ] Project created under **Workers & Pages** > **Create application** > **Pages** tab.
- [ ] Build command set to `npm run build`.
- [ ] Build output directory set to `dist`.
- [ ] Deploy command left **empty / blank** (in native Pages).
- [ ] Environment variable `NODE_VERSION` set to `20`.
- [ ] `public/_redirects` and `public/_headers` present in repository.
- [ ] Site verified live on `https://nk-laser.pages.dev`.
- [ ] Custom domain linked with automated SSL/TLS.
