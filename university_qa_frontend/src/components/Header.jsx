import {
  Activity,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { useMemo } from 'react'

export default function Header({ apiStatus, onCheckHealth, checkingHealth }) {
  const status = useMemo(() => {
    if (checkingHealth) {
      return {
        tone: 'pending',
        label: 'Checking…',
        Icon: Loader2,
        classes: 'bg-slate-50 text-slate-600 ring-slate-200',
        dot: 'bg-slate-400',
        spin: true,
      }
    }
    if (!apiStatus) {
      return {
        tone: 'unknown',
        label: 'Unknown',
        Icon: Activity,
        classes: 'bg-slate-50 text-slate-500 ring-slate-200',
        dot: 'bg-slate-300',
      }
    }
    const value = (apiStatus.status || 'ok').toLowerCase()
    if (value === 'ok' || value === 'healthy' || value === 'up') {
      return {
        tone: 'ok',
        label: apiStatus.status || 'Healthy',
        Icon: CheckCircle2,
        classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
        dot: 'bg-emerald-500',
      }
    }
    return {
      tone: 'error',
      label: apiStatus.status || 'Error',
      Icon: AlertTriangle,
      classes: 'bg-rose-50 text-rose-700 ring-rose-200/70',
      dot: 'bg-rose-500',
    }
  }, [apiStatus, checkingHealth])

  return (
    <header
      className="
        relative overflow-hidden isolate
        rounded-3xl bg-white/80 backdrop-blur-xl
        p-6 sm:p-7
        shadow-[0_4px_12px_rgba(15,23,42,0.06),0_2px_4px_rgba(15,23,42,0.04)]
        ring-1 ring-slate-200/70
      "
    >
      {/* Decorative gradient */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full
          bg-gradient-to-br from-indigo-400/20 via-violet-400/10 to-transparent
          blur-3xl -z-10
        "
      />
      <div
        aria-hidden
        className="
          pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full
          bg-gradient-to-tr from-emerald-300/10 to-transparent
          blur-3xl -z-10
        "
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Brand block */}
        <div className="flex items-start gap-4 min-w-0">
          <div
            className="
              flex h-14 w-14 flex-shrink-0 items-center justify-center
              rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700
              text-white shadow-[0_12px_32px_-8px_rgba(15,23,42,0.4)]
              ring-1 ring-white/10
            "
          >
            <Database className="h-7 w-7" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <TechPill>FastAPI</TechPill>
              <Dot />
              <TechPill>PostgreSQL</TechPill>
              <Dot />
              <TechPill>LangGraph</TechPill>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              University QA Agent
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
              Ask natural language questions, inspect generated SQL, review
              database rows, and debug the full local execution trace.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center lg:flex-shrink-0">
          <button
            type="button"
            onClick={onCheckHealth}
            disabled={checkingHealth}
            className="
              group inline-flex items-center justify-center gap-2
              rounded-2xl px-4 py-2.5 text-sm font-semibold text-white
              bg-gradient-to-br from-indigo-500 to-violet-600
              shadow-[0_8px_24px_-8px_rgba(99,102,241,0.5)]
              hover:shadow-[0_12px_36px_-8px_rgba(99,102,241,0.6)]
              hover:-translate-y-0.5
              active:translate-y-0
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2
            "
          >
            <Activity
              className={`h-4 w-4 ${checkingHealth ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`}
              strokeWidth={2.5}
            />
            {checkingHealth ? 'Checking…' : 'Check API'}
          </button>

          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="
              group inline-flex items-center justify-center gap-2
              rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700
              ring-1 ring-slate-200 hover:ring-slate-300
              hover:bg-slate-50
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2
            "
          >
            Swagger Docs
            <ExternalLink
              className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
              strokeWidth={2}
            />
          </a>
        </div>
      </div>

      {/* Status row */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          API Status
        </span>
        <span
          className={`
            inline-flex items-center gap-2 rounded-full
            px-2.5 py-1 text-xs font-medium ring-1
            ${status.classes}
          `}
        >
          <span className="relative flex h-2 w-2">
            {status.tone === 'ok' && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${status.dot}`} />
          </span>
          {status.label}
        </span>

        {apiStatus?.version && (
          <span className="text-xs text-slate-500">
            v{apiStatus.version}
          </span>
        )}
        {apiStatus?.database && (
          <>
            <Dot />
            <span className="text-xs text-slate-500">
              db: <span className="font-medium text-slate-700">{apiStatus.database}</span>
            </span>
          </>
        )}
      </div>
    </header>
  )
}

function TechPill({ children }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </span>
  )
}

function Dot() {
  return <span className="text-slate-300">·</span>
}