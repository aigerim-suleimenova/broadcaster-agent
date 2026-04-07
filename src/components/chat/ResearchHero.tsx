"use client";

import React, { useState, useRef } from "react";
import { motion as framerMotion, AnimatePresence } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const motion = framerMotion as any;
import { Mic, ArrowUp, Search, Radio, Mail, ChevronRight } from "lucide-react";

// ─── Design tokens ─────────────────────────────────────────────────────────────
// Obsidian dark with electric cyan (#05E8C0) + deep violet (#7C3AED) neons.
// CTA: crimson-rose (#F43F5E → #EC4899). Text: #EEF2FF / rgba(238,242,255, α).

// ─── Signal logo mark ─────────────────────────────────────────────────────────

const SignalMark = ({ size = 76 }: { size?: number }) => {
  const id = "sm"; // stable ID — no Date.now() to avoid hydration mismatch
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 76 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="38" cy="38" r="36" stroke={`url(#${id}-ring)`} strokeWidth="1" strokeOpacity="0.35" />
      {/* Mid ring */}
      <circle cx="38" cy="38" r="25" stroke={`url(#${id}-ring)`} strokeWidth="0.5" strokeOpacity="0.18" />

      {/* Three signal-wave arcs, largest → smallest */}
      <path
        d="M12 38 Q22.5 20 38 38 Q53.5 56 64 38"
        stroke={`url(#${id}-w1)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 38 Q27 24 38 38 Q49 52 56 38"
        stroke={`url(#${id}-w2)`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.72"
      />
      <path
        d="M27 38 Q31.5 30 38 38 Q44.5 46 49 38"
        stroke={`url(#${id}-w3)`}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />

      {/* Center dot */}
      <circle cx="38" cy="38" r="3.5" fill={`url(#${id}-dot)`} />

      <defs>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="76" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#05E8C0" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={`${id}-w1`} x1="12" y1="20" x2="64" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#05E8C0" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id={`${id}-w2`} x1="20" y1="24" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id={`${id}-w3`} x1="27" y1="30" x2="49" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
        <radialGradient id={`${id}-dot`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#05E8C0" />
          <stop offset="100%" stopColor="#7C3AED" />
        </radialGradient>
      </defs>
    </svg>
  );
};

// ─── Compact Signal wordmark for nav header ───────────────────────────────────

const SignalWordmark = () => (
  <div className="flex items-center gap-2">
    <SignalMark size={22} />
    <span
      style={{
        fontFamily: "Syne, sans-serif",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.08em",
        color: "rgba(238,242,255,0.9)",
        textTransform: "uppercase",
      }}
    >
      signal
    </span>
  </div>
);

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { Icon: Search, label: "Research" },
  { Icon: Radio,  label: "Pipeline" },
  { Icon: Mail,   label: "Outreach" },
] as const;

// ─── Suggestion prompts ───────────────────────────────────────────────────────

const SUGGESTIONS = [
  "Research BBC's ad tech stack",
  "Analyze Paramount compatibility",
  "Find decision makers at Sky",
  "Draft outreach for Al Jazeera",
  "Show me key metrics",
] as const;

// ─── Ambient glow layer ───────────────────────────────────────────────────────

const AmbientGlow = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    {/* Top-center cyan glow */}
    <div
      style={{
        position: "absolute",
        top: "20%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "80%",
        height: "60%",
        background:
          "radial-gradient(ellipse at center, rgba(5,232,192,0.08) 0%, rgba(124,58,237,0.05) 50%, transparent 75%)",
        filter: "blur(28px)",
      }}
    />
    {/* Bottom-left violet glow */}
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        left: "20%",
        width: "50%",
        height: "35%",
        background:
          "radial-gradient(ellipse at center, rgba(124,58,237,0.07) 0%, transparent 70%)",
        filter: "blur(32px)",
      }}
    />
    {/* Subtle grid overlay */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(238,242,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(238,242,255,0.018) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage:
          "radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 80%)",
      }}
    />
  </div>
);

// ─── Chip suggestion button ───────────────────────────────────────────────────

const SuggestionChip = ({
  label,
  onClick,
  delay = 0,
}: {
  label: string;
  onClick: () => void;
  delay?: number;
}) => (
  <motion.button
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, delay }}
    onClick={onClick}
    className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
    style={{
      border: "1px solid rgba(238,242,255,0.1)",
      color: "rgba(238,242,255,0.6)",
      background: "rgba(238,242,255,0.03)",
      fontFamily: "DM Sans, sans-serif",
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
    }}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget;
      el.style.borderColor = "rgba(5,232,192,0.38)";
      el.style.color = "rgba(238,242,255,0.95)";
      el.style.background = "rgba(5,232,192,0.07)";
    }}
    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget;
      el.style.borderColor = "rgba(238,242,255,0.1)";
      el.style.color = "rgba(238,242,255,0.6)";
      el.style.background = "rgba(238,242,255,0.03)";
    }}
  >
    {label}
  </motion.button>
);

// ─── Collapsible nav strip ────────────────────────────────────────────────────

