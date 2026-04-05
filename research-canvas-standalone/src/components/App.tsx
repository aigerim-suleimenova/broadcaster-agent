import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { motion as framerMotion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { MarkdownInput } from "@/components/MarkdownInput"
import { A2UIRenderer, A2UIRendererList } from "@/components/A2UIRenderer"
import { LoadingSkeleton } from "@/components/LoadingSkeleton"
import type { SemanticZone } from "@/lib/a2ui-catalog"
import { getGridSpan } from "@/lib/layout-engine"
import { useDashboardAgent } from "@/hooks/useDashboardAgent"
import AgenticChat from './chat/AgenticChat'

import {
  FileText, Sparkles, ArrowLeft, RotateCcw, LayoutDashboard,
  BookOpen, TrendingUp, Lightbulb, FileCode, Video, Link2, Tags,
  MessageSquare, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Zone config ──────────────────────────────────────────────────────────────

const ZONE_CONFIG: Record<SemanticZone, { title: string; icon: React.ReactNode; className: string }> = {
  hero:      { title: '',            icon: null,                                    className: '' },
  metrics:   { title: 'Key Metrics', icon: <TrendingUp className="h-4 w-4" />,     className: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20' },
  insights:  { title: 'Key Insights',icon: <Lightbulb className="h-4 w-4" />,      className: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20' },
  content:   { title: 'Details',     icon: <FileCode className="h-4 w-4" />,       className: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20' },
  media:     { title: 'Media',       icon: <Video className="h-4 w-4" />,          className: 'bg-gradient-to-r from-rose-500/10 to-red-500/10 border-rose-500/20' },
  resources: { title: 'Resources',   icon: <Link2 className="h-4 w-4" />,          className: 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20' },
  tags:      { title: 'Categories',  icon: <Tags className="h-4 w-4" />,           className: 'bg-gradient-to-r from-slate-500/10 to-gray-500/10 border-slate-500/20' },
}

const ZONE_ORDER: SemanticZone[] = ['hero', 'metrics', 'insights', 'content', 'media', 'resources', 'tags']

type ViewState = 'input' | 'loading' | 'dashboard'
type DashboardTab = 'dashboard' | 'source'

const motion = framerMotion as any

// ─── Chat panel width ─────────────────────────────────────────────────────────
const CHAT_WIDTH = 420

// ─── App ──────────────────────────────────────────────────────────────────────

function App({ initialContent }: { initialContent?: string } = {}) {
  const [viewState, setViewState]       = useState<ViewState>('input')
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('dashboard')
  const [chatOpen, setChatOpen]         = useState(true)
  const hasNavigatedBack                = useRef(false)
  // Ref to CopilotChat's submit function — populated by AgenticChat on every render.
  // Using this instead of agent.runAgent() prevents the AbortError that fires when
  // two callers try to drive the same SSE connection simultaneously.
  const chatChainRef = useRef<((text: string) => void) | null>(null)

  const {
    state,
    setState,
    componentsByZone,
    generateDashboard,
    isGenerating,
    isComplete,
  } = useDashboardAgent()


  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleGenerate = useCallback((content: string, _file?: File) => {
    hasNavigatedBack.current = false
    // Reset agent state with the new markdown (no runAgent call here).
    // Wrapped in startTransition so the heavy setState doesn't block the click handler.
    generateDashboard(content)
    // Open chat so CopilotChat is mounted and the chain ref is populated.
    setChatOpen(true)
    setViewState('loading')
    // Submit through CopilotChat's own flow.  The short message avoids token-
    // limit issues; the markdown is already in agent state for the tools to read.
    // Small delay lets React flush setChatOpen before the DOM query runs.
    setTimeout(() => {
      chatChainRef.current?.(
        'Please analyze the current markdown document and generate a dashboard. ' +
        'Call analyze_content first, then generate_components.'
      )
    }, 120)
  }, [generateDashboard])

  const handleBackToInput = useCallback(() => {
    hasNavigatedBack.current = true
    setViewState('input')
  }, [])

  const handleRegenerate = useCallback(() => {
    if (state.markdown_content?.trim()) {
      handleGenerate(state.markdown_content)
    }
  }, [state.markdown_content, handleGenerate])

  const handleContentChange = useCallback((content: string) => {
    if (state.markdown_content === content) return
    setState({ ...state, markdown_content: content })
  }, [setState, state])


  // ── View-state transitions ───────────────────────────────────────────────────

  // 1. Success path: check status directly and ensure we transition when complete.
  //    This runs whenever the status or components change.
  useEffect(() => {
    if (state.status === 'complete' && (state.components?.length ?? 0) > 0 && !hasNavigatedBack.current) {
      setViewState('dashboard')
    }
  }, [state.status, state.components])

  // 2. Ensure loading view is set whenever the agent starts running (e.g. triggered from chat).
  //    Also used as a recovery trigger when the agent stops without completing.
  const prevIsGenerating = useRef(false)
  useEffect(() => {
    if (isGenerating && viewState !== 'loading') {
      hasNavigatedBack.current = false
      setViewState('loading')
    }
    if (prevIsGenerating.current && !isGenerating) {
      // Agent stopped — wait a tick so the success effect can run first,
      // then recover to input if still stuck on loading
      setTimeout(() => {
        if (viewState === 'loading' && state.status !== 'complete') {
          setViewState('input')
        }
      }, 300)
    }
    prevIsGenerating.current = isGenerating
  }, [isGenerating, state.status, viewState])

  // ── Analysis Options Panel ──────────────────────────────────────────────────
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set())

  const ANALYSIS_OPTIONS = [
    { id: 'viewership', label: '👥 Viewership Metrics', description: 'User counts and engagement patterns' },
    { id: 'stream_quality', label: '📡 Stream Quality', description: 'Resolution and performance metrics' },
    { id: 'cdn', label: '🌐 CDN Performance', description: 'Content delivery network analysis' },
    { id: 'revenue', label: '💰 Revenue & Monetization', description: 'Financial performance data' },
    { id: 'engagement', label: '🎯 Engagement Analytics', description: 'User interaction metrics' },
    { id: 'geographic', label: '🗺️ Geographic Breakdown', description: 'Regional audience distribution' },
  ]

  const toggleMetric = useCallback((metricId: string) => {
    setSelectedMetrics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(metricId)) {
        newSet.delete(metricId)
      } else {
        newSet.add(metricId)
      }
      return newSet
    })
  }, [])

  const handleAnalyzeWithMetrics = useCallback(() => {
    if (state.markdown_content?.trim() && selectedMetrics.size > 0) {
      const metricsStr = Array.from(selectedMetrics).join(', ')
      hasNavigatedBack.current = false
      // Reset agent state with the new markdown
      generateDashboard(state.markdown_content)
      // Open chat so CopilotChat is mounted and the chain ref is populated.
      setChatOpen(true)
      setViewState('loading')
      // Submit with focus on selected metrics
      setTimeout(() => {
        chatChainRef.current?.(
          `Please analyze the current markdown document and generate a dashboard focusing on these metrics: ${metricsStr}. ` +
          'Call analyze_content first, then generate_components.'
        )
      }, 120)
    }
  }, [state.markdown_content, selectedMetrics, generateDashboard])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">

      {/* ── Header ── */}
      <AnimatePresence mode="wait">
        {viewState === 'dashboard' ? (
          <motion.header
            key="compact-header"
            className="shrink-0 sticky top-0 z-50 border-b border-blue-500/20 bg-card/95 backdrop-blur-sm shadow-lg shadow-black/10"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 py-2 flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost" size="sm"
                  onClick={handleBackToInput}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-sm">
                    {state.document_title || "Research Dashboard"}
                  </span>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                {/* Tab toggle */}
                <div className="flex items-center bg-secondary/50 rounded-lg p-0.5">
                  <Button
                    variant={dashboardTab === 'dashboard' ? 'default' : 'ghost'}
                    size="sm" onClick={() => setDashboardTab('dashboard')}
                    className="gap-1.5 h-7 px-3"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                  </Button>
                  <Button
                    variant={dashboardTab === 'source' ? 'default' : 'ghost'}
                    size="sm" onClick={() => setDashboardTab('source')}
                    className="gap-1.5 h-7 px-3"
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Source
                  </Button>
                </div>
                <div className="h-6 w-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {(state.components ?? []).length} components
                </span>
                <Button
                  variant="outline" size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <RotateCcw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <div className="h-6 w-px bg-border" />
                {/* Chat toggle */}
                <ChatToggleButton open={chatOpen} onClick={() => setChatOpen(o => !o)} />
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          </motion.header>
        ) : (
          <motion.header
            key="full-header"
            className="shrink-0 border-b border-blue-500/20 bg-gradient-to-r from-card via-card to-secondary/30 shadow-lg shadow-black/20"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
                  <Sparkles className="h-8 w-8 text-blue-400 relative" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                >
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Second Brain Research Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Transform markdown into AI-powered dashboards with CopilotKit + AG-UI
                  </p>
                </motion.div>
              </div>
              {/* Chat toggle */}
              <ChatToggleButton open={chatOpen} onClick={() => setChatOpen(o => !o)} />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Body: main content + chat panel ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Main scrollable area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Input view */}
            {viewState === 'input' && (
              <motion.div
                key="input-view"
                className="min-h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <h2 className="text-lg font-semibold text-foreground">Enter Your Research</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Paste markdown or drag a .md file — or ask the AI in the chat panel on the right.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.25 }}
                    className="bg-card rounded-xl border border-border p-6 shadow-xl"
                  >
                    <MarkdownInput
                      onGenerate={handleGenerate}
                      onContentChange={handleContentChange}
                      placeholder={PLACEHOLDER}
                      initialValue={initialContent || state.markdown_content}
                    />
                  </motion.div>

                  {/* Analysis Options Panel */}
                  {state.markdown_content?.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.35 }}
                      className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6 shadow-xl"
                    >
                      <div className="mb-4">
                        <h3 className="text-base font-semibold text-foreground mb-1">Analysis Options</h3>
                        <p className="text-xs text-muted-foreground">Select metrics to focus on in your dashboard:</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {ANALYSIS_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => toggleMetric(option.id)}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                              selectedMetrics.has(option.id)
                                ? 'bg-blue-500/20 border-blue-500/60'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedMetrics.has(option.id)}
                              onChange={() => toggleMetric(option.id)}
                              className="mt-0.5 h-4 w-4 rounded cursor-pointer"
                              aria-label={option.label}
                            />
                            <div className="text-left flex-1">
                              <div className="text-sm font-medium text-blue-100">{option.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      {selectedMetrics.size > 0 && (
                        <Button
                          onClick={handleAnalyzeWithMetrics}
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          Generate Dashboard with {selectedMetrics.size} metric{selectedMetrics.size !== 1 ? 's' : ''}
                        </Button>
                      )}
                    </motion.div>
                  )}

                  <motion.p
                    className="mt-6 text-center text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.45 }}
                  >
                    Tip: Include statistics, code blocks, links, and structured sections for best results
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* Loading view */}
            {viewState === 'loading' && (
              <motion.div
                key="loading-view"
                className="min-h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="max-w-6xl mx-auto px-4 py-8">
                  <div className="text-center mb-8">
                    <Sparkles className="h-8 w-8 text-blue-400 animate-pulse mx-auto" />
                    <h2 className="text-xl font-semibold mt-4">
                      {state.current_step || "Generating Your Dashboard"}
                    </h2>
                    <div className="max-w-md mx-auto mt-4">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${state.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{state.progress}% complete</p>
                    </div>
                    <div className="mt-4 space-y-1">
                      {(state.activity_log ?? []).slice(-5).map((log) => (
                        <p key={log.id} className="text-xs text-muted-foreground">
                          {log.status === 'completed' ? '✓' : '⏳'} {log.message}
                        </p>
                      ))}
                    </div>
                  </div>

                  {(state.components ?? []).length > 0 ? (
                    <div className="space-y-6">
                      <A2UIRendererList components={state.components ?? []} spacing="lg" showErrors />
                    </div>
                  ) : (
                    <LoadingSkeleton />
                  )}
                </div>
              </motion.div>
            )}

            {/* Dashboard view */}
            {viewState === 'dashboard' && (
              <motion.div
                key="dashboard-view"
                className="min-h-full"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <div className="max-w-7xl mx-auto px-4 py-6">
                  <AnimatePresence mode="wait">
                    {dashboardTab === 'dashboard' ? (
                      <motion.div
                        key="dashboard-content"
                        className="space-y-8"
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0 }}
                        variants={{
                          hidden: { opacity: 0 },
                          visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
                        }}
                      >
                        {ZONE_ORDER.map((zone) => {
                          const components = componentsByZone[zone]
                          if (!components?.length) return null
                          const config = ZONE_CONFIG[zone]

                          if (zone === 'hero') return (
                            <motion.div key={zone} className="space-y-4"
                              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}>
                              {components.map((c, i) => (
                                <div key={c.id || `${zone}-${i}`} className="col-span-12">
                                  <A2UIRenderer component={c} showErrors />
                                </div>
                              ))}
                            </motion.div>
                          )

                          if (zone === 'metrics') return (
                            <motion.section key={zone} className={`rounded-xl border p-6 ${config.className}`}
                              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}>
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-blue-400">{config.icon}</span>
                                <h2 className="text-lg font-semibold text-blue-100">{config.title}</h2>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {components.map((c, i) => (
                                  <A2UIRenderer key={c.id || `${zone}-${i}`} component={c} showErrors />
                                ))}
                              </div>
                            </motion.section>
                          )

                          if (zone === 'tags') return (
                            <motion.section key={zone} className={`rounded-xl border p-4 ${config.className}`}
                              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-slate-400">{config.icon}</span>
                                <h2 className="text-sm font-semibold text-slate-300">{config.title}</h2>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {components.map((c, i) => (
                                  <A2UIRenderer key={c.id || `${zone}-${i}`} component={c} showErrors />
                                ))}
                              </div>
                            </motion.section>
                          )

                          return (
                            <motion.section key={zone} className={`rounded-xl border p-6 ${config.className}`}
                              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}>
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-blue-400">{config.icon}</span>
                                <h2 className="text-lg font-semibold text-blue-100">{config.title}</h2>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {components.length} {components.length === 1 ? 'item' : 'items'}
                                </span>
                              </div>
                              <div className="grid grid-cols-12 gap-4 auto-rows-min">
                                {components.map((c, i) => (
                                  <div key={c.id || `${zone}-${i}`} className={getGridSpan(c)}>
                                    <A2UIRenderer component={c} showErrors />
                                  </div>
                                ))}
                              </div>
                            </motion.section>
                          )
                        })}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="source-content"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-card rounded-xl border border-blue-500/20 p-6 shadow-xl"
                      >
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                          <BookOpen className="h-5 w-5 text-blue-400" />
                          <h2 className="text-lg font-semibold">Source Document</h2>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {(state.markdown_content ?? "").length} characters
                          </span>
                        </div>
                        <SourceMarkdown content={state.markdown_content} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── Chat panel ── (always mounted — CSS width transition keeps CopilotChat
             alive so its internal AbortController never fires mid-request) */}
        <aside
          className="shrink-0 overflow-hidden border-l border-blue-500/20 flex flex-col
                     transition-[width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width:   chatOpen ? CHAT_WIDTH : 0,
            opacity: chatOpen ? 1 : 0,
            // Disable pointer events when closed so hidden content isn't reachable
            pointerEvents: chatOpen ? undefined : 'none',
          }}
          aria-hidden={!chatOpen}
        >
          {/* Inner container — fixed width so content doesn't distort during animation */}
          <div className="flex flex-col h-full" style={{ width: CHAT_WIDTH }}>
            {/* Panel header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3
                            bg-[#0a1628] border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-100">AI Assistant</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground
                           hover:bg-white/5 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat body — always rendered */}
            <div className="flex-1 min-h-0">
              <AgenticChat
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                chainRef={chatChainRef}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ─── Chat toggle button ───────────────────────────────────────────────────────

function ChatToggleButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close chat" : "Open chat"}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        border transition-all duration-200
        ${open
          ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
          : 'bg-secondary/60 border-border text-muted-foreground hover:text-foreground hover:border-blue-500/30'
        }
      `}
    >
      <MessageSquare className="h-4 w-4" />
      {open ? 'Hide Chat' : 'Chat'}
    </button>
  )
}

// ─── Source markdown renderer ─────────────────────────────────────────────────

function SourceMarkdown({ content }: { content?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        h1: ({ children }: { children?: ReactNode }) => <h1 className="text-3xl font-bold text-blue-100 border-b border-blue-500/30 pb-3 mb-6 mt-0">{children}</h1>,
        h2: ({ children }: { children?: ReactNode }) => <h2 className="text-2xl font-bold text-blue-100 border-b border-blue-500/20 pb-2 mb-4 mt-10">{children}</h2>,
        h3: ({ children }: { children?: ReactNode }) => <h3 className="text-xl font-semibold text-blue-100 mb-3 mt-8">{children}</h3>,
        h4: ({ children }: { children?: ReactNode }) => <h4 className="text-lg font-semibold text-blue-200 mb-2 mt-6">{children}</h4>,
        p:  ({ children }: { children?: ReactNode }) => <p className="text-blue-200 leading-relaxed mb-4">{children}</p>,
        strong: ({ children }: { children?: ReactNode }) => <strong className="text-blue-100 font-semibold">{children}</strong>,
        em: ({ children }: { children?: ReactNode }) => <em className="text-blue-300 italic">{children}</em>,
        ul: ({ children }: { children?: ReactNode }) => <ul className="text-blue-200 my-4 ml-6 list-disc space-y-2">{children}</ul>,
        ol: ({ children }: { children?: ReactNode }) => <ol className="text-blue-200 my-4 ml-6 list-decimal space-y-2">{children}</ol>,
        li: ({ children }: { children?: ReactNode }) => <li className="text-blue-200 marker:text-blue-400">{children}</li>,
        a:  ({ href, children }: { href?: string; children?: ReactNode }) => <a href={href} className="text-blue-400 underline hover:text-blue-300 transition-colors">{children}</a>,
        code: ({ className, children }: { className?: string; children?: ReactNode }) => {
          if (!className) return <code className="text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
          return <code className={`${className} block bg-secondary/60 border border-blue-500/20 rounded-lg p-4 my-4 overflow-x-auto text-sm font-mono text-blue-200`}>{children}</code>
        },
        pre: ({ children }: { children?: ReactNode }) => <pre className="bg-secondary/60 border border-blue-500/20 rounded-lg p-4 my-6 overflow-x-auto">{children}</pre>,
        blockquote: ({ children }: { children?: ReactNode }) => <blockquote className="border-l-4 border-blue-500 pl-4 my-6 text-blue-300 italic">{children}</blockquote>,
        table: ({ children }: { children?: ReactNode }) => <table className="w-full border-collapse my-6">{children}</table>,
        thead: ({ children }: { children?: ReactNode }) => <thead className="bg-blue-900/30">{children}</thead>,
        th: ({ children }: { children?: ReactNode }) => <th className="text-blue-100 p-3 text-left border border-blue-500/20 font-semibold">{children}</th>,
        td: ({ children }: { children?: ReactNode }) => <td className="p-3 border border-blue-500/20 text-blue-200">{children}</td>,
        hr: () => <hr className="border-blue-500/30 my-8" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLACEHOLDER = `# Your Research Title
## Introduction
Enter your research content here...

## Key Findings
- Finding 1
- Finding 2

## Data & Statistics
- 85% improvement in efficiency
- $2.5M cost savings

## Code Examples
\`\`\`python
def analyze_data(content):
  return insights
\`\`\`

## Conclusion
Your conclusions here...`

export default App
