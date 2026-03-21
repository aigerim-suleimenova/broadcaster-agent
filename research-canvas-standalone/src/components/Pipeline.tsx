"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PipelineStage from "@/components/pipeline/PipelineStage";
import { ResearchCanvas } from "@/components/ResearchCanvas";
import { Dashboard } from "@/components/Dashboard";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCoAgent } from "@copilotkit/react-core";
import { useModelSelectorContext } from "@/lib/model-selector-provider";
import { AgentState } from "@/lib/types";
import Analysis from "./pipeline/Analysis";

// Define pipeline context type for structured data flow between stages
interface PipelineContext {
  broadcasterName: string;
  domain: string;
  // Stage 1: ads.txt Research
  adServer: string;
  fundamentSSPs: string[];
  smartclipPresent: boolean;
  // Stage 2: Compatibility Analysis
  compatibilityScore: number;
  compatibilityNotes: string;
  migrationRisk: "low" | "medium" | "high";
  // Stage 3: Decision Makers
  decisionMakers: Array<{ name: string; title: string }>;
  primaryContact: string;
  // Stage 4: Outreach Strategy
  outreachStrategy?: string;
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

// Helper function to extract smartclip-relevant data from Stage 1 research output
const extractResearchData = (stage1Messages: string[]) => {
  const fullText = stage1Messages.join("\n");

  const adServerMatch = fullText.match(/(?:Detected|Found|using|ad server:)\s+([A-Za-z0-9\s&.-]+?)(?:\s+(?:ad server|adserver)|\\n|,|\.)/i);
  const adServer = adServerMatch ? adServerMatch[1].trim() : "Unknown";

  const sspMatch = fullText.match(/(?:Found SSPs:|SSP:)\s+([A-Za-z0-9\s&.,()-]+?)(?:\\n|,\s+smartclip|Total|\.|$)/i);
  const ssp = sspMatch ? sspMatch[1].trim() : "Not specified";

  const smartclipMatch = fullText.match(/smartclip (detected|not)/i);
  const riskLevel = smartclipMatch && smartclipMatch[1] === "detected" ? "low" : "medium";

  return { adServer, ssp, riskLevel };
};

// Extract compatibility score and notes from Stage 2
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

// Extract decision makers from Stage 3
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
  const { model, agent } = useModelSelectorContext();
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
  const [stageStatuses, setStageStatuses] = useState<
    Array<"pending" | "active" | "complete">
  >([]);
  const [stages, setStages] = useState<
    Array<{ messages: string[]; isCheckpoint: boolean }>
  >([]);
  const [pipelineData, setPipelineData] = useState<Record<string, string[]>>({});
  const [activeStage, setActiveStage] = useState(0);
  const [broadcasterData, setBroadcasterData] = useState<{
    broadcasterName: string;
    domain: string;
    adServer: string;
    fundamentSSPs: string[];
    smartclipPresent: boolean;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pipelineContextRef = useRef<PipelineContext | null>(null);

  const handleTermClick = useCallback(() => {}, []);

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
  }, [stages, stageStatuses]);

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
    };

    // Stage 0 is interactive (ResearchCanvas) - skip LLM, move to Stage 1 after delay
    await new Promise((res) => setTimeout(res, 1000));
    if (abortRef.current || abortController.signal.aborted) return;

    setStageStatuses((prev) => {
      const n = [...prev];
      n[0] = "complete";
      return n;
    });

    // Stages 1-4 run through LLM prompts or deterministic analysis
    for (let i = 1; i < 5; i++) {
      if (abortRef.current || abortController.signal.aborted) return;

      // Mark active
      setStageStatuses((prev) => {
        const n = [...prev];
        n[i] = "active";
        return n;
      });
      setActiveStage(i);

      let result: { messages?: string[] } | undefined;

      try {
        // Stage 1: Use deterministic ads.txt analysis instead of LLM
        if (i === 1) {
          console.log(`[Pipeline] Stage 1: Analyzing ads.txt for ${domain}`);

          const adsTxtResponse = await fetch('/api/pipeline/analyze-ads-txt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain }),
            signal: abortController.signal,
          }).then(async res => {
            if (!res.ok) {
              let errorMsg = `HTTP ${res.status} ${res.statusText}`;
              try {
                const errorData = await res.json();
                if (errorData.error) errorMsg = `${errorMsg}: ${errorData.error}`;
              } catch (e) {
                const text = await res.text();
                if (text) errorMsg = `${errorMsg}: ${text.substring(0, 200)}`;
              }
              console.error(`[Pipeline] Stage 1 API error: ${errorMsg}`);
              throw new Error(`Stage 1 API error: ${errorMsg}`);
            }
            return res.json();
          });

          if (adsTxtResponse.messages) {
            result = { messages: adsTxtResponse.messages };
          }

          // Extract Stage 1 data into context
          if (result?.messages) {
            const stage1Data = extractResearchData(result.messages as string[]);
            context.adServer = stage1Data.adServer;
            context.fundamentSSPs = stage1Data.ssp.split(",").map(s => s.trim()).filter(s => s);
            context.smartclipPresent = stage1Data.riskLevel === "low";

            // Store broadcaster data for Analysis component
            setBroadcasterData({
              broadcasterName: name,
              domain,
              adServer: context.adServer,
              fundamentSSPs: context.fundamentSSPs,
              smartclipPresent: context.smartclipPresent,
            });

            console.log(`[Pipeline] Stage 1 complete - Context updated:`, {
              adServer: context.adServer,
              ssps: context.fundamentSSPs,
              smartclip: context.smartclipPresent,
            });
          } else {
            console.warn(`[Pipeline] Stage 1 returned no messages, using defaults`);
            context.adServer = "Unknown";
            context.fundamentSSPs = [];
            context.smartclipPresent = false;

            // Store broadcaster data with defaults
            setBroadcasterData({
              broadcasterName: name,
              domain,
              adServer: "Unknown",
              fundamentSSPs: [],
              smartclipPresent: false,
            });
          }
        }
        // Stage 2: Compatibility Analysis (receives Stage 1 context)
        else if (i === 2) {
          const enhancedPrompt = `You are a compatibility analysis agent for programmatic advertising migrations.
          Analyze "${name}"'s compatibility with smartclip transition.

          CURRENT TECH STACK:
          - Primary Ad Server: ${context.adServer}
          - Current SSPs: ${context.fundamentSSPs.length > 0 ? context.fundamentSSPs.join(", ") : "Unknown"}
          - smartclip already integrated: ${context.smartclipPresent ? "Yes" : "No"}

          Analyze this broadcaster's infrastructure, technology maturity, and integration complexity.
          Return a JSON object with exactly this structure:
          {
          "messages": [
          "Analyzing compatibility for ${name}...",
          "<detailed compatibility assessment - 2-3 sentences>",
          "<migration risk level and technical challenges>",
          "Compatibility Score: [0-100]/100"
          ]
          }`;

          if (!enhancedPrompt.trim()) {
            throw new Error("Stage 2 prompt is empty");
          }
          console.log(`[Pipeline] Stage 2 prompt length: ${enhancedPrompt.length}`);

          result = await fetch('/api/pipeline/invoke-llm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: enhancedPrompt, model }),
            signal: abortController.signal,
          }).then(async res => {
            if (!res.ok) {
              let errorMsg = `HTTP ${res.status} ${res.statusText}`;
              try {
                const errorData = await res.json();
                if (errorData.error) errorMsg = `${errorMsg}: ${errorData.error}`;
              } catch (e) {
                const text = await res.text();
                if (text) errorMsg = `${errorMsg}: ${text.substring(0, 200)}`;
              }
              console.error(`[Pipeline] Stage 2 API error: ${errorMsg}`);
              throw new Error(`Stage 2 API error: ${errorMsg}`);
            }
            return res.json();
          });

          // Extract Stage 2 data into context
          if (result?.messages) {
            const stage2Data = extractCompatibilityData(result.messages as string[]);
            context.compatibilityScore = stage2Data.score;
            context.migrationRisk = stage2Data.risk;
            context.compatibilityNotes = stage2Data.notes;
            console.log(`[Pipeline] Stage 2 complete - Context updated:`, {
              score: context.compatibilityScore,
              risk: context.migrationRisk,
            });
          }
        }
        // Stage 3: Decision Makers (receives Stage 1-2 context)
        else if (i === 3) {
          const enhancedPrompt = `You are a contact intelligence agent. Identify real or realistic decision makers at "${name}" relevant to a programmatic advertising/adtech partnership.

CONTEXT:
- Current Ad Server: ${context.adServer}
- Compatibility Score: ${context.compatibilityScore}/100
- Migration Difficulty: ${context.migrationRisk}
- SSP Partners: ${context.fundamentSSPs.length > 0 ? context.fundamentSSPs.join(", ") : "Unknown"}

Focus on contacts who would approve or influence a transition to new SSP partners/ad servers.
Return a JSON object with exactly this structure:
{
  "messages": [
    "Identifying decision makers at ${name}...",
    "<2 contacts with name, title, on separate lines, format: Found: [Name], [Title] and Found: [Name], [Title]>",
    "Ranking by partnership relevance..."
  ]
}
Use realistic names and senior titles like Director/VP/Head of Digital Sales, Programmatic, Ad Tech, etc.`;

          if (!enhancedPrompt.trim()) {
            throw new Error("Stage 3 prompt is empty");
          }
          console.log(`[Pipeline] Stage 3 prompt length: ${enhancedPrompt.length}`);

          result = await fetch('/api/pipeline/invoke-llm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: enhancedPrompt, model }),
            signal: abortController.signal,
          }).then(async res => {
            if (!res.ok) {
              let errorMsg = `HTTP ${res.status} ${res.statusText}`;
              try {
                const errorData = await res.json();
                if (errorData.error) errorMsg = `${errorMsg}: ${errorData.error}`;
              } catch (e) {
                const text = await res.text();
                if (text) errorMsg = `${errorMsg}: ${text.substring(0, 200)}`;
              }
              console.error(`[Pipeline] Stage 3 API error: ${errorMsg}`);
              throw new Error(`Stage 3 API error: ${errorMsg}`);
            }
            return res.json();
          });

          // Extract Stage 3 data into context
          if (result?.messages) {
            const makers = extractDecisionMakers(result.messages as string[]);
            context.decisionMakers = makers;
            context.primaryContact = makers[0]?.name || "Unknown";
            console.log(`[Pipeline] Stage 3 complete - Context updated:`, {
              contacts: context.decisionMakers.length,
              primary: context.primaryContact,
            });
          }
        }
        // Stage 4: Outreach Strategy (receives full context)
        else if (i === 4) {
          const enhancedPrompt = `You are an outreach preparation agent. Draft preparation notes for reaching out to the key contact at "${name}".

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
    "<one line referencing ${name}'s specific streaming/digital growth angle>",
    "Proposing ${context.migrationRisk === "low" ? "pilot" : "proof of concept"} on ${context.fundamentSSPs[0] || "SSP"} inventory."
  ]
}`;

          if (!enhancedPrompt.trim()) {
            throw new Error("Stage 4 prompt is empty");
          }
          console.log(`[Pipeline] Stage 4 prompt length: ${enhancedPrompt.length}`);

          result = await fetch('/api/pipeline/invoke-llm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: enhancedPrompt, model }),
            signal: abortController.signal,
          }).then(async res => {
            if (!res.ok) {
              let errorMsg = `HTTP ${res.status} ${res.statusText}`;
              try {
                const errorData = await res.json();
                if (errorData.error) errorMsg = `${errorMsg}: ${errorData.error}`;
              } catch (e) {
                const text = await res.text();
                if (text) errorMsg = `${errorMsg}: ${text.substring(0, 200)}`;
              }
              console.error(`[Pipeline] Stage 4 API error: ${errorMsg}`);
              throw new Error(`Stage 4 API error: ${errorMsg}`);
            }
            return res.json();
          });

          // Extract Stage 4 data
          if (result?.messages) {
            context.outreachStrategy = result.messages.join(" ");
            console.log(`[Pipeline] Stage 4 complete - Outreach drafted`);
          }
        }

        if (abortRef.current) return;

        setStages((prev) => {
          const next = [...prev];
          next[i] = {
            messages: (result?.messages || []) as string[],
            isCheckpoint: false,
          };
          return next;
        });
        setPipelineData((prev) => ({
          ...prev,
          [`stage${i}`]: (result?.messages || []) as string[],
        }));

        // Wait for messages to animate, then mark complete
        await new Promise((res) =>
          setTimeout(res, ((result?.messages || []).length * 1200) + 800)
        );
        if (abortRef.current) return;

        setStageStatuses((prev) => {
          const n = [...prev];
          n[i] = "complete";
          return n;
        });
        setActiveStage(i + 1 < 5 ? i + 1 : i);
        await new Promise((res) => setTimeout(res, 400));
      } catch (error) {
        console.error(`Error in stage ${i}:`, error);
        setStageStatuses((prev) => {
          const n = [...prev];
          n[i] = "complete"; // Mark as complete even on error to allow continuing
          return n;
        });
      }
    }

    if (abortRef.current) return;

    // Stage 5 — checkpoint (stage 4 in array) with full context review
    console.log(`[Pipeline] Stage 5 - Final context:`, context);
    setStageStatuses((prev) => {
      const n = [...prev];
      n[4] = "active";
      return n;
    });
    setActiveStage(4);

    // Generate checkpoint summary showing complete context
    const checkpointMessages = [
      "Pipeline Research Complete ✓",
      `📊 Broadcaster: ${context.broadcasterName}`,
      `🔧 Ad Stack: ${context.adServer} + ${context.fundamentSSPs.length} SSPs`,
      `✅ Compatibility: ${context.compatibilityScore}/100 (${context.migrationRisk} risk)`,
      `👥 Contacts: ${context.decisionMakers.length} decision makers identified`,
      `🎯 Primary: ${context.primaryContact}`,
    ];

    setStages((prev) => {
      const next = [...prev];
      next[4] = {
        messages: checkpointMessages,
        isCheckpoint: true,
      };
      return next;
    });

    await new Promise((res) => setTimeout(res, 800));
    setStageStatuses((prev) => {
      const n = [...prev];
      n[4] = "complete";
      return n;
    });
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1e3a8a] to-[#581c87] text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg shadow-purple-500/50" />
            <h1 className="text-lg font-semibold tracking-tight">
              Pipeline Agent
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {running && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-white/60 hover:text-white hover:bg-white/10 gap-2 rounded-full px-4"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className={running && activeStage === 0 ? "w-full relative z-10" : "max-w-4xl mx-auto px-4 sm:px-6 relative z-10"}>
        <AnimatePresence>
          {!running && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-32 pb-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200">
                  Multi-Step Pipeline Agent
                </h2>
                <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                  Enter a broadcaster name to run the full discovery, analysis, and
                  outreach pipeline with human approval.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-16">
                <Input
                  placeholder="e.g. TF1 Group"
                  value={broadcasterName}
                  onChange={(e) => setBroadcasterName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()}
                  className="bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 h-14 text-base rounded-full px-6 backdrop-blur-sm"
                />
                <Button
                  onClick={handleRun}
                  disabled={!broadcasterName.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-14 px-8 gap-2.5 shrink-0 rounded-full font-medium text-base shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  Run Full Agent Pipeline
                </Button>
              </div>

              {/* Stage pipeline visualization */}
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-white mb-6">Pipeline Stages</h3>
                <div className="space-y-4">
                  {["Broadcaster Research", "Compatibility Analysis", "Decision Makers", "Outreach Preparation", "Checkpoint"].map((stage, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.08] transition-colors">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20">
                        <span className="text-sm font-semibold text-white">{i}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{stage}</h4>
                        <p className="text-xs text-white/60">
                          {i === 0 && "Researching broadcaster profile, ad server, and SSP relationships"}
                          {i === 1 && "Analyzing smartclip compatibility and market fit"}
                          {i === 2 && "Identifying key decision makers for partnership"}
                          {i === 3 && "Preparing personalized outreach strategy"}
                          {i === 4 && "Review and confirm findings"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {running && (
          <div ref={scrollRef} className={running && (activeStage === 0 || activeStage === 1) ? "fixed inset-0 top-[70px] flex flex-col" : "pt-12 pb-12 max-w-4xl mx-auto px-4 sm:px-6"}>
            {/* Stage tabs */}
            <div className={running && (activeStage === 0 || activeStage === 1) ? "flex items-center gap-2 mb-10 px-4 sm:px-6" : "flex items-center gap-2 mb-10"}>
              {stages.map((_, i) => {
                const isAccessible =
                  stageStatuses[i] === "complete" ||
                  stageStatuses[i] === "active";
                return (
                  <button
                    key={i}
                    onClick={() => isAccessible && setActiveStage(i)}
                    disabled={!isAccessible}
                    className={`flex-1 h-1.5 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm transition-all ${isAccessible ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <motion.div
                      className={
                        i === activeStage
                          ? "h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                          : stageStatuses[i] === "complete"
                          ? "h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          : stageStatuses[i] === "active"
                          ? "h-full bg-gradient-to-r from-purple-400 to-pink-400"
                          : "h-full bg-transparent"
                      }
                      initial={{ width: "0%" }}
                      animate={{
                        width:
                          stageStatuses[i] === "complete"
                            ? "100%"
                            : stageStatuses[i] === "active"
                            ? "60%"
                            : "0%",
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </button>
                );
              })}
            </div>

            <div className={running && (activeStage === 0 || activeStage === 1) ? "text-sm text-white/50 font-medium px-4 sm:px-6 pb-4" : "text-sm text-white/50 mb-8 font-medium"}>
              Target: <span className="text-white/80">{broadcasterName}</span>
            </div>

            <div className={running && (activeStage === 0 || activeStage === 1) ? "flex-1 overflow-hidden" : ""}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={running && (activeStage === 0 || activeStage === 1) ? "h-full w-full flex" : ""}
              >
                {activeStage === 0 && running ? (
                  <div className="flex flex-1 relative z-10" style={{ height: "calc(100% - 0px)" }}>
                    <div className="flex-1 overflow-hidden">
                      <ResearchCanvas />
                    </div>
                    <div
                      className="w-[500px] h-full flex-shrink-0 border-l border-white/10"
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
                      <CopilotChat
                        className="h-full"
                        onSubmitMessage={async (message) => {
                          await new Promise((resolve) => setTimeout(resolve, 30));
                        }}
                        labels={{
                          initial: "Hi! How can I assist you with the broadcaster research today?",
                        }}
                      />
                    </div>
                  </div>
                  ) : activeStage === 1 ? (
                  <div className="flex flex-1 relative z-10 w-full h-full" style={{ height: "calc(100% - 0px)" }}>
                    <div className="flex-1 overflow-hidden w-full">
                      <Analysis broadcasterData={broadcasterData} />
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
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
              </motion.div>
            </AnimatePresence>
            </div>

            {/* Prev / Next navigation */}
            <div className={running && (activeStage === 0 || activeStage === 1) ? "hidden" : "flex justify-between mt-8 px-4 sm:px-6"}>
              <button
                onClick={() => setActiveStage((s) => Math.max(0, s - 1))}
                disabled={activeStage === 0}
                className="text-sm text-white/40 hover:text-white disabled:opacity-20 transition-colors px-4 py-2 rounded-full border border-white/10 hover:border-white/30"
              >
                ← Previous
              </button>
              <button
                onClick={() =>
                  setActiveStage((s) =>
                    Math.min(stages.length - 1, s + 1)
                  )
                }
                disabled={
                  activeStage >= stages.length - 1 ||
                  stageStatuses[activeStage + 1] === "pending"
                }
                className="text-sm text-white/40 hover:text-white disabled:opacity-20 transition-colors px-4 py-2 rounded-full border border-white/10 hover:border-white/30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
