import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, TrendingUp, Users, Mail, Briefcase, Award, Lightbulb } from "lucide-react";

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

interface PipelineStageProps {
  stageIndex: number;
  status: "pending" | "active" | "complete";
  messages: string[];
  messageBaseDelay: number;
  isCheckpoint?: boolean;
  broadcasterName: string;
  pipelineData?: Record<string, string[]>;
  scoreBreakdown?: ScoreBreakdown;
  compatibilityScore?: number;
  migrationRisk?: "low" | "medium" | "high";
  onTermClick?: () => void;
  onNextStage?: () => void;
}

const STAGE_NAMES = [
  "Broadcaster Research",
  "Compatibility Analysis",
  "Decision Makers",
  "Outreach Preparation",
  "Checkpoint",
];

const STAGE_DESCRIPTIONS = [
  "Researching broadcaster profile, ad server, and SSP relationships",
  "Analyzing smartclip compatibility and market fit",
  "Identifying key decision makers for partnership",
  "Preparing personalized outreach strategy",
  "Review and confirm findings",
];

// Helper function to parse messages and clean JSON
const parseAndCleanMessages = (messages: string[]): string[] => {
  const cleanedMessages: string[] = [];
  const seenMessages = new Set<string>(); // Track seen messages to avoid duplicates

  // List of section headers and patterns to skip
  const skipPatterns = [
    'Reasoning behind',
    'Primary Ad Server',
    'Current SSPs',
    'Technology Maturity',
    'Compatibility Score',
    'Approach',
    'Timeline',
    'Phased Migration Approach',
    'Key Benefits',
    'Assessment and Planning',
    'Migration Planning',
    'Pilot Program',
    'Full Migration',
    'Proof of Concept'
  ];

  messages.forEach(msg => {
    // Skip empty messages
    if (!msg || msg.trim().length === 0) {
      return;
    }

    // Remove markdown code blocks and clean the message
    const cleanMsg = msg.replace(/```json|```/g, '').trim();

    // Try to extract JSON from the message
    const jsonMatch = cleanMsg.match(/\{[\s\S]*"messages"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);

        // If it has a messages array, extract those
        if (Array.isArray(parsed.messages)) {
          parsed.messages.forEach((m: string) => {
            if (m && typeof m === 'string' && !m.startsWith('{') && !seenMessages.has(m.trim())) {
              cleanedMessages.push(m.trim());
              seenMessages.add(m.trim());
            }
          });
        }
        return;
      } catch (e) {
        // Not valid JSON, continue
      }
    }

    // Skip if message starts with JSON markers
    if (cleanMsg.startsWith('{') || cleanMsg.startsWith('[')) {
      return;
    }

    // Skip if message contains section headers or reasoning
    if (skipPatterns.some(pattern => cleanMsg.includes(pattern))) {
      return;
    }

    // Add regular messages if not already seen
    if (!seenMessages.has(cleanMsg)) {
      cleanedMessages.push(cleanMsg);
      seenMessages.add(cleanMsg);
    }
  });

  return cleanedMessages;
};

// Helper functions to extract structured data from messages

const extractDecisionMakers = (messages: string[]): Array<{name: string; title: string}> => {
  const makers: Array<{name: string; title: string}> = [];
  const seen = new Set<string>();
  for (const msg of messages) {
    // Primary: parse "Found: Name, Title" lines (the format the LLM is instructed to use)
    const foundMatches = [...msg.matchAll(/Found:\s*([^,\n]+),\s*([^\n]+)/gi)];
    for (const m of foundMatches) {
      const name = m[1].trim();
      if (!seen.has(name)) {
        makers.push({ name, title: m[2].trim() });
        seen.add(name);
      }
    }
  }
  // Fallback: extract any "Name, Senior Title" pattern if "Found:" format wasn't used
  if (makers.length === 0) {
    for (const msg of messages) {
      const m = msg.match(/([A-Z][a-z]+ [A-Z][a-z]+),?\s+((?:VP|Head|Chief|Director|Manager|CTO|CDO|SVP)[^.\n]{0,60})/);
      if (m && !seen.has(m[1].trim())) {
        makers.push({ name: m[1].trim(), title: m[2].trim() });
        seen.add(m[1].trim());
      }
    }
  }
  return makers;
};

