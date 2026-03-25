"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, RotateCcw, ArrowRight, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import PipelineStage from "@/components/pipeline/PipelineStage";
import { ResearchCanvas } from "@/components/ResearchCanvas";
import { Dashboard } from "@/components/Dashboard";
import { OutreachSendStage } from "@/components/OutreachSendStage";
import { CopilotChat, CopilotPopup, CopilotSidebar } from "@copilotkit/react-ui";
import { useCoAgent } from "@copilotkit/react-core";
import { AgentState } from "@/lib/types";

// Define pipeline context type for structured data flow between stages
interface PipelineContext {
  broadcasterName: string;
  domain: string;
  // Stage 1: Compatibility Analysis
  compatibilityScore: number;
  compatibilityNotes: string;
  migrationRisk: "low" | "medium" | "high";
  adServer: string;
  fundamentSSPs: string[];
  smartclipPresent: boolean;
  // Stage 2: Decision Makers
  decisionMakers: Array<{ name: string; title: string }>;
  primaryContact: string;
  // Stage 3: Outreach Preparation
  outreachStrategy?: string;
  // Stage 4: Email Outreach
  emailDraft?: {
    subject: string;
    body: string;
  };
  emailsSent?: Array<{ to: string; subject: string; messageId: string }>;
}

// Helper function to convert broadcaster name to domain
const getBroadcasterDomain = (broadcasterName: string): string => {
  // Remove spaces and convert to lowercase
  const cleaned = broadcasterName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
  return `${cleaned}.com`;
};


