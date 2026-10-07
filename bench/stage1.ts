// Stage 1 benchmark: LLM-researched ad stack (before) vs ads.txt analyzer + LLM scoring (after).
//
//   npm run bench:stage1           # from the repo root; reads OPENROUTER_API_KEY from agent/.env
//   RUNS=10 npm run bench:stage1   # timed runs per variant per broadcaster (default 5)
//   npm run bench:stage1:free      # free model, 5 broadcasters × 3 runs (fits the free daily limit)
//
// Both variants use the same model, system prompt and stage-0 research report, and run
// alternately so a slow period at the provider hits both equally. The first run per
// broadcaster is a warm-up and is discarded. Results go to bench/results.json.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { analyzeAdsTxt, type AdsTxtAnalysis } from "../src/lib/adsTxtAnalyzer";
import { generateBroadcasterReport } from "../src/lib/broadcasterReport";
import { callLLM, MODEL, parsePipelineJson, PIPELINE_SYSTEM_PROMPT } from "../src/lib/llm";
import { buildAdsTxtStage1Prompt, buildLlmStage1Prompt } from "../src/lib/stage1Prompts";

interface Broadcaster {
  name: string;
  domain: string;
}

type Variant = "llm" | "adsTxt";

interface Sample {
  variant: Variant;
  broadcaster: string;
  run: number;
  ms: number;
  adsTxtMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  ssps: string[];
}

interface VariantSummary {
  runs: number;
  p50Ms: number;
  p95Ms: number;
  meanTotalTokens: number;
  meanCompletionTokens: number;
}

interface AccuracyRow {
  broadcaster: string;
  truth: string[];
  llmGuesses: number;
  verifiableGuesses: number;
  correctGuesses: number;
  truthFound: number;
}

const BROADCASTERS: Broadcaster[] = [
  { name: "BBC", domain: "bbc.com" },
  { name: "Paramount", domain: "paramount.com" },
  { name: "Al Jazeera", domain: "aljazeera.com" },
  { name: "Channel 4", domain: "channel4.com" },
  { name: "RTL", domain: "rtl.de" },
  { name: "ProSieben", domain: "prosieben.de" },
  { name: "TF1", domain: "tf1.fr" },
  { name: "RTVE", domain: "rtve.es" },
  { name: "NBC", domain: "nbc.com" },
  { name: "Sky Sports", domain: "skysports.com" },
];

const RUNS = Number(process.env.RUNS ?? 5);
// Use the first N broadcasters (e.g. to fit a free model's daily request limit)
const SELECTED = BROADCASTERS.slice(0, Number(process.env.BROADCASTERS ?? BROADCASTERS.length));

// Maps the names an LLM tends to use onto the SSP names adsTxtAnalyzer reports
const SSP_ALIASES: Record<string, string[]> = {
  "Magnite": ["magnite", "rubicon"],
  "Xandr": ["xandr", "appnexus"],
  "PubMatic": ["pubmatic"],
  "Index Exchange": ["index exchange", "indexexchange", "ix"],
  "smartclip": ["smartclip"],
  "Google Ad Manager": ["google", "adx", "doubleclick", "dfp", "gam"],
  "Improvado": ["improvado"],
  "SpotX": ["spotx"],
  "OpenX": ["openx"],
  "Prebid": ["prebid"],
  "EMX Digital": ["emx"],
  "Contextual Media": ["contextweb", "pulsepoint"],
  "Tremor International": ["tremor"],
  "FreeWheel": ["freewheel"],
  "BrightRoll": ["brightroll"],
  "AOL Advertising": ["aol", "advertising.com"],
};

function canonicalSsp(llmName: string): string | undefined {
  const n = llmName.toLowerCase();
  for (const [canonical, aliases] of Object.entries(SSP_ALIASES)) {
    if (aliases.some((a) => (a.length <= 3 ? n.split(/\W+/).includes(a) : n.includes(a)))) return canonical;
  }
  return undefined;
}

