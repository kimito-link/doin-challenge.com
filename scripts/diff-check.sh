#!/usr/bin/env bash
set -euo pipefail

# ==========
# diff-check.sh
# - PR / push どちらでも動く
# - 変更ファイルから「影響領域」を分類して GITHUB_OUTPUT に出す
# - Gate1用途: "壊しやすい領域" を検知してチェックリスト必須化に使う
# ==========

BASE_SHA="${1:-}"
HEAD_SHA="${2:-}"

if [[ -z "${HEAD_SHA}" ]]; then
  HEAD_SHA="$(git rev-parse HEAD)"
fi

if [[ -z "${BASE_SHA}" ]]; then
  # PRの場合: base を取りたいが、ローカル実行もあるので保険
  # GitHub Actions では GITHUB_BASE_REF が入るケースあり
  if [[ -n "${GITHUB_BASE_REF:-}" ]]; then
    git fetch origin "${GITHUB_BASE_REF}" --depth=1 >/dev/null 2>&1 || true
    BASE_SHA="$(git rev-parse "origin/${GITHUB_BASE_REF}" 2>/dev/null || true)"
  fi
fi

if [[ -z "${BASE_SHA}" ]]; then
  # pushの場合: 1個前
  BASE_SHA="$(git rev-parse HEAD~1 2>/dev/null || echo "")"
fi

if [[ -z "${BASE_SHA}" ]]; then
  echo "BASE_SHA not found; assuming first commit."
  BASE_SHA="${HEAD_SHA}"
fi

echo "BASE_SHA=${BASE_SHA}"
echo "HEAD_SHA=${HEAD_SHA}"

CHANGED_FILES="$(git diff --name-only "${BASE_SHA}" "${HEAD_SHA}" || true)"
echo "Changed files:"
echo "${CHANGED_FILES}"

# ---- 分類ルール（必要に応じて増やす）
touch_api=false
touch_auth=false
touch_db=false
touch_ui=false
touch_deploy=false
touch_env=false
touch_health=false
touch_workflow=false

while IFS= read -r f; do
  [[ -z "${f}" ]] && continue

  # backend / api
  if [[ "${f}" =~ ^server/ ]] || [[ "${f}" =~ ^src/server/ ]] || [[ "${f}" =~ ^apps/api/ ]] || [[ "${f}" =~ ^packages/server/ ]]; then
    touch_api=true
  fi

  # auth / oauth（壊れやすい）
  if [[ "${f}" =~ oauth ]] || [[ "${f}" =~ auth ]] || [[ "${f}" =~ callback ]] || [[ "${f}" =~ session ]] || [[ "${f}" =~ login ]]; then
    touch_auth=true
  fi

  # db / schema / migration
  if [[ "${f}" =~ drizzle ]] || [[ "${f}" =~ schema ]] || [[ "${f}" =~ migration ]] || [[ "${f}" =~ db/ ]]; then
    touch_db=true
  fi

  # ui / components
  if [[ "${f}" =~ ^app/ ]] || [[ "${f}" =~ ^components/ ]] || [[ "${f}" =~ \.tsx$ ]] || [[ "${f}" =~ \.css$ ]]; then
    touch_ui=true
  fi

  # deploy / routing
  if [[ "${f}" == "vercel.json" ]] || [[ "${f}" == "railway.json" ]] || [[ "${f}" =~ vercel ]] || [[ "${f}" =~ railway ]] || [[ "${f}" =~ deploy ]]; then
    touch_deploy=true
  fi

  # env / secrets-ish
  if [[ "${f}" =~ \.env ]] || [[ "${f}" =~ app\.config ]] || [[ "${f}" =~ environment ]] || [[ "${f}" =~ secrets ]]; then
    touch_env=true
  fi

  # health endpoint / build-info
  if [[ "${f}" =~ health ]] || [[ "${f}" =~ build-info ]] || [[ "${f}" =~ /api/health ]]; then
    touch_health=true
  fi

  # workflows
  if [[ "${f}" =~ ^\.github/workflows/ ]]; then
    touch_workflow=true
  fi

done <<< "${CHANGED_FILES}"

# "Gate1的に危険"（ここだけは必ず手当てしたい）
# auth / deploy / env / db / health は事故りやすい
sensitive=false
if [[ "${touch_auth}" == true || "${touch_deploy}" == true || "${touch_env}" == true || "${touch_db}" == true || "${touch_health}" == true ]]; then
  sensitive=true
fi

# ---- outputs
{
  echo "baseSha=${BASE_SHA}"
  echo "headSha=${HEAD_SHA}"
  echo "touch_api=${touch_api}"
  echo "touch_auth=${touch_auth}"
  echo "touch_db=${touch_db}"
  echo "touch_ui=${touch_ui}"
  echo "touch_deploy=${touch_deploy}"
  echo "touch_env=${touch_env}"
  echo "touch_health=${touch_health}"
  echo "touch_workflow=${touch_workflow}"
  echo "sensitive=${sensitive}"
} | tee -a "${GITHUB_OUTPUT:-/dev/null}"
