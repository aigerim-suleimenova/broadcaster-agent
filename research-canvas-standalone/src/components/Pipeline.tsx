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
import { sampleDocuments, type SampleDocument } from "@/data/sampleDocuments";

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
  decisionMakers: Array<{ name: string; title: string }>;
  primaryContact: string;
  outreachStrategy?: string;
  emailDraft?: { subject: string; body: string };
  emailsSent?: Array<{ to: string; subject: string; messageId: string }>;
}

const THREAD_STORAGE_KEY = 'copilotkit-thread-id'

// ─── Broadcaster doc sidebar ──────────────────────────────────────────────────

function BroadcasterDocSidebar({
  broadcasterName,
  selectedId,
  onSelect,
}: {
  broadcasterName: string;
  selectedId: string | undefined;
  onSelect: (doc: SampleDocument) => void;
}) {
  const name = broadcasterName.trim().toLowerCase();
  const matched = sampleDocuments.filter(
    (d) => d.broadcaster && d.broadcaster.toLowerCase().includes(name)
  );

  if (matched.length === 0) return null;

  return (
    <div className="w-72 shrink-0 flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-sm overflow-y-auto">
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Documents</p>
        <p className="text-sm font-bold text-white mt-0.5">{broadcasterName}</p>
        <p className="text-xs text-white/40 mt-0.5">{matched.length} document{matched.length !== 1 ? 's' : ''} found</p>
      </div>
      <div className="flex-1 p-3 space-y-2">
        {matched.map((doc) => {
          const isSelected = selectedId === doc.id;
          return (
            <button
              key={doc.id}
              onClick={() => onSelect(doc)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? "bg-purple-600/30 border-purple-500/60 shadow-lg shadow-purple-500/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{doc.icon}</span>
                <span className="text-sm font-semibold text-white truncate">{doc.title}</span>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                isSelected ? "bg-purple-500/30 text-purple-200" : "bg-white/10 text-white/50"
              }`}>
                {doc.category}
              </span>
              <p className="text-xs text-white/40 mt-1.5 leading-relaxed line-clamp-2">
                {doc.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  const [broadcasterName, setBroadcasterName] = useState("");
  const [running, setRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStageNumber, setPendingStageNumber] = useState(0);
  const [stageStatuses, setStageStatuses] = useState<Array<"pending" | "active" | "complete">>([]);
  const [stages, setStages] = useState<Array<{ messages: string[]; isCheckpoint: boolean }>>([]);
  const [pipelineData, setPipelineData] = useState<Record<string, string[]>>({});
  const [activeStage, setActiveStage] = useState(0);
  const [selectedDocContent, setSelectedDocContent] = useState<string | undefined>(undefined);

  const scrollRef = useRef<HTMLDivElement>(null);
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

  const showProceedConfirm = () => {
    setPendingStageNumber(activeStage + 1);
    setShowConfirmDialog(true);
  };

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

Evaluate these areas and return a JSON object with a "messages" array of exactly 5 strings:
1. "Analyzing ad tech stack for ${context.broadcasterName}..." (status message)
2. Ad Server & SSP Analysis: what ad server they use, current SSP partners, and whether Smartclip adds incremental demand or conflicts
3. Video Inventory Assessment: pre-roll/mid-roll/CTV/HbbTV inventory volume and types — how well they fit Smartclip's demand
4. Revenue Opportunity & Migration Risk: estimated CPM uplift Smartclip could deliver, migration complexity (Low/Medium/High), timeline
5. "Compatibility Score: [NUMBER]/100 | Migration Risk: [low/medium/high] | Ad Server: [name] | Current SSPs: [comma-separated list] | Revenue Opportunity: [estimate]"

The last message MUST end with that exact format so data can be extracted.
Return ONLY valid JSON: { "messages": ["...", "...", "...", "...", "..."] }`;

        result = await fetch("/api/pipeline/invoke-llm", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }), signal: abortController?.signal,
        }).then(async (res) => { if (!res.ok) throw new Error("LLM API failed"); return res.json(); });

        if (result?.messages) {
          const last = (result.messages as string[]).at(-1) ?? "";
          const scoreMatch = last.match(/Compatibility Score:\s*(\d+)/i);
          const riskMatch  = last.match(/Migration Risk:\s*(low|medium|high)/i);
          const adMatch    = last.match(/Ad Server:\s*([^|]+)/i);
          const sspMatch   = last.match(/Current SSPs:\s*([^|]+)/i);
          const revMatch   = last.match(/Revenue Opportunity:\s*(.+)/i);
          context.compatibilityScore = scoreMatch ? parseInt(scoreMatch[1]) : 65;
          context.migrationRisk = (riskMatch?.[1]?.toLowerCase() ?? "medium") as "low" | "medium" | "high";
          context.adServer = adMatch?.[1]?.trim() ?? "Unknown";
          context.currentSSPs = sspMatch?.[1]?.split(",").map(s => s.trim()) ?? [];
          context.revenueOpportunity = revMatch?.[1]?.trim() ?? "";
          context.compatibilityNotes = (result.messages as string[])[3] ?? "";
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

        result = await fetch("/api/pipeline/invoke-llm", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }), signal: abortController?.signal,
        }).then(async (res) => { if (!res.ok) throw new Error("LLM API failed"); return res.json(); });

        if (result?.messages) {
          const makers = extractDecisionMakers(result.messages as string[]);
          context.decisionMakers = makers;
          context.primaryContact = makers[0]?.name || "Unknown";
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

        result = await fetch("/api/pipeline/invoke-llm", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }), signal: abortController?.signal,
        }).then(async (res) => { if (!res.ok) throw new Error("LLM API failed"); return res.json(); });

        if (result?.messages) context.outreachStrategy = (result.messages as string[]).slice(1).join(" ");

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

        result = await fetch("/api/pipeline/invoke-llm", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }), signal: abortController?.signal,
        }).then(async (res) => { if (!res.ok) throw new Error("LLM API failed"); return res.json(); });

        if (result?.emailSubject && result?.emailBody) {
          context.emailDraft = { subject: result.emailSubject, body: result.emailBody };
        } else {
          const messagesText = (result?.messages || []).join("\n");
          const subjectMatch = messagesText.match(/Subject:\s*(.+)/i);
          const bodyMatch    = messagesText.match(/Body:\s*([\s\S]+?)(?=\n\n|$)/i);
          context.emailDraft = subjectMatch && bodyMatch
            ? { subject: subjectMatch[1].trim(), body: bodyMatch[1].trim() }
            : { subject: messagesText.split("\n")[0]?.substring(0, 100) ?? "", body: messagesText };
        }
      }

      setStages((prev) => {
        const next = [...prev];
        next[nextStage] = { messages: (result?.messages || []) as string[], isCheckpoint: false };
        return next;
      });

      await new Promise((res) => setTimeout(res, ((result?.messages || []).length * 1200) + 800));
      setStageStatuses((prev) => { const n = [...prev]; n[nextStage] = "complete"; return n; });
      setIsProcessing(false);
    } catch (error) {
      console.error(`Error in stage ${nextStage}:`, error);
      setStageStatuses((prev) => { const n = [...prev]; n[nextStage] = "complete"; return n; });
      setIsProcessing(false);
    }
  };

  const handleRun = () => {
    if (!broadcasterName.trim()) return;
    setRunning(true);
    setPipelineData({});
    runPipeline(broadcasterName.trim());
  };

  const handleReset = () => {
    abortRef.current = true;
    setRunning(false);
    setStageStatuses([]);
    setStages([]);
    setBroadcasterName("");
    setPipelineData({});
    setActiveStage(0);
    setSelectedDocContent(undefined);
  };

  const STAGE_NAMES     = ["Research", "Compatibility", "Decision Makers", "Outreach Plan", "Review"];
  const STAGE_SUBTITLES = ["Researching broadcaster...", "Analyzing compatibility...", "Finding contacts...", "Preparing outreach...", "Ready for review"];

  return (
    <div className="h-screen bg-gradient-to-br from-[#0a1628] via-[#1e3a8a] to-[#581c87] text-white relative flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
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
                <RotateCcw className="w-4 h-4" />
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
                      <Input
                        placeholder="e.g. BBC, Paramount, TF1 Group, Sky..."
                        value={broadcasterName}
                        onChange={(e) => setBroadcasterName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRun()}
                        className="flex-1 bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-purple-500/50 h-12 text-base rounded-lg px-4 backdrop-blur-sm"
                      />
                      <Button onClick={handleRun} disabled={!broadcasterName.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-12 px-6 sm:px-8 gap-2 shrink-0 rounded-lg font-medium text-base shadow-lg shadow-purple-500/30 disabled:opacity-50">
                        <Play className="w-4 h-4" /> Start Pipeline
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-6 text-center">Discovery Pipeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
                      {[
                        { num: 0, name: "Research",        desc: "Broadcaster profile & tech stack", icon: <Search className="h-5 w-5 text-cyan-300" /> },
                        { num: 1, name: "Compatibility",   desc: "Smartclip fit analysis", icon: <ShieldCheck className="h-5 w-5 text-emerald-300" /> },
                        { num: 2, name: "Decision Makers", desc: "Key contact identification", icon: <Users className="h-5 w-5 text-blue-300" /> },
                        { num: 3, name: "Outreach Plan",   desc: "Personalized strategy", icon: <Megaphone className="h-5 w-5 text-pink-300" /> },
                        { num: 4, name: "Review",          desc: "Final approval checkpoint", icon: <ClipboardCheck className="h-5 w-5 text-violet-300" /> },
                      ].map((stage) => (
                        <motion.div key={stage.num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: stage.num * 0.1 }}>
                          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg p-4 h-full hover:border-purple-500/30 transition-all duration-300">
                            <div className="text-2xl mb-2">{stage.icon}</div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-500/40 to-pink-500/40 border border-white/20">
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
                <div className="flex items-center gap-2">
                  {stages.map((_, i) => {
                    const isAccessible = stageStatuses[i] === "complete" || stageStatuses[i] === "active";
                    const isActive = i === activeStage;
                    const isComplete = stageStatuses[i] === "complete";
                    return (
                      <button key={i} onClick={() => isAccessible && setActiveStage(i)} disabled={!isAccessible}
                        className={`h-2 flex-1 rounded-full transition-all ${
                          isActive ? "bg-gradient-to-r from-cyan-400 to-purple-500"
                          : isComplete ? "bg-gradient-to-r from-emerald-400 to-green-500"
                          : "bg-white/10"
                        } ${isAccessible ? "cursor-pointer" : "cursor-default"}`} />
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
              <AnimatePresence mode="wait">
                <motion.div key={activeStage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="h-full">
                    {activeStage === 0 ? (
                      <div className="flex h-full">
                        {/* Broadcaster doc sidebar — only visible when matching docs exist */}
                        <BroadcasterDocSidebar
                          broadcasterName={broadcasterName}
                          selectedId={selectedDocContent
                            ? sampleDocuments.find((d) => d.content === selectedDocContent)?.id
                            : undefined}
                          onSelect={(doc) => setSelectedDocContent(doc.content)}
                        />
                        <div className="flex-1 overflow-y-auto">
                          {sharedThreadId ? (
                            <CopilotKit runtimeUrl="/api/copilotkit"
                              agent="dashboard_agent"
                              threadId={sharedThreadId}>
                              <App initialContent={selectedDocContent} />
                            </CopilotKit>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
                                <p className="text-white/60">Initializing Copilot session...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : activeStage === 4 ? (
                      <div className="w-full h-full flex flex-col">
                        {pipelineContextRef.current?.emailDraft ? (
                          <OutreachSendStage
                            status={stageStatuses[4] || "active"}
                            contactName={pipelineContextRef.current.decisionMakers[0]?.name || "Contact"}
                            contactEmail={"contact@" + pipelineContextRef.current.domain}
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
                              <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
                              <p className="text-white/60">Loading email draft...</p>
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
                          messageBaseDelay={200}
                          isCheckpoint={stages[activeStage]?.isCheckpoint}
                          broadcasterName={broadcasterName}
                          pipelineData={pipelineData}
                          onTermClick={handleTermClick}
                          onNextStage={() => setActiveStage((s) => Math.min(stages.length - 1, s + 1))}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
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
                      <Button onClick={showProceedConfirm} disabled={isProcessing}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 gap-2 rounded-lg font-semibold shadow-lg shadow-purple-500/50 disabled:opacity-50">
                        {isProcessing ? (
                          <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          <><ArrowRight className="w-4 h-4" /> Next Stage</>
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
              {["Broadcaster Research", "Compatibility Analysis", "Decision Makers", "Outreach Planning"][pendingStageNumber - 1]}{" "}
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
                setShowConfirmDialog(false);
                setActiveStage(pendingStageNumber);
                setTimeout(() => handleProceedToNextStage(pendingStageNumber), 0);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
              <ArrowRight className="w-4 h-4 mr-2" /> Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}