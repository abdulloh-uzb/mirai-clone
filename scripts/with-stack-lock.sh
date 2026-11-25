#!/usr/bin/env bash
# Runs a command while holding the lock on the one shared local Supabase stack (and port 3000).
# Every worktree uses the same stack, so DB resets, DB tests, Playwright and `pnpm check` take this lock.
# See docs/adr/0002-one-shared-local-stack.md. Override the path with ROADREADY_STACK_LOCK.
set -euo pipefail
lock="${ROADREADY_STACK_LOCK:-/tmp/claude-$(id -u)/roadready-stack.lock}"
mkdir -p "$(dirname "$lock")"
exec flock "$lock" bash -c "$*"
