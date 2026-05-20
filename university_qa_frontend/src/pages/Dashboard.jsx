import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from '../components/Header'
import QuestionForm from '../components/QuestionForm'
import AnswerCard from '../components/AnswerCard'
import SqlViewer from '../components/SqlViewer'
import RowsTable from '../components/RowsTable'
import TraceViewer from '../components/TraceViewer'
import ErrorAlert from '../components/ErrorAlert'
import { checkHealth } from '../api/client'
import { useAgentQuestion } from '../hooks/useAgentQuestion'

const SUBMIT_KEY = 'uqa:lastQuestion'

export default function Dashboard() {
  const [question, setQuestion] = useState(
    () => readLastQuestion() ?? 'List all teachers'
  )
  const [apiStatus, setApiStatus] = useState(null)
  const [checkingHealth, setCheckingHealth] = useState(false)
  const [healthError, setHealthError] = useState('')

  const {
    status,
    loading,
    result,
    error,
    durationMs,
    ask,
    retry,
    cancel,
  } = useAgentQuestion()

  // Auto-probe health on mount, quietly. Don't surface an error if it fails
  // initially — user can press "Check API" for an explicit attempt.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await checkHealth()
        if (!cancelled) setApiStatus(data)
      } catch {
        /* silent on first load */
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Persist last question across reloads
  useEffect(() => {
    persistLastQuestion(question)
  }, [question])

  // Cmd/Ctrl + K → focus the question textarea
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('question')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleHealthCheck = useCallback(async () => {
    setCheckingHealth(true)
    setHealthError('')
    try {
      const data = await checkHealth()
      setApiStatus(data)
    } catch {
      // Keep showing the last-known good status (don't blank the chip),
      // but raise a banner explaining what to do.
      setHealthError(
        'FastAPI is not reachable. Start it with: uvicorn app.main:app --reload'
      )
    } finally {
      setCheckingHealth(false)
    }
  }, [])

  const handleSubmit = useCallback((event) => {
    event.preventDefault()
    ask(question)
  }, [ask, question])

  const errorMessage = error?.message || (typeof error === 'string' ? error : '')

  return (
    <main
      className="
        relative min-h-screen
        bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(99,102,241,0.08),transparent_60%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(139,92,246,0.06),transparent_60%)]
        bg-slate-50
        p-4 sm:p-6 lg:p-8
      "
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <FadeIn>
          <Header
            apiStatus={apiStatus}
            onCheckHealth={handleHealthCheck}
            checkingHealth={checkingHealth}
          />
        </FadeIn>

        {/* Health banner */}
        <AnimatePresence initial={false}>
          {healthError && (
            <SlideDown key="health-error">
              <ErrorAlert
                message={healthError}
                onDismiss={() => setHealthError('')}
              />
            </SlideDown>
          )}
        </AnimatePresence>

        {/* Question form */}
        <FadeIn delay={0.05}>
          <QuestionForm
            question={question}
            setQuestion={setQuestion}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </FadeIn>

        {/* Status strip (running / cancelled controls) */}
        <AnimatePresence initial={false}>
          {loading && (
            <SlideDown key="running">
              <RunningStrip onCancel={cancel} />
            </SlideDown>
          )}
        </AnimatePresence>

        {/* Ask error */}
        <AnimatePresence initial={false}>
          {status === 'error' && errorMessage && (
            <SlideDown key="ask-error">
              <ErrorAlert
                message={errorMessage}
                detail={error?.kind ? formatErrorKind(error) : null}
                onRetry={retry}
                onDismiss={null}
              />
            </SlideDown>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <AnswerCard
                answer={result.answer}
                sources={result.sources}
                timestamp={new Date()}
                status="idle"
              />

              {/* Run summary */}
              {durationMs != null && (
                <div className="flex items-center justify-end text-xs text-slate-500">
                  Completed in{' '}
                  <span className="ml-1 font-medium tabular-nums text-slate-700">
                    {formatDuration(durationMs)}
                  </span>
                </div>
              )}

              <div className="grid gap-6 xl:grid-cols-2">
                <SqlViewer sql={result.sql} />
                <RowsTable rows={result.rows} />
              </div>

              <TraceViewer trace={result.trace} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="pt-4 pb-2 text-center text-xs text-slate-400">
          Press{' '}
          <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
            ⌘K
          </kbd>{' '}
          to focus the question
        </footer>
      </div>
    </main>
  )
}

/* ---------- Animation wrappers ---------- */

function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SlideDown({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -6 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -6 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  )
}

/* ---------- Running strip ---------- */

function RunningStrip({ onCancel }) {
  return (
    <div className="
      flex items-center justify-between gap-3
      rounded-2xl bg-white/80 backdrop-blur-xl
      px-4 py-3
      ring-1 ring-indigo-200/60
      shadow-[0_4px_12px_rgba(99,102,241,0.08)]
    ">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">Agent is thinking…</p>
          <p className="text-xs text-slate-500">
            Generating SQL, querying the database, composing an answer.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="
          rounded-lg px-2.5 py-1.5 text-xs font-medium
          text-slate-600 hover:text-slate-900
          bg-slate-50 hover:bg-slate-100
          ring-1 ring-slate-200 hover:ring-slate-300
          transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
        "
      >
        Cancel
      </button>
    </div>
  )
}

/* ---------- helpers ---------- */

function formatDuration(ms) {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function formatErrorKind(err) {
  const map = {
    network: 'Network unreachable — is the API server running?',
    auth: 'Authentication failed.',
    not_found: 'The requested endpoint was not found.',
    validation: 'The request was rejected as invalid.',
    server: `Server error${err.status ? ` (${err.status})` : ''}.`,
    client: `Request error${err.status ? ` (${err.status})` : ''}.`,
  }
  return map[err.kind] || null
}

function readLastQuestion() {
  try {
    return typeof window !== 'undefined'
      ? window.sessionStorage.getItem(SUBMIT_KEY)
      : null
  } catch {
    return null
  }
}

function persistLastQuestion(q) {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(SUBMIT_KEY, q)
    }
  } catch {
    /* sessionStorage unavailable */
  }
}