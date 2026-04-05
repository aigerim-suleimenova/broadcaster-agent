"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, RotateCcw, ArrowRight, Loader, Search, ShieldCheck, Users, Megaphone, ClipboardCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import PipelineStage from "@/components/pipeline/PipelineStage";
import { OutreachSendStage } from "@/components/OutreachSendStage";

import { CopilotPopup } from "@copilotkit/react-ui";
import App from "./App";
import { CopilotKit } from "@copilotkit/react-core";

interface PipelineContext {
  broadcasterName: string;
  domain: string;
  compatibilityScore: number;
  compatibilityNotes: string;
  migrationRisk: "low" | "medium" | "high";
  adServer: string;
  fundamentSSPs: string[];
  smartclipPresent: boolean;
  decisionMakers: Array<{ name: string; title: string }>;
  primaryContact: string;
  outreachStrategy?: string;
  emailDraft?: { subject: string; body: string };
  emailsSent?: Array<{ to: string; subject: string; messageId: string }>;
}
import A2UITestPage from '../A2UITestPage'
import NewsComponentsTestPage from './pages/NewsComponentsTestPage'
import TestPeopleComponents from './pages/TestPeopleComponents'
import SummaryComponentsTestPage from './pages/SummaryComponentsTestPage'
import MediaComponentsTest from './pages/MediaComponentsTest'
import DataComponentsTest from './pages/DataComponentsTest'
import ResourceTest from './pages/ResourceTest'
import A2UIValidatorTest from './pages/A2UIValidatorTest'
import ComponentShowcase from './pages/ComponentShowcase'

const THREAD_STORAGE_KEY = 'copilotkit-thread-id'

const getBroadcasterDomain = (broadcasterName: string): string => {
  const cleaned = broadcasterName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  return `${cleaned}.com`;
};

const extractCompatibilityData = (stage2Messages: string[]) => {
  const fullText = stage2Messages.join("\n");
  const scoreMatch = fullText.match(/(?:Compatibility Score|Score):\s*(\d+)\s*\/\s*100/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 65;
  const riskMatch = fullText.match(/(?:Risk|difficulty):\s*(low|medium|high)/i);
  const risk = (riskMatch ? riskMatch[1].toLowerCase() : "medium") as "low" | "medium" | "high";
  const notes = stage2Messages[stage2Messages.length - 1] || "";
  return { score, risk, notes };
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
  const model = "openai";

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

  function getAppComponent() {
    if (typeof window === "undefined") return <App />;

    // Use test pages based on query params (check specific tests first to avoid conflicts)
    const search = window.location.search;
    if (search.includes('showcase')) return <ComponentShowcase />;
    if (search.includes('validator-test')) return <A2UIValidatorTest />;
    if (search.includes('resource-test')) return <ResourceTest />;
    if (search.includes('data-test')) return <DataComponentsTest />;
    if (search.includes('media-test')) return <MediaComponentsTest />;
    if (search.includes('summary-test')) return <SummaryComponentsTestPage />;
    if (search.includes('people-test')) return <TestPeopleComponents />;
    if (search.includes('news-test')) return <NewsComponentsTestPage />;
    if (search === '?test' || search.startsWith('?test&')) return <A2UITestPage />;
    return <App />;
  }

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

    const domain = getBroadcasterDomain(name);
    const context: PipelineContext = {
      broadcasterName: name, domain, adServer: "", fundamentSSPs: [],
      smartclipPresent: false, compatibilityScore: 0, compatibilityNotes: "",
      migrationRisk: "medium", decisionMakers: [], primaryContact: "",
      emailDraft: undefined, emailsSent: [],
    };
    pipelineContextRef.current = context;

    await new Promise((res) => setTimeout(res, 1000));
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
    if (!context.decisionMakers)  context.decisionMakers = [];
    if (!context.compatibilityScore) context.compatibilityScore = 0;
    if (!context.migrationRisk)   context.migrationRisk = "medium";
    if (!context.adServer)        context.adServer = "Unknown";
    if (!context.primaryContact)  context.primaryContact = "Unknown";
    if (!context.compatibilityNotes) context.compatibilityNotes = "";

    const abortController = abortControllerRef.current;
    let result: { messages?: string[] } | undefined;

    try {
      setStageStatuses((prev) => { const n = [...prev]; n[nextStage] = "active"; return n; });

      if (nextStage === 1) {
        const prompt = `You are a compatibility analysis agent. Analyze "${context.broadcasterName}" compatibility with smartclip.
          Return JSON: { "messages": ["Analyzing...", "<assessment>", "<risk>", "Compatibility Score: 78/100"] }`;
        result = await fetch("/api/pipeline/invoke-llm", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model }), signal: abortController?.signal,
        }).then(async (res) => { if (!res.ok) throw new Error("LLM API failed"); return res.json(); });

        if (result?.messages) {
          const d = extractCompatibilityData(result.messages as string[]);
          context.compatibilityScore = d.score;
          context.migrationRisk = d.risk;
          context.compatibilityNotes = d.notes;
        }
      } else if (nextStage === 2) {
        const prompt = `Identify decision makers at "${context.broadcasterName}".
          Return: { "messages": ["Identifying...", "Found: [Name], [Title]\\nFound: [Name], [Title]", "Ranking..."] }`;
        result = await fetch("/api/pipeline/invoke-llm", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model }), signal: abortController?.signal,
        }).then(async (res) => { if (!res.ok) throw new Error("LLM API failed"); return res.json(); });

        if (result?.messages) {
          const makers = extractDecisionMakers(result.messages as string[]);
          context.decisionMakers = makers;
          context.primaryContact = makers[0]?.name || "Unknown";
        }
      } else if (nextStage === 3) {
        const prompt = `Draft outreach strategy for "${context.broadcasterName}" to ${context.primaryContact}.
          Return: { "messages": ["Drafting outreach...", "<angle>", "Proposing pilot."] }`;
        result = await fetch("/api/pipeline/invoke-llm", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model }), signal: abortController?.signal,
        }).then(async (res) => { if (!res.ok) throw new Error("LLM API failed"); return res.json(); });
        if (result?.messages) context.outreachStrategy = result.messages.join(" ");
      } else if (nextStage === 4) {
        const primaryContact = context.decisionMakers[0] || { name: "Unknown", title: "Decision Maker" };
        const prompt = `Draft outreach email to ${primaryContact.name} at ${context.broadcasterName}.
          Return: { "messages": ["Drafting email...", "(Review before sending)"], "emailSubject": "...", "emailBody": "..." }`;
        result = await fetch("/api/pipeline/invoke-llm", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model }), signal: abortController?.signal,
        }).then(async (res) => { if (!res.ok) throw new Error("LLM API failed"); return res.json(); });

        const messagesText = (result?.messages || []).join("\n");
        const subjectMatch = messagesText.match(/Subject:\s*(.+)/i);
        const bodyMatch    = messagesText.match(/Body:\s*([\s\S]+?)(?=\n\n|$)/i);
        context.emailDraft = subjectMatch && bodyMatch
          ? { subject: subjectMatch[1].trim(), body: bodyMatch[1].trim() }
          : { subject: messagesText.split("\n")[0]?.substring(0, 100) ?? "", body: messagesText };
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
                        <div className="flex-1 overflow-y-auto">
                          {sharedThreadId ? (
                            <CopilotKit runtimeUrl={BACKEND_URL}
                              agent="dashboard_agent"
                              threadId={sharedThreadId}>
                              {getAppComponent()}
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