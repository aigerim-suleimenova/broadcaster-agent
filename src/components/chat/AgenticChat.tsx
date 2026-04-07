"use client";
import React, { useState, useEffect } from "react";

import "./style.css";
import {
  useConfigureSuggestions,
  useHumanInTheLoop,
  useComponent,
  useRenderTool,
  CopilotChat,
  CopilotChatConfigurationProvider,
} from "@copilotkit/react-core/v2";
import { useLangGraphInterrupt } from "@copilotkit/react-core";
import {
  LayoutDashboard, ChevronDown, ChevronUp,
  CheckCircle2, Loader2,
} from "lucide-react";
import { z } from "zod";
import { A2UIRenderer } from "@/components/A2UIRenderer";
import type { A2UIComponent } from "@/lib/a2ui-catalog";
import { useDashboardAgent } from "@/hooks/useDashboardAgent";
import ResearchHero from "./ResearchHero";

// ─── Config ───────────────────────────────────────────────────────────────────

const AGENT_ID = "dashboard_agent";


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

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const OptionContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="relative rounded-xl w-[580px] p-6 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/50">
    {children}
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
    {subtitle && <p className="text-xs mb-3 text-slate-400">{subtitle}</p>}
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

// ─── Analysis option helpers ──────────────────────────────────────────────────

function toggleOption(i: number, prev: AnalysisOption[]): AnalysisOption[] {
  return prev.map((o, idx) => (idx === i ? { ...o, selected: !o.selected } : o));
}

function countSelected(options: AnalysisOption[]): number {
  return options.filter((o) => o.selected).length;
}

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
  const selectedCount = countSelected(options);
  const toggle = (i: number) => setOptions((prev) => toggleOption(i, prev));
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
  const selectedCount = countSelected(live);
  const toggle = (i: number) => setOptions((prev) => toggleOption(i, prev));
  const handleReject = () => { setDecision("rejected"); respond?.({ accepted: false }); };
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

// ─── A2UI inline component renderers ─────────────────────────────────────────
// These render A2UI components inline in the chat when the agent calls them.

function InlineA2UI({ type, props, label }: { type: string; props: Record<string, any>; label?: string }) {
  // Stable ID derived from type — no Date.now() to avoid remounting on every render
  const component: A2UIComponent = { id: `inline-${type}`, type, props };
  return (
    <div className="my-2 space-y-1">
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400/70 px-1">
          {label}
        </p>
      )}
      <A2UIRenderer component={component} showErrors={false} />
    </div>
  );
}

// ─── Tool-call status card ────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  analyze_content:     "Analyzing content",
  generate_components: "Generating components",
  set_state:           "Updating state",
};

function ToolCallCard({ name, status }: { name: string; status: string }) {
  const label = TOOL_LABELS[name] ?? name.replace(/_/g, " ");
  const done  = status === "complete";
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all duration-300 ${
      done
        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
        : "bg-blue-500/10 border-blue-500/25 text-blue-300"
    }`}>
      {done
        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        : <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
      }
      <span className="font-medium">{label}</span>
      {done && <span className="ml-auto text-emerald-400/60 font-normal">done</span>}
    </div>
  );
}

// ─── Live component feed ──────────────────────────────────────────────────────

function LiveComponentFeed({ components }: { components: A2UIComponent[] }) {
  const [open, setOpen] = useState(true);
  if (components.length === 0) return null;
  // Show last 6 components
  const recent = components.slice(-6);

  return (
    <div className="shrink-0 border-t border-blue-500/15">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-300
                   hover:bg-blue-500/5 transition-colors"
      >
        <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" />
        <span>Live Components</span>
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
          {components.length}
        </span>
        <span className="ml-auto">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </span>
      </button>

      {open && (
        <div className="max-h-72 overflow-y-auto px-2 pb-2 space-y-2">
          {recent.map((comp, i) => (
            <div key={comp.id ?? i} className="rounded-lg overflow-hidden ring-1 ring-blue-500/10">
              <A2UIRenderer component={comp} showErrors={false} />
            </div>
          ))}
          {components.length > 6 && (
            <p className="text-center text-[10px] text-blue-400/50 py-1">
              +{components.length - 6} more in the dashboard
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Public props ─────────────────────────────────────────────────────────────

export interface AgenticChatProps {
  onGenerate?: (content: string) => void;
  chainRef?: React.RefObject<((text: string) => void) | null>;
}


// ─── Chat ─────────────────────────────────────────────────────────────────────

const Chat: React.FC<AgenticChatProps> = ({ chainRef }) => {
  const chain = useChainAction();
  const { state } = useDashboardAgent();
  const components = state.components ?? [];
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    if (chainRef) {
      (chainRef as React.MutableRefObject<((text: string) => void) | null>).current = chain;
    }
  }, [chain, chainRef]);

  // ── LangGraph interrupt ────────────────────────────────────────────────────
  useLangGraphInterrupt({
    render: ({ event, resolve }) => (
      <InterruptAnalysisOptions event={event as any} resolve={resolve} />
    ),
  });

  // ── HITL ──────────────────────────────────────────────────────────────────
  useHumanInTheLoop({
    agentId: AGENT_ID,
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

  // ── Wildcard tool-call renderer ───────────────────────────────────────────
  useRenderTool(
    {
      name: "*",
      agentId: AGENT_ID,
      render: ({ name, status }: any) => <ToolCallCard name={name} status={status} />,
    },
    [],
  );

  // ── A2UI frontend components the agent can call inline ────────────────────

  // StatCard — display a single metric inline
  useComponent(
    {
      name: "show_stat",
      description: "Display a metric or KPI stat card inline in the conversation",
      agentId: AGENT_ID,
      parameters: z.object({
        title: z.string().describe("Metric name"),
        value: z.string().describe("Metric value"),
        subtitle: z.string().optional().describe("Supporting context"),
        trend: z.string().optional().describe("Trend direction: up | down | neutral"),
      }),
      render: (props) => (
        <InlineA2UI type="a2ui.StatCard" props={props} label="Metric" />
      ),
    },
    [],
  );

  // KeyTakeaways — bullet-point summary card
  useComponent(
    {
      name: "show_key_takeaways",
      description: "Display key takeaways or findings as a bullet list inline",
      agentId: AGENT_ID,
      parameters: z.object({
        title: z.string().optional().describe("Section title"),
        points: z.array(z.string()).describe("List of key points"),
      }),
      render: (props) => (
        <InlineA2UI type="a2ui.KeyTakeaways" props={props} label="Key Takeaways" />
      ),
    },
    [],
  );

  // ProfileCard — person/contact display
  useComponent(
    {
      name: "show_profile",
      description: "Display a person profile card inline — useful for showing contacts or decision makers",
      agentId: AGENT_ID,
      parameters: z.object({
        name: z.string().describe("Person's full name"),
        title: z.string().optional().describe("Job title"),
        company: z.string().optional().describe("Company name"),
        bio: z.string().optional().describe("Short bio or note"),
        avatar: z.string().optional().describe("Avatar image URL"),
      }),
      render: (props) => (
        <InlineA2UI type="a2ui.ProfileCard" props={props} label="Contact" />
      ),
    },
    [],
  );

  // CalloutCard — highlight or alert message
  useComponent(
    {
      name: "show_callout",
      description: "Display a highlighted callout, warning, tip or insight inline",
      agentId: AGENT_ID,
      parameters: z.object({
        type: z.enum(["info", "warning", "success", "error", "tip"]).optional(),
        title: z.string().optional(),
        message: z.string().describe("Callout body text"),
      }),
      render: (props) => (
        <InlineA2UI type="a2ui.CalloutCard" props={props} label="Insight" />
      ),
    },
    [],
  );

  // ComparisonBar — side-by-side metric comparison
  useComponent(
    {
      name: "show_comparison",
      description: "Display a visual comparison bar between two values",
      agentId: AGENT_ID,
      parameters: z.object({
        label: z.string().describe("What is being compared"),
        leftLabel: z.string(),
        leftValue: z.number(),
        rightLabel: z.string(),
        rightValue: z.number(),
        unit: z.string().optional(),
      }),
      render: (props) => (
        <InlineA2UI type="a2ui.ComparisonBar" props={props} label="Comparison" />
      ),
    },
    [],
  );

  // Dismiss hero on first prompt
  const handleHeroPrompt = (text: string) => {
    setShowHero(false);
    chain(text);
  };

  // Also dismiss if components arrive (e.g. after reload)
  if (components.length > 0 && showHero) setShowHero(false);

  return (
    <div className="relative flex flex-col h-full w-full bg-[#071428]">

      {/* Hero / empty state — overlays everything until first interaction */}
      {showHero && (
        <div className="absolute inset-0 z-20 flex flex-col">
          <ResearchHero onPrompt={handleHeroPrompt} />
        </div>
      )}

      {/* CopilotChat — always mounted so hooks stay alive */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>

      {/* Live A2UI component feed */}
      {components.length > 0 && <LiveComponentFeed components={components} />}
    </div>
  );
};

const AgenticChat: React.FC<AgenticChatProps> = (props) => (
  <CopilotChatConfigurationProvider agentId={AGENT_ID}>
    <Chat {...props} />
  </CopilotChatConfigurationProvider>
);

export default AgenticChat;
