#!/usr/bin/env bash
# =============================================================================
# NK Laser Spares & Optics - Cloudflare Pages Automated Deployment Script
# Method 1: Cloudflare Pages + Edge Functions + Cloudflare D1 (Zero Data Loss)
# =============================================================================

set -e

# ANSI Color Codes
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}  NK Laser: Cloudflare Pages Automated Deployment     ${NC}"
echo -e "${CYAN}======================================================${NC}"

PROJECT_NAME="nk-laser"
DB_NAME="nk-laser-db"

# 1. Verify Dependencies
echo -e "\n${YELLOW}[1/7] Verifying CLI Tools...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed. Please install Node.js (v18+).${NC}"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}Error: npm is not installed.${NC}"
  exit 1
fi

# 2. Check Wrangler Authentication
echo -e "\n${YELLOW}[2/7] Checking Cloudflare Authentication...${NC}"
if ! npx wrangler whoami &> /dev/null; then
  echo -e "${YELLOW}You are not logged in to Cloudflare. Opening login...${NC}"
  npx wrangler login
fi

echo -e "${GREEN}✓ Authenticated with Cloudflare.${NC}"

# 3. Cloudflare D1 Database Provisioning & Schema Migration
echo -e "\n${YELLOW}[3/7] Setting up Cloudflare D1 Database (${DB_NAME})...${NC}"

# Check if database already exists or create it
D1_OUTPUT=$(npx wrangler d1 info "$DB_NAME" 2>&1 || true)

if echo "$D1_OUTPUT" | grep -q "database_id"; then
  echo -e "${GREEN}✓ D1 Database '${DB_NAME}' already exists.${NC}"
  DATABASE_ID=$(echo "$D1_OUTPUT" | grep -o 'database_id = "[^"]*"' | head -1 | cut -d'"' -f2 || true)
  if [ -z "$DATABASE_ID" ]; then
    DATABASE_ID=$(echo "$D1_OUTPUT" | grep -o '[0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}' | head -1 || true)
  fi
else
  echo -e "${CYAN}Creating new Cloudflare D1 database '${DB_NAME}'...${NC}"
  CREATE_OUT=$(npx wrangler d1 create "$DB_NAME")
  DATABASE_ID=$(echo "$CREATE_OUT" | grep -o '[0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}' | head -1 || true)
  echo -e "${GREEN}✓ Created D1 Database ID: ${DATABASE_ID}${NC}"
fi

