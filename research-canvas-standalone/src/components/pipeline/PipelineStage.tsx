import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";
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

    const messageTimers: NodeJS.Timeout[] = [];

    messages.forEach((_, index) => {
      const timer = setTimeout(() => {
        setDisplayedMessages((prev) => [...prev, messages[index]]);
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

        {displayedMessages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="group"
          >
            <div className="text-white/75 text-xs leading-relaxed flex gap-2">
              <span className="text-white/30 font-mono flex-shrink-0 select-none pt-1">
                •
              </span>
              <span className="break-words flex-1 text-white/70 group-hover:text-white/80 transition-colors">
                {message}
              </span>
            </div>
          </motion.div>
        ))}

        {displayedMessages.length > 0 && status === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-3 mt-3 border-t border-white/10"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-white/40">Complete</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons - Fixed at bottom if needed */}
      {stageIndex === 0 && onNextStage && displayedMessages.length > 0 && status === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-shrink-0 mt-4 pt-3 border-t border-white/10"
        >
          <Button
            onClick={onNextStage}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white gap-2 rounded-full py-2 font-medium text-xs shadow-lg shadow-purple-500/30"
          >
            <span>Next Stage</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
