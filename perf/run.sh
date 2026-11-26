#!/usr/bin/env bash
# Runs one JMeter profile against an already running production server and
# builds the HTML report. See perf/PLAN.md.
#
#   perf/run.sh performance|load|stress
#
# Before: `pnpm db:start`, `pnpm db:seed:demo`, `pnpm build`, then in another
# terminal `PAYMENTS_MOCK=1 pnpm start`. Override host/port with
# HOST=... PORT=... perf/run.sh load
set -euo pipefail

profile="${1:?usage: perf/run.sh performance|load|stress}"
cd "$(dirname "$0")/.."
props="perf/profiles/${profile}.properties"
[[ -f "$props" ]] || { echo "no profile: $props" >&2; exit 1; }

host="${HOST:-localhost}"
port="${PORT:-3000}"
jmeter="${JMETER:-$(command -v jmeter || echo /opt/jmeter/bin/jmeter)}"

if ! curl -fsS -o /dev/null "http://${host}:${port}/"; then
  echo "Nothing answers on http://${host}:${port}/ — start the production server first." >&2
  exit 1
fi

# Fresh sessions: local Supabase sessions last one hour.
node perf/scripts/make-session.mjs

out="perf/results/${profile}-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$out"

# JMeter shares the machine with Next.js and Supabase: keep its heap small.
HEAP="${JMETER_HEAP:--Xms256m -Xmx768m}" "$jmeter" -n \
  -t perf/roadready.jmx \
  -q "$props" \
  -Jhost="$host" -Jport="$port" \
  -Jjmeter.save.saveservice.output_format=csv \
  -l "$out/results.jtl" \
  -j "$out/jmeter.log" \
  -e -o "$out/report"

node perf/scripts/summarize.mjs "$out" | tee "$out/summary.md"
echo
echo "HTML report: $out/report/index.html"
