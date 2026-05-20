import {
  Copy,
  Check,
  DatabaseZap,
  Code2,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

const SQL_KEYWORDS = new Set([
  'select', 'from', 'where', 'and', 'or', 'not', 'in', 'is', 'null',
  'join', 'inner', 'outer', 'left', 'right', 'full', 'cross', 'on', 'using',
  'group', 'by', 'order', 'having', 'limit', 'offset', 'distinct', 'as',
  'union', 'all', 'intersect', 'except', 'with', 'recursive',
  'insert', 'into', 'values', 'update', 'set', 'delete',
  'create', 'table', 'view', 'index', 'drop', 'alter', 'add', 'column',
  'case', 'when', 'then', 'else', 'end', 'cast', 'between', 'like', 'ilike',
  'asc', 'desc', 'true', 'false', 'exists',
])

const SQL_FUNCTIONS = new Set([
  'count', 'sum', 'avg', 'min', 'max', 'coalesce', 'nullif',
  'now', 'current_date', 'current_timestamp', 'date_trunc',
  'extract', 'lower', 'upper', 'length', 'substring', 'concat',
  'round', 'floor', 'ceil', 'abs',
])

/**
 * Tokenize SQL into spans for syntax highlighting.
 * Order of matching matters: comments → strings → numbers → identifiers/punct.
 */
function tokenizeSql(sql) {
  const tokens = []
  let i = 0
  const push = (type, value) => tokens.push({ type, value })

  while (i < sql.length) {
    const rest = sql.slice(i)

    // Block comment /* ... */
    const block = rest.match(/^\/\*[\s\S]*?\*\//)
    if (block) { push('comment', block[0]); i += block[0].length; continue }
    // Line comment -- ...
    const line = rest.match(/^--[^\n]*/)
    if (line) { push('comment', line[0]); i += line[0].length; continue }
    // Strings
    const str = rest.match(/^'([^'\\]|\\.)*'/) || rest.match(/^"([^"\\]|\\.)*"/)
    if (str) { push('string', str[0]); i += str[0].length; continue }
    // Numbers
    const num = rest.match(/^\d+(\.\d+)?/)
    if (num) { push('number', num[0]); i += num[0].length; continue }
    // Identifiers / keywords
    const word = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/)
    if (word) {
      const v = word[0]
      const lower = v.toLowerCase()
      const type = SQL_KEYWORDS.has(lower)
        ? 'keyword'
        : SQL_FUNCTIONS.has(lower)
        ? 'function'
        : 'identifier'
      push(type, v)
      i += v.length
      continue
    }
    // Punctuation / operators
    const punct = rest.match(/^[(),;.*]/) || rest.match(/^[=<>!]+/) || rest.match(/^[+\-/%]/)
    if (punct) { push('punct', punct[0]); i += punct[0].length; continue }
    // Whitespace
    const ws = rest.match(/^\s+/)
    if (ws) { push('ws', ws[0]); i += ws[0].length; continue }
    // Fallback — single char
    push('text', sql[i])
    i++
  }
  return tokens
}

const TOKEN_CLASS = {
  keyword:    'text-indigo-300 font-medium',
  function:   'text-violet-300',
  string:     'text-emerald-300',
  number:     'text-amber-300',
  comment:    'text-slate-500 italic',
  identifier: 'text-slate-100',
  punct:      'text-slate-400',
  ws:         '',
  text:       'text-slate-100',
}

export default function SqlViewer({ sql }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isEmpty = !sql

  const tokens = useMemo(() => (sql ? tokenizeSql(sql) : []), [sql])

  const stats = useMemo(() => {
    if (!sql) return null
    const lines = sql.split('\n').length
    const chars = sql.length
    return { lines, chars }
  }, [sql])

  const copy = async () => {
    if (!sql) return
    try {
      await navigator.clipboard.writeText(sql)
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
          bg-gradient-to-br from-indigo-400/20 via-violet-400/10 to-transparent
          blur-3xl -z-10
        "
      />

      {/* Header */}
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="
            flex h-9 w-9 items-center justify-center rounded-xl
            bg-gradient-to-br from-amber-400 to-orange-500
            shadow-[0_8px_24px_-8px_rgba(245,158,11,0.5)]
          ">
            <DatabaseZap className="h-5 w-5 text-white" strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Generated SQL
            </h2>
            {stats && (
              <p className="text-xs text-slate-500 mt-0.5">
                {stats.lines} {stats.lines === 1 ? 'line' : 'lines'}
                <span className="mx-1 text-slate-300">·</span>
                {stats.chars} chars
              </p>
            )}
          </div>
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="
                inline-flex items-center gap-1.5 rounded-lg
                bg-slate-50 hover:bg-slate-100
                px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900
                ring-1 ring-slate-200/70 hover:ring-slate-300
                transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
              "
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded
                ? <Minimize2 className="h-3.5 w-3.5" strokeWidth={2} />
                : <Maximize2 className="h-3.5 w-3.5" strokeWidth={2} />
              }
              {expanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              type="button"
              onClick={copy}
              className="
                inline-flex items-center gap-1.5 rounded-lg
                bg-slate-50 hover:bg-slate-100
                px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900
                ring-1 ring-slate-200/70 hover:ring-slate-300
                transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
              "
              aria-label={copied ? 'Copied' : 'Copy SQL'}
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
      {isEmpty ? (
        <div className="
          flex flex-col items-center justify-center
          rounded-2xl border border-dashed border-slate-200
          bg-slate-50/40 px-6 py-10 text-center
        ">
          <div className="
            flex h-14 w-14 items-center justify-center rounded-2xl
            bg-white ring-1 ring-slate-200/70 shadow-sm mb-3
          ">
            <Code2 className="h-7 w-7 text-slate-400" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-semibold text-slate-700">No SQL generated</p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs">
            Ask a question and the agent's SQL will appear here.
          </p>
        </div>
      ) : (
        <div className="
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br from-slate-950 to-slate-900
          ring-1 ring-slate-900/50
          shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
        ">
          {/* Window chrome dots */}
          <div className="
            flex items-center gap-1.5 px-4 py-2.5
            border-b border-white/5
          ">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              query.sql
            </span>
          </div>

          {/* Code with line numbers */}
          <div
            className={`
              overflow-auto font-mono text-[13px] leading-6
              ${expanded ? 'max-h-[640px]' : 'max-h-72'}
              transition-[max-height] duration-300
            `}
          >
            <CodeBlock tokens={tokens} sql={sql} />
          </div>
        </div>
      )}
    </section>
  )
}

function CodeBlock({ tokens, sql }) {
  const lines = sql.split('\n')

  // Render tokens but keep line structure for the gutter.
  // Strategy: emit a single flow of token spans inside a <pre>, with a parallel
  // <div> column for line numbers using the same line-height.
  return (
    <div className="flex">
      <div
        aria-hidden
        className="
          flex-shrink-0 select-none border-r border-white/5
          bg-slate-950/40 py-3 px-3 text-right
          text-slate-600 tabular-nums
        "
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre className="flex-1 m-0 py-3 px-4 whitespace-pre overflow-visible">
        <code>
          {tokens.map((t, i) => (
            <span key={i} className={TOKEN_CLASS[t.type]}>
              {t.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}