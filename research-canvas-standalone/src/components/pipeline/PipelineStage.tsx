import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, ArrowRight, TrendingUp, Users, Target, Zap, Shield, Mail, Briefcase, Award, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PipelineStageProps {
  stageIndex: number;
  status: "pending" | "active" | "complete";
  messages: string[];
  messageBaseDelay: number;
  isCheckpoint?: boolean;
  broadcasterName: string;
  pipelineData?: Record<string, string[]>;
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
    let cleanMsg = msg.replace(/```json|```/g, '').trim();

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
const extractCompatibilityScore = (messages: string[]): number => {
  const scoreMsg = messages.find(m => m.includes("Score") || m.includes("score"));
  if (scoreMsg) {
    const match = scoreMsg.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
};

const extractRiskLevel = (messages: string[]): "low" | "medium" | "high" => {
  const riskMsg = messages.find(m => m.toLowerCase().includes("risk"));
  if (riskMsg?.toLowerCase().includes("low")) return "low";
  if (riskMsg?.toLowerCase().includes("high")) return "high";
  return "medium";
};

const extractDecisionMakers = (messages: string[]): Array<{name: string; title: string}> => {
  const makers: Array<{name: string; title: string}> = [];
  messages.forEach(msg => {
    if (msg.includes("Decision Maker") || msg.includes("Manager") || msg.includes("Director")) {
      const match = msg.match(/([A-Z][a-z]+ [A-Z][a-z]+).*?(\w+\s*(?:Manager|Director|Head|Officer))/i);
      if (match) {
        makers.push({
          name: match[1],
          title: match[2]
        });
      }
    }
  });
  return makers;
};

const extractOutreachStrategy = (messages: string[]): {proposition?: string; approach?: string; timeline?: string} => {
  return {
    proposition: messages.find(m => m.includes("proposition") || m.includes("value"))?.substring(0, 80),
    approach: messages.find(m => m.includes("approach") || m.includes("strategy"))?.substring(0, 80),
    timeline: messages.find(m => m.includes("timeline") || m.includes("week") || m.includes("day"))?.substring(0, 80)
  };
};

export default function PipelineStage({
  stageIndex,
  status,
  messages,
  messageBaseDelay,
  isCheckpoint,
  broadcasterName,
  onNextStage,
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Stage Header - Fixed */}
      <div className="flex-shrink-0 pb-4 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {getStatusIcon()}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-white truncate">
                {STAGE_NAMES[stageIndex]}
              </h3>
              <p className="text-xs text-white/50 line-clamp-2">
                {STAGE_DESCRIPTIONS[stageIndex]}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Messages Container - Scrollable */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-3 px-1">
        {displayedMessages.length === 0 && status === "active" && (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-pulse text-white/40">
                <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-cyan-400 animate-spin" />
              </div>
              <p className="text-xs text-white/40">Processing...</p>
            </div>
          </div>
        )}

        {/* Stage 1: Compatibility Analysis - Enhanced View */}
        {stageIndex === 1 && displayedMessages.length > 0 && (
          <div className="space-y-3">
            {(() => {
              const score = extractCompatibilityScore(displayedMessages);
              const riskLevel = extractRiskLevel(displayedMessages);
              const scoreColor = score >= 80 ? "from-emerald-400 to-green-400" : score >= 60 ? "from-cyan-400 to-blue-400" : "from-amber-400 to-orange-400";
              const riskColor = riskLevel === "low" ? "text-emerald-400" : riskLevel === "high" ? "text-red-400" : "text-amber-400";

              return (
                <>
                  <div className="bg-gradient-to-r from-white/5 to-white/0 border border-white/10 rounded-lg p-4 space-y-3">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold text-white">Compatibility Score</span>
                      </div>
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-baseline gap-2">
                            <span className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${scoreColor}`}>{score}</span>
                            <span className="text-xs text-white/60">/100</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div style={{ width: `${score}%` }} className={`h-full bg-gradient-to-r ${scoreColor}`} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${riskLevel === "low" ? "bg-emerald-400" : riskLevel === "high" ? "bg-red-400" : "bg-amber-400"}`} />
                        <span className="text-xs text-white/60">Risk Level:</span>
                        <span className={`text-xs font-semibold ${riskColor} capitalize`}>{riskLevel}</span>
                      </div>
                    </motion.div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Stage 2: Decision Makers - Enhanced View */}
        {stageIndex === 2 && displayedMessages.length > 0 && (
          <div className="space-y-3">
            {(() => {
              const makers = extractDecisionMakers(displayedMessages);
              return (
                <>
                  <div className="bg-gradient-to-r from-white/5 to-white/0 border border-white/10 rounded-lg p-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold text-white">Decision Makers Identified</span>
                        <span className="ml-auto text-xs bg-cyan-500/20 border border-cyan-500/30 rounded-full px-2 py-0.5 text-cyan-300">{makers.length || displayedMessages.length}</span>
                      </div>
                    </motion.div>
                  </div>
                  {makers.map((maker, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-cyan-500/30 transition-colors">
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + idx * 0.1 }}>
                        <div className="flex items-start gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-xs">{maker.name}</div>
                            <div className="text-xs text-white/60">{maker.title}</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}

        {/* Stage 3: Outreach Preparation - Enhanced View */}
        {stageIndex === 3 && displayedMessages.length > 0 && (
          <div className="space-y-3">
            {(() => {
              const strategy = extractOutreachStrategy(displayedMessages);
              return (
                <>
                  <div className="bg-gradient-to-r from-white/5 to-white/0 border border-white/10 rounded-lg p-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold text-white">Outreach Strategy</span>
                      </div>
                    </motion.div>
                  </div>
                  {strategy.proposition && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <div className="flex items-start gap-2">
                          <Award className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white mb-1">Value Proposition</div>
                            <div className="text-xs text-white/70">{strategy.proposition}</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                  {strategy.approach && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white mb-1">Approach</div>
                            <div className="text-xs text-white/70">{strategy.approach}</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                  {strategy.timeline && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white mb-1">Timeline</div>
                            <div className="text-xs text-white/70">{strategy.timeline}</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Generic message display for other stages */}
        {![1, 2, 3].includes(stageIndex) && displayedMessages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <div className="text-white/75 text-xs leading-relaxed flex gap-2 group">
              <span className="text-white/30 font-mono flex-shrink-0 select-none pt-1">
                •
              </span>
              <span className="break-words flex-1 text-white/70 group-hover:text-white/80 transition-colors">
                {message}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Show remaining messages for enhanced stages */}
        {[1, 2, 3].includes(stageIndex) && displayedMessages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
          >
            <div className="text-white/75 text-xs leading-relaxed flex gap-2 group">
              <span className="text-white/30 font-mono flex-shrink-0 select-none pt-1">
                •
              </span>
              <span className="break-words flex-1 text-white/70 group-hover:text-white/80 transition-colors text-xs">
                {message}
              </span>
            </div>
          </motion.div>
        ))}

        {displayedMessages.length > 0 && status === "complete" && (
          <div className="pt-3 mt-3 border-t border-white/10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-white/40">Complete</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed at bottom if needed */}
      {stageIndex === 0 && onNextStage && displayedMessages.length > 0 && status === "complete" && (
        <div className="flex-shrink-0 mt-4 pt-3 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={onNextStage}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white gap-2 rounded-full py-2 font-medium text-xs shadow-lg shadow-purple-500/30"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
