#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${PROJECT_DIR}/dist"
DEPLOY_DIR="${DTSKR_FRONTEND_DEPLOY_DIR:-/var/www/digivolutionlab}"
SITE_URL="${DTSKR_FRONTEND_URL:-https://digivolutionlab.com/}"

fail() {
  echo "ERROR: $1" >&2
  exit 1
}

command -v npm >/dev/null 2>&1 || fail "npm is not installed."
command -v rsync >/dev/null 2>&1 || fail "rsync is not installed."
command -v curl >/dev/null 2>&1 || fail "curl is not installed."
command -v realpath >/dev/null 2>&1 || fail "realpath is not installed."

RESOLVED_DEPLOY_DIR="$(realpath -m -- "${DEPLOY_DIR}")"
if [[ "${RESOLVED_DEPLOY_DIR}" != /var/www/* || "${RESOLVED_DEPLOY_DIR}" == "/var/www" ]]; then
  fail "Deployment directory must be a child of /var/www: ${RESOLVED_DEPLOY_DIR}"
fi

cd "${PROJECT_DIR}"

echo "Installing locked frontend dependencies..."
npm ci

echo "Running lint and production build..."
npm run lint
npm run build

[[ -f "${DIST_DIR}/index.html" ]] || fail "Build output is missing: ${DIST_DIR}/index.html"

echo "Deploying dist/ to ${RESOLVED_DEPLOY_DIR}..."
sudo -v
sudo mkdir -p -- "${RESOLVED_DEPLOY_DIR}"
sudo rsync --archive --delete --delay-updates "${DIST_DIR}/" "${RESOLVED_DEPLOY_DIR}/"

for attempt in {1..5}; do
  if curl --silent --show-error --fail --max-time 10 \
      --header "Cache-Control: no-cache" \
      "${SITE_URL}?deploy-check=$(date +%s)" >/dev/null; then
    echo "Frontend deployment completed: ${SITE_URL}"
    exit 0
  fi
  echo "Waiting for frontend check (${attempt}/5)..."
  sleep 2
done

fail "The deployed site did not respond successfully: ${SITE_URL}"
