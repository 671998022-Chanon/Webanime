#!/bin/sh
# entrypoint.sh — validate environment before starting Next.js.
# Fails fast with a clear message if a required var is missing.
set -e

# Required for production runtime (auth, DB, Redis).
# In dev, these are provided by docker-compose.override.yml with safe defaults.
REQUIRED_VARS="DATABASE_URL REDIS_URL AUTH_SECRET"

MISSING=""
for var in $REQUIRED_VARS; do
  val=$(eval "echo \$$var")
  if [ -z "$val" ]; then
    MISSING="$MISSING $var"
  fi
done

if [ -n "$MISSING" ]; then
  echo "ERROR: Missing required environment variables:$MISSING" >&2
  echo "Set them in .env, docker-compose.override.yml, or your CI secrets." >&2
  exit 1
fi

# Generate AUTH_SECRET if it's still the dev placeholder
if [ "$AUTH_SECRET" = "devonly-insecure-secret-change-me" ]; then
  echo "WARNING: AUTH_SECRET is set to the dev placeholder. Generating a random one." >&2
  AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  export AUTH_SECRET
fi

echo "Environment validated. Starting Next.js..."
exec "$@"
