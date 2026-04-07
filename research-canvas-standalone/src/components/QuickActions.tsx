"use client";

import React from "react";
import { Zap, FileText, Users, CheckCircle2 } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export function QuickActions({ actions, title = "Next Steps" }: QuickActionsProps) {
  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
      </div>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="w-full flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-lg transition-all group cursor-pointer text-left"
          >
            <div className="flex-shrink-0 mt-0.5 text-cyan-400 group-hover:text-cyan-300 transition-colors">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-white/90 transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-white/60 group-hover:text-white/70 transition-colors">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: "scanning" | "parsed" | "found" | "pending";
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    scanning: {
      bg: "bg-blue-500/20",
      border: "border-blue-500/40",
      text: "text-blue-300",
      icon: "⏳",
    },
    parsed: {
      bg: "bg-amber-500/20",
      border: "border-amber-500/40",
      text: "text-amber-300",
      icon: "📄",
    },
    found: {
      bg: "bg-emerald-500/20",
      border: "border-emerald-500/40",
      text: "text-emerald-300",
      icon: "✓",
    },
    pending: {
      bg: "bg-white/10",
      border: "border-white/20",
      text: "text-white/60",
      icon: "○",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded ${config.bg} border ${config.border} ${config.text}`}>
      <span>{config.icon}</span>
      <span>{label}</span>
    </div>
  );
}

interface EmptyStateProps {
  broadcasterName?: string;
  hasResources: boolean;
  onSuggestedAction: (action: string) => void;
}

export function ResearchCanvasEmptyState({
  broadcasterName,
  hasResources,
  onSuggestedAction,
}: EmptyStateProps) {
  if (!broadcasterName) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-white/60 text-sm mb-2">👋 Welcome to Research Canvas</p>
        <p className="text-white/40 text-xs">Enter a broadcaster name to begin discovery</p>
      </div>
    );
  }

  if (!hasResources) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm text-white/80 font-medium mb-3">
            🤖 I&apos;m ready to research <span className="text-purple-300">{broadcasterName}</span>
          </p>
          <p className="text-xs text-white/60 mb-4">
            Let&apos;s start by fetching their ads.txt to discover their current ad server and SSP partnerships.
          </p>
          <button
            onClick={() => onSuggestedAction("fetch_ads_txt")}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all"
          >
            Fetch ads.txt
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSuggestedAction("search_contacts")}
            className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all text-left"
          >
            <div className="text-cyan-400 mb-1">👥</div>
            <p className="text-xs font-medium text-white">Find Contacts</p>
            <p className="text-[10px] text-white/50">LinkedIn, decision makers</p>
          </button>
          <button
            onClick={() => onSuggestedAction("analyze_compatibility")}
            className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all text-left"
          >
            <div className="text-emerald-400 mb-1">✓</div>
            <p className="text-xs font-medium text-white">Check Compatibility</p>
            <p className="text-[10px] text-white/50">Smartclip fit analysis</p>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
