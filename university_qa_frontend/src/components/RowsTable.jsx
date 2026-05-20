import {
  Table as TableIcon,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export default function RowsTable({ rows }) {
  const safeRows = Array.isArray(rows) ? rows : []
  const columns = safeRows.length > 0 ? Object.keys(safeRows[0]) : []

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ column: null, direction: 'asc' })

  // Filter
  const filtered = useMemo(() => {
    if (!query.trim()) return safeRows
    const q = query.toLowerCase()
    return safeRows.filter((row) =>
      columns.some((c) => String(row[c] ?? '').toLowerCase().includes(q))
    )
  }, [safeRows, columns, query])

  // Sort
  const sortedRows = useMemo(() => {
    if (!sort.column) return filtered
    const dir = sort.direction === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const av = a[sort.column]
      const bv = b[sort.column]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const an = Number(av)
      const bn = Number(bv)
      if (!Number.isNaN(an) && !Number.isNaN(bn)) return (an - bn) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [filtered, sort])

  const toggleSort = (column) => {
    setSort((prev) => {
      if (prev.column !== column) return { column, direction: 'asc' }
      if (prev.direction === 'asc') return { column, direction: 'desc' }
      return { column: null, direction: 'asc' }
    })
  }

  const downloadCSV = () => {
    if (sortedRows.length === 0) return
    const esc = (v) => {
      const s = v == null ? '' : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [
      columns.join(','),
      ...sortedRows.map((row) => columns.map((c) => esc(row[c])).join(',')),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rows-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const isEmpty = safeRows.length === 0
  const hasNoMatches = !isEmpty && sortedRows.length === 0

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
      {/* Decorative glow */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full
          bg-gradient-to-br from-indigo-400/20 via-violet-400/10 to-transparent
          blur-3xl -z-10
        "
      />

      {/* Header */}
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="
            flex h-9 w-9 items-center justify-center rounded-xl
            bg-gradient-to-br from-slate-900 to-slate-700
            text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.4)]
          ">
            <TableIcon className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Database Rows
            </h2>
            <span className="
              inline-flex items-center rounded-full
              bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700
              ring-1 ring-indigo-100 tabular-nums
            ">
              {query ? `${sortedRows.length}/${safeRows.length}` : safeRows.length}
            </span>
          </div>
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="
              group relative flex items-center
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
                placeholder="Filter rows…"
                className="
                  w-32 bg-transparent px-2 py-1.5 text-xs text-slate-900
                  placeholder:text-slate-400 outline-none
                  sm:w-40 focus:w-48 transition-[width]
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

            {/* Export */}
            <button
              type="button"
              onClick={downloadCSV}
              className="
                inline-flex items-center gap-1.5 rounded-lg
                bg-slate-50 hover:bg-slate-100
                px-2.5 py-1.5 text-xs font-medium text-slate-700
                ring-1 ring-slate-200 hover:ring-slate-300
                transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
              "
              aria-label="Download CSV"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              CSV
            </button>
          </div>
        )}
      </header>

      {/* Body */}
      {isEmpty ? (
        <EmptyState
          icon={<Inbox className="h-7 w-7 text-slate-400" strokeWidth={1.75} />}
          title="No rows returned"
          message="The query executed successfully but returned no data."
        />
      ) : hasNoMatches ? (
        <EmptyState
          icon={<Search className="h-7 w-7 text-slate-400" strokeWidth={1.75} />}
          title="No matches"
          message={`No rows match "${query}".`}
          action={
            <button
              type="button"
              onClick={() => setQuery('')}
              className="
                mt-3 inline-flex items-center gap-1 rounded-lg
                bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700
                ring-1 ring-indigo-100 hover:bg-indigo-100
              "
            >
              Clear filter
            </button>
          }
        />
      ) : (
        <div className="
          max-h-[420px] overflow-auto rounded-2xl
          ring-1 ring-slate-200/60
          bg-gradient-to-br from-slate-50/40 to-white
        ">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr>
                {columns.map((column, i) => {
                  const isSorted = sort.column === column
                  return (
                    <th
                      key={column}
                      scope="col"
                      className={`
                        whitespace-nowrap bg-slate-50/95 backdrop-blur
                        px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider
                        text-slate-600
                        border-b border-slate-200
                        ${i === 0 ? 'rounded-tl-2xl' : ''}
                        ${i === columns.length - 1 ? 'rounded-tr-2xl' : ''}
                      `}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className="
                          group/sort inline-flex items-center gap-1.5
                          hover:text-slate-900 transition-colors
                          focus:outline-none focus-visible:text-indigo-600
                        "
                      >
                        {column}
                        <SortIcon active={isSorted} direction={sort.direction} />
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="
                    group/row
                    odd:bg-white even:bg-slate-50/50
                    hover:bg-indigo-50/40 transition-colors
                  "
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="
                        whitespace-nowrap px-4 py-2.5
                        border-b border-slate-100
                        group-last/row:border-b-0
                      "
                    >
                      <Cell value={row[column]} highlight={query} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/* ---------- Subcomponents ---------- */

function SortIcon({ active, direction }) {
  if (!active) {
    return (
      <ArrowUpDown
        className="h-3 w-3 text-slate-300 group-hover/sort:text-slate-500 transition-colors"
        strokeWidth={2.5}
      />
    )
  }
  return direction === 'asc' ? (
    <ArrowUp className="h-3 w-3 text-indigo-600" strokeWidth={2.5} />
  ) : (
    <ArrowDown className="h-3 w-3 text-indigo-600" strokeWidth={2.5} />
  )
}

function Cell({ value, highlight }) {
  // null / undefined
  if (value === null || value === undefined) {
    return <span className="text-slate-300 italic text-xs">NULL</span>
  }
  // booleans
  if (typeof value === 'boolean') {
    return (
      <span
        className={`
          inline-flex items-center rounded-md
          px-1.5 py-0.5 text-[11px] font-medium ring-1
          ${value
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/70'
            : 'bg-rose-50 text-rose-700 ring-rose-200/70'
          }
        `}
      >
        {value ? 'true' : 'false'}
      </span>
    )
  }
  // numbers — right-feel via tabular-nums + subtle color
  if (typeof value === 'number') {
    return (
      <span className="tabular-nums font-medium text-slate-900">
        {Number.isInteger(value) ? value.toLocaleString() : value.toString()}
      </span>
    )
  }
  // objects / arrays
  if (typeof value === 'object') {
    return (
      <code className="
        rounded bg-slate-100 px-1.5 py-0.5
        text-[11px] font-mono text-slate-700
      ">
        {JSON.stringify(value)}
      </code>
    )
  }

  const str = String(value)

  // dates (ISO-like)
  if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?/.test(str)) {
    return <span className="tabular-nums text-slate-700">{str}</span>
  }

  return (
    <span className="text-slate-700">
      <Highlight text={str} term={highlight} />
    </span>
  )
}

function Highlight({ text, term }) {
  if (!term?.trim()) return text
  const t = term.trim()
  const idx = text.toLowerCase().indexOf(t.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-amber-100 px-0.5 text-amber-900">
        {text.slice(idx, idx + t.length)}
      </mark>
      {text.slice(idx + t.length)}
    </>
  )
}

function EmptyState({ icon, title, message, action }) {
  return (
    <div className="
      flex flex-col items-center justify-center
      rounded-2xl border border-dashed border-slate-200
      bg-slate-50/40
      px-6 py-10 text-center
    ">
      <div className="
        flex h-14 w-14 items-center justify-center rounded-2xl
        bg-white ring-1 ring-slate-200/70 shadow-sm mb-3
      ">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500 max-w-xs">{message}</p>
      {action}
    </div>
  )
}