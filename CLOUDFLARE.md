# Cloudflare Pages Deployment & Troubleshooting Guide: NK Laser

This guide provides authoritative, step-by-step instructions for deploying **NK Laser** on **Cloudflare Pages**, resolving deployment authentication errors, configuring secrets, and explaining how data persistence operates in alignment with `src/data/` and `DATA_MANAGEMENT.md`.

---

## 1. Quick Diagnosis: Why Your Cloudflare Deployment Failed

### The Error in Your Log:
```text
Executing user deploy command: npx wrangler pages deploy dist --project-name=nk-laser
✘ [ERROR] A request to the Cloudflare API (/accounts/d88645e2bdd45924053b19bea0fe165b/pages/projects/nk-laser) failed.
  Authentication error [code: 10000]
📎 It looks like you are authenticating Wrangler via a custom API token set in an environment variable.
Please ensure it has the correct permissions for this operation.
```

### Root Cause:
1. **Wrong API Token Permissions**: Your `CLOUDFLARE_API_TOKEN` environment variable was created using a template (like *"Edit Cloudflare Workers"*) that only grants Workers permissions, but is **missing the `Account > Cloudflare Pages > Edit` permission**. Without this permission, Cloudflare blocks any access to the `/pages/projects/` API.
2. **Deploy Command in Native Pages**: If you are using Cloudflare Pages native build runner, **you do not need a custom deploy command at all**. Cloudflare Pages automatically takes the `dist` directory and deploys it globally. Running `npx wrangler pages deploy` inside a Cloudflare Pages build is redundant and causes token errors.
3. **Duplicate `vite` Dependency in `package.json`**: Fixed. `vite` was listed in both `dependencies` and `devDependencies`, triggering `bun` duplicate warnings during installation.

---

## 2. Deployment Method 1: Cloudflare Pages Git Integration (Recommended — Zero Secrets Needed)

This is the easiest, most reliable, and standard method. Cloudflare automatically builds and deploys your application on every `git push`. **No API tokens or Wrangler commands are required.**

### Step-by-Step Instructions:

1. **Push your code to GitHub or GitLab**:
   ```bash
   git add .
   git commit -m "fix: resolve cloudflare deployment configuration"
   git push origin main
   ```

2. **Connect Repository in Cloudflare Dashboard**:
   - Log into [dash.cloudflare.com](https://dash.cloudflare.com/).
   - In the left sidebar, navigate to **Workers & Pages** > **Overview** > **Create application** > **Pages** tab > **Connect to Git**.
   - Select your repository (`nk-laser`).

3. **Configure Build Settings**:
   - **Project name**: `nk-laser`
   - **Production branch**: `main`
   - **Framework preset**: `Vite` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Deploy command**: *(Leave completely blank / None! Cloudflare handles this automatically)*

4. **Add Environment Variables (under Build configuration)**:
   - Click **Add variable**:
     - Variable name: `NODE_VERSION`
     - Value: `20`

5. **Click Save and Deploy**:
   - Cloudflare will run `npm install` and `npm run build`, then automatically publish `dist` across all 300+ global edge locations.
   - You will receive a live URL like `https://nk-laser.pages.dev`.

---

## 3. Deployment Method 2: Wrangler CLI / CI/CD (GitHub Actions)

If you are deploying from a terminal, custom CI runner, or GitHub Actions using `wrangler pages deploy`, follow these steps to configure your API token properly:

### Step 1: Create a Cloudflare API Token with the Correct Permissions
1. Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Click **Create Token**.
3. Scroll to the bottom and click **Create Custom Token** (do not use preset templates).
4. Configure the token:
   - **Token name**: `NK Laser Pages Deploy`
   - **Permissions**:
     - `Account` — `Cloudflare Pages` — `Edit` **(Required!)**
     - `Account` — `Account Settings` — `Read` **(Required!)**
     - `Account` — `Workers Scripts` — `Edit` *(Optional, only if deploying workers)*
   - **Account Resources**:
     - `Include` — `All accounts` *(or select `Kotadia.subscription.india@gmail.com's Account`)*
5. Click **Continue to summary** and **Create Token**.
6. Copy the token string immediately.

### Step 2: Set CI Environment Variables
In your CI runner, repository secrets, or local environment, set:
```bash
# Your generated token from Step 1
export CLOUDFLARE_API_TOKEN="your_new_api_token_here"

# Your Account ID (from your error log: d88645e2bdd45924053b19bea0fe165b)
export CLOUDFLARE_ACCOUNT_ID="d88645e2bdd45924053b19bea0fe165b"
```

### Step 3: Create Project & Deploy
```bash
# 1. Ensure the project exists in Cloudflare Pages (run once):
npx wrangler pages project create nk-laser --production-branch=main

# 2. Build the production assets:
npm run build

# 3. Deploy the dist directory:
npx wrangler pages deploy dist --project-name=nk-laser
```

---

## 4. Data Architecture Alignment: No SQL Tables Needed

> **IMPORTANT CLARIFICATION**:
> You **DO NOT** need to create SQL tables or run `CREATE TABLE` scripts in Cloudflare D1. 

### How Data Is Actually Managed (referencing `DATA_MANAGEMENT.md`):
1. **Catalog Foundation (`src/data/`)**:
   - All product catalogs, machine OEM compatibility, material cutting specs, categories, reviews, and site settings are pre-compiled directly into the application from the `src/data/` folder:
     - `src/data/productsData.ts`: 40+ laser optical lenses, nozzles, ceramic sensors, cutting heads.
     - `src/data/categoriesData.ts`: Category taxonomies, subcategories, brand filters.
     - `src/data/brandsData.ts`: Compatible OEM laser brands (RayTools, Precitec, Bodor, Trumpf, WSX, etc.).
     - `src/data/settingsData.ts`: Business information, WhatsApp numbers, multi-address workshop list.
     - `src/data/reviewsData.ts`: Verified buyer feedback.
   - When built (`npm run build`), this entire catalog is bundled directly into the static client application.

2. **Client-Side Persistence & Admin Control**:
   - In browser environments (Cloudflare Pages), all changes made in the **Admin Console** persist in `localStorage`.
   - Administrators have access to **Modular CSV & JSON Import/Export** tools (see `DATA_MANAGEMENT.md`):
     - **Products**: Export/Import via `.json` or `.csv` (Excel).
     - **Categories**: Export/Import via `.json`.
     - **Reviews & Settings**: Export/Import via `.json`.
     - Support for **Merge Mode** (updates items without overwriting existing data) and **Replace Mode** (full refresh with automated snapshots).

3. **SEO Edge Functions (`functions/[[path]].ts`)**:
   - Cloudflare Pages Functions run at the edge for search bots (Googlebot, Bingbot, AI crawlers).
   - The edge function imports data directly from `src/data/initialData.ts`. It does not require any external database to serve pre-rendered HTML and Schema.org JSON-LD to search engines.

---

## 5. How to Configure Cloudflare Secrets & Environment Variables

To configure secrets in Cloudflare Pages:

### In Cloudflare Pages Dashboard:
1. Navigate to [dash.cloudflare.com](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Click on your project (`nk-laser`).
3. Go to **Settings** > **Environment variables**.
4. Click **Add variables** under **Production** (and optionally **Preview**):

| Variable Name | Type | Recommended Value | Description |
|---|---|---|---|
| `NODE_VERSION` | Plaintext | `20` | Ensures Node 20 runtime during Vite compilation |
| `ADMIN_PASSWORD_HASH` | Encrypted / Secret | `$2a$12$...` | Bcrypt hash (Cost 12) for admin panel authentication |
| `ENCRYPTION_KEY` | Encrypted / Secret | 32-byte hex string | Key for encrypting customer PII (phone & email) at rest |
| `GEMINI_API_KEY` | Encrypted / Secret | `AIzaSy...` | (Optional) Gemini API key for server-side AI features |

### Generating Secrets on Your Computer:

#### 1. Generate a New Admin Password Bcrypt Hash:
Run this one-liner in your terminal (replace `YOUR_ADMIN_PIN` with your desired PIN or password):
```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR_ADMIN_PIN', 12))"
```
Copy the resulting string (starts with `$2a$12$...`) and paste it as the value for `ADMIN_PASSWORD_HASH`.

#### 2. Generate a 32-Byte PII Encryption Key:
Run this command in your terminal:
```bash
openssl rand -hex 32
```
Copy the 64-character hex string and paste it as the value for `ENCRYPTION_KEY`.

---

## 6. SPA Routing & Security Headers Files

The repository includes pre-configured Cloudflare Pages routing and security files in `/public/`:

### 1. `public/_redirects` (Single Page App Deep Linking)
```text
/*   /index.html   200
```
This ensures direct URLs (e.g. `https://nk-laser.pages.dev/store?cat=optics`, `https://nk-laser.pages.dev/?admin=true`) reload seamlessly without 404 errors.

### 2. `public/_headers` (Security & Caching Rules)
Enforces OWASP security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`), sets `Cache-Control: public, max-age=31536000, immutable` on hashed `/assets/*`, and ensures `/index.html` is always revalidated so customers instantly see new updates.

### 3. `wrangler.toml` (Cloudflare Pages Configuration)
```toml
name = "nk-laser"
compatibility_date = "2024-09-01"
pages_build_output_dir = "dist"
compatibility_flags = ["nodejs_compat"]
```

---

## 7. Connecting Your Custom Domain

1. In Cloudflare Pages, go to **Custom domains** > **Set up a custom domain**.
2. Enter your domain (e.g., `nklaser.com` or `spares.nklaser.com`).
3. If your domain's DNS is managed by Cloudflare, it configures automatically with zero downtime.
4. Automatic SSL/TLS certificates are provisioned and renewed for free.

---

## 8. Summary Checklist Before Re-Deploying

- [x] Duplicate `vite` dependency removed from `package.json`.
- [x] `wrangler.toml` configured with `pages_build_output_dir = "dist"`.
- [x] `public/_headers` and `public/_redirects` present in repository.
- [x] Cloudflare API token verified to have `Account > Cloudflare Pages > Edit` permissions (if using CLI deploy).
- [x] Build command confirmed as `npm run build` and output directory as `dist`.
- [x] No SQL database setup needed — data is cleanly powered by `src/data/` and `DATA_MANAGEMENT.md`.
