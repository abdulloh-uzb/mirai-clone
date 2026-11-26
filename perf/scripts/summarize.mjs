// Turns a JMeter HTML report's statistics.json into Markdown tables for README.md.
//
//   node perf/scripts/summarize.mjs perf/results/load-20261127-101500

import { readFileSync } from "node:fs";
import { basename } from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("usage: summarize.mjs <results dir>");
const stats = JSON.parse(readFileSync(`${dir}/report/statistics.json`, "utf8"));

const ms = (n) => `${Math.round(n)}`;
const pct = (n) => `${n.toFixed(2)}%`;
const row = (name, s) =>
  `| ${name} | ${s.sampleCount} | ${ms(s.meanResTime)} | ${ms(s.pct1ResTime)} | ${ms(s.pct2ResTime)} | ${ms(s.pct3ResTime)} | ${ms(s.maxResTime)} | ${s.throughput.toFixed(1)} | ${pct(s.errorPct)} |`;

const { Total: total, ...pages } = stats;
const lines = [
  `### ${basename(dir)}`,
  "",
  "| Request | Samples | Mean ms | p90 ms | p95 ms | p99 ms | Max ms | Req/s | Errors |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...Object.keys(pages)
    .sort()
    .map((k) => row(k, pages[k])),
  row("**Total**", total),
];
console.log(lines.join("\n"));