const extractCompatibilityData = (stage2Messages: string[]) => {
  const fullText = stage2Messages.join("\n");

  // Try to extract score like "Compatibility Score: 75/100"
  const scoreMatch = fullText.match(/(?:Compatibility Score|Score):\s*(\d+)\s*\/\s*100/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 65;

  // Extract risk level from the assessment
  const riskMatch = fullText.match(/(?:Risk|difficulty):\s*(low|medium|high)/i);
  const risk = (riskMatch ? riskMatch[1].toLowerCase() : "medium") as "low" | "medium" | "high";

  // Get the assessment paragraph (usually the last message)
  const notes = stage2Messages[stage2Messages.length - 1] || "";

  return { score, risk, notes };
};

// Extract decision makers from Stage 2
const extractDecisionMakers = (stage3Messages: string[]) => {
  const contactLines = stage3Messages[1] || "";
  const makers: Array<{ name: string; title: string }> = [];

  // Match "Found: [Name], [Title]" pattern
  const matches = contactLines.matchAll(/Found:\s*([^,]+),\s*([^\n]+)/gi);
  for (const match of matches) {
    makers.push({
      name: match[1].trim(),
      title: match[2].trim(),
    });
  }

  return makers.length > 0 ? makers : [{ name: "Unknown", title: "Decision Maker" }];
};

export default function Pipeline() {
  const model = "openai";
  const agent = "research_agent";
  const { state, setState } = useCoAgent<AgentState>({
    name: agent,
    initialState: {
      model,
      research_question: "",
      resources: [],
      report: "",
      logs: [],
    },
  });

  const [broadcasterName, setBroadcasterName] = useState("");
  const [running, setRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStageNumber, setPendingStageNumber] = useState(0);
  const [stageStatuses, setStageStatuses] = useState<
    Array<"pending" | "active" | "complete">
  >([]);
  const [stages, setStages] = useState<
    Array<{ messages: string[]; isCheckpoint: boolean }>
  >([]);
  const [pipelineData, setPipelineData] = useState<Record<string, string[]>>({});
  const [activeStage, setActiveStage] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pipelineContextRef = useRef<PipelineContext | null>(null);

  const handleTermClick = useCallback(() => {}, []);

  // Show confirmation dialog before proceeding
  const showProceedConfirm = () => {
    setPendingStageNumber(activeStage + 1);
    setShowConfirmDialog(true);
  };

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 300);
    return () => clearTimeout(timer);
  }, [stages, stageStatuses, scrollToBottom]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const runPipeline = async (name: string) => {
    abortRef.current = false;
    // Create abort controller for this pipeline run
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const initialStages = [
      { messages: [], isCheckpoint: false },
      { messages: [], isCheckpoint: false },
      { messages: [], isCheckpoint: false },
      { messages: [], isCheckpoint: false },
      { messages: [], isCheckpoint: true },
    ];
    setStages(initialStages);
    setStageStatuses(["active", "pending", "pending", "pending", "pending"]);
    setActiveStage(0);

    // Initialize pipeline context that will be built up through all stages
    const domain = getBroadcasterDomain(name);
    const context: PipelineContext = {
      broadcasterName: name,
      domain,
      adServer: "",
      fundamentSSPs: [],
      smartclipPresent: false,
      compatibilityScore: 0,
      compatibilityNotes: "",
      migrationRisk: "medium",
      decisionMakers: [],
      primaryContact: "",
      emailDraft: undefined,
      emailsSent: [],
    };

    // Store context in ref so handleProceedToNextStage can access it
    pipelineContextRef.current = context;

    // Stage 0 is interactive (ResearchCanvas) - skip LLM, move to Stage 1 after delay
    await new Promise((res) => setTimeout(res, 1000));
    if (abortRef.current || abortController.signal.aborted) return;

    setStageStatuses((prev) => {
      const n = [...prev];
      n[0] = "complete";
      return n;
    });

    // STOP HERE - Wait for user to click "Proceed" button to advance to Stage 1
    // The agent does NOT auto-advance through stages anymore
    setIsProcessing(false);
  };

  // Handler to process the next stage when user clicks "Proceed"
  const handleProceedToNextStage = async () => {
    const nextStage = activeStage + 1;
    if (nextStage >= stages.length) return;

    setIsProcessing(true);

    // Retrieve context and ensure all properties have defaults
    const context = pipelineContextRef.current || ({} as PipelineContext);
    if (!context.fundamentSSPs) context.fundamentSSPs = [];
    if (!context.decisionMakers) context.decisionMakers = [];
    if (!context.compatibilityScore) context.compatibilityScore = 0;
    if (!context.migrationRisk) context.migrationRisk = "medium";
    if (!context.adServer) context.adServer = "Unknown";
    if (!context.primaryContact) context.primaryContact = "Unknown";
    if (!context.compatibilityNotes) context.compatibilityNotes = "";

    const abortController = abortControllerRef.current;
    let result: { messages?: string[] } | undefined;

    try {
      // Mark next stage as active
      setStageStatuses((prev) => {
        const n = [...prev];
        n[nextStage] = "active";
        return n;
      });

      // Stage 1: Compatibility Analysis (formerly Stage 2)
      if (nextStage === 1) {
        const enhancedPrompt = `You are a compatibility analysis agent for programmatic advertising migrations.
          Analyze "${context.broadcasterName}"'s compatibility with smartclip transition.

          CURRENT TECH STACK:
          - Primary Ad Server: ${context.adServer}
          - Current SSPs: ${context.fundamentSSPs.length > 0 ? context.fundamentSSPs.join(", ") : "Unknown"}
          - smartclip already integrated: ${context.smartclipPresent ? "Yes" : "No"}

          Analyze this broadcaster's infrastructure, technology maturity, and integration complexity.
          Return a JSON object with exactly this structure:
          {
          "messages": [
          "Analyzing compatibility for ${context.broadcasterName}...",
          "<detailed compatibility assessment - 2-3 sentences>",
          "<migration risk level and technical challenges>",
          "Compatibility Score: [0-100]/100"
          ]
          }`;

        result = await fetch('/api/pipeline/invoke-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: enhancedPrompt, model }),
          signal: abortController?.signal,
        }).then(async res => {
          if (!res.ok) throw new Error('LLM API failed');
          return res.json();
        });

        if (result?.messages) {
          const stage2Data = extractCompatibilityData(result.messages as string[]);
          context.compatibilityScore = stage2Data.score;
          context.migrationRisk = stage2Data.risk;
          context.compatibilityNotes = stage2Data.notes;
        }
      }
      // Stage 2: Decision Makers (formerly Stage 3)
      else if (nextStage === 2) {
        const enhancedPrompt = `You are a contact intelligence agent. Identify real or realistic decision makers at "${context.broadcasterName}" relevant to a programmatic advertising/adtech partnership.

CONTEXT:
- Current Ad Server: ${context.adServer}
- Compatibility Score: ${context.compatibilityScore}/100
- Migration Difficulty: ${context.migrationRisk}
- SSP Partners: ${context.fundamentSSPs.length > 0 ? context.fundamentSSPs.join(", ") : "Unknown"}

Focus on contacts who would approve or influence a transition to new SSP partners/ad servers.
Return a JSON object with exactly this structure:
{
  "messages": [
    "Identifying decision makers at ${context.broadcasterName}...",
    "<2 contacts with name, title, on separate lines, format: Found: [Name], [Title] and Found: [Name], [Title]>",
    "Ranking by partnership relevance..."
  ]
}
Use realistic names and senior titles like Director/VP/Head of Digital Sales, Programmatic, Ad Tech, etc.`;

        result = await fetch('/api/pipeline/invoke-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: enhancedPrompt, model }),
          signal: abortController?.signal,
        }).then(async res => {
          if (!res.ok) throw new Error('LLM API failed');
          return res.json();
        });

        if (result?.messages) {
          const makers = extractDecisionMakers(result.messages as string[]);
          context.decisionMakers = makers;
          context.primaryContact = makers[0]?.name || "Unknown";
        }
      }
      // Stage 3: Outreach Strategy (formerly Stage 4)
      else if (nextStage === 3) {
        const enhancedPrompt = `You are an outreach preparation agent. Draft preparation notes for reaching out to the key contact at "${context.broadcasterName}".

FULL CONTEXT:
- Broadcaster: ${context.broadcasterName}
- Current Stack: ${context.adServer}, SSPs: ${context.fundamentSSPs.length > 0 ? context.fundamentSSPs.join(", ") : "Unknown"}
- Compatibility Score: ${context.compatibilityScore}/100
- Migration Difficulty: ${context.migrationRisk}
- Primary Contact: ${context.primaryContact}

The key contact is: ${context.primaryContact || "the Head of Programmatic"}.

Propose a strategic outreach focusing on ${context.migrationRisk === "low" ? "quick pilot" : "phased migration"} approach.
Return a JSON object with exactly this structure:
{
  "messages": [
    "Drafting outreach to ${context.primaryContact}...",
    "<one line referencing ${context.broadcasterName}'s specific streaming/digital growth angle>",
    "Proposing ${context.migrationRisk === "low" ? "pilot" : "proof of concept"} on ${context.fundamentSSPs[0] || "SSP"} inventory."
  ]
}`;

        result = await fetch('/api/pipeline/invoke-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: enhancedPrompt, model }),
          signal: abortController?.signal,
        }).then(async res => {
          if (!res.ok) throw new Error('LLM API failed');
          return res.json();
        });

        if (result?.messages) {
          context.outreachStrategy = result.messages.join(" ");
        }
      }
      // Stage 4: Email Outreach Draft
      else if (nextStage === 4) {
        const primaryContact = context.decisionMakers[0] || { name: "Unknown", title: "Decision Maker" };

        const emailPrompt = `You are an expert outreach email writer for broadcast partnerships.

BROADCASTER: ${context.broadcasterName}
CONTACT: ${primaryContact.name}, ${primaryContact.title}
PARTNERSHIP CONTEXT: Smartclip SSP Integration Opportunity
COMPATIBILITY: ${context.compatibilityScore}/100 (${context.migrationRisk} risk)

Draft a professional, personalized 3-4 paragraph outreach email that:
1. Opens with a specific insight about ${context.broadcasterName}'s current setup
2. Explains the smartclip integration value prop
3. Briefly references their current ad server (${context.adServer})
4. Proposes a brief call to discuss
5. Includes a clear CTA

Format the response as JSON:
{
  "messages": [
    "Drafting email for ${primaryContact.name}...",
    "(This is a draft - review and edit before sending)"
  ],
  "emailSubject": "[Your subject line here]",
  "emailBody": "[Complete email body]"
}`;

        result = await fetch('/api/pipeline/invoke-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: emailPrompt, model }),
          signal: abortController?.signal,
        }).then(async res => {
          if (!res.ok) throw new Error('LLM API failed');
          return res.json();
        });

        // Parse email from response messages
        const messagesText = (result?.messages || []).join('\n');
        const subjectMatch = messagesText.match(/Subject:\s*(.+)/i);
        const bodyMatch = messagesText.match(/Body:\s*([\s\S]+?)(?=\n\n|$)/i);

        if (subjectMatch && bodyMatch) {
          context.emailDraft = {
            subject: subjectMatch[1].trim(),
            body: bodyMatch[1].trim(),
          };
        } else if (messagesText) {
          // Fallback: use first part as subject, rest as body
          const parts = messagesText.split('\n');
          context.emailDraft = {
            subject: parts[0].substring(0, 100),
            body: messagesText,
          };
        }
      }

      // Update stages with results
      setStages((prev) => {
        const next = [...prev];
        next[nextStage] = {
          messages: (result?.messages || []) as string[],
          isCheckpoint: false,
        };
        return next;
      });

      // Wait for messages to animate
      await new Promise((res) =>
        setTimeout(res, ((result?.messages || []).length * 1200) + 800)
      );

      // Mark stage as complete and PAUSE - Wait for next "Proceed" click
      setStageStatuses((prev) => {
        const n = [...prev];
        n[nextStage] = "complete";
        return n;
      });

      setIsProcessing(false);
    } catch (error) {
      console.error(`Error in stage ${nextStage}:`, error);
      setStageStatuses((prev) => {
        const n = [...prev];
        n[nextStage] = "complete";
        return n;
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1e3a8a] to-[#581c87] text-white relative overflow-hidden flex flex-col">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
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
          <div className="flex items-center gap-3">
            {running && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-white/50">Processing</p>
                  <p className="text-sm font-semibold text-white">{broadcasterName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-white/60 hover:text-white hover:bg-white/10 gap-2 rounded-full px-3 sm:px-4 h-9"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex flex-col">
        <AnimatePresence>
          {!running && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex-1 flex flex-col justify-center">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-20">
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200">
                    Multi-Step Pipeline Agent
                  </h2>
                  <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                    Enter a broadcaster name to launch an intelligent discovery, analysis, and outreach pipeline with human approval gates.
                  </p>
                </div>

                {/* Input Section */}
                <div className="max-w-2xl mx-auto mb-16">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="e.g. BBC, Paramount, TF1 Group, Sky..."
                      value={broadcasterName}
                      onChange={(e) => setBroadcasterName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRun()}
                      className="flex-1 bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 h-12 text-base rounded-lg px-4 backdrop-blur-sm transition-all"
                    />
                    <Button
                      onClick={handleRun}
                      disabled={!broadcasterName.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-12 px-6 sm:px-8 gap-2 shrink-0 rounded-lg font-medium text-base shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Pipeline</span>
                    </Button>
                  </div>
                </div>

                {/* Pipeline Stages Grid */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-6 text-center">Discovery Pipeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-2 max-w-4xl mx-auto">
                    {[
                      { num: 0, name: "Research", desc: "Broadcaster profile & tech stack", icon: "🔍" },
                      { num: 1, name: "Compatibility", desc: "Smartclip fit analysis", icon: "⚙️" },
                      { num: 2, name: "Decision Makers", desc: "Key contact identification", icon: "👥" },
                      { num: 3, name: "Outreach Plan", desc: "Personalized strategy", icon: "📋" },
                      { num: 4, name: "Review", desc: "Final approval checkpoint", icon: "✅" },
                    ].map((stage) => (
                      <motion.div
                        key={stage.num}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: stage.num * 0.1 }}
                      >
                        <div className="group bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg p-4 sm:p-3 h-full hover:border-purple-500/30 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-purple-500/5 transition-all duration-300">
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
          <div className={`flex-1 flex flex-col overflow-hidden ${activeStage === 0 ? "fixed inset-0 top-[70px]" : ""}`}>
            {/* Stage Progress Bar */}
            <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4">
              <div className="max-w-6xl mx-auto space-y-3">
                {/* Progress Indicators */}
                <div className="flex items-center gap-2">
                  {stages.map((_, i) => {
                    const isAccessible = stageStatuses[i] === "complete" || stageStatuses[i] === "active";
                    const isActive = i === activeStage;
                    const isComplete = stageStatuses[i] === "complete";

                    return (
                      <button
                        key={i}
                        onClick={() => isAccessible && setActiveStage(i)}
                        disabled={!isAccessible}
                        className={`h-2 rounded-full transition-all ${
                          isActive
                            ? "flex-1 bg-gradient-to-r from-cyan-400 to-purple-500"
                            : isComplete
                            ? "flex-1 bg-gradient-to-r from-emerald-400 to-green-500"
                            : "flex-1 bg-white/10"
                        } ${isAccessible ? "cursor-pointer" : "cursor-default"}`}
                      />
                    );
                  })}
                </div>

                {/* Stage Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 font-medium">Stage {activeStage + 1} of {stages.length}</p>
                    <p className="text-sm font-semibold text-white">
                      {["Research", "Compatibility", "Decision Makers", "Outreach Plan", "Review"][activeStage]}
                    </p>
                  </div>
                  <div className="text-xs text-white/50">
                    {["Researching broadcaster...", "Analyzing compatibility...", "Finding contacts...", "Preparing outreach...", "Ready for review"][activeStage]}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div ref={scrollRef} className="flex-1 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex-1 overflow-y-auto">
                  {activeStage === 0 && running ? (
                    <div className="w-full h-full flex flex-col" style={{ height: "calc(100% - 0px)" }}>
                      <div
                        className="flex-1 overflow-y-auto bg-white/5"
                        style={
                          {
                            "--copilot-kit-background-color": "#0a1628",
                            "--copilot-kit-secondary-color": "#a78bfa",
                            "--copilot-kit-separator-color": "#4c1d95",
                            "--copilot-kit-primary-color": "#FFFFFF",
                            "--copilot-kit-contrast-color": "#FFFFFF",
                            "--copilot-kit-secondary-contrast-color": "#a78bfa",
                          } as any
                        }
                      >
                        <CopilotPopup
                          onSubmitMessage={async (message) => {
                            await new Promise((resolve) => setTimeout(resolve, 30));
                          }}
                          labels={{
                            title: "Pipeline Assistant",
                            initial: "Hi! How can I assist you with the broadcaster research today?",
                          }}
                        >
                          <div className="w-full h-full flex flex-col">
                            <div className="flex-1 overflow-hidden">
                              <ResearchCanvas />
                            </div>
                          </div>
                        </CopilotPopup>
                      </div>
                    </div>
                  ) : activeStage === 4 ? (
                    <div className="w-full h-full flex flex-col">
                      {pipelineContextRef.current && pipelineContextRef.current.emailDraft ? (
                        <OutreachSendStage
                          status={stageStatuses[4] || "active"}
                          contactName={pipelineContextRef.current.decisionMakers[0]?.name || "Contact"}
                          contactEmail={pipelineContextRef.current.decisionMakers[0]?.title.includes("@") ? pipelineContextRef.current.decisionMakers[0].title : "contact@" + pipelineContextRef.current.domain}
                          contactTitle={pipelineContextRef.current.decisionMakers[0]?.title || "Decision Maker"}
                          broadcasterName={pipelineContextRef.current.broadcasterName}
                          draftSubject={pipelineContextRef.current.emailDraft.subject}
                          draftBody={pipelineContextRef.current.emailDraft.body}
                          onEmailSent={(messageId, subject, to) => {
                            if (!pipelineContextRef.current) return;
                            if (!pipelineContextRef.current.emailsSent) {
                              pipelineContextRef.current.emailsSent = [];
                            }
                            pipelineContextRef.current.emailsSent.push({ to, subject, messageId });
                          }}
                          onCancel={() => setActiveStage((s) => Math.min(stages.length - 1, s + 1))}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin mb-3 inline-block">
                              <Clock className="w-8 h-8 text-purple-400" />
                            </div>
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4">
                  <div className="max-w-5xl mx-auto flex justify-between items-center">
                  <div>
                    <p className="text-sm text-white/70 font-medium">
                      Stage complete. Ready to continue?
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/10 border border-white/20 rounded-lg px-4"
                    >
                      Exit Pipeline
                    </Button>
                    <Button
                      onClick={showProceedConfirm}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 gap-2 rounded-lg font-semibold shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <div className="inline-block">
                              <Clock className="w-4 h-4" />
                            </div>
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          Next Stage
                        </>
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
              You&apos;ve completed the {["Broadcaster Research", "Compatibility Analysis", "Decision Makers", "Outreach Planning"][pendingStageNumber - 1]} stage. Review the findings above before proceeding to the next step.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0 flex-row justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-white/20 text-white hover:bg-white/10 rounded-lg"
            >
              Review More
            </Button>
            <Button
              onClick={async () => {
                setShowConfirmDialog(false);
                setActiveStage(pendingStageNumber);
                setTimeout(() => handleProceedToNextStage(), 0);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
