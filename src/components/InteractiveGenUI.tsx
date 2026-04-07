"use client";

import { useState } from "react";
import {
  CheckCircle2, Loader, ChevronDown, ChevronUp, ArrowRight,
  Shield, Zap, Users, TrendingUp, Radio, Globe, AlertTriangle,
} from "lucide-react";

// ─── Chain helper (v1 compatible — no useCopilotChat needed) ─────────────────
// Finds the CopilotKit textarea and simulates typing + submit
function useChainAction() {
  return (text: string) => {
    const textarea = document.querySelector(
      'textarea[placeholder*="essage"]'
    ) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, "value"
    )?.set;
    setter?.call(textarea, text);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    setTimeout(() => {
      const form = textarea.closest("form");
      if (form) {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      } else {
        textarea.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
        );
      }
    }, 100);
  };
}

type Status = "executing" | "complete" | "inProgress";

// ─── 1. BroadcasterCard ──────────────────────────────────────────────────────

interface BroadcasterCardProps {
  status: Status;
  args: { broadcaster_name?: string };
  result?: string;
}

export function BroadcasterCard({ status, args, result }: BroadcasterCardProps) {
  const name = args.broadcaster_name ?? "Broadcaster";
  const chain = useChainAction();
  const [tab, setTab] = useState<"overview" | "tech" | "risk">("overview");
  const [expanded, setExpanded] = useState(false);

  if (status === "executing") {
    return (
      <div className="rounded-xl border border-white/20 bg-white/5 p-4 my-2 space-y-3">
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
          <span className="text-sm">Analyzing {name}...</span>
        </div>
        <div className="grid grid-cols-2 gap-2 animate-pulse">
          {[1,2,3,4].map((i) => <div key={i} className="h-10 rounded-lg bg-white/10" />)}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Overview",   icon: Globe  },
    { id: "tech"     as const, label: "Tech Stack", icon: Zap    },
    { id: "risk"     as const, label: "Risk",       icon: Shield },
  ];

  return (
    <div className="rounded-xl border border-white/20 bg-white/5 overflow-hidden my-2">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
        <span className="text-white font-semibold text-sm">{name}</span>
        <span className="ml-auto text-xs text-white/40">Analysis ready</span>
      </div>

      <div className="flex gap-1 p-2 border-b border-white/10 bg-black/20">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === id ? "bg-purple-600 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/10"
            }`}>
            <Icon className="w-3 h-3" />{label}
          </button>
        ))}
      </div>

      <div className="p-3">
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Radio,      label: "Ad Server", value: "Google DFP"  },
              { icon: Globe,      label: "Coverage",  value: "100M+ reach" },
              { icon: Users,      label: "Audience",  value: "18–54 demo"  },
              { icon: TrendingUp, label: "Revenue",   value: "$80–150M"    },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/10 rounded-lg p-2.5 flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-white/40 text-[10px] uppercase tracking-wide">{label}</div>
                  <div className="text-white text-xs font-medium">{value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "tech" && (
          <div className="space-y-1.5">
            {[
              { ok: true,  label: "VAST 4.0 compatible"             },
              { ok: true,  label: "Header bidding enabled"           },
              { ok: true,  label: "SSPs: Rubicon, OpenX, Index Exch" },
              { ok: false, label: "Legacy SDK requires update"       },
              { ok: true,  label: "GDPR consent framework"           },
            ].map(({ ok, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className={ok ? "text-green-400" : "text-yellow-400"}>{ok ? "✓" : "⚠"}</span>
                <span className={ok ? "text-white/70" : "text-yellow-300/70"}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "risk" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">Medium risk</span>
              <div className="ml-auto flex gap-1">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className={`w-4 h-1.5 rounded-full ${i <= 3 ? "bg-yellow-400" : "bg-white/20"}`} />
                ))}
              </div>
            </div>
            <div className="text-xs text-white/50 space-y-1">
              <p>• SDK migration estimated 2–3 weeks</p>
              <p>• Existing DFP integration is compatible</p>
              <p>• No contractual blockers identified</p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-2 border-t border-white/10 pt-2">
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors">
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Raw data
            </button>
            {expanded && (
              <pre className="mt-1 text-[10px] text-white/30 font-mono whitespace-pre-wrap">{result}</pre>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 p-2 border-t border-white/10 bg-black/20">
        {[
          { label: "Compare", prompt: `Compare ${name} with its top 2 competitors` },
          { label: "ads.txt", prompt: `Fetch the ads.txt for ${name}`               },
          { label: "Metrics", prompt: `Generate metrics for ${name}`                },
        ].map(({ label, prompt }) => (
          <button key={label} onClick={() => chain(prompt)}
            className="py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center justify-center gap-1">
            {label} <ArrowRight className="w-3 h-3" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 2. CompareCard ──────────────────────────────────────────────────────────

interface CompareCardProps {
  status: Status;
  args: { broadcasters?: string[] };
}

type SortKey = "revenue" | "audience" | "score" | "risk";

const MOCK: Record<string, { name: string; revenue: number; audience: number; score: number; risk: number }> = {
  BBC:       { name: "BBC",       revenue: 145, audience: 18, score: 82, risk: 2 },
  Sky:       { name: "Sky",       revenue: 120, audience: 15, score: 76, risk: 3 },
  TF1:       { name: "TF1",       revenue: 96,  audience: 8,  score: 70, risk: 2 },
  Paramount: { name: "Paramount", revenue: 142, audience: 18, score: 79, risk: 3 },
  ITV:       { name: "ITV",       revenue: 85,  audience: 10, score: 68, risk: 3 },
};

export function CompareCard({ status, args }: CompareCardProps) {
  const chain = useChainAction();
  const broadcasters = Array.isArray(args.broadcasters) ? args.broadcasters : [];
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);

  if (status === "executing") {
    return (
      <div className="rounded-xl border border-white/20 bg-white/5 p-4 my-2">
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-sm">Comparing {broadcasters.join(" · ")}...</span>
        </div>
      </div>
    );
  }

  const data = broadcasters
    .map((b) => MOCK[b] ?? { name: b, revenue: 80, audience: 7, score: 65, risk: 3 })
    .sort((a, b) => sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const cols: { key: SortKey; label: string }[] = [
    { key: "revenue",  label: "Revenue"  },
    { key: "audience", label: "Audience" },
    { key: "score",    label: "Score"    },
    { key: "risk",     label: "Risk"     },
  ];

  return (
    <div className="rounded-xl border border-white/20 bg-white/5 overflow-hidden my-2">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-white font-semibold text-sm">{broadcasters.join(" vs ")}</span>
        <span className="ml-auto text-xs text-white/30">click headers to sort</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-black/20">
              <th className="text-left px-4 py-2 text-white/40 font-normal">Broadcaster</th>
              {cols.map(({ key, label }) => (
                <th key={key} onClick={() => toggleSort(key)}
                  className={`px-3 py-2 text-right font-normal cursor-pointer select-none transition-colors ${
                    sortKey === key ? "text-purple-400" : "text-white/40 hover:text-white/70"
                  }`}>
                  {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.name} className={`border-b border-white/5 ${i === 0 ? "bg-purple-500/10" : ""}`}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="text-yellow-400 text-[10px]">★</span>}
                    <span className="text-white font-medium">{row.name}</span>
                  </div>
                  <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden w-20">
                    <div className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(row.revenue / maxRevenue) * 100}%` }} />
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text-white/70">${row.revenue}M</td>
                <td className="px-3 py-2.5 text-right text-white/70">{row.audience}M</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`font-semibold ${row.score >= 80 ? "text-green-400" : row.score >= 70 ? "text-yellow-400" : "text-white/60"}`}>
                    {row.score}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex justify-end gap-0.5">
                    {[1,2,3,4,5].map((d) => (
                      <div key={d} className={`w-2 h-2 rounded-full ${d <= row.risk ? "bg-yellow-400" : "bg-white/15"}`} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-2 border-t border-white/10 bg-black/20 flex gap-1">
        <button onClick={() => chain(`Deep dive on ${data[0]?.name}`)}
          className="flex-1 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-center">
          Deep dive #{1} →
        </button>
        <button onClick={() => chain(`Analyze compatibility for ${broadcasters.join(", ")}`)}
          className="flex-1 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-center">
          Full compatibility →
        </button>
      </div>
    </div>
  );
}

// ─── 3. AdsTxtCard ───────────────────────────────────────────────────────────

interface AdsTxtCardProps {
  status: Status;
  args: { broadcaster?: string };
}

const MOCK_ADS_TXT = [
  { seller: "Rubicon Project", id: "0001",      type: "DIRECT",   authorized: true  },
  { seller: "Index Exchange",  id: "185960",    type: "DIRECT",   authorized: true  },
  { seller: "OpenX",           id: "537143344", type: "RESELLER", authorized: true  },
  { seller: "Xandr",           id: "928572",    type: "RESELLER", authorized: true  },
  { seller: "FreeWheel",       id: "22006",     type: "DIRECT",   authorized: true  },
  { seller: "Smartadserver",   id: "4038",      type: "RESELLER", authorized: false },
];

export function AdsTxtCard({ status, args }: AdsTxtCardProps) {
  const chain = useChainAction();
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "DIRECT" | "RESELLER">("ALL");

  if (status === "executing") {
    return (
      <div className="rounded-xl border border-white/20 bg-white/5 p-4 my-2">
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping" />
          <span className="text-sm">Fetching ads.txt for {args.broadcaster}...</span>
        </div>
      </div>
    );
  }

  const filtered = MOCK_ADS_TXT.filter((e) => filter === "ALL" || e.type === filter);
  const visible = showAll ? filtered : filtered.slice(0, 3);

  return (
    <div className="rounded-xl border border-white/20 bg-white/5 overflow-hidden my-2">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-white font-semibold text-sm">ads.txt — {args.broadcaster}</span>
        <span className="ml-auto bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full">
          {MOCK_ADS_TXT.filter((e) => e.authorized).length} verified
        </span>
      </div>

      <div className="flex gap-1 p-2 bg-black/20 border-b border-white/10">
        {(["ALL", "DIRECT", "RESELLER"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              filter === f ? "bg-purple-600 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/10"
            }`}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-white/30 self-center pr-1">{filtered.length} entries</span>
      </div>

      <div className="p-2 space-y-1">
        {visible.map((entry) => (
          <div key={entry.seller} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 font-mono text-xs">
            <span className={entry.authorized ? "text-green-400" : "text-red-400"}>
              {entry.authorized ? "✓" : "✗"}
            </span>
            <span className="text-white/80 flex-1">{entry.seller}</span>
            <span className="text-white/30">{entry.id}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              entry.type === "DIRECT" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"
            }`}>{entry.type}</span>
          </div>
        ))}
        {filtered.length > 3 && (
          <button onClick={() => setShowAll(!showAll)}
            className="w-full py-1.5 text-xs text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-1">
            {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showAll ? "Show less" : `Show ${filtered.length - 3} more`}
          </button>
        )}
      </div>

      <div className="p-2 border-t border-white/10 bg-black/20">
        <button onClick={() => chain(`Analyze compatibility of ${args.broadcaster} based on their SSP partners`)}
          className="w-full py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center justify-center gap-1">
          Analyze compatibility <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── 4. CompatibilityCard ────────────────────────────────────────────────────

interface CompatibilityCardProps {
  status: Status;
  args: { broadcaster?: string };
  result?: string;
}

export function CompatibilityCard({ status, args, result }: CompatibilityCardProps) {
  const chain = useChainAction();
  const [showDetails, setShowDetails] = useState(false);

  if (status === "executing") {
    return (
      <div className="rounded-xl border border-white/20 bg-white/5 p-4 my-2">
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
          <span className="text-sm">Analyzing {args.broadcaster} compatibility...</span>
        </div>
      </div>
    );
  }

  const scoreMatch = result?.match(/Score[:\s]+(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 78;
  const scoreColor = score >= 80 ? "text-green-400" : score >= 65 ? "text-yellow-400" : "text-red-400";
  const barColor   = score >= 80 ? "bg-green-500"   : score >= 65 ? "bg-yellow-500"   : "bg-red-500";

  const dimensions = [
    { label: "VAST compatibility", value: 92 },
    { label: "Header bidding",     value: 85 },
    { label: "SDK readiness",      value: 55 },
    { label: "Data compliance",    value: 80 },
  ];

  return (
    <div className="rounded-xl border border-white/20 bg-white/5 overflow-hidden my-2">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-white font-semibold text-sm">{args.broadcaster} — Compatibility</span>
      </div>

      <div className="p-4">
        <div className="flex items-end gap-3 mb-4">
          <span className={`text-5xl font-bold tabular-nums ${scoreColor}`}>{score}</span>
          <span className="text-white/30 text-lg mb-1">/100</span>
          <div className="ml-auto text-right">
            <div className="text-xs text-white/40">Risk level</div>
            <div className="text-sm font-semibold text-yellow-400">Medium</div>
          </div>
        </div>

        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <div className={`h-full ${barColor} rounded-full transition-all duration-700`}
            style={{ width: `${score}%` }} />
        </div>

        <button onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors mb-2">
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showDetails ? "Hide breakdown" : "Show breakdown"}
        </button>

        {showDetails && (
          <div className="space-y-2">
            {dimensions.map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">{label}</span>
                  <span className={value >= 80 ? "text-green-400" : value >= 60 ? "text-yellow-400" : "text-red-400"}>
                    {value}%
                  </span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
            <span className="text-white/40">Est. timeline</span>
            <span className="text-white font-medium">3 weeks</span>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
            <span className="text-white/40">Priority</span>
            <span className="text-yellow-400 font-medium">High</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 p-2 border-t border-white/10 bg-black/20">
        <button onClick={() => chain(`Draft outreach for ${args.broadcaster}, score ${score}/100`)}
          className="py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center justify-center gap-1">
          Draft outreach <ArrowRight className="w-3 h-3" />
        </button>
        <button onClick={() => chain(`Generate metrics for ${args.broadcaster}`)}
          className="py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center justify-center gap-1">
          Performance data <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── 5. MetricsCard ──────────────────────────────────────────────────────────

interface MetricsCardProps {
  status: Status;
  args: { broadcaster?: string };
}

export function MetricsCard({ status, args }: MetricsCardProps) {
  const chain = useChainAction();
  const [period, setPeriod] = useState<"1M" | "3M" | "12M">("3M");

  if (status === "executing") {
    return (
      <div className="rounded-xl border border-white/20 bg-white/5 p-4 my-2">
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
          <span className="text-sm">Loading metrics for {args.broadcaster}...</span>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Monthly Users", value: "12.5M",   delta: "+8%",  positive: true  },
    { label: "CPM Range",     value: "$8–35",   delta: "+12%", positive: true  },
    { label: "Fill Rate",     value: "96%",     delta: "-1%",  positive: false },
    { label: "Ad Revenue",    value: "$85M/yr", delta: "+23%", positive: true  },
  ];

  const sparkData: Record<string, number[]> = {
    "1M":  [60, 65, 70, 68, 75, 78, 80],
    "3M":  [40, 45, 55, 50, 60, 70, 68, 75, 80, 78, 82, 85],
    "12M": [20,25,30,28,35,40,42,38,45,50,60,70,75,80,85,82,88,90,85,88,92,90,95,100],
  };

  const points = sparkData[period];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const toY = (v: number) => 40 - ((v - min) / (max - min || 1)) * 36;
  const pathD = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * 180} ${toY(v)}`)
    .join(" ");

  return (
    <div className="rounded-xl border border-white/20 bg-white/5 overflow-hidden my-2">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-white font-semibold text-sm">{args.broadcaster} — Performance</span>
        <div className="ml-auto flex gap-1">
          {(["1M", "3M", "12M"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                period === p ? "bg-purple-600 text-white" : "text-white/40 hover:text-white/70"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-1">
        <svg viewBox="0 0 180 44" className="w-full h-12" preserveAspectRatio="none">
          <defs>
            <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${pathD} L 180 44 L 0 44 Z`} fill="url(#spark-fill)" />
          <path d={pathD} fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-3">
        {metrics.map(({ label, value, delta, positive }) => (
          <div key={label} className="bg-white/10 rounded-lg p-2.5">
            <div className="text-white/40 text-[10px] uppercase tracking-wide mb-1">{label}</div>
            <div className="text-white font-semibold text-sm">{value}</div>
            <div className={`text-[10px] font-medium ${positive ? "text-green-400" : "text-red-400"}`}>
              {delta} vs last period
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-white/10 bg-black/20">
        <button onClick={() => chain(`Recommended outreach angle for ${args.broadcaster} based on their metrics?`)}
          className="w-full py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center justify-center gap-1">
          Generate outreach angle <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── 6. OutreachApprovalCard ─────────────────────────────────────────────────

interface OutreachApprovalCardProps {
  status: Status;
  args: { broadcaster?: string; contact_name?: string; draft_subject?: string; draft_body?: string };
  handler?: (result: string) => void;
}

export function OutreachApprovalCard({ status, args, handler }: OutreachApprovalCardProps) {
  const [subject, setSubject] = useState(args.draft_subject ?? "Partnership opportunity");
  const [body, setBody] = useState(
    args.draft_body ?? `Hi ${args.contact_name ?? "there"},\n\nI wanted to reach out regarding a potential programmatic partnership...\n\nBest regards`
  );
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    handler?.(JSON.stringify({ approved: true, subject, body }));
  };

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 overflow-hidden my-2">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-500/20">
        <div className="w-2 h-2 rounded-full bg-purple-400" />
        <span className="text-white font-semibold text-sm">
          Review outreach to {args.contact_name ?? args.broadcaster}
        </span>
        <span className="ml-auto text-xs text-white/30">Edit before sending</span>
      </div>

      <div className="p-3 space-y-2">
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wide block mb-1">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white/10 text-white text-xs rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:border-purple-500/50 transition-all" />
        </div>
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wide block mb-1">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6}
            className="w-full bg-white/10 text-white text-xs rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:border-purple-500/50 transition-all resize-none leading-relaxed" />
        </div>
        <div className="text-right text-[10px] text-white/20">{body.length} chars</div>
      </div>

      {status === "executing" && (
        <div className="flex gap-2 p-3 border-t border-purple-500/20 bg-black/20">
          <button onClick={() => handler?.("REJECTED")}
            className="flex-1 py-2 border border-white/20 rounded-lg text-white/60 text-sm hover:bg-white/10 transition-all">
            Discard
          </button>
          <button onClick={() => handler?.(JSON.stringify({ approved: true, subject, body: "SAVE_ONLY" }))}
            className="flex-1 py-2 border border-purple-500/40 rounded-lg text-purple-300 text-sm hover:bg-purple-500/10 transition-all">
            Save draft
          </button>
          <button onClick={handleSend} disabled={sending}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-lg text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5">
            {sending ? <Loader className="w-3.5 h-3.5 animate-spin" /> : "Send ✓"}
          </button>
        </div>
      )}

      {status === "complete" && (
        <div className="p-3 border-t border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2 text-green-400 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Email processed
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 7. DeleteConfirmCard ────────────────────────────────────────────────────

interface Resource {
  url: string;
  title?: string;
  description?: string;
}

interface DeleteConfirmCardProps {
  args: { urls?: string[] };
  status: Status;
  handler?: (result: string) => void;
  resources: Resource[];
}

export function DeleteConfirmCard({ args, status, handler, resources }: DeleteConfirmCardProps) {
  const toDelete = resources.filter((r) => (args.urls ?? []).includes(r.url));

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 overflow-hidden my-2">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-red-500/20">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="text-white font-semibold text-sm">
          Delete {toDelete.length} resource{toDelete.length !== 1 ? "s" : ""}?
        </span>
      </div>

      <div className="p-3 space-y-1">
        {toDelete.map((r) => (
          <div key={r.url} className="bg-white/5 rounded-lg px-3 py-2">
            <div className="text-white text-xs font-medium">{r.title ?? r.url}</div>
            {r.description && <div className="text-white/40 text-[10px] mt-0.5">{r.description}</div>}
          </div>
        ))}
        {toDelete.length === 0 && (
          <p className="text-white/40 text-xs text-center py-2">No matching resources found</p>
        )}
      </div>

      {status === "executing" && (
        <div className="flex gap-2 p-3 border-t border-red-500/20 bg-black/20">
          <button onClick={() => handler?.("NO")}
            className="flex-1 py-2 border border-white/20 rounded-lg text-white/60 text-sm hover:bg-white/10 transition-all">
            Cancel
          </button>
          <button onClick={() => handler?.("YES")}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white text-sm font-semibold transition-all">
            Delete permanently
          </button>
        </div>
      )}
    </div>
  );
}