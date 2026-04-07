"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, RotateCcw, ArrowRight, Loader, Search, ShieldCheck, Users, Megaphone, ClipboardCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import PipelineStage from "@/components/pipeline/PipelineStage";
import { OutreachSendStage } from "@/components/OutreachSendStage";

import App from "./App";
import { CopilotKit } from "@copilotkit/react-core";

interface ScoreCriterion {
  score: number;
  reason: string;
}

interface ScoreBreakdown {
  adServerCompatibility: ScoreCriterion;
  sspOverlap: ScoreCriterion;
  videoInventory: ScoreCriterion;
  revenueOpportunity: ScoreCriterion;
  migrationEase: ScoreCriterion;
}

const SCORE_WEIGHTS: Record<keyof ScoreBreakdown, number> = {
  adServerCompatibility: 0.25,
  sspOverlap: 0.20,
  videoInventory: 0.25,
  revenueOpportunity: 0.15,
  migrationEase: 0.15,
};

function computeCompatibilityScore(breakdown: ScoreBreakdown): number {
  return Math.round(
    Object.entries(breakdown).reduce(
      (total, [key, { score }]) => total + score * SCORE_WEIGHTS[key as keyof ScoreBreakdown],
      0
    )
  );
}

interface PipelineContext {
  broadcasterName: string;
  domain: string;
  researchMarkdown: string;          // Stage 0 output — passed into all later stages
  compatibilityScore: number;
  compatibilityNotes: string;
  migrationRisk: "low" | "medium" | "high";
  adServer: string;
  currentSSPs: string[];
  fundamentSSPs: string[];
  smartclipPresent: boolean;
  revenueOpportunity: string;
  scoreBreakdown?: ScoreBreakdown;
  decisionMakers: Array<{ name: string; title: string }>;
  primaryContact: string;
  outreachStrategy?: string;
  emailDraft?: { subject: string; body: string };
  emailsSent?: Array<{ to: string; subject: string; messageId: string }>;
}

const THREAD_STORAGE_KEY = 'copilotkit-thread-id';
const MESSAGE_BASE_DELAY = 200; // ms per message for animation timing

const STAGE_NAMES     = ["Research", "Compatibility", "Decision Makers", "Outreach Plan", "Review"];
const STAGE_SUBTITLES = ["Researching broadcaster...", "Analyzing compatibility...", "Finding contacts...", "Preparing outreach...", "Ready for review"];
const CONFIRM_STAGE_LABELS = ["Broadcaster Research", "Compatibility Analysis", "Decision Makers", "Outreach Planning"];


const getBroadcasterDomain = (broadcasterName: string): string => {
  const cleaned = broadcasterName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  return `${cleaned}.com`;
};

const extractDecisionMakers = (stage3Messages: string[]) => {
  const contactLines = stage3Messages[1] || "";
  const makers: Array<{ name: string; title: string }> = [];
  const matches = contactLines.matchAll(/Found:\s*([^,]+),\s*([^\n]+)/gi);
  for (const match of matches) {
    makers.push({ name: match[1].trim(), title: match[2].trim() });
  }
  return makers.length > 0 ? makers : [{ name: "Unknown", title: "Decision Maker" }];
};

export default function Pipeline() {
  const [broadcasterName, setBroadcasterName] = useState("");
  const [running, setRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [stageStatuses, setStageStatuses] = useState<Array<"pending" | "active" | "complete">>([]);
  const [stages, setStages] = useState<Array<{ messages: string[]; isCheckpoint: boolean }>>([]);
  const [activeStage, setActiveStage] = useState(0);
  const [selectedDocContent, setSelectedDocContent] = useState<string | undefined>(undefined);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stageContentRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pipelineContextRef = useRef<PipelineContext | null>(null);

  const handleTermClick = useCallback(() => { }, []);
  const [sharedThreadId, setSharedThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = window.localStorage.getItem(THREAD_STORAGE_KEY);
    if (existing) {
      setSharedThreadId(existing);
      return;
    }

    const threadId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(THREAD_STORAGE_KEY, threadId);
    setSharedThreadId(threadId);
  }, []);

  // Move focus to stage content when active stage changes
  useEffect(() => {
    if (running) {
      stageContentRef.current?.focus();
    }
  }, [activeStage, running]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 300);
    return () => clearTimeout(timer);
  }, [stages, stageStatuses, scrollToBottom]);

  useEffect(() => {
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, []);

  const runPipeline = async (name: string) => {
    abortRef.current = false;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const initialStages = [
      { messages: [], isCheckpoint: false },
      { messages: [], isCheckpoint: false },
      { messages: [], isCheckpoint: false },
      { messages: [], isCheckpoint: false },
      { messages: [], isCheckpoint: true  },
    ];
    setStages(initialStages);
    setStageStatuses(["active", "pending", "pending", "pending", "pending"]);
    setActiveStage(0);
    setSelectedDocContent(undefined);

    const domain = getBroadcasterDomain(name);
    const context: PipelineContext = {
      broadcasterName: name, domain, researchMarkdown: "", adServer: "",
      currentSSPs: [], fundamentSSPs: [], smartclipPresent: false,
      revenueOpportunity: "", compatibilityScore: 0, compatibilityNotes: "",
      migrationRisk: "medium", decisionMakers: [], primaryContact: "",
      emailDraft: undefined, emailsSent: [],
    };
    pipelineContextRef.current = context;

    // Stage 0: AI generates a broadcaster analysis markdown report
    try {
      const res = await fetch("/api/pipeline/invoke-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "broadcaster_report", broadcasterName: name }),
        signal: abortController.signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.markdown) {
          setSelectedDocContent(data.markdown);
          // Store for use in all subsequent stages
          context.researchMarkdown = data.markdown;
        }
      }
    } catch {
      // Silently skip — user can still paste their own markdown
    }

    if (abortRef.current || abortController.signal.aborted) return;

    setStageStatuses((prev) => { const n = [...prev]; n[0] = "complete"; return n; });
    setIsProcessing(false);
  };

  const handleProceedToNextStage = async (explicitNextStage?: number) => {
    const nextStage = explicitNextStage ?? activeStage + 1;
    if (nextStage >= stages.length) return;

    setIsProcessing(true);

    const context = pipelineContextRef.current || ({} as PipelineContext);
    if (!context.fundamentSSPs)   context.fundamentSSPs = [];
    if (!context.currentSSPs)     context.currentSSPs = [];
    if (!context.decisionMakers)  context.decisionMakers = [];
    if (!context.compatibilityScore) context.compatibilityScore = 0;
    if (!context.migrationRisk)   context.migrationRisk = "medium";
    if (!context.adServer)        context.adServer = "Unknown";
    if (!context.primaryContact)  context.primaryContact = "Unknown";
    if (!context.compatibilityNotes) context.compatibilityNotes = "";
    if (!context.revenueOpportunity) context.revenueOpportunity = "";

    const abortController = abortControllerRef.current;
    const research = context.researchMarkdown
      ? `\n\nBROADCASTER RESEARCH REPORT:\n${context.researchMarkdown.slice(0, 3000)}`
      : "";

    let result: { messages?: string[]; emailSubject?: string; emailBody?: string } | undefined;

    try {
      setStageStatuses((prev) => { const n = [...prev]; n[nextStage] = "active"; return n; });

      if (nextStage === 1) {
        const prompt = `You are a Smartclip partnership analyst. Smartclip is a video ad tech company that provides SSP, ad serving, and CTV monetisation solutions for broadcasters.

Analyze "${context.broadcasterName}" for Smartclip partnership compatibility based on the research below.${research}

Score each criterion from 0–100 with a one-sentence reason. Then return a JSON object with this exact shape:

{
  "messages": [
    "Analyzing ad tech stack for ${context.broadcasterName}...",
    "<Ad Server & SSP summary: what server they use, current SSP partners, incremental demand vs conflicts>",
    "<Video Inventory: pre-roll/mid-roll/CTV/HbbTV volume and types, fit with Smartclip demand>",
    "<Revenue Opportunity: estimated CPM uplift, migration complexity, timeline>"
  ],
  "adServer": "<name>",
  "currentSSPs": ["<ssp1>", "<ssp2>"],
  "migrationRisk": "<low|medium|high>",
  "revenueOpportunity": "<estimate>",
  "scoreBreakdown": {
    "adServerCompatibility": { "score": <0-100>, "reason": "<one sentence>" },
    "sspOverlap":            { "score": <0-100>, "reason": "<one sentence>" },
    "videoInventory":        { "score": <0-100>, "reason": "<one sentence>" },
    "revenueOpportunity":    { "score": <0-100>, "reason": "<one sentence>" },
    "migrationEase":         { "score": <0-100>, "reason": "<one sentence — higher = easier to migrate>" }
  }
}

Weights applied in code: adServerCompatibility 25%, sspOverlap 20%, videoInventory 25%, revenueOpportunity 15%, migrationEase 15%.
Return ONLY valid JSON with no extra text.`;

        try {
          const res = await fetch("/api/pipeline/invoke-llm", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }), signal: abortController?.signal,
          });

          if (!res.ok) throw new Error(`API returned ${res.status}`);
          result = await res.json();
        } catch (apiError) {
          result = {
            messages: [
              `❌ Analysis failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
              "Unable to fetch ad tech analysis. Please check the API endpoint and try again.",
              "",
              "",
            ]
          };
        }

        if (result && Array.isArray(result.messages)) {
          const r = result as {
            messages: string[];
            adServer?: string;
            currentSSPs?: string[];
            migrationRisk?: string;
            revenueOpportunity?: string;
            scoreBreakdown?: ScoreBreakdown;
          };
          context.adServer = r.adServer ?? "Unknown";
          context.currentSSPs = r.currentSSPs ?? [];
          context.migrationRisk = (r.migrationRisk?.toLowerCase() ?? "medium") as "low" | "medium" | "high";
          context.revenueOpportunity = r.revenueOpportunity ?? "";
          context.compatibilityNotes = (result.messages as string[])[3] ?? "";
          if (r.scoreBreakdown) {
            context.scoreBreakdown = r.scoreBreakdown;
            context.compatibilityScore = computeCompatibilityScore(r.scoreBreakdown);
          } else {
            context.compatibilityScore = 65;
          }
        }

      } else if (nextStage === 2) {
        const prompt = `You are a B2B sales intelligence analyst. Identify the real decision makers at "${context.broadcasterName}" who would be responsible for ad technology, video monetisation, and digital partnerships.${research}

Focus on roles like: Chief Digital Officer, VP/Head of Ad Tech, VP/Head of Digital Revenue, Head of Programmatic, CTO, Head of Streaming/OTT.

Return ONLY valid JSON with a "messages" array of exactly 4 strings:
1. "Identifying decision makers at ${context.broadcasterName}..." (status message)
2. List of contacts in this exact format per line: "Found: [Full Name], [Job Title]" — provide 3-4 people
3. "Primary contact selected: [Name] — [reason why they are the best entry point]"
4. "LinkedIn/contact strategy: [brief note on best way to reach them]"

Return ONLY: { "messages": ["...", "...", "...", "..."] }`;

        try {
          const res = await fetch("/api/pipeline/invoke-llm", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }), signal: abortController?.signal,
          });

          if (!res.ok) throw new Error(`API returned ${res.status}`);
          result = await res.json();
        } catch (apiError) {
          result = {
            messages: [
              `❌ Identification failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
              "Found: John Smith, VP of Digital Strategy\nFound: Sarah Johnson, Head of Ad Technology\nFound: Michael Chen, Chief Technology Officer",
              "Primary contact selected: Sarah Johnson — Head of Ad Tech is the best entry point for tech partnerships",
              "LinkedIn/contact strategy: Research their LinkedIn profile first, then connect with a personalized note about CTV monetization opportunities"
            ]
          };
        }

        if (result?.messages && Array.isArray(result.messages)) {
          const makers = extractDecisionMakers(result.messages as string[]);
          context.decisionMakers = makers.length > 0 ? makers : [{ name: "Decision Maker", title: "Unknown" }];
          context.primaryContact = context.decisionMakers[0]?.name || "Contact";
        }

      } else if (nextStage === 3) {
        const contact = context.decisionMakers[0] || { name: context.primaryContact, title: "Head of Ad Tech" };
        const prompt = `You are a Smartclip sales strategist. Draft a personalised outreach strategy for approaching ${contact.name} (${contact.title}) at ${context.broadcasterName}.

CONTEXT:
- Broadcaster: ${context.broadcasterName}
- Compatibility Score: ${context.compatibilityScore}/100
- Migration Risk: ${context.migrationRisk}
- Current Ad Server: ${context.adServer}
- Current SSPs: ${context.currentSSPs.join(", ") || "Unknown"}
- Revenue Opportunity: ${context.revenueOpportunity}
- Contact: ${contact.name}, ${contact.title}${research}

Return ONLY valid JSON with a "messages" array of exactly 4 strings:
1. "Crafting outreach strategy for ${contact.name} at ${context.broadcasterName}..." (status)
2. Personalised angle: why Smartclip is uniquely valuable for THIS broadcaster given their specific ad stack, inventory type, and revenue opportunity. Be specific — reference their actual tech stack.
3. Recommended approach: channel (LinkedIn/email/event), timing, conversation opener, and what NOT to say
4. Pilot proposal: a specific low-risk pilot to propose (e.g. CTV inventory test, specific channel, revenue share model)

Return ONLY: { "messages": ["...", "...", "...", "..."] }`;

        try {
          const res = await fetch("/api/pipeline/invoke-llm", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }), signal: abortController?.signal,
          });

          if (!res.ok) throw new Error(`API returned ${res.status}`);
          result = await res.json();
        } catch (apiError) {
          result = {
            messages: [
              `❌ Strategy generation failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
              `Smartclip uniquely complements ${context.broadcasterName}'s setup by adding incremental SSP demand without conflicts. With ${context.adServer} as the primary server and existing SSPs like ${context.currentSSPs.join(", ") || "standard partners"}, Smartclip's video-first approach targets premium CTV/HbbTV inventory that currently undermonetizes.`,
              "Strategy: Approach via LinkedIn with a specific reference to their video inventory. Timeline: 2-week discovery call. Opener: 'We specialize in unlocking revenue from CTV/streaming – wanted to explore if there's opportunity at [Broadcaster]'",
              "Pilot: 30-day CTV preroll test with [Country] networks. Smartclip handles setup/trafficking. KPI: 15%+ CPM uplift vs. current. Revenue share: 70/30."
            ]
          };
        }

        if (result?.messages && Array.isArray(result.messages)) {
          context.outreachStrategy = (result.messages as string[]).slice(1).join(" ");
        }

      } else if (nextStage === 4) {
        const contact = context.decisionMakers[0] || { name: context.primaryContact, title: "Head of Ad Tech" };
        const prompt = `You are a Smartclip business development manager. Write a concise, personalised cold outreach email to ${contact.name} (${contact.title}) at ${context.broadcasterName}.

CONTEXT:
- Compatibility Score: ${context.compatibilityScore}/100
- Current Ad Server: ${context.adServer}
- Current SSPs: ${context.currentSSPs.join(", ") || "Unknown"}
- Revenue Opportunity: ${context.revenueOpportunity}
- Outreach Strategy: ${context.outreachStrategy ?? ""}${research}

EMAIL REQUIREMENTS:
- Subject line: specific, not generic, references their actual situation
- Body: 4-5 sentences max — who you are, why them specifically, what Smartclip offers that their current setup doesn't, one clear CTA (15-min call)
- Tone: peer-to-peer, not salesy
- Do NOT use: "I hope this finds you well", "synergies", "leverage", "touch base"

Return ONLY valid JSON:
{
  "messages": ["Drafting personalised email for ${contact.name}...", "Email ready for review"],
  "emailSubject": "...",
  "emailBody": "..."
}`;

        try {
          const res = await fetch("/api/pipeline/invoke-llm", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }), signal: abortController?.signal,
          });

          if (!res.ok) throw new Error(`API returned ${res.status}`);
          result = await res.json();
        } catch (apiError) {
          result = {
            messages: [`❌ Email draft failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`, "Email ready for review"],
            emailSubject: `Quick question: ${context.broadcasterName}'s CTV monetization strategy`,
            emailBody: `Hi ${contact.name},\n\nWe work with broadcasters like ${context.broadcasterName} to unlock incremental revenue from CTV/HbbTV inventory—without disrupting your current setup.\n\nGiven your current ${context.adServer} environment and SSP partners, there's typically a 10-20% CPM gap vs. what dedicated video demand can deliver.\n\nWorth a 15-min chat to explore? Happy to run a quick analysis of your inventory first.\n\nCheers`
          };
        }

        if (result?.emailSubject && result?.emailBody) {
          context.emailDraft = { subject: result.emailSubject, body: result.emailBody };
        } else if (result?.messages && Array.isArray(result.messages)) {
          const messagesText = (result.messages as string[]).join("\n");
          const subjectMatch = messagesText.match(/Subject:\s*(.+)/i);
          const bodyMatch    = messagesText.match(/Body:\s*([\s\S]+?)(?=\n\n|$)/i);
          context.emailDraft = subjectMatch && bodyMatch
            ? { subject: subjectMatch[1].trim(), body: bodyMatch[1].trim() }
            : { subject: messagesText.split("\n")[0]?.substring(0, 100) ?? "Partnership Opportunity", body: messagesText };
        }
      }

      setStages((prev) => {
        const next = [...prev];
        next[nextStage] = { messages: (result?.messages || []) as string[], isCheckpoint: false };
        return next;
      });

      // Wait for message animations to complete before marking stage done
      const messageCount = result?.messages?.length ?? 4;
      await new Promise((res) => setTimeout(res, messageCount * MESSAGE_BASE_DELAY + 500));
      setStageStatuses((prev) => { const n = [...prev]; n[nextStage] = "complete"; return n; });
      setIsProcessing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStages((prev) => {
        const next = [...prev];
        next[nextStage] = {
          messages: [`⚠️ Unexpected error: ${errorMessage}. Please check the console and retry.`] as string[],
          isCheckpoint: false
        };
        return next;
      });
      setStageStatuses((prev) => { const n = [...prev]; n[nextStage] = "complete"; return n; });
      setIsProcessing(false);
    }
  };

  const handleRun = () => {
    if (!broadcasterName.trim()) return;
    setRunning(true);
    runPipeline(broadcasterName.trim());
  };

  const handleReset = () => {
    abortRef.current = true;
    setRunning(false);
    setStageStatuses([]);
    setStages([]);
    setBroadcasterName("");
    setActiveStage(0);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#0a1628] via-[#1e3a8a] to-[#581c87] text-white relative flex flex-col">
      {/* Decorative background — hidden from assistive technology */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl motion-safe:animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl motion-safe:animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative" aria-hidden="true">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg shadow-purple-500/50" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-pink-500/20 animate-ping" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Pipeline Agent</h1>
              <p className="text-xs text-white/50">Multi-step broadcaster discovery & outreach</p>
            </div>
          </div>
          {running && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-white/50">Processing</p>
                <p className="text-sm font-semibold text-white">{broadcasterName}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}
                className="text-white/60 hover:text-white hover:bg-white/10 gap-2 rounded-full px-3 sm:px-4 h-9">
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        <AnimatePresence>
          {!running && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-20">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200">
                      Multi-Step Pipeline Agent
                    </h2>
                    <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                      Enter a broadcaster name to launch an intelligent discovery, analysis, and outreach pipeline.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto mb-16">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label htmlFor="broadcaster-input" className="sr-only">Broadcaster name</label>
                      <Input
                        id="broadcaster-input"
                        placeholder="e.g. BBC, Paramount, TF1 Group, Sky..."
                        value={broadcasterName}
                        onChange={(e) => setBroadcasterName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRun()}
                        className="flex-1 bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-purple-500/50 h-12 text-base rounded-lg px-4 backdrop-blur-sm"
                      />
                      <Button onClick={handleRun} disabled={!broadcasterName.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-12 px-6 sm:px-8 gap-2 shrink-0 rounded-lg font-medium text-base shadow-lg shadow-purple-500/30 disabled:opacity-50">
                        <Play className="w-4 h-4" aria-hidden="true" /> Start Pipeline
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-6 text-center">Discovery Pipeline</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
                      {[
                        { num: 0, name: "Research",        desc: "Broadcaster profile & tech stack", icon: <Search className="h-5 w-5 text-cyan-300" aria-hidden="true" /> },
                        { num: 1, name: "Compatibility",   desc: "Smartclip fit analysis", icon: <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden="true" /> },
                        { num: 2, name: "Decision Makers", desc: "Key contact identification", icon: <Users className="h-5 w-5 text-blue-300" aria-hidden="true" /> },
                        { num: 3, name: "Outreach Plan",   desc: "Personalized strategy", icon: <Megaphone className="h-5 w-5 text-pink-300" aria-hidden="true" /> },
                        { num: 4, name: "Review",          desc: "Final approval checkpoint", icon: <ClipboardCheck className="h-5 w-5 text-violet-300" aria-hidden="true" /> },
                      ].map((stage) => (
                        <motion.div key={stage.num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: stage.num * 0.1 }}>
                          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg p-4 h-full hover:border-purple-500/30 transition-all duration-300">
                            <div className="text-2xl mb-2">{stage.icon}</div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-500/40 to-pink-500/40 border border-white/20" aria-hidden="true">
                                <span className="text-xs font-bold text-white">{stage.num}</span>
                              </div>
                              <h4 className="font-semibold text-white text-sm">{stage.name}</h4>
                            </div>
                            <p className="text-xs text-white/50 line-clamp-2">{stage.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {running && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Stage Progress Bar */}
            <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4 shrink-0">
              <div className="max-w-6xl mx-auto space-y-3">
                <div className="flex items-center gap-2" role="tablist" aria-label="Pipeline stages">
                  {stages.map((_, i) => {
                    const isAccessible = stageStatuses[i] === "complete" || stageStatuses[i] === "active";
                    const isActive = i === activeStage;
                    const isComplete = stageStatuses[i] === "complete";
                    return (
                      <button
                        key={i}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Stage ${i + 1}: ${STAGE_NAMES[i]}${isComplete ? " (complete)" : isActive ? " (active)" : " (pending)"}`}
                        aria-current={isActive ? "step" : undefined}
                        onClick={() => isAccessible && setActiveStage(i)}
                        disabled={!isAccessible}
                        className={`h-2 flex-1 rounded-full transition-all ${
                          isActive ? "bg-gradient-to-r from-cyan-400 to-purple-500"
                          : isComplete ? "bg-gradient-to-r from-emerald-400 to-green-500"
                          : "bg-white/10"
                        } ${isAccessible ? "cursor-pointer" : "cursor-default"}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 font-medium">Stage {activeStage + 1} of {stages.length}</p>
                    <p className="text-sm font-semibold text-white">{STAGE_NAMES[activeStage]}</p>
                  </div>
                  <div className="text-xs text-white/50">{STAGE_SUBTITLES[activeStage]}</div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div ref={stageContentRef} tabIndex={-1} className="outline-none h-full">
                <AnimatePresence mode="wait">
                  <motion.div key={activeStage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <div className="h-full">
                      {activeStage === 0 ? (
                        <div className="h-full">
                          {sharedThreadId ? (
                            <CopilotKit runtimeUrl="/api/copilotkit"
                              agent="dashboard_agent"
                              threadId={sharedThreadId}>
                              <App initialContent={selectedDocContent} />
                            </CopilotKit>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" aria-hidden="true" />
                                <span className="sr-only">Initializing Copilot session</span>
                                <p className="text-white/60" aria-hidden="true">Initializing Copilot session...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : activeStage === 4 ? (
                        <div className="w-full h-full flex flex-col">
                          {pipelineContextRef.current?.emailDraft ? (
                            <OutreachSendStage
                              status={stageStatuses[4] || "active"}
                              contactName={pipelineContextRef.current.decisionMakers[0]?.name || "Contact"}
                              contactEmail=""
                              contactTitle={pipelineContextRef.current.decisionMakers[0]?.title || "Decision Maker"}
                              broadcasterName={pipelineContextRef.current.broadcasterName}
                              draftSubject={pipelineContextRef.current.emailDraft.subject}
                              draftBody={pipelineContextRef.current.emailDraft.body}
                              onEmailSent={(messageId, subject, to) => {
                                if (!pipelineContextRef.current) return;
                                pipelineContextRef.current.emailsSent = pipelineContextRef.current.emailsSent ?? [];
                                pipelineContextRef.current.emailsSent.push({ to, subject, messageId });
                              }}
                              onCancel={() => setActiveStage((s) => Math.min(stages.length - 1, s + 1))}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" aria-hidden="true" />
                                <span className="sr-only">Loading email draft</span>
                                <p className="text-white/60" aria-hidden="true">Loading email draft...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
                          <PipelineStage
                            stageIndex={activeStage}
                            status={stageStatuses[activeStage]}
                            messages={stages[activeStage]?.messages || []}
                            messageBaseDelay={MESSAGE_BASE_DELAY}
                            isCheckpoint={stages[activeStage]?.isCheckpoint}
                            broadcasterName={broadcasterName}
                            scoreBreakdown={pipelineContextRef.current?.scoreBreakdown}
                            compatibilityScore={pipelineContextRef.current?.compatibilityScore}
                            migrationRisk={pipelineContextRef.current?.migrationRisk}
                            onTermClick={handleTermClick}
                            onNextStage={() => setActiveStage((s) => Math.min(stages.length - 1, s + 1))}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Action Bar */}
            {stageStatuses[activeStage] === "complete" && activeStage < 4 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="shrink-0 border-t border-white/10 bg-black/30 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4">
                  <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <p className="text-sm text-white/70 font-medium">Stage complete. Ready to continue?</p>
                    <div className="flex gap-3">
                      <Button onClick={handleReset} variant="ghost"
                        className="text-white/60 hover:text-white hover:bg-white/10 border border-white/20 rounded-lg px-4">
                        Exit Pipeline
                      </Button>
                      <Button
                        onClick={() => setShowConfirmDialog(true)}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 gap-2 rounded-lg font-semibold shadow-lg shadow-purple-500/50 disabled:opacity-50">
                        {isProcessing ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
                            <span className="sr-only">Processing</span>
                            <span aria-hidden="true">Processing...</span>
                          </>
                        ) : (
                          <><ArrowRight className="w-4 h-4" aria-hidden="true" /> Next Stage</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gradient-to-br from-[#1a2a4a] to-[#0f1a2a] border border-white/20 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Ready to Continue?</DialogTitle>
            <DialogDescription className="text-white/60 text-sm">
              You&apos;ve completed the{" "}
              {CONFIRM_STAGE_LABELS[activeStage] ?? "current"}{" "}
              stage. Review the findings above before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 flex-row justify-end">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}
              className="border-white/20 text-white hover:bg-white/10 rounded-lg">
              Review More
            </Button>
            <Button
              onClick={() => {
                const nextStage = activeStage + 1;
                setShowConfirmDialog(false);
                setActiveStage(nextStage);
                setTimeout(() => handleProceedToNextStage(nextStage), 0);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
              <ArrowRight className="w-4 h-4 mr-2" aria-hidden="true" /> Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
