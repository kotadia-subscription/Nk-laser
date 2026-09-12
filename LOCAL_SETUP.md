# 🧪 Local Setup & Quick Testing Guide

This is the practical, "just get it running" companion to [README.md](README.md). It covers the
**one-time setup** you do once on a machine, and the **every-time steps** you repeat whenever you
want to spin the app up to test a change.

---

## 1. One-Time Setup (do this once per machine)

### 1.1 Prerequisites
- **Node.js** 18+ and **npm** 9+ installed.
- This is a Windows repo path (`D:\NK laser\git\Nk-laser`) — use PowerShell or Git Bash.

### 1.2 Install dependencies
```bash
npm install
```

### 1.3 Create your local `.env` file
The app runs with safe defaults out of the box (a built-in admin password hash, a built-in PII
encryption fallback), so **`.env` is optional** — but without it you won't know the admin login
password, since the default hash isn't documented anywhere. Create a `.env` file in the project
root:

```env
ADMIN_PASSWORD="your-local-test-password"
```

**Gotchas with `.env` values:**
- If your password contains `#`, wrap the whole value in double quotes — an unquoted `#` is
  treated as a comment and everything after it gets silently cut off.
- `.env` is already in `.gitignore` — it will never get committed. Don't put real production
  secrets in it; this is for local testing only.
- Other optional vars (`DATA_ENCRYPTION_KEY`, `SESSION_SECRET`, `GEMINI_API_KEY`, ...) are listed
  in [.env.example](.env.example) — none are required for local testing.

### 1.4 Know your local database
There's no database server to install. Local dev persists everything to **`app-config.json`** in
the project root (products, categories, settings, reviews, etc.) — the Express server
(`server.ts`) reads/writes it directly. It's tracked in git, so if you make a mess of it while
testing:
```bash
git checkout -- app-config.json
```
resets it back to the last committed state.

---

## 2. Every-Time Run (do this each time you want to test)

### 2.1 Start the dev server
```bash
npm run dev
```
This launches the full stack (Express API + Vite dev middleware) on **http://localhost:3000**,
with hot-reload on file changes. Leave the terminal running while you test.

### 2.2 Where to look
| What | URL |
|---|---|
| Storefront (customer-facing site) | http://localhost:3000/ |
| Admin console | http://localhost:3000/?admin=true |
| Public settings API (sanity check) | http://localhost:3000/api/settings |

Log into the admin console with the `ADMIN_PASSWORD` you set in `.env`.

### 2.3 Stop the server
`Ctrl+C` in the terminal it's running in. If it's running in the background and you've lost the
terminal, find and kill it by port:
```bash
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### 2.4 Before calling any change "done"
Per this project's contract in [AGENTS.md](AGENTS.md), every code change must pass both of these
before you consider it finished:
```bash
npm run lint    # tsc --noEmit type check
npm run build   # Vite frontend bundle + esbuild server bundle
```

---

## 3. Quick Manual Test Checklist

Use this whenever you want a fast sanity pass after a change, especially around branding/logo:

1. **Homepage loads** and shows the current logo in the navbar/footer (`/`).
2. **Admin login** works at `/?admin=true` with your `.env` password.
3. **Settings → Store Logo**: upload a new PNG/SVG file, confirm the preview updates, click
   **Save Settings**, then refresh the homepage and confirm the new logo shows up.
4. Check the file actually landed on disk: `public/images/logo/site-logo-*.<ext>` should exist,
   and `app-config.json` → `settings.logoUrl` should point at that same short path (not a giant
   `data:` base64 string).
5. **Products / Categories / Inquiries** tabs load and basic CRUD (add/edit/delete) works without
   console errors.

---

## 4. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Access Denied: Invalid Administrator Password` | `.env` password wasn't parsed correctly (special characters), or `.env` wasn't created before `npm run dev` was started | Quote the value in `.env`, then fully restart `npm run dev` (env vars are only read at process start) |
| `Security Lockout: Too many failed login attempts` | 5 failed logins from your IP trips a 15-minute lockout | Wait 15 minutes, or restart the dev server to clear in-memory rate-limit state |
| `EADDRINUSE` / port 3000 already in use | A previous `npm run dev` is still running | Find and kill it (see 2.3), then retry |
| Logo / uploaded image doesn't change on the site | Browser cache, or you forgot to click **Save Settings** after uploading | Hard-refresh (Ctrl+Shift+R); confirm `app-config.json` actually updated |
| Env var changes don't seem to take effect | `.env` is only read once, at server startup | Stop (`Ctrl+C`) and re-run `npm run dev` after editing `.env` |
