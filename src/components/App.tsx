import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { motion as framerMotion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { MarkdownInput } from "@/components/MarkdownInput"
import { A2UIRenderer } from "@/components/A2UIRenderer"
import { LoadingSkeleton } from "@/components/LoadingSkeleton"
import type { SemanticZone } from "@/lib/a2ui-catalog"
import { getGridSpan } from "@/lib/layout-engine"
import { useDashboardAgent } from "@/hooks/useDashboardAgent"
import AgenticChat from './chat/AgenticChat'

import {
  Sparkles, ArrowLeft, RotateCcw, LayoutDashboard,
  BookOpen, TrendingUp, Lightbulb, FileCode, Video, Link2, Tags,
  MessageSquare, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Zone config ──────────────────────────────────────────────────────────────

const ZONE_CONFIG: Record<SemanticZone, { title: string; icon: React.ReactNode; className: string; iconColor: string }> = {
  hero:      { title: '',            icon: null,                                    className: '',                                                                                                      iconColor: '' },
  metrics:   { title: 'Key Metrics', icon: <TrendingUp className="h-4 w-4" />,     className: 'bg-gradient-to-br from-[#05E8C0]/[0.06] to-[#22D3EE]/[0.03] border-[#05E8C0]/[0.18]',                iconColor: 'text-[#05E8C0]' },
  insights:  { title: 'Key Insights',icon: <Lightbulb className="h-4 w-4" />,      className: 'bg-gradient-to-br from-[#7C3AED]/[0.07] to-[#A78BFA]/[0.03] border-[#7C3AED]/[0.22]',                iconColor: 'text-[#A78BFA]' },
  content:   { title: 'Details',     icon: <FileCode className="h-4 w-4" />,       className: 'bg-gradient-to-br from-[#F43F5E]/[0.06] to-[#EC4899]/[0.03] border-[#F43F5E]/[0.18]',                iconColor: 'text-[#F87171]' },
  media:     { title: 'Media',       icon: <Video className="h-4 w-4" />,          className: 'bg-gradient-to-br from-[#FB923C]/[0.06] to-[#FBBF24]/[0.03] border-[#FB923C]/[0.18]',                iconColor: 'text-[#FB923C]' },
  resources: { title: 'Resources',   icon: <Link2 className="h-4 w-4" />,          className: 'bg-gradient-to-br from-[#22D3EE]/[0.06] to-[#05E8C0]/[0.03] border-[#22D3EE]/[0.18]',                iconColor: 'text-[#22D3EE]' },
  tags:      { title: 'Categories',  icon: <Tags className="h-4 w-4" />,           className: 'bg-gradient-to-br from-white/[0.03] to-transparent border-white/[0.08]',                              iconColor: 'text-white/40' },
}

const ZONE_ORDER: SemanticZone[] = ['hero', 'metrics', 'insights', 'content', 'media', 'resources', 'tags']

type ViewState = 'input' | 'loading' | 'dashboard'
type DashboardTab = 'dashboard' | 'source'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const motion = framerMotion as any

// ─── Chat panel width ─────────────────────────────────────────────────────────
const DEFAULT_CHAT_WIDTH = 560
const MIN_CHAT_WIDTH = 320
const MAX_CHAT_WIDTH = 960

// ─── App ──────────────────────────────────────────────────────────────────────

function App({ initialContent }: { initialContent?: string }) {
  const [viewState, setViewState]       = useState<ViewState>('input')
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('dashboard')
  const [chatOpen, setChatOpen]         = useState(true)
  const [isMobile, setIsMobile]         = useState(false)
  const [chatWidth, setChatWidth]       = useState(DEFAULT_CHAT_WIDTH)
  const isDragging                      = useRef(false)
  const hasNavigatedBack                = useRef(false)
  const viewStateRef                    = useRef<ViewState>('input')
  const statusRef                       = useRef<string>('idle')
  const chatChainRef = useRef<((text: string) => void) | null>(null)

  const {
    state,
    setState,
    componentsByZone,
    generateDashboard,
    isGenerating,
  } = useDashboardAgent()

  viewStateRef.current = viewState
  statusRef.current    = state.status

  // ── Responsive layout ────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Drag-to-resize ───────────────────────────────────────────────────────────
  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    const startX = e.clientX
    const startWidth = chatWidth
    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return
      const delta = startX - ev.clientX
      setChatWidth(Math.min(MAX_CHAT_WIDTH, Math.max(MIN_CHAT_WIDTH, startWidth + delta)))
    }
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [chatWidth])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const triggerGeneration = useCallback((content: string, metricsHint?: string) => {
    hasNavigatedBack.current = false
    generateDashboard(content)
    setChatOpen(true)
    setViewState('loading')
    const suffix = metricsHint ? ` focusing on these metrics: ${metricsHint}.` : '.'
    setTimeout(() => {
      chatChainRef.current?.(
        `Please analyze the current markdown document and generate a dashboard${suffix} ` +
        'Call analyze_content first, then generate_components.'
      )
    }, 120)
  }, [generateDashboard])

  const handleGenerate = useCallback((content: string, _file?: File) => {
    triggerGeneration(content)
  }, [triggerGeneration])

  const handleBackToInput = useCallback(() => {
    hasNavigatedBack.current = true
    setViewState('input')
  }, [])

  const handleRegenerate = useCallback(() => {
    if (state.markdown_content?.trim()) handleGenerate(state.markdown_content)
  }, [state.markdown_content, handleGenerate])

  const handleContentChange = useCallback((content: string) => {
    if (state.markdown_content === content) return
    setState({ ...state, markdown_content: content })
  }, [setState, state])

  // ── View-state transitions ───────────────────────────────────────────────────

  const componentCount = state.components?.length ?? 0
  useEffect(() => {
    if (state.status === 'complete' && componentCount > 0 && !hasNavigatedBack.current) {
      setViewState('dashboard')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, componentCount])

  const prevIsGenerating = useRef(false)
  useEffect(() => {
    // Only transition to loading if we're not already on the dashboard.
    // When the user chats from the dashboard, isGenerating fires again but
    // we should NOT replace the fully-rendered dashboard with the loading view.
    if (isGenerating && viewState === 'input') {
      hasNavigatedBack.current = false
      setViewState('loading')
    }
    if (prevIsGenerating.current && !isGenerating) {
      setTimeout(() => {
        if (viewStateRef.current === 'loading' && statusRef.current !== 'complete') {
          setViewState('input')
        }
      }, 300)
    }
    prevIsGenerating.current = isGenerating
  }, [isGenerating, state.status, viewState])

  // ── Render ───────────────────────────────────────────────────────────────────

  const panelWidth = isMobile ? 'min(90vw, 380px)' : `${chatWidth}px`

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">

      {/* ── Header ── */}
      <AnimatePresence mode="wait">
        {viewState === 'dashboard' ? (
          /* ── Compact dashboard header ── */
          <motion.header key="compact-header"
            className="shrink-0 sticky top-0 z-50 backdrop-blur-xl shadow-lg shadow-black/20"
            style={{ background: 'rgba(6,9,17,0.95)', borderBottom: '1px solid rgba(5,232,192,0.1)' }}
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleBackToInput}
                  className="gap-1.5 text-xs text-white/40 hover:text-white/80 hover:bg-white/5 h-7 px-2">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="h-4 w-px bg-white/8" />
                {/* Signal mark */}
                <svg width="16" height="16" viewBox="0 0 76 76" fill="none" aria-hidden="true" className="shrink-0">
                  <path d="M12 38 Q22.5 20 38 38 Q53.5 56 64 38" stroke="url(#dh-w1)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  <path d="M22 38 Q29 25 38 38 Q47 51 54 38" stroke="url(#dh-w2)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
                  <circle cx="38" cy="38" r="3.5" fill="url(#dh-dot)"/>
                  <defs>
                    <linearGradient id="dh-w1" x1="12" y1="20" x2="64" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#05E8C0"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient>
                    <linearGradient id="dh-w2" x1="22" y1="25" x2="54" y2="51" gradientUnits="userSpaceOnUse"><stop stopColor="#22D3EE"/><stop offset="1" stopColor="#A78BFA"/></linearGradient>
                    <radialGradient id="dh-dot" cx="50%" cy="50%" r="50%"><stop stopColor="#05E8C0"/><stop offset="1" stopColor="#7C3AED"/></radialGradient>
                  </defs>
                </svg>
                <span className="text-xs font-semibold tracking-wide truncate max-w-[200px]"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'rgba(238,242,255,0.75)' }}>
                  {state.document_title || 'Research Dashboard'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab switcher */}
                <div className="flex items-center rounded-lg p-0.5 gap-0.5"
                  style={{ background: 'rgba(238,242,255,0.04)', border: '1px solid rgba(238,242,255,0.06)' }}
                  role="tablist">
                  {(['dashboard', 'source'] as const).map((tab) => (
                    <button key={tab} role="tab" aria-selected={dashboardTab === tab}
                      onClick={() => setDashboardTab(tab)}
                      className="flex items-center gap-1.5 h-6 px-2.5 rounded-md text-[11px] font-medium transition-all"
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        background: dashboardTab === tab ? 'rgba(5,232,192,0.12)' : 'transparent',
                        color: dashboardTab === tab ? '#05E8C0' : 'rgba(238,242,255,0.38)',
                        border: dashboardTab === tab ? '1px solid rgba(5,232,192,0.25)' : '1px solid transparent',
                      }}>
                      {tab === 'dashboard' ? <LayoutDashboard className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-white/8" />
                <span className="text-[11px] tabular-nums" style={{ color: 'rgba(238,242,255,0.25)', fontFamily: 'DM Sans, sans-serif' }}>
                  {componentCount} items
                </span>
                <button onClick={handleRegenerate} disabled={isGenerating}
                  className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-40"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    border: '1px solid rgba(238,242,255,0.1)',
                    color: 'rgba(238,242,255,0.5)',
                    background: 'rgba(238,242,255,0.03)',
                  }}>
                  <RotateCcw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regen
                </button>
                <div className="h-4 w-px bg-white/8" />
                <ChatToggleButton open={chatOpen} onClick={() => setChatOpen(o => !o)} />
              </div>
            </div>
            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(5,232,192,0.3) 40%, rgba(124,58,237,0.3) 70%, transparent)' }} />
          </motion.header>
        ) : (
          /* ── Input / loading header ── */
          <motion.header key="full-header"
            className="shrink-0 backdrop-blur-xl"
            style={{ background: 'rgba(6,9,17,0.9)', borderBottom: '1px solid rgba(5,232,192,0.08)' }}
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                  style={{ filter: 'drop-shadow(0 0 12px rgba(5,232,192,0.28))' }}>
                  <svg width="28" height="28" viewBox="0 0 76 76" fill="none" aria-hidden="true">
                    <path d="M10 38 Q22 16 38 38 Q54 60 66 38" stroke="url(#fh-w1)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    <path d="M19 38 Q27 22 38 38 Q49 54 57 38" stroke="url(#fh-w2)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6"/>
                    <path d="M27 38 Q32 30 38 38 Q44 46 49 38" stroke="url(#fh-w3)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35"/>
                    <circle cx="38" cy="38" r="4" fill="url(#fh-dot)"/>
                    <defs>
                      <linearGradient id="fh-w1" x1="10" y1="16" x2="66" y2="60" gradientUnits="userSpaceOnUse"><stop stopColor="#05E8C0"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient>
                      <linearGradient id="fh-w2" x1="19" y1="22" x2="57" y2="54" gradientUnits="userSpaceOnUse"><stop stopColor="#22D3EE"/><stop offset="1" stopColor="#A78BFA"/></linearGradient>
                      <linearGradient id="fh-w3" x1="27" y1="30" x2="49" y2="46" gradientUnits="userSpaceOnUse"><stop stopColor="#67E8F9"/><stop offset="1" stopColor="#C4B5FD"/></linearGradient>
                      <radialGradient id="fh-dot" cx="50%" cy="50%" r="50%"><stop stopColor="#05E8C0"/><stop offset="1" stopColor="#7C3AED"/></radialGradient>
                    </defs>
                  </svg>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.18 }}>
                  <h1 className="font-bold leading-none"
                    style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, letterSpacing: '-0.01em', color: '#EEF2FF' }}>
                    Signal
                  </h1>
                  <p className="mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'rgba(238,242,255,0.35)' }}>
                    Research intelligence for the media industry
                  </p>
                </motion.div>
              </div>
              <ChatToggleButton open={chatOpen} onClick={() => setChatOpen(o => !o)} />
            </div>
            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(5,232,192,0.2) 50%, transparent)' }} />
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Body ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Input view */}
            {viewState === 'input' && (
              <motion.div key="input-view" className="min-h-full"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}>
                <div className="max-w-3xl mx-auto px-4 py-6">
                  <MarkdownInput
                    onGenerate={handleGenerate}
                    onContentChange={handleContentChange}
                    placeholder={PLACEHOLDER}
                    initialValue={initialContent || state.markdown_content}
                  />
                </div>
              </motion.div>
            )}

            {/* Loading view */}
            {viewState === 'loading' && (
              <motion.div key="loading-view" className="min-h-full"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}>
                <div className="max-w-6xl mx-auto px-4 py-8">
                  <div className="text-center mb-8">
                    <Sparkles className="h-8 w-8 text-blue-400 animate-pulse mx-auto" aria-hidden="true" />
                    <h2 className="text-xl font-semibold mt-4">
                      {state.current_step || "Generating Your Dashboard"}
                    </h2>
                    <div className="max-w-md mx-auto mt-4">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden"
                        role="progressbar" aria-valuenow={state.progress || 0} aria-valuemin={0} aria-valuemax={100}>
                        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={{ width: 0 }} animate={{ width: `${state.progress}%` }}
                          transition={{ duration: 0.3 }} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{state.progress}% complete</p>
                    </div>
                    <div className="mt-4 space-y-1">
                      {(state.activity_log ?? []).slice(-5).map((log) => (
                        <p key={log.id} className="text-xs text-muted-foreground">
                          <span>{log.status === 'completed' ? '✓' : '⏳'}</span>{' '}{log.message}
                        </p>
                      ))}
                    </div>
                  </div>
                  {componentCount === 0 && <LoadingSkeleton />}
                </div>
              </motion.div>
            )}

            {/* Dashboard view */}
            {viewState === 'dashboard' && (
              <motion.div key="dashboard-view" className="min-h-full"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}>
                <div className="max-w-7xl mx-auto px-4 py-6">
                  <AnimatePresence mode="wait">
                    {dashboardTab === 'dashboard' ? (
                      <motion.div key="dashboard-content" className="space-y-8"
                        initial="hidden" animate="visible" exit={{ opacity: 0 }}
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } }}>
                        {ZONE_ORDER.map((zone) => {
                          const components = componentsByZone[zone]
                          if (!components?.length) return null
                          const config = ZONE_CONFIG[zone]

                          if (zone === 'hero') return (
                            <motion.div key={zone} className="space-y-4"
                              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}>
                              {components.map((c, i) => (
                                <div key={c.id || `${zone}-${i}`}>
                                  <A2UIRenderer component={c} showErrors />
                                </div>
                              ))}
                            </motion.div>
                          )

                          if (zone === 'metrics') return (
                            <motion.section key={zone} className={`rounded-xl border p-5 overflow-hidden ${config.className}`}
                              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}>
                              <ZoneHeader config={config} count={components.length} />
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {components.map((c, i) => (
                                  <div key={c.id || `${zone}-${i}`} className="min-w-0">
                                    <A2UIRenderer component={c} showErrors />
                                  </div>
                                ))}
                              </div>
                            </motion.section>
                          )

                          if (zone === 'tags') return (
                            <motion.section key={zone} className={`rounded-xl border p-4 overflow-hidden ${config.className}`}
                              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}>
                              <ZoneHeader config={config} count={components.length} compact />
                              <div className="flex flex-wrap gap-2">
                                {components.map((c, i) => (
                                  <A2UIRenderer key={c.id || `${zone}-${i}`} component={c} showErrors />
                                ))}
                              </div>
                            </motion.section>
                          )

                          // insights / content / media / resources — smart responsive grid
                          const colClass =
                            zone === 'insights' || zone === 'content'
                              ? 'grid-cols-1 md:grid-cols-2'
                              : zone === 'media' || zone === 'resources'
                              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                              : 'grid-cols-1'

                          return (
                            <motion.section key={zone} className={`rounded-xl border p-5 overflow-hidden ${config.className}`}
                              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}>
                              <ZoneHeader config={config} count={components.length} />
                              <div className={`grid ${colClass} gap-4`}>
                                {components.map((c, i) => {
                                  // Full-width override for components that need it
                                  const span = getGridSpan(c)
                                  const fullWidth = span.includes('col-span-12') && !span.includes('md:col-span')
                                  return (
                                    <div key={c.id || `${zone}-${i}`}
                                      className={`min-w-0 overflow-hidden ${fullWidth ? 'col-span-full' : ''}`}>
                                      <A2UIRenderer component={c} showErrors />
                                    </div>
                                  )
                                })}
                              </div>
                            </motion.section>
                          )
                        })}
                      </motion.div>
                    ) : (
                      <motion.div key="source-content"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(5,232,192,0.1)' }}>
                        <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(5,232,192,0.08)' }}>
                          <BookOpen className="h-4 w-4" style={{ color: '#05E8C0' }} />
                          <h2 className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'rgba(238,242,255,0.75)' }}>Source Document</h2>
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

        {/* ── Chat panel — always mounted, CSS-hidden when closed ── */}
        <aside
          className="relative shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            borderLeft: '1px solid rgba(5,232,192,0.08)',
            width: chatOpen ? panelWidth : 0,
            opacity: chatOpen ? 1 : 0,
            pointerEvents: chatOpen ? undefined : 'none',
          }}
          aria-hidden={!chatOpen}
          inert={!chatOpen ? true : undefined}
        >
          {/* Drag handle */}
          {!isMobile && (
            <div onMouseDown={startDrag}
              className="absolute left-0 top-0 h-full w-1 cursor-col-resize z-10
                         hover:bg-[#05E8C0]/30 active:bg-[#05E8C0]/50 transition-colors"
              aria-hidden="true" />
          )}

          {/* Inner container */}
          <div className="flex flex-col h-full" style={{ width: panelWidth }}>
            {/* Panel header — Signal branding */}
            <div
              className="shrink-0 flex items-center justify-between px-4 py-3"
              style={{
                background: "rgba(6,9,17,0.92)",
                borderBottom: "1px solid rgba(238,242,255,0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-2.5">
                {/* Signal logo mark (inline SVG, 18px) */}
                <svg width="18" height="18" viewBox="0 0 76 76" fill="none" aria-hidden="true">
                  <path d="M12 38 Q22.5 20 38 38 Q53.5 56 64 38" stroke="url(#sp-w1)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <path d="M22 38 Q29 25 38 38 Q47 51 54 38" stroke="url(#sp-w2)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.65"/>
                  <path d="M28 38 Q32 31 38 38 Q44 45 48 38" stroke="url(#sp-w3)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.38"/>
                  <circle cx="38" cy="38" r="3" fill="url(#sp-dot)"/>
                  <defs>
                    <linearGradient id="sp-w1" x1="12" y1="20" x2="64" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#05E8C0"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient>
                    <linearGradient id="sp-w2" x1="22" y1="25" x2="54" y2="51" gradientUnits="userSpaceOnUse"><stop stopColor="#22D3EE"/><stop offset="1" stopColor="#A78BFA"/></linearGradient>
                    <linearGradient id="sp-w3" x1="28" y1="31" x2="48" y2="45" gradientUnits="userSpaceOnUse"><stop stopColor="#67E8F9"/><stop offset="1" stopColor="#C4B5FD"/></linearGradient>
                    <radialGradient id="sp-dot" cx="50%" cy="50%" r="50%"><stop stopColor="#05E8C0"/><stop offset="1" stopColor="#7C3AED"/></radialGradient>
                  </defs>
                </svg>
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{
                    fontFamily: "Syne, sans-serif",
                    color: "rgba(238,242,255,0.75)",
                    letterSpacing: "0.1em",
                  }}
                >
                  Signal
                </span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-md transition-colors"
                aria-label="Close chat"
                style={{ color: "rgba(238,242,255,0.3)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(238,242,255,0.8)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(238,242,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(238,242,255,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Chat body */}
            <div className="flex-1 min-h-0">
              <AgenticChat onGenerate={handleGenerate} chainRef={chatChainRef} />
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
      aria-label={open ? "Close Signal" : "Open Signal"}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
      style={{
        fontFamily: "Syne, sans-serif",
        letterSpacing: "0.06em",
        border: open
          ? "1px solid rgba(5,232,192,0.35)"
          : "1px solid rgba(238,242,255,0.12)",
        background: open
          ? "rgba(5,232,192,0.08)"
          : "rgba(238,242,255,0.04)",
        color: open
          ? "rgba(5,232,192,0.9)"
          : "rgba(238,242,255,0.5)",
      }}
    >
      <MessageSquare className="h-3.5 w-3.5" />
      {open ? "Hide Signal" : "Signal"}
    </button>
  );
}

// ─── Zone section header ──────────────────────────────────────────────────────

function ZoneHeader({
  config,
  count,
  compact = false,
}: {
  config: { title: string; icon: React.ReactNode; iconColor: string };
  count: number;
  compact?: boolean;
}) {
  if (!config.title) return null;
  return (
    <div className={`flex items-center gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
      <span className={config.iconColor}>{config.icon}</span>
      <h2
        className={compact ? 'text-xs font-semibold tracking-wide uppercase' : 'text-sm font-semibold'}
        style={{ fontFamily: 'Syne, sans-serif', color: 'rgba(238,242,255,0.75)' }}
      >
        {config.title}
      </h2>
      <span
        className="ml-auto text-[10px] tabular-nums"
        style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(238,242,255,0.25)' }}
      >
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  );
}

// ─── Source markdown renderer ─────────────────────────────────────────────────

function SourceMarkdown({ content }: { content?: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={{
      h1: ({ children }: { children?: ReactNode }) => <h1 className="text-2xl font-bold pb-3 mb-5 mt-0" style={{ fontFamily: 'Syne, sans-serif', color: '#EEF2FF', borderBottom: '1px solid rgba(5,232,192,0.18)' }}>{children}</h1>,
      h2: ({ children }: { children?: ReactNode }) => <h2 className="text-xl font-bold pb-2 mb-4 mt-8" style={{ fontFamily: 'Syne, sans-serif', color: '#EEF2FF', borderBottom: '1px solid rgba(5,232,192,0.1)' }}>{children}</h2>,
      h3: ({ children }: { children?: ReactNode }) => <h3 className="text-base font-semibold mb-3 mt-6" style={{ fontFamily: 'Syne, sans-serif', color: 'rgba(238,242,255,0.9)' }}>{children}</h3>,
      h4: ({ children }: { children?: ReactNode }) => <h4 className="text-sm font-semibold mb-2 mt-5" style={{ color: 'rgba(238,242,255,0.75)' }}>{children}</h4>,
      p:  ({ children }: { children?: ReactNode }) => <p className="leading-relaxed mb-4 text-sm" style={{ color: 'rgba(238,242,255,0.65)', fontFamily: 'DM Sans, sans-serif' }}>{children}</p>,
      strong: ({ children }: { children?: ReactNode }) => <strong style={{ color: '#EEF2FF', fontWeight: 600 }}>{children}</strong>,
      em: ({ children }: { children?: ReactNode }) => <em style={{ color: '#05E8C0' }}>{children}</em>,
      ul: ({ children }: { children?: ReactNode }) => <ul className="my-4 ml-5 list-disc space-y-1.5 text-sm" style={{ color: 'rgba(238,242,255,0.65)', fontFamily: 'DM Sans, sans-serif' }}>{children}</ul>,
      ol: ({ children }: { children?: ReactNode }) => <ol className="my-4 ml-5 list-decimal space-y-1.5 text-sm" style={{ color: 'rgba(238,242,255,0.65)', fontFamily: 'DM Sans, sans-serif' }}>{children}</ol>,
      li: ({ children }: { children?: ReactNode }) => <li style={{ color: 'rgba(238,242,255,0.65)' }}>{children}</li>,
      a:  ({ href, children }: { href?: string; children?: ReactNode }) => <a href={href} className="underline transition-colors" style={{ color: '#05E8C0' }}>{children}</a>,
      code: ({ className, children }: { className?: string; children?: ReactNode }) => {
        if (!className) return <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ color: '#05E8C0', background: 'rgba(5,232,192,0.08)', border: '1px solid rgba(5,232,192,0.16)' }}>{children}</code>
        return <code className={`${className} block rounded-xl my-4 overflow-x-auto text-xs font-mono`} style={{ color: '#05E8C0', background: '#0A0F1A', border: '1px solid rgba(5,232,192,0.14)', padding: '12px 16px' }}>{children}</code>
      },
      pre: ({ children }: { children?: ReactNode }) => <pre className="rounded-xl my-5 overflow-x-auto" style={{ background: '#0A0F1A', border: '1px solid rgba(5,232,192,0.12)', padding: '12px 16px' }}>{children}</pre>,
      blockquote: ({ children }: { children?: ReactNode }) => <blockquote className="pl-4 my-5 italic text-sm" style={{ borderLeft: '3px solid #05E8C0', color: 'rgba(5,232,192,0.8)' }}>{children}</blockquote>,
      table: ({ children }: { children?: ReactNode }) => <table className="w-full border-collapse my-5 text-sm">{children}</table>,
      thead: ({ children }: { children?: ReactNode }) => <thead style={{ background: 'rgba(5,232,192,0.06)' }}>{children}</thead>,
      th: ({ children }: { children?: ReactNode }) => <th className="p-2.5 text-left font-semibold text-xs" style={{ color: 'rgba(238,242,255,0.7)', border: '1px solid rgba(5,232,192,0.12)' }}>{children}</th>,
      td: ({ children }: { children?: ReactNode }) => <td className="p-2.5 text-xs" style={{ border: '1px solid rgba(5,232,192,0.08)', color: 'rgba(238,242,255,0.6)' }}>{children}</td>,
      hr: () => <hr className="my-6" style={{ borderColor: 'rgba(5,232,192,0.12)' }} />,
    }}>
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
