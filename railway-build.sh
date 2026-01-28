#!/bin/bash

# Railway Custom Build Script
# This script is called by Railway's Custom Build Command to avoid character limit

set -eux

echo "=== Railway Build Script Started ==="
echo "PWD=$(pwd)"
ls -la

# Clean up old build-info.json files
echo "=== Cleaning up old build-info.json files ==="
rm -rf server/_core/build-info.json dist/build-info.json

# Install dependencies
echo "=== Installing dependencies ==="
pnpm install

# Run database migrations
echo "=== Running database migrations ==="
pnpm db:migrate

# Generate build-info.json
echo "=== Generating build-info.json ==="
mkdir -p server/_core
COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "railway-$(date +%s)")
echo "{\"commitSha\":\"$COMMIT_SHA\",\"gitSha\":\"$COMMIT_SHA\",\"builtAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"version\":\"$COMMIT_SHA\",\"buildTime\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > server/_core/build-info.json

echo "=== build-info (server/_core) ==="
ls -la server/_core || true
cat server/_core/build-info.json || true

# Build the application
echo "=== Building application ==="
pnpm build

# Copy build-info.json to dist/_core
echo "=== Copying build-info.json to dist/_core ==="
mkdir -p dist/_core
cp server/_core/build-info.json dist/_core/build-info.json

echo "=== build-info (dist/_core) ==="
ls -la dist/_core || true
cat dist/_core/build-info.json || true

echo "=== Railway Build Script Completed ==="
