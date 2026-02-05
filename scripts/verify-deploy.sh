#!/usr/bin/env bash
set -euo pipefail

# Gate 1: 本番が「そのコミット」になったことを照合。ズレたら即失敗。
# usage: verify-deploy.sh <url> <expected_sha>

URL="${1:?usage: verify-deploy.sh <url> <expected_sha>}"
EXPECTED_SHA="${2:?usage: verify-deploy.sh <url> <expected_sha>}"

echo "Checking: $URL/api/health"
RESP="$(curl -fsSL "$URL/api/health")"
echo "$RESP"

ACTUAL_SHA="$(echo "$RESP" | jq -r '.commitSha // .gitSha // "unknown"')"

if [ "$ACTUAL_SHA" = "unknown" ]; then
  echo "❌ commitSha is unknown. Health endpoint is not returning version info."
  exit 1
fi

if [ "$ACTUAL_SHA" != "$EXPECTED_SHA" ]; then
  echo "❌ Deploy mismatch! expected=$EXPECTED_SHA actual=$ACTUAL_SHA"
  exit 1
fi

echo "✅ Deploy verified. commitSha=$ACTUAL_SHA"
