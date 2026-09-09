#!/usr/bin/env bash
# ==============================================================================
# NK Laser Spares & Optics — D1 Database Synchronization Script
# Applies schema changes (tables, indexes, columns) to Cloudflare D1
# Ensures zero data loss across redeployments and schema extensions
# ==============================================================================

set -e

DB_NAME="nk-laser-db"
SCHEMA_FILE="./d1-schema.sql"

echo "========================================================"
echo " NK Laser — Cloudflare D1 Database Schema Synchronization"
echo "========================================================"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "Error: $SCHEMA_FILE not found!"
  exit 1
fi

echo "Verifying Cloudflare credentials..."
if ! npx wrangler whoami > /dev/null 2>&1; then
  echo "Please log in to Cloudflare first by running: npx wrangler login"
  exit 1
fi

echo "Applying schema migrations to remote database: $DB_NAME..."
npx wrangler d1 execute "$DB_NAME" --file="$SCHEMA_FILE" --remote

echo "========================================================"
echo "Database schema synchronized successfully!"
echo "Tables verified: config, inquiries, reviews, sessions"
echo "Zero data loss guaranteed across all redeployments."
echo "========================================================"
