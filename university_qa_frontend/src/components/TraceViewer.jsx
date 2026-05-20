import {
  ChevronDown,
  ChevronRight,
  Route,
  Copy,
  Check,
  Search,
  X,
  Braces,
  List,
  Hash,
  Type,
  ToggleLeft,
  CircleSlash,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export default function TraceViewer({ trace }) {
  const [open, setOpen] = useState(true)
  const [view, setView] = useState('tree') // 'tree' | 'raw'
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)

  const hasTrace = trace && (typeof trace === 'object' ? Object.keys(trace).length > 0 : true)

  const raw = useMemo(() => JSON.stringify(trace ?? {}, null, 2), [trace])

  const stats = useMemo(() => {
    if (!hasTrace) return null
    if (Array.isArray(trace)) return { keys: trace.length, label: 'items' }
    if (typeof trace === 'object') return { keys: Object.keys(trace).length, label: 'keys' }
    return null
  }, [trace, hasTrace])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* noop */ }
  }

  return (
    <section
      className="
        relative overflow-hidden isolate
        rounded-3xl bg-white/80 backdrop-blur-xl
        p-6 sm:p-7
        shadow-[0_4px_12px_rgba(15,23,42,0.06),0_2px_4px_rgba(15,23,42,0.04)]
        ring-1 ring-slate-200/70
        transition-shadow duration-300
        hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.12),0_8px_16px_-8px_rgba(15,23,42,0.08)]
      "
    >
      <div
        aria-hidden
        className="
          pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full
          bg-gradient-to-br from-violet-400/20 via-fuchsia-400/10 to-transparent
          blur-3xl -z-10
        "
      />

      {/* Header (always visible, the toggle button) */}
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="
            group flex items-center gap-2.5 -m-2 p-2 rounded-xl
            hover:bg-slate-50 transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
          "
          aria-expanded={open}
        >
          <span className="
            flex h-9 w-9 items-center justify-center rounded-xl
            bg-gradient-to-br from-violet-500 to-fuchsia-600
            shadow-[0_8px_24px_-8px_rgba(139,92,246,0.5)]
          ">
            <Route className="h-5 w-5 text-white" strokeWidth={2.25} />
          </span>
          <div className="text-left">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Execution Trace
            </h2>
            {stats && (
              <p className="text-xs text-slate-500 mt-0.5">
                {stats.keys} {stats.label}
              </p>
            )}
          </div>
          <ChevronDown
            className={`
              ml-1 h-4 w-4 text-slate-400 transition-transform duration-200
              ${open ? 'rotate-180' : ''}
            `}
            strokeWidth={2.5}
          />
        </button>

        {open && hasTrace && (
          <div className="flex items-center gap-2">
            <ViewToggle view={view} setView={setView} />
            <button
              type="button"
              onClick={copy}
              className="
                inline-flex items-center gap-1.5 rounded-lg
                bg-slate-50 hover:bg-slate-100
                px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900
                ring-1 ring-slate-200/70 hover:ring-slate-300
                transition-colors
              "
              aria-label="Copy trace"
            >
              {copied
                ? <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                : <Copy className="h-3.5 w-3.5" strokeWidth={2} />
              }
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </header>

      {/* Body */}
      {open && (
        <div className="mt-4">
          {!hasTrace ? (
            <div className="
              flex flex-col items-center justify-center
              rounded-2xl border border-dashed border-slate-200
              bg-slate-50/40 px-6 py-10 text-center
            ">
              <div className="
                flex h-14 w-14 items-center justify-center rounded-2xl
                bg-white ring-1 ring-slate-200/70 shadow-sm mb-3
              ">
                <Route className="h-7 w-7 text-slate-400" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-semibold text-slate-700">No trace yet</p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Run a question to see the agent's full execution graph.
              </p>
            </div>
          ) : view === 'raw' ? (
            <div className="
              relative overflow-hidden rounded-2xl
              bg-gradient-to-br from-slate-950 to-slate-900
              ring-1 ring-slate-900/50
            ">
              <div className="
                flex items-center gap-1.5 px-4 py-2.5
                border-b border-white/5
              ">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  trace.json
                </span>
              </div>
              <pre className="
                max-h-[520px] overflow-auto m-0 py-3 px-4
                font-mono text-[12px] leading-6 text-slate-100
                whitespace-pre
              ">
                {raw}
              </pre>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <div className="
                  group relative flex items-center flex-1 max-w-xs
                  rounded-lg bg-slate-50 ring-1 ring-slate-200
                  focus-within:ring-indigo-400 focus-within:bg-white
                  focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]
                  transition-all
                ">
                  <Search className="ml-2.5 h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter keys & values…"
                    className="
                      flex-1 bg-transparent px-2 py-1.5 text-xs text-slate-900
                      placeholder:text-slate-400 outline-none
                    "
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="mr-1.5 rounded p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      aria-label="Clear filter"
                    >
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
              <div className="
                max-h-[520px] overflow-auto rounded-2xl
                bg-gradient-to-br from-slate-50/60 to-white
                ring-1 ring-slate-200/60
                p-3
              ">
                <JsonTree value={trace} query={query.trim().toLowerCase()} root />
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}

/* ---------- View toggle ---------- */

function ViewToggle({ view, setView }) {
  const opts = [
    { id: 'tree', label: 'Tree', Icon: List },
    { id: 'raw',  label: 'Raw',  Icon: Braces },
  ]
  return (
    <div className="
      inline-flex items-center rounded-lg bg-slate-100 p-0.5
      ring-1 ring-slate-200
    ">
      {opts.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          className={`
            inline-flex items-center gap-1.5 rounded-md
            px-2.5 py-1 text-xs font-medium transition-all
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
            ${view === id
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70'
              : 'text-slate-600 hover:text-slate-900'
            }
          `}
        >
          <Icon className="h-3 w-3" strokeWidth={2.5} />
          {label}
        </button>
      ))}
    </div>
  )
}

/* ---------- JSON Tree ---------- */

function JsonTree({ value, query, root = false }) {
  if (Array.isArray(value)) {
    return <ArrayNode array={value} query={query} root={root} />
  }
  if (value && typeof value === 'object') {
    return <ObjectNode obj={value} query={query} root={root} />
  }
  return <ScalarNode value={value} />
}

function ObjectNode({ obj, query, root }) {
  const entries = Object.entries(obj)
  return (
    <div className={root ? '' : 'ml-3 border-l border-slate-200/70 pl-3'}>
      {entries.length === 0 ? (
        <span className="font-mono text-xs text-slate-400">{'{}'}</span>
      ) : (
        entries.map(([k, v]) => (
          <KeyValueNode key={k} k={k} v={v} query={query} />
        ))
      )}
    </div>
  )
}

function ArrayNode({ array, query, root }) {
  return (
    <div className={root ? '' : 'ml-3 border-l border-slate-200/70 pl-3'}>
      {array.length === 0 ? (
        <span className="font-mono text-xs text-slate-400">[]</span>
      ) : (
        array.map((item, i) => (
          <KeyValueNode key={i} k={i} v={item} query={query} isIndex />
        ))
      )}
    </div>
  )
}

function KeyValueNode({ k, v, query, isIndex }) {
  const isContainer = v && typeof v === 'object'
  const childCount = isContainer ? (Array.isArray(v) ? v.length : Object.keys(v).length) : 0

  // Auto-expand small objects + when filtering
  const initiallyOpen = !!query || childCount <= 8
  const [open, setOpen] = useState(initiallyOpen)

  // Filter — show this node if its key or any descendant value matches
  const matches = useMemo(() => {
    if (!query) return true
    return nodeMatches(k, v, query)
  }, [k, v, query])

  if (!matches) return null

  const keyEl = (
    <span className={`
      font-mono text-[12px]
      ${isIndex ? 'text-slate-400' : 'text-violet-700'}
    `}>
      {isIndex ? k : <Highlighted text={String(k)} term={query} accent="violet" />}
    </span>
  )

  if (!isContainer) {
    return (
      <div className="flex items-baseline gap-1.5 py-0.5">
        <span className="w-3" />
        {keyEl}
        <span className="text-slate-400">:</span>
        <ScalarNode value={v} query={query} />
      </div>
    )
  }

  return (
    <div className="py-0.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
          group/key flex items-center gap-1 w-full text-left
          rounded hover:bg-slate-100/60 transition-colors
        "
      >
        <ChevronRight
          className={`
            h-3 w-3 text-slate-400 transition-transform
            ${open ? 'rotate-90' : ''}
          `}
          strokeWidth={2.5}
        />
        {keyEl}
        <span className="text-slate-400">:</span>
        <TypeBadge value={v} count={childCount} />
        {!open && (
          <span className="text-[11px] text-slate-400 font-mono truncate">
            {Array.isArray(v) ? `[ ${childCount} ]` : `{ ${childCount} }`}
          </span>
        )}
      </button>
      {open && <JsonTree value={v} query={query} />}
    </div>
  )
}

function ScalarNode({ value, query }) {
  if (value === null) {
    return <span className="font-mono text-[12px] italic text-slate-400">null</span>
  }
  if (value === undefined) {
    return <span className="font-mono text-[12px] italic text-slate-400">undefined</span>
  }
  if (typeof value === 'boolean') {
    return (
      <span className={`
        font-mono text-[12px] font-medium
        ${value ? 'text-emerald-700' : 'text-rose-700'}
      `}>
        {String(value)}
      </span>
    )
  }
  if (typeof value === 'number') {
    return <span className="font-mono text-[12px] tabular-nums text-amber-700">{value}</span>
  }
  // string
  return (
    <span className="font-mono text-[12px] text-emerald-700 break-all">
      "<Highlighted text={String(value)} term={query} accent="emerald" />"
    </span>
  )
}

function TypeBadge({ value, count }) {
  let Icon, label, classes
  if (Array.isArray(value)) {
    Icon = List
    label = 'array'
    classes = 'bg-indigo-50 text-indigo-700 ring-indigo-100'
  } else if (value && typeof value === 'object') {
    Icon = Braces
    label = 'object'
    classes = 'bg-violet-50 text-violet-700 ring-violet-100'
  } else if (typeof value === 'number') {
    Icon = Hash
    label = 'num'
    classes = 'bg-amber-50 text-amber-700 ring-amber-100'
  } else if (typeof value === 'string') {
    Icon = Type
    label = 'str'
    classes = 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  } else if (typeof value === 'boolean') {
    Icon = ToggleLeft
    label = 'bool'
    classes = 'bg-slate-100 text-slate-600 ring-slate-200'
  } else {
    Icon = CircleSlash
    label = 'null'
    classes = 'bg-slate-50 text-slate-500 ring-slate-200'
  }
  return (
    <span className={`
      inline-flex items-center gap-0.5 rounded
      px-1 py-px text-[10px] font-medium ring-1 ${classes}
    `}>
      <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
      {label}{typeof count === 'number' && (Array.isArray(value) || (value && typeof value === 'object')) ? ` ${count}` : ''}
    </span>
  )
}

/* ---------- Filtering & highlight ---------- */

function nodeMatches(key, value, q) {
  if (String(key).toLowerCase().includes(q)) return true
  if (value == null) return false
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.some((v, i) => nodeMatches(i, v, q))
    }
    return Object.entries(value).some(([k, v]) => nodeMatches(k, v, q))
  }
  return String(value).toLowerCase().includes(q)
}

function Highlighted({ text, term, accent = 'amber' }) {
  if (!term) return text
  const idx = text.toLowerCase().indexOf(term)
  if (idx === -1) return text
  const cls = {
    amber:   'bg-amber-200/70 text-amber-900',
    violet:  'bg-violet-200/60 text-violet-900',
    emerald: 'bg-emerald-200/60 text-emerald-900',
  }[accent] || 'bg-amber-200/70'
  return (
    <>
      {text.slice(0, idx)}
      <mark className={`rounded px-0.5 ${cls}`}>{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  )
}