const NavStrip = ({
  open,
  onToggle,
  onSuggestion,
}: {
  open: boolean;
  onToggle: () => void;
  onSuggestion: (text: string) => void;
}) => (
  <motion.aside
    animate={{ width: open ? 196 : 48 }}
    transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
    className="absolute left-0 top-0 h-full flex flex-col overflow-hidden z-20"
    style={{
      background: "rgba(6,9,17,0.85)",
      borderRight: "1px solid rgba(238,242,255,0.05)",
      backdropFilter: "blur(20px)",
    }}
    aria-label="Navigation"
  >
    {/* Wordmark / toggle row */}
    <div
      className="flex items-center justify-between px-3 py-4 shrink-0"
      style={{ borderBottom: "1px solid rgba(238,242,255,0.05)" }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SignalWordmark />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onToggle}
        aria-label={open ? "Collapse navigation" : "Expand navigation"}
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
        style={{ background: "rgba(238,242,255,0.05)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "rgba(5,232,192,0.1)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "rgba(238,242,255,0.05)")
        }
      >
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(238,242,255,0.4)" }} />
        </motion.div>
      </button>
    </div>

    {/* Nav links */}
    <nav className="flex flex-col gap-0.5 px-2 pt-3 shrink-0">
      {NAV_ITEMS.map(({ Icon, label }) => (
        <button
          key={label}
          className="flex items-center gap-3 px-2 py-2 rounded-lg transition-all text-left overflow-hidden"
          style={{ color: "rgba(238,242,255,0.45)", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = "rgba(5,232,192,0.9)";
            el.style.background = "rgba(5,232,192,0.06)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = "rgba(238,242,255,0.45)";
            el.style.background = "transparent";
          }}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="text-xs font-medium"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      ))}
    </nav>

    {/* Suggestions section — only when open */}
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.22, delay: 0.06 }}
          className="mt-5 px-3 flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <p
            className="mb-2.5"
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(238,242,255,0.22)",
            }}
          >
            Suggestions
          </p>
          <div className="space-y-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="w-full text-left px-3 py-2 rounded-lg text-[11px] leading-snug transition-all"
                style={{
                  border: "1px solid rgba(5,232,192,0.15)",
                  color: "rgba(238,242,255,0.65)",
                  background: "rgba(5,232,192,0.03)",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(5,232,192,0.09)";
                  el.style.borderColor = "rgba(5,232,192,0.38)";
                  el.style.color = "rgba(238,242,255,0.95)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(5,232,192,0.03)";
                  el.style.borderColor = "rgba(5,232,192,0.15)";
                  el.style.color = "rgba(238,242,255,0.65)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.aside>
);

// ─── Main export ──────────────────────────────────────────────────────────────

export interface ResearchHeroProps {
  onPrompt: (text: string) => void;
}

export default function ResearchHero({ onPrompt }: ResearchHeroProps) {
  const [input, setInput] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    onPrompt(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(170deg, #060911 0%, #080D1A 55%, #060911 100%)",
      }}
    >
      <AmbientGlow />

      {/* Collapsible nav */}
      <NavStrip
        open={navOpen}
        onToggle={() => setNavOpen((o) => !o)}
        onSuggestion={(text) => {
          onPrompt(text);
        }}
      />

      {/* Hero content — shifts right with nav */}
      <motion.div
        animate={{ paddingLeft: navOpen ? 204 : 56 }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center pr-4"
        style={{ minHeight: 0 }}
      >
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-5"
          style={{
            filter: "drop-shadow(0 0 24px rgba(5,232,192,0.22))",
          }}
        >
          <SignalMark size={72} />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.14 }}
          className="text-center mb-7 px-2"
        >
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(20px, 4vw, 26px)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              color: "#EEF2FF",
              marginBottom: 10,
            }}
          >
            Hi, I&apos;m Signal.
          </h1>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(12px, 1.8vw, 13.5px)",
              color: "rgba(238,242,255,0.42)",
              lineHeight: 1.55,
            }}
          >
            Research intelligence
            <br />
            for the media industry.
          </p>
        </motion.div>

        {/* Centered suggestion chips — visible when nav is closed */}
        <AnimatePresence>
          {!navOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, delay: 0.22 }}
              className="flex flex-wrap gap-2 justify-center px-2"
              style={{ maxWidth: 320 }}
            >
              {SUGGESTIONS.slice(0, 4).map((s, i) => (
                <SuggestionChip
                  key={s}
                  label={s}
                  onClick={() => onPrompt(s)}
                  delay={0.28 + i * 0.07}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating input bar */}
      <motion.div
        animate={{ paddingLeft: navOpen ? 212 : 60 }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        initial={{ opacity: 0, y: 16 }}
        className="relative z-10 shrink-0 pr-4 pb-4 pt-2"
        style={{ opacity: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div
            className="flex items-end gap-2 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(10,15,28,0.92)",
              border: "1px solid rgba(238,242,255,0.09)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(5,232,192,0.04)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about a broadcaster..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none leading-snug"
              style={{
                color: "#EEF2FF",
                fontFamily: "DM Sans, sans-serif",
                fontSize: 13,
                maxHeight: 96,
                scrollbarWidth: "none",
              }}
            />

            {/* Mic icon */}
            <button
              className="p-1.5 rounded-full transition-colors shrink-0 mb-0.5"
              aria-label="Voice input"
              style={{ color: "rgba(238,242,255,0.25)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(5,232,192,0.75)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(238,242,255,0.25)")
              }
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send button */}
            <button
              onClick={submit}
              disabled={!input.trim()}
              aria-label="Send"
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 mb-0.5"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #F43F5E 0%, #EC4899 100%)"
                  : "rgba(238,242,255,0.07)",
                cursor: input.trim() ? "pointer" : "not-allowed",
                boxShadow: input.trim()
                  ? "0 4px 18px rgba(244,63,94,0.45)"
                  : "none",
                transform: "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (input.trim())
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              <ArrowUp
                className="w-4 h-4"
                style={{
                  color: input.trim()
                    ? "#fff"
                    : "rgba(238,242,255,0.25)",
                }}
              />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