const extractOutreachStrategy = (messages: string[]): {proposition?: string; approach?: string; timeline?: string} => {
  // The LLM prompt defines exact indices: [0]=status, [1]=value prop, [2]=approach, [3]=pilot/timeline
  // Use positional access first; fall back to keyword scan if indices are off.
  const nonEmpty = messages.filter(m => m && m.trim().length > 0);
  return {
    proposition: nonEmpty[1] ?? nonEmpty.find(m => m.includes("proposition") || m.includes("value") || m.includes("uniquely")),
    approach:    nonEmpty[2] ?? nonEmpty.find(m => m.includes("approach") || m.includes("strategy") || m.includes("LinkedIn") || m.includes("email")),
    timeline:    nonEmpty[3] ?? nonEmpty.find(m => m.includes("pilot") || m.includes("timeline") || m.includes("week") || m.includes("day")),
  };
};

export default function PipelineStage({
  stageIndex,
  status,
  messages,
  messageBaseDelay,
  isCheckpoint,
  broadcasterName,
  scoreBreakdown,
  compatibilityScore,
  migrationRisk,
}: PipelineStageProps) {
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);

  useEffect(() => {
    if (status !== "active" && status !== "complete") {
      setDisplayedMessages([]);
      return;
    }

    // Clean messages first
    const cleanedMessages = parseAndCleanMessages(messages);
    const messageTimers: NodeJS.Timeout[] = [];

    cleanedMessages.forEach((_, index) => {
      const timer = setTimeout(() => {
        setDisplayedMessages((prev) => [...prev, cleanedMessages[index]]);
      }, messageBaseDelay * (index + 1));
      messageTimers.push(timer);
    });

    return () => messageTimers.forEach(clearTimeout);
  }, [status, messages, messageBaseDelay]);

  const getStatusIcon = () => {
    switch (status) {
      case "complete":
        return (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
        );
      case "active":
        return <Clock className="w-5 h-5 text-cyan-400 animate-spin" />;
      case "pending":
        return <AlertCircle className="w-5 h-5 text-white/30" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "complete":
        return "Complete";
      case "active":
        return "Processing";
      case "pending":
        return "Pending";
    }
  };

  if (isCheckpoint) {
    return (
      <div className="bg-gradient-to-r from-white/5 to-white/0 border border-white/10 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <h3 className="text-xl font-semibold">Ready for Human Review</h3>
        </div>
        <p className="text-white/60 mb-6">
          Pipeline execution complete. All findings are ready for your review and
          approval before sending outreach.
        </p>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Target Broadcaster</div>
          <div className="text-lg font-semibold text-white">{broadcasterName}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      {/* Stage Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 pt-1">{getStatusIcon()}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white">{STAGE_NAMES[stageIndex]}</h3>
              <p className="text-sm text-white/60 mt-1">{STAGE_DESCRIPTIONS[stageIndex]}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-white/20 text-white backdrop-blur-sm">
                {getStatusText()}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {displayedMessages.length === 0 && status === "active" && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-purple-400" />
                </div>
              </motion.div>
              <div className="text-center">
                <p className="text-white font-medium">Processing Stage {stageIndex + 1}</p>
                <p className="text-white/50 text-sm mt-1">
                  {["Researching broadcaster profile...", "Analyzing compatibility...", "Finding key contacts...", "Planning outreach strategy..."][stageIndex] || "Processing..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {stageIndex === 1 && displayedMessages.length > 0 && (() => {
          const score = compatibilityScore ?? 0;
          const riskLevel = migrationRisk ?? "medium";
          const scoreColor = score >= 80 ? "from-emerald-400 to-green-400" : score >= 60 ? "from-cyan-400 to-blue-400" : "from-amber-400 to-orange-400";
          const riskColor = riskLevel === "low" ? "text-emerald-400" : riskLevel === "high" ? "text-red-400" : "text-amber-400";

          const CRITERIA_LABELS: Record<keyof ScoreBreakdown, string> = {
            adServerCompatibility: "Ad Server Compatibility",
            sspOverlap: "SSP Overlap",
            videoInventory: "Video Inventory Fit",
            revenueOpportunity: "Revenue Opportunity",
            migrationEase: "Migration Ease",
          };

          return (
            <div key="stage1" className="space-y-3">
              {/* Total score */}
              <div className="bg-gradient-to-r from-white/5 to-white/0 border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Compatibility Score</span>
                  <span className="ml-auto text-xs text-white/40">weighted average</span>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${scoreColor}`}>{score}</span>
                    <span className="text-xs text-white/60">/100</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${score}%` }} className={`h-full bg-gradient-to-r ${scoreColor} transition-all duration-700`} />
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              {scoreBreakdown && (
                <div className="space-y-2">
                  {(Object.entries(scoreBreakdown) as Array<[keyof ScoreBreakdown, ScoreCriterion]>).map(([key, { score: s, reason }]) => {
                    const barColor = s >= 80 ? "bg-emerald-400" : s >= 60 ? "bg-cyan-400" : "bg-amber-400";
                    return (
                      <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-white/70">{CRITERIA_LABELS[key]}</span>
                          <span className="text-xs font-bold text-white">{s}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden mb-1.5">
                          <div style={{ width: `${s}%` }} className={`h-full ${barColor} transition-all duration-500`} />
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">{reason}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Risk level */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${riskLevel === "low" ? "bg-emerald-400" : riskLevel === "high" ? "bg-red-400" : "bg-amber-400"}`} />
                  <span className="text-xs text-white/60">Migration Risk:</span>
                  <span className={`text-xs font-semibold ${riskColor} capitalize`}>{riskLevel}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {stageIndex === 2 && displayedMessages.length > 0 && (() => {
          const makers = extractDecisionMakers(displayedMessages);
          return (
            <div key="stage2" className="space-y-3">
              <div className="bg-gradient-to-r from-white/5 to-white/0 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Decision Makers</span>
                  <span className="ml-auto text-xs bg-cyan-500/20 border border-cyan-500/30 rounded-full px-2 py-0.5 text-cyan-300">{makers.length}</span>
                </div>
              </div>
              {makers.map((maker, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-xs">{maker.name}</div>
                      <div className="text-xs text-white/60">{maker.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {stageIndex === 3 && displayedMessages.length > 0 && (() => {
          const strategy = extractOutreachStrategy(displayedMessages);
          return (
            <div key="stage3" className="space-y-3">
              <div className="bg-gradient-to-r from-white/5 to-white/0 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Outreach Strategy</span>
                </div>
              </div>
              {strategy.proposition && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Award className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white mb-1">Value Proposition</div>
                      <div className="text-xs text-white/70">{strategy.proposition}</div>
                    </div>
                  </div>
                </div>
              )}
              {strategy.approach && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white mb-1">Approach</div>
                      <div className="text-xs text-white/70">{strategy.approach}</div>
                    </div>
                  </div>
                </div>
              )}
              {strategy.timeline && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white mb-1">Timeline</div>
                      <div className="text-xs text-white/70">{strategy.timeline}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {![1, 2, 3].includes(stageIndex) && displayedMessages.length > 0 && (
          <div className="space-y-3">
            {displayedMessages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="group bg-white/[0.03] border border-white/10 rounded-lg p-3 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm leading-relaxed break-words">{message}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {displayedMessages.length > 0 && status === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2 px-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-white">Stage Complete</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
