#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Ontor domain cutover:  healthos.live  →  ontor.ai
#
# Run this ONLY when BOTH are true:
#   1. ontor.ai DNS points at GitHub Pages (see scripts/DOMAIN-CUTOVER.md)
#      and GitHub Pages custom domain = ontor.ai (cert issued / green check).
#   2. ontor.ai email is set up (so hello@/sabber@ontor.ai actually receive).
#
# Usage (from the healthos-frontend/ root):
#   bash scripts/domain-cutover.sh
#   git diff          # review
#   git add -A && git commit -m "Domain cutover: healthos.live → ontor.ai" && git push
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")/.."

OLD="healthos.live"
NEW="ontor.ai"

echo "→ Replacing '$OLD' with '$NEW' across source + CNAME…"

# Every reference: metadataBase, OG urls, canonical, sitemap BASE_URL, llms.txt
# BASE_URL, blog structured-data urls, robots.txt sitemap, email addresses,
# footer text, and public/CNAME (the GitHub Pages custom-domain file).
FILES=$( { grep -rl "$OLD" app lib content public \
            --include=*.tsx --include=*.ts --include=*.md --include=*.txt 2>/dev/null || true; \
          [ -f public/CNAME ] && echo public/CNAME; } | sort -u )

if [ -z "$FILES" ]; then
  echo "Nothing to change — no '$OLD' references found. Already cut over?"
  exit 0
fi

echo "$FILES" | sed 's/^/   /'

# perl -pi is identical on macOS + Linux (no sed -i portability headache)
echo "$FILES" | while IFS= read -r f; do
  perl -pi -e "s/\Qhealthos.live\E/ontor.ai/g" "$f"
done

REMAIN=$(grep -rc "$OLD" app lib content public 2>/dev/null | awk -F: '{s+=$2} END{print s+0}')
echo "→ Done. Remaining '$OLD' references: $REMAIN (should be 0)."
echo "→ CNAME now: $(cat public/CNAME 2>/dev/null)"
echo ""
echo "Next: review 'git diff', rebuild ('npm run build'), then commit + push."
echo "Don't forget: add 301 redirects from healthos.live → ontor.ai (see DOMAIN-CUTOVER.md)."