// Free models share an upstream pool and often return 429; wait and retry. Each attempt
// re-runs the timed function, so waiting is never counted as latency.
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const rateLimited = err instanceof Error && err.message.includes("error 429");
      if (!rateLimited || attempt >= 8) throw err;
      const waitS = 15 * attempt;
      console.log(`  rate-limited, retrying in ${waitS}s`);
      await new Promise((r) => setTimeout(r, waitS * 1000));
    }
  }
}

function percentile(values: number[], q: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

async function runLlmVariant(b: Broadcaster, research: string): Promise<Omit<Sample, "broadcaster" | "run">> {
  const t0 = performance.now();
  const { content, usage } = await callLLM(PIPELINE_SYSTEM_PROMPT, buildLlmStage1Prompt(b.name, research));
  const parsed = parsePipelineJson(content);
  const ms = performance.now() - t0;
  const ssps = Array.isArray(parsed.currentSSPs) ? parsed.currentSSPs.map(String) : [];
  return { variant: "llm", ms, adsTxtMs: 0, ...usage, ssps };
}

async function runAdsTxtVariant(b: Broadcaster, research: string): Promise<Omit<Sample, "broadcaster" | "run">> {
  const t0 = performance.now();
  const analysis = await analyzeAdsTxt(b.domain);
  const adsTxtMs = performance.now() - t0;
  const prompt = analysis.fetched
    ? buildAdsTxtStage1Prompt(b.name, research, analysis)
    : buildLlmStage1Prompt(b.name, research);
  const { content, usage } = await callLLM(PIPELINE_SYSTEM_PROMPT, prompt);
  parsePipelineJson(content);
  const ms = performance.now() - t0;
  return { variant: "adsTxt", ms, adsTxtMs, ...usage, ssps: analysis.foundSSPs };
}

function summarize(samples: Sample[]): VariantSummary {
  return {
    runs: samples.length,
    p50Ms: Math.round(percentile(samples.map((s) => s.ms), 0.5)),
    p95Ms: Math.round(percentile(samples.map((s) => s.ms), 0.95)),
    meanTotalTokens: Math.round(mean(samples.map((s) => s.totalTokens))),
    meanCompletionTokens: Math.round(mean(samples.map((s) => s.completionTokens))),
  };
}

async function main(): Promise<void> {
  if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
    console.error("Set OPENROUTER_API_KEY in agent/.env, then run: npm run bench:stage1");
    process.exit(1);
  }

  const samples: Sample[] = [];
  const accuracy: AccuracyRow[] = [];
  const truthByBroadcaster: Record<string, AdsTxtAnalysis> = {};

  for (const b of SELECTED) {
    console.log(`\n${b.name} (${b.domain})`);
    const truth = await analyzeAdsTxt(b.domain);
    truthByBroadcaster[b.name] = truth;
    if (!truth.fetched) {
      console.log(`  skipped: ${truth.error}`);
      continue;
    }

    // Same stage-0 report for both variants, truncated exactly like Pipeline.tsx does
    const report = await withRetry(() => generateBroadcasterReport(b.name));
    const research = `\n\nBROADCASTER RESEARCH REPORT:\n${report.slice(0, 3000)}`;

    for (let run = 0; run <= RUNS; run++) {
      const order: Variant[] = run % 2 === 0 ? ["llm", "adsTxt"] : ["adsTxt", "llm"];
      for (const variant of order) {
        try {
          const s = await withRetry(() =>
            variant === "llm" ? runLlmVariant(b, research) : runAdsTxtVariant(b, research),
          );
          if (run === 0) continue; // warm-up
          samples.push({ ...s, broadcaster: b.name, run });
          console.log(`  run ${run} ${variant.padEnd(6)} ${Math.round(s.ms)} ms, ${s.totalTokens} tokens`);
        } catch (err) {
          console.log(`  run ${run} ${variant} failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    // SSP accuracy of the LLM's guesses, using ads.txt as ground truth. Skipped when ads.txt
    // lists none of the SSPs the analyzer knows, since every guess would then count as wrong.
    if (truth.foundSSPs.length === 0) continue;
    const truthSet = new Set(truth.foundSSPs);
    for (const s of samples.filter((x) => x.broadcaster === b.name && x.variant === "llm")) {
      const mapped = s.ssps.map(canonicalSsp).filter((x): x is string => x !== undefined);
      const mappedSet = new Set(mapped);
      accuracy.push({
        broadcaster: b.name,
        truth: truth.foundSSPs,
        llmGuesses: s.ssps.length,
        verifiableGuesses: mappedSet.size,
        correctGuesses: [...mappedSet].filter((x) => truthSet.has(x)).length,
        truthFound: [...truthSet].filter((x) => mappedSet.has(x)).length,
      });
    }
  }

  const llm = summarize(samples.filter((s) => s.variant === "llm"));
  const adsTxt = summarize(samples.filter((s) => s.variant === "adsTxt"));
  const adsTxtFetchP50 = Math.round(percentile(samples.filter((s) => s.variant === "adsTxt").map((s) => s.adsTxtMs), 0.5));
  const sum = (k: "llmGuesses" | "verifiableGuesses" | "correctGuesses" | "truthFound"): number =>
    accuracy.reduce((t, r) => t + r[k], 0);
  const precision = sum("verifiableGuesses") ? sum("correctGuesses") / sum("verifiableGuesses") : 0;
  const truthTotal = accuracy.reduce((t, r) => t + r.truth.length, 0);
  const sspRecall = truthTotal ? sum("truthFound") / truthTotal : 0;

  const summary = {
    model: MODEL,
    date: new Date().toISOString(),
    runsPerVariantPerBroadcaster: RUNS,
    broadcasters: SELECTED.filter((b) => truthByBroadcaster[b.name]?.fetched).map((b) => b.name),
    latency: {
      llm,
      adsTxt,
      adsTxtFetchP50Ms: adsTxtFetchP50,
      p50ReductionPct: Math.round(((llm.p50Ms - adsTxt.p50Ms) / llm.p50Ms) * 1000) / 10,
      p95ReductionPct: Math.round(((llm.p95Ms - adsTxt.p95Ms) / llm.p95Ms) * 1000) / 10,
    },
    tokens: {
      reductionPct: Math.round(((llm.meanTotalTokens - adsTxt.meanTotalTokens) / llm.meanTotalTokens) * 1000) / 10,
    },
    llmSspAccuracy: {
      precision: Math.round(precision * 1000) / 10,
      recall: Math.round(sspRecall * 1000) / 10,
      unverifiableGuesses: sum("llmGuesses") - sum("verifiableGuesses"),
    },
  };

  writeFileSync(join(process.cwd(), "bench", "results.json"), JSON.stringify({ summary, samples, accuracy }, null, 2));

  console.log("\n── Summary ──");
  console.log(`model ${MODEL}, ${RUNS} runs × ${summary.broadcasters.length} broadcasters per variant`);
  console.log(`LLM ad stack      p50 ${llm.p50Ms} ms  p95 ${llm.p95Ms} ms  ${llm.meanTotalTokens} tokens`);
  console.log(`ads.txt + scoring p50 ${adsTxt.p50Ms} ms  p95 ${adsTxt.p95Ms} ms  ${adsTxt.meanTotalTokens} tokens (ads.txt fetch p50 ${adsTxtFetchP50} ms)`);
  console.log(`latency  p50 −${summary.latency.p50ReductionPct}%  p95 −${summary.latency.p95ReductionPct}%`);
  console.log(`tokens   −${summary.tokens.reductionPct}%`);
  console.log(`LLM SSP guesses vs ads.txt: precision ${summary.llmSspAccuracy.precision}%, recall ${summary.llmSspAccuracy.recall}%`);
  console.log("Full results: bench/results.json");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
