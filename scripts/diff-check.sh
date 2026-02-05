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
touch_routing=false
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

  # routing / redirect / proxy（Gate 1 汎用テンプレート: 危険な変更6つ目）
  if [[ "${f}" =~ middleware ]] || [[ "${f}" =~ router ]] || [[ "${f}" =~ redirect ]] || [[ "${f}" =~ proxy ]]; then
    touch_routing=true
  fi

  # workflows
  if [[ "${f}" =~ ^\.github/workflows/ ]]; then
    touch_workflow=true
  fi

done <<< "${CHANGED_FILES}"

# "Gate1的に危険"（危険ファイルを触ったら CI で fail）
sensitive=false
if [[ "${touch_auth}" == true || "${touch_deploy}" == true || "${touch_env}" == true || "${touch_db}" == true || "${touch_health}" == true || "${touch_routing}" == true ]]; then
  sensitive=true
fi

# ---- outputs（先に出す。fail 時も他ジョブで参照できるよう）
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
  echo "touch_routing=${touch_routing}"
  echo "touch_workflow=${touch_workflow}"
  echo "sensitive=${sensitive}"
} | tee -a "${GITHUB_OUTPUT:-/dev/null}"

# 禁止ワード検知（コミットメッセージのみ。コード内の「成功しました」等は許可）
FORBIDDEN_WORDS="成功|保証|必ず|確実|売れる"
COMMIT_MSGS="$(git log --format=%B "${BASE_SHA}".."${HEAD_SHA}" 2>/dev/null || true)"
if echo "${COMMIT_MSGS}" | grep -qE "${FORBIDDEN_WORDS}"; then
  echo "❌ コミットメッセージに禁止ワードを検知しました: ${FORBIDDEN_WORDS}"
  echo "該当コミット:"
  git log --oneline "${BASE_SHA}".."${HEAD_SHA}" 2>/dev/null || true
  exit 1
fi

# 危険ファイルを触ったら fail（Gate 1 で止める）
if [[ "${sensitive}" == true ]]; then
  echo "❌ 危険な変更が検知されました（oauth/auth/vercel.json/env/schema/health/routing 等）。PRテンプレの必須アクションを実施してください。"
  exit 1
fi

# ---- ローカル実行時用サマリー（CIでは GITHUB_OUTPUT にだけ書く）
if [[ -z "${GITHUB_OUTPUT:-}" ]] || [[ "${GITHUB_OUTPUT}" == "/dev/null" ]]; then
  echo ""
  echo "--- diff-check サマリー ---"
  echo "  touch_api:      ${touch_api}"
  echo "  touch_auth:     ${touch_auth}"
  echo "  touch_db:       ${touch_db}"
  echo "  touch_ui:       ${touch_ui}"
  echo "  touch_deploy:   ${touch_deploy}"
  echo "  touch_env:      ${touch_env}"
  echo "  touch_health:   ${touch_health}"
  echo "  touch_routing:  ${touch_routing}"
  echo "  touch_workflow: ${touch_workflow}"
  echo "  sensitive:      ${sensitive}"
  if [[ "${sensitive}" == "true" ]]; then
    echo ""
    echo "⚠️  危険な変更が検知されました。PRテンプレートの Gate 1 必須アクションを実施してください。"
  fi
fi
