#!/usr/bin/env node
/**
 * NK Laser Spares & Optics - Interactive Cloudflare Deployment
 *
 * One-click, cross-platform (Windows / macOS / Linux) setup and deployment for:
 *   - Cloudflare D1 database (create, schema, drift repair, seed)
 *   - Cloudflare Pages or Workers project (create, bind D1, secrets)
 *   - Build + deploy, with a post-deploy health check
 *
 * Run with: npm run deploy
 *
 * Design notes (read before "simplifying" this script):
 * - Every external tool (wrangler, vite, esbuild, tsc) is invoked as
 *   `node <absolute-path-to-entry.js>` via spawnSync with an argument ARRAY and
 *   shell:false (the default). We never invoke bare command names ("wrangler",
 *   "npx vite", ...) through a shell. On Windows, npm's auto-generated .cmd
 *   shims break if any ancestor directory name contains "&" (cmd.exe mis-parses
 *   the expanded path) - this project's folder name has one. Spawning node
 *   directly on the real entry file sidesteps that bug entirely and behaves
 *   identically on every OS.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const readline = require('readline/promises');

const ROOT = path.join(__dirname, '..');
const NODE = process.execPath;
const WRANGLER = path.join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const DB_NAME = 'nk-laser-db';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function log(msg) { console.log(msg); }
function step(msg) { console.log(`\n\x1b[36m${msg}\x1b[0m`); }
function ok(msg) { console.log(`\x1b[32m✓ ${msg}\x1b[0m`); }
function warn(msg) { console.log(`\x1b[33m⚠ ${msg}\x1b[0m`); }
function fail(msg) { console.log(`\x1b[31m✗ ${msg}\x1b[0m`); }

async function ask(question, defaultValue) {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || defaultValue || '';
}

async function askYesNo(question, defaultYes) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${question} [${hint}]: `)).trim().toLowerCase();
  if (!answer) return defaultYes;
  return answer === 'y' || answer === 'yes';
}

// Masked input for secrets. Falls back to plain (visible) input if the
// terminal doesn't support raw mode (e.g. piped/non-interactive stdin).
function askSecret(question) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY || !process.stdin.setRawMode) {
      rl.question(`${question}: `).then(resolve);
      return;
    }
    process.stdout.write(`${question}: `);
    let value = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    const onData = (char) => {
      const code = char.charCodeAt(0);
      if (char === '\r' || char === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(value);
      } else if (code === 3) { // Ctrl+C
        process.stdin.setRawMode(false);
        process.stdout.write('\n');
        process.exit(130);
      } else if (code === 127 || code === 8) { // Backspace / Delete
        if (value.length > 0) {
          value = value.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else if (code >= 32) { // printable characters only
        value += char;
        process.stdout.write('*');
      }
    };
    process.stdin.on('data', onData);
  });
}

function randomHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

/** Run a node entry file with inherited stdio (output visible live). Exits process on failure unless allowFail. */
function runNode(args, { allowFail = false, cwd = ROOT } = {}) {
  const result = spawnSync(NODE, args, { stdio: 'inherit', cwd });
  if (result.status !== 0 && !allowFail) {
    fail(`Command failed: node ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
  return result.status === 0;
}

function wrangler(args, opts = {}) {
  return runNode([WRANGLER, ...args], opts);
}

/** Run wrangler and capture stdout/stderr as text (no live output). */
function wranglerCapture(args) {
  return spawnSync(NODE, [WRANGLER, ...args], { cwd: ROOT, encoding: 'utf8' });
}

/** Run a wrangler subcommand with --json and parse the JSON payload out of its stdout. */
function wranglerJSON(args) {
  const result = wranglerCapture([...args, '--json']);
  const out = result.stdout || '';
  const start = out.search(/[[{]/);
  if (start === -1) return null;
  try {
    return JSON.parse(out.slice(start));
  } catch {
    return null;
  }
}

/** Run wrangler with a value piped to stdin (for `secret put`), no shell pipe involved. */
function wranglerWithStdin(args, input) {
  const result = spawnSync(NODE, [WRANGLER, ...args], { cwd: ROOT, input, stdio: ['pipe', 'inherit', 'inherit'] });
  return result.status === 0;
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

async function ensureAuth() {
  step('[1/8] Checking Cloudflare authentication...');
  const who = wranglerCapture(['whoami']);
  if (who.status === 0 && /logged in/i.test(who.stdout || '')) {
    const match = (who.stdout || '').match(/associated with the email (\S+@\S+)/i);
    ok(`Authenticated${match ? ' as ' + match[1] : ''}.`);
    return;
  }
  warn('Not logged in to Cloudflare.');
  if (await askYesNo('Open browser to log in now?', true)) {
    wrangler(['login']);
  } else {
    fail('Cannot continue without Cloudflare authentication.');
    process.exit(1);
  }
}

async function ensureD1Database() {
  step('[2/8] Ensuring D1 database exists...');
  let list = wranglerJSON(['d1', 'list']);
  let db = Array.isArray(list) ? list.find((d) => d.name === DB_NAME) : null;
  if (db) {
    ok(`D1 database '${DB_NAME}' already exists (${db.uuid}).`);
    return db.uuid;
  }
  log(`Creating D1 database '${DB_NAME}'...`);
  wrangler(['d1', 'create', DB_NAME]);
  list = wranglerJSON(['d1', 'list']);
  db = Array.isArray(list) ? list.find((d) => d.name === DB_NAME) : null;
  if (!db) {
    fail(`Could not find '${DB_NAME}' after creation. Check the output above.`);
    process.exit(1);
  }
  ok(`Created D1 database '${DB_NAME}' (${db.uuid}).`);
  return db.uuid;
}

/** Patch wrangler.toml / wrangler.worker.toml with the [[d1_databases]] binding. */
function bindDatabaseInToml(tomlPath, databaseId) {
  let toml = fs.readFileSync(tomlPath, 'utf8');
  if (toml.includes(`database_id = "${databaseId}"`)) {
    ok(`${path.basename(tomlPath)} already bound to ${databaseId}.`);
    return;
  }
  if (/^\s*\[\[d1_databases\]\]/m.test(toml) && !/^\s*#\s*\[\[d1_databases\]\]/m.test(toml)) {
    toml = toml.replace(/database_id\s*=\s*"[^"]*"/, `database_id = "${databaseId}"`);
  } else {
    toml = toml.replace(/^\s*#\s*\[\[d1_databases\]\][\s\S]*?#\s*database_id\s*=\s*"[^"]*"\s*$/m, '').trimEnd();
    toml += `\n\n[[d1_databases]]\nbinding = "DB"\ndatabase_name = "${DB_NAME}"\ndatabase_id = "${databaseId}"\n`;
  }
  fs.writeFileSync(tomlPath, toml);
  ok(`Bound D1 database in ${path.basename(tomlPath)}.`);
}

async function applySchemaAndRepairDrift() {
  step('[3/8] Applying schema and checking for drift...');
  wrangler(['d1', 'execute', DB_NAME, '--file=./d1-schema.sql', '--remote', '--yes']);
  ok('Schema applied (CREATE TABLE IF NOT EXISTS is a no-op on existing tables).');

  const schemaSql = fs.readFileSync(path.join(ROOT, 'd1-schema.sql'), 'utf8');
  const tableRe = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\n\);/g;
  let match;
  let repaired = 0;
  while ((match = tableRe.exec(schemaSql))) {
    const table = match[1];
    const body = match[2];
    const lines = body.split(',\n').map((l) => l.trim()).filter(Boolean);
    const expectedCols = [];
    for (const line of lines) {
      const nameMatch = line.match(/^(\w+)\s+(.+)$/);
      if (!nameMatch) continue;
      const [, colName, rest] = nameMatch;
      // Skip constraints we can't safely retrofit with ALTER TABLE ADD COLUMN.
      if (/PRIMARY KEY|UNIQUE|REFERENCES/i.test(rest)) continue;
      if (/NOT NULL/i.test(rest) && !/DEFAULT/i.test(rest)) continue;
      expectedCols.push({ name: colName, def: rest.replace(/,$/, '') });
    }

    const info = wranglerJSON(['d1', 'execute', DB_NAME, '--command', `PRAGMA table_info(${table});`, '--remote']);
    const existingCols = new Set(
      (Array.isArray(info) && info[0] && Array.isArray(info[0].results) ? info[0].results : []).map((r) => r.name)
    );
    if (existingCols.size === 0) continue; // table not created yet / query failed, skip

    for (const col of expectedCols) {
      if (!existingCols.has(col.name)) {
        log(`  Repairing drift: ${table}.${col.name} is missing remotely, adding it...`);
        const success = wrangler(
          ['d1', 'execute', DB_NAME, '--command', `ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.def};`, '--remote'],
          { allowFail: true }
        );
        if (success) repaired++;
      }
    }
  }
  if (repaired > 0) ok(`Repaired ${repaired} missing column(s) on the remote database.`);
  else ok('No schema drift detected.');
}

async function maybeSeed() {
  step('[4/8] Catalog data seeding...');
  const counts = wranglerJSON(['d1', 'execute', DB_NAME, '--command', 'SELECT COUNT(*) AS c FROM products;', '--remote']);
  const productCount = counts && counts[0] && counts[0].results && counts[0].results[0] ? counts[0].results[0].c : 0;
  log(`Remote 'products' table currently has ${productCount} row(s).`);
  const doSeed = await askYesNo('Regenerate and run the one-time catalog seed (from app-config.json)?', productCount === 0);
  if (!doSeed) {
    ok('Skipped seeding.');
    return;
  }
  runNode([path.join(ROOT, 'scripts', 'generate-d1-seed.cjs')]);
  wrangler(['d1', 'execute', DB_NAME, '--file=./d1-seed.sql', '--remote', '--yes']);
  ok('Catalog seeded into D1.');
}

async function maybeSetSecrets(method, projectName) {
  step('[5/8] Cloudflare secrets (ADMIN_PASSWORD, SESSION_SECRET, DATA_ENCRYPTION_KEY, GEMINI_API_KEY)...');
  const listArgs = method === 'pages'
    ? ['pages', 'secret', 'list', `--project-name=${projectName}`]
    : ['secret', 'list', '--config', 'wrangler.worker.toml'];
  const listed = wranglerCapture(listArgs);
  const existing = new Set([...(listed.stdout || '').matchAll(/- (\w+):/g)].map((m) => m[1]));
  if (existing.size > 0) log(`Existing secrets: ${[...existing].join(', ')}`);

  if (!(await askYesNo('Configure/update secrets now?', existing.size === 0))) {
    ok('Skipped secret configuration.');
    return;
  }

  const putArgs = (name) => method === 'pages'
    ? ['pages', 'secret', 'put', name, `--project-name=${projectName}`]
    : ['secret', 'put', name, '--config', 'wrangler.worker.toml'];

  const adminPassword = await askSecret('ADMIN_PASSWORD (min 8 chars, leave blank to keep existing/skip)');
  if (adminPassword) wranglerWithStdin(putArgs('ADMIN_PASSWORD'), adminPassword);

  const sessionSecret = await ask('SESSION_SECRET (press Enter to auto-generate a secure value)', '');
  wranglerWithStdin(putArgs('SESSION_SECRET'), sessionSecret || randomHex(32));

  const encKey = await ask('DATA_ENCRYPTION_KEY (press Enter to auto-generate a secure value)', '');
  wranglerWithStdin(putArgs('DATA_ENCRYPTION_KEY'), encKey || randomHex(32));

  const geminiKey = await askSecret('GEMINI_API_KEY (optional, leave blank to skip)');
  if (geminiKey) wranglerWithStdin(putArgs('GEMINI_API_KEY'), geminiKey);

  ok('Secrets configured.');
}

function build() {
  step('[6/8] Building production bundle...');
  runNode([path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'build']);
  fs.copyFileSync(path.join(ROOT, 'dist', 'index.html'), path.join(ROOT, 'dist', '200.html'));
  runNode([
    path.join(ROOT, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    'server.ts', '--bundle', '--platform=node', '--format=cjs', '--packages=external', '--sourcemap',
    '--outfile=dist/server.cjs',
  ]);
  ok('Build complete (dist/).');
}

async function ensurePagesProject(projectName) {
  const list = wranglerJSON(['pages', 'project', 'list']);
  const exists = Array.isArray(list) && list.some((p) => (p['Project Name'] || p.name) === projectName);
  if (exists) {
    ok(`Pages project '${projectName}' already exists.`);
    return;
  }
  log(`Creating Pages project '${projectName}'...`);
  wrangler(['pages', 'project', 'create', projectName, '--production-branch=main']);
  ok(`Created Pages project '${projectName}'.`);
}

async function deployPages(projectName) {
  step('[7/8] Deploying to Cloudflare Pages...');
  await ensurePagesProject(projectName);
  wrangler(['pages', 'deploy', 'dist', `--project-name=${projectName}`, '--commit-dirty=true']);
  ok('Deployment uploaded.');
}

function deployWorker() {
  step('[7/8] Deploying Cloudflare Worker...');
  wrangler(['deploy', '--config', 'wrangler.worker.toml']);
  ok('Worker deployed.');
}

async function verify(projectName, method) {
  step('[8/8] Verifying deployment...');
  if (method !== 'pages') {
    warn('Skipping automated health check for Workers deployments - check your worker URL manually.');
    return;
  }
  const url = `https://${projectName}.pages.dev/api/health`;
  log(`Waiting for ${url} ...`);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await new Promise((r) => setTimeout(r, attempt === 0 ? 3000 : 5000));
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        const data = await res.json();
        if (data.d1Connected) {
          ok(`Live and connected to D1: ${url}`);
          return;
        }
        warn(`Reached the site but d1Connected=false (attempt ${attempt + 1}/5), retrying...`);
      }
    } catch {
      // retry
    }
  }
  warn(`Could not confirm D1 connectivity automatically. Check manually: ${url}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\x1b[36m======================================================\x1b[0m');
  console.log('\x1b[36m  NK Laser: Interactive Cloudflare Deployment          \x1b[0m');
  console.log('\x1b[36m======================================================\x1b[0m');
  log('Cross-platform (Windows/macOS/Linux) one-click setup for Cloudflare D1 + Pages/Workers.\n');

  await ensureAuth();

  const methodAnswer = await ask('Deploy target: [1] Cloudflare Pages (recommended)  [2] Cloudflare Workers', '1');
  const method = methodAnswer.trim() === '2' ? 'worker' : 'pages';
  const projectName = method === 'pages'
    ? await ask('Cloudflare Pages project name', 'nk-laser')
    : await ask('Cloudflare Worker name (must match wrangler.worker.toml "name")', 'nk-laser');

  const databaseId = await ensureD1Database();
  const tomlPath = method === 'pages'
    ? path.join(ROOT, 'wrangler.toml')
    : path.join(ROOT, 'wrangler.worker.toml');
  bindDatabaseInToml(tomlPath, databaseId);

  await applySchemaAndRepairDrift();
  await maybeSeed();
  await maybeSetSecrets(method, projectName);
  build();

  if (method === 'pages') {
    await deployPages(projectName);
  } else {
    deployWorker();
  }

  await verify(projectName, method);

  console.log('\n\x1b[32m======================================================\x1b[0m');
  console.log('\x1b[32m  Deployment finished!                                \x1b[0m');
  console.log('\x1b[32m======================================================\x1b[0m');
  if (method === 'pages') {
    log(`Storefront: https://${projectName}.pages.dev`);
    log(`Admin:      https://${projectName}.pages.dev/?admin=true`);
  }
  rl.close();
}

main().catch((err) => {
  fail(err && err.stack ? err.stack : String(err));
  rl.close();
  process.exit(1);
});
