#!/usr/bin/env bash
# Merge gate: fast-forwards the integration branch to the current branch, but only after the
# full check passes on exactly this commit. Run it from the ticket's worktree.
#   scripts/merge-ticket.sh [integration-branch]   (default: foundation)
set -euo pipefail
integration="${1:-foundation}"
branch="$(git rev-parse --abbrev-ref HEAD)"
head="$(git rev-parse HEAD)"
base="$(git rev-parse "refs/heads/$integration")"

if [ -n "$(git status --porcelain)" ]; then
  echo "merge-ticket: commit or discard your changes first" >&2; exit 1
fi
if ! git merge-base --is-ancestor "$base" "$head"; then
  echo "merge-ticket: $branch does not contain the $integration tip; run 'git merge $integration' first" >&2; exit 1
fi
if [ "$base" = "$head" ]; then
  echo "merge-ticket: $branch has nothing new for $integration"; exit 0
fi

bash "$(dirname "$0")/with-stack-lock.sh" 'pnpm db:reset && pnpm check'

# The third argument makes update-ref refuse if the integration branch moved during the check.
git update-ref "refs/heads/$integration" "$head" "$base"
echo "merge-ticket: $integration is now at $(git rev-parse --short "$head") ($branch)"