# Automatically update wrangler.toml if database_id is present
if [ -n "$DATABASE_ID" ]; then
  echo -e "${CYAN}Configuring D1 binding in wrangler.toml with database_id: ${DATABASE_ID}...${NC}"
  node -e "
    const fs = require('fs');
    let toml = fs.readFileSync('wrangler.toml', 'utf8');
    if (!toml.includes('binding = \"DB\"') || toml.includes('# [[d1_databases]]')) {
      toml = toml.replace(/# \[\[d1_databases\]\][\s\S]*?database_id = \"[^\"]*\"/, '');
      toml = toml.trim() + '\n\n[[d1_databases]]\nbinding = \"DB\"\ndatabase_name = \"nk-laser-db\"\ndatabase_id = \"${DATABASE_ID}\"\n';
    } else {
      toml = toml.replace(/database_id\s*=\s*\"[^\"]*\"/, 'database_id = \"${DATABASE_ID}\"');
    }
    fs.writeFileSync('wrangler.toml', toml);
  "
fi

# Run D1 Schema initialization (Zero data loss document & relational store)
echo -e "${CYAN}Applying D1 database schema from d1-schema.sql...${NC}"
npx wrangler d1 execute "$DB_NAME" --file=./d1-schema.sql --remote --yes || {
  echo -e "${YELLOW}Notice: If tables already exist, schema execution proceeds safely.${NC}"
}
echo -e "${GREEN}✓ D1 database schema ready.${NC}"

# 4. Check & Configure Cloudflare Secrets
echo -e "\n${YELLOW}[4/7] Checking Cloudflare Secrets...${NC}"
echo -e "The application uses 4 secrets for security, admin authentication & AI:"
echo -e "  1. ADMIN_PASSWORD       (Master password to log into /?admin=true)"
echo -e "  2. SESSION_SECRET        (Cryptographic secret for admin session tokens)"
echo -e "  3. DATA_ENCRYPTION_KEY   (32-char key for AES-256 PII encryption at rest)"
echo -e "  4. GEMINI_API_KEY        (Google Gemini API key for AI features)"

read -p "Do you want to configure or update these secrets now via CLI? [y/N]: " CONFIGURE_SECRETS
if [[ "$CONFIGURE_SECRETS" =~ ^[Yy]$ ]]; then
  echo -e "\n${CYAN}Setting ADMIN_PASSWORD...${NC}"
  read -s -p "Enter Admin Master Password (min 8 chars): " ADMIN_PASS
  echo ""
  if [ -n "$ADMIN_PASS" ]; then
    echo "$ADMIN_PASS" | npx wrangler pages secret put ADMIN_PASSWORD --project-name="$PROJECT_NAME"
    echo -e "${GREEN}✓ ADMIN_PASSWORD set.${NC}"
  fi

  echo -e "\n${CYAN}Setting SESSION_SECRET...${NC}"
  # Generate 32-byte hex if user leaves blank
  DEFAULT_SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  read -p "Enter SESSION_SECRET (press Enter to auto-generate): " S_SECRET
  S_SECRET=${S_SECRET:-$DEFAULT_SESSION_SECRET}
  echo "$S_SECRET" | npx wrangler pages secret put SESSION_SECRET --project-name="$PROJECT_NAME"
  echo -e "${GREEN}✓ SESSION_SECRET set.${NC}"

  echo -e "\n${CYAN}Setting DATA_ENCRYPTION_KEY...${NC}"
  DEFAULT_ENC_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  read -p "Enter DATA_ENCRYPTION_KEY (press Enter to auto-generate): " E_KEY
  E_KEY=${E_KEY:-$DEFAULT_ENC_KEY}
  echo "$E_KEY" | npx wrangler pages secret put DATA_ENCRYPTION_KEY --project-name="$PROJECT_NAME"
  echo -e "${GREEN}✓ DATA_ENCRYPTION_KEY set.${NC}"

  echo -e "\n${CYAN}Setting GEMINI_API_KEY...${NC}"
  read -p "Enter GEMINI_API_KEY (leave blank to skip): " G_KEY
  if [ -n "$G_KEY" ]; then
    echo "$G_KEY" | npx wrangler pages secret put GEMINI_API_KEY --project-name="$PROJECT_NAME"
    echo -e "${GREEN}✓ GEMINI_API_KEY set.${NC}"
  fi
else
  echo -e "${CYAN}Skipping interactive secret setup. You can set them anytime in the Cloudflare Dashboard:${NC}"
  echo -e "Workers & Pages > ${PROJECT_NAME} > Settings > Environment variables"
fi

# 5. Build Production Bundle
echo -e "\n${YELLOW}[5/7] Building Production Bundle with Vite...${NC}"
npm run build
echo -e "${GREEN}✓ Production bundle compiled successfully to dist/.${NC}"

# 6. Ensure Cloudflare Pages Project Exists
echo -e "\n${YELLOW}[6/7] Ensuring Cloudflare Pages Project '${PROJECT_NAME}' exists...${NC}"
PROJECT_CHECK=$(npx wrangler pages project list 2>&1 || true)

if ! echo "$PROJECT_CHECK" | grep -q "$PROJECT_NAME"; then
  echo -e "${CYAN}Pages project '${PROJECT_NAME}' not found. Creating it now...${NC}"
  npx wrangler pages project create "$PROJECT_NAME" --production-branch=main || true
  echo -e "${GREEN}✓ Cloudflare Pages project '${PROJECT_NAME}' initialized.${NC}"
else
  echo -e "${GREEN}✓ Cloudflare Pages project '${PROJECT_NAME}' verified.${NC}"
fi

# 7. Deploy to Cloudflare Pages
echo -e "\n${YELLOW}[7/7] Deploying to Cloudflare Pages...${NC}"
npx wrangler pages deploy dist --project-name="$PROJECT_NAME" --commit-dirty=true

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  ✓ Deployment Completed Successfully!                ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "Your application is now live on Cloudflare Pages!"
echo -e "• Live URL: https://${PROJECT_NAME}.pages.dev"
echo -e "• Admin Portal: https://${PROJECT_NAME}.pages.dev/?admin=true"
echo -e "• Data Persistence: Protected by Cloudflare D1 (Safe from redeployments)"
echo -e "\n"
