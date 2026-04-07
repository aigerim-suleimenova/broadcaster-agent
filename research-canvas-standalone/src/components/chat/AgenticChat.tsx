"use client";
import React, { useState, useEffect } from "react";

import "./style.css";
import {
  useConfigureSuggestions,
  useHumanInTheLoop,
  CopilotChat,
  CopilotChatConfigurationProvider,
} from "@copilotkit/react-core/v2";
import { useLangGraphInterrupt } from "@copilotkit/react-core";
import { sampleDocuments, type SampleDocument } from "@/data/sampleDocuments";
import { Sparkles } from "lucide-react";
import { z } from "zod";

// ─── Config ───────────────────────────────────────────────────────────────────

const CHAT_SUGGESTIONS = sampleDocuments.slice(0, 5).map((doc) => ({
  title: doc.title ?? "Analyze document",
  message: `Use this sample markdown and generate dashboard now:\n\n${doc.content}`,
}));

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useChainAction() {
  return (text: string) => {
    const textarea = document.querySelector(
      'textarea[placeholder*="essage"]'
    ) as HTMLTextAreaElement | null;
    if (!textarea) return;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;
    setter?.call(textarea, text);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    setTimeout(() => {
      const form = textarea.closest("form");
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }, 100);
  };
}

const useDashboardSuggestions = () =>
  useConfigureSuggestions({ suggestions: CHAT_SUGGESTIONS, available: "always" });

// ─── Shared UI primitives (dark-only) ─────────────────────────────────────────

const OptionContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex">
    <div className="relative rounded-xl w-[580px] p-6 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/50">
      {children}
    </div>
  </div>
);

const OptionHeader = ({
  title,
  subtitle,
  selectedCount,
  totalCount,
  status,
  showStatus = false,
}: {
  title: string;
  subtitle?: string;
  selectedCount: number;
  totalCount: number;
  status?: string;
  showStatus?: boolean;
}) => (
  <div className="mb-5">
    <div className="flex items-center justify-between mb-1">
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-400">
          {selectedCount}/{totalCount} selected
        </div>
        {showStatus && (
          <div className={`text-xs px-2 py-1 rounded-full font-medium ${
            status === "executing"
              ? "bg-blue-900/30 text-blue-300 border border-blue-500/30"
              : "bg-slate-700 text-slate-300"
          }`}>
            {status === "executing" ? "Ready" : "Waiting"}
          </div>
        )}
      </div>
    </div>
    {subtitle && (
      <p className="text-xs mb-3 text-slate-400">{subtitle}</p>
    )}
    <div className="relative h-1.5 rounded-full overflow-hidden bg-slate-700">
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${totalCount > 0 ? (selectedCount / totalCount) * 100 : 0}%` }}
      />
    </div>
  </div>
);

const OptionItem = ({
  label,
  description,
  icon,
  selected,
  status,
  onToggle,
  disabled = false,
}: {
  label: string;
  description: string;
  icon?: string;
  selected: boolean;
  status?: string;
  onToggle: () => void;
  disabled?: boolean;
}) => (
  <div
    className={`flex items-start p-3 rounded-lg transition-all duration-200 ${
      selected
        ? "bg-gradient-to-r from-blue-900/25 to-cyan-900/15 border border-blue-500/35"
        : "bg-slate-800/30 border border-slate-600/30"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.01]"}`}
    onClick={disabled ? undefined : onToggle}
  >
    <div className="relative mt-0.5 shrink-0">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
        selected
          ? "bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-500"
          : "border-slate-400 bg-slate-700"
      }`}>
        {selected && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
    <div className="ml-3 flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-base leading-none">{icon}</span>}
        <span className={`text-sm font-semibold text-white ${disabled && !selected ? "line-through opacity-60" : ""}`}>
          {label}
        </span>
      </div>
      <p className="text-xs mt-0.5 leading-relaxed text-slate-400">{description}</p>
    </div>
  </div>
);

const PanelButton = ({
  variant,
  disabled,
  onClick,
  children,
}: {
  variant: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  const base = "px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200";
  const active = "hover:scale-105 shadow-md hover:shadow-lg";
  const inactive = "opacity-50 cursor-not-allowed";

  const variants: Record<string, string> = {
    primary: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg",
  };

  return (
    <button
      className={`${base} ${disabled ? inactive : active} ${variants[variant]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const DecorativeGlow = ({ variant = "default" }: { variant?: "default" | "success" | "danger" }) => (
  <>
    <div className={`absolute top-3 right-3 w-16 h-16 rounded-full blur-xl pointer-events-none ${
      variant === "success" ? "bg-green-500/10"
      : variant === "danger" ? "bg-red-500/10"
      : "bg-blue-500/10"
    }`} />
    <div className="absolute bottom-3 left-3 w-12 h-12 rounded-full blur-xl pointer-events-none bg-cyan-500/10" />
  </>
);

// ─── Analysis option type ──────────────────────────────────────────────────────

interface AnalysisOption {
  label: string;
  description: string;
  icon?: string;
  selected: boolean;
}

function parseOptions(raw: any[]): AnalysisOption[] {
  return raw.map((o: any) => ({
    label: typeof o === "string" ? o : (o.label ?? ""),
    description: typeof o === "object" ? (o.description ?? "") : "",
    icon: typeof o === "object" ? o.icon : undefined,
    selected: typeof o === "object" && o.selected !== undefined ? o.selected : true,
  }));
}

// ─── LangGraph interrupt handler ──────────────────────────────────────────────

const InterruptAnalysisOptions: React.FC<{
  event: { value: { options: AnalysisOption[]; document_title?: string } };
  resolve: (value: string) => void;
}> = ({ event, resolve }) => {
  const [options, setOptions] = useState<AnalysisOption[]>(
    () => parseOptions(event.value?.options ?? [])
  );
  const selectedCount = options.filter((o) => o.selected).length;

  const toggle = (i: number) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, selected: !o.selected } : o)));

  const handleConfirm = () => {
    const chosen = options.filter((o) => o.selected).map((o) => o.label);
    resolve(`Analyze the following dimensions: ${chosen.join(", ")}`);
  };

  return (
    <OptionContainer>
      <OptionHeader
        title="Analysis Options"
        subtitle={
          event.value?.document_title
            ? `Document: ${event.value.document_title}`
            : "Select which broadcast dimensions to include in your dashboard"
        }
        selectedCount={selectedCount}
        totalCount={options.length}
      />
      <div className="space-y-2 mb-5">
        {options.map((opt, i) => (
          <OptionItem
            key={i}
            label={opt.label}
            description={opt.description}
            icon={opt.icon}
            selected={opt.selected}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <PanelButton variant="primary" disabled={selectedCount === 0} onClick={handleConfirm}>
          <span className="mr-1.5">📊</span>
          Generate Dashboard
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-800/50">
            {selectedCount}
          </span>
        </PanelButton>
      </div>
      <DecorativeGlow />
    </OptionContainer>
  );
};

// ─── HITL feedback panel ──────────────────────────────────────────────────────

const AnalysisOptionsFeedback: React.FC<{
  args: any;
  respond: ((value: any) => void) | undefined;
  status: string;
}> = ({ args, respond, status }) => {
  const [options, setOptions] = useState<AnalysisOption[]>([]);
  const [decision, setDecision] = useState<"confirmed" | "rejected" | null>(null);

  useEffect(() => {
    if (
      status === "executing" &&
      options.length === 0 &&
      Array.isArray(args?.options) &&
      args.options.length > 0
    ) {
      setOptions(parseOptions(args.options));
    }
  }, [status, args?.options, options.length]);

  if (!Array.isArray(args?.options) || args.options.length === 0) return null;

  const live = options.length > 0 ? options : (args.options as AnalysisOption[]);
  const selectedCount = live.filter((o) => o.selected).length;

  const toggle = (i: number) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, selected: !o.selected } : o)));

  const handleReject = () => {
    setDecision("rejected");
    respond?.({ accepted: false });
  };

  const handleConfirm = () => {
    setDecision("confirmed");
    respond?.({ accepted: true, options: options.filter((o) => o.selected) });
  };

  return (
    <OptionContainer>
      <OptionHeader
        title="Analysis Options"
        subtitle={
          args?.document_title
            ? `Document: ${args.document_title}`
            : "Select which broadcast dimensions to include in your dashboard"
        }
        selectedCount={selectedCount}
        totalCount={live.length}
        status={status}
        showStatus
      />

      <div className="space-y-2 mb-5">
        {live.map((opt: AnalysisOption, i: number) => (
          <OptionItem
            key={i}
            label={opt.label}
            description={opt.description}
            icon={opt.icon}
            selected={opt.selected}
            status={status}
            onToggle={() => toggle(i)}
            disabled={status !== "executing"}
          />
        ))}
      </div>

      {decision === null && (
        <div className="flex justify-center gap-3">
          <PanelButton variant="secondary" disabled={status !== "executing"} onClick={handleReject}>
            <span className="mr-1.5">✗</span>Skip
          </PanelButton>
          <PanelButton
            variant="success"
            disabled={status !== "executing" || selectedCount === 0}
            onClick={handleConfirm}
          >
            <span className="mr-1.5">✓</span>Confirm
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-green-800/50">
              {selectedCount}
            </span>
          </PanelButton>
        </div>
      )}

      {decision !== null && (
        <div className="flex justify-center">
          <div className={`px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 ${
            decision === "confirmed"
              ? "bg-green-900/30 text-green-300 border border-green-500/30"
              : "bg-red-900/30 text-red-300 border border-red-500/30"
          }`}>
            <span>{decision === "confirmed" ? "✓" : "✗"}</span>
            {decision === "confirmed" ? "Analysis confirmed" : "Skipped"}
          </div>
        </div>
      )}

      <DecorativeGlow variant={
        decision === "confirmed" ? "success" : decision === "rejected" ? "danger" : "default"
      } />
    </OptionContainer>
  );
};

// ─── Public props ─────────────────────────────────────────────────────────────

export interface AgenticChatProps {
  onGenerate?: (content: string) => void;
  isGenerating?: boolean;
  chainRef?: React.RefObject<((text: string) => void) | null>;
}

// ─── DocCard ──────────────────────────────────────────────────────────────────

const DocCard: React.FC<{ doc: SampleDocument; onClick: () => void; disabled?: boolean }> = ({
  doc,
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/40
               text-blue-200 text-xs font-medium
               hover:bg-blue-900/50 hover:border-blue-400/50
               disabled:opacity-40 disabled:cursor-not-allowed
               transition-all whitespace-nowrap"
  >
    {doc.icon} {doc.title}
  </button>
);

// ─── Chat ─────────────────────────────────────────────────────────────────────

const Chat: React.FC<AgenticChatProps> = ({ onGenerate, isGenerating, chainRef }) => {
  useDashboardSuggestions();
  const chain = useChainAction();

  useEffect(() => {
    if (chainRef) {
      (chainRef as React.MutableRefObject<((text: string) => void) | null>).current = chain;
    }
  });

  useLangGraphInterrupt({
    render: ({ event, resolve }) => (
      <InterruptAnalysisOptions event={event as any} resolve={resolve} />
    ),
  });

  useHumanInTheLoop({
    agentId: "dashboard_agent",
    name: "confirm_analysis_options",
    description:
      "Presents broadcaster analysis dimensions for the user to confirm before generating the dashboard. Call this before running analyze_content() to let the user choose which sections to focus on.",
    parameters: z.object({
      document_title: z.string().optional().describe("Title of the document being analyzed"),
      options: z.array(
        z.object({
          label: z.string().describe("Short name of the analysis dimension"),
          description: z.string().describe("One-sentence explanation of what this dimension covers"),
          icon: z.string().optional().describe("Emoji icon for the dimension"),
          selected: z.boolean().describe("Whether this option is selected by default"),
        })
      ).describe("List of broadcaster analysis dimensions the user can enable or disable"),
    }),
    render: ({ args, respond, status }: any) => (
      <AnalysisOptionsFeedback args={args} respond={respond} status={status} />
    ),
  });

  const handleDocClick = (doc: SampleDocument) => {
    onGenerate?.(doc.content);
    chain(`Use this sample markdown and generate dashboard now:\n\n${doc.content}`);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#071428]">
      {isGenerating && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border-b border-blue-500/20">
          <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse shrink-0" />
          <span className="text-xs text-blue-300 font-medium">Generating dashboard…</span>
          <span className="ml-auto flex items-center gap-1">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <CopilotChat agentId="dashboard_agent" className="h-full" />
      </div>

      <div className="shrink-0 px-3 pb-3 pt-2 flex flex-wrap gap-1.5 border-t border-blue-500/10">
        {sampleDocuments.map((doc) => (
          <DocCard key={doc.id} doc={doc} disabled={isGenerating} onClick={() => handleDocClick(doc)} />
        ))}
      </div>
    </div>
  );
};

const AgenticChat: React.FC<AgenticChatProps> = (props) => (
  <CopilotChatConfigurationProvider agentId="dashboard_agent">
    <Chat {...props} />
  </CopilotChatConfigurationProvider>
);

export default AgenticChat;
