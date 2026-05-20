import { CheckCircle2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function AnswerCard({ answer, sources, timestamp }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!answer) return
    try {
      await navigator.clipboard.writeText(answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // silently ignore
    }
  }

  const isEmpty = !answer

  return (
    <section
      className="
        group relative overflow-hidden
        rounded-3xl bg-white/80 backdrop-blur-xl
        p-6 sm:p-7
        shadow-[0_4px_12px_rgba(15,23,42,0.06),0_2px_4px_rgba(15,23,42,0.04)]
        ring-1 ring-slate-200/70
        transition-shadow duration-300
        hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.12),0_8px_16px_-8px_rgba(15,23,42,0.08)]
      "
      aria-label="Answer"
    >
      {/* Decorative accent glow */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full
          bg-gradient-to-br from-indigo-400/20 via-violet-400/10 to-transparent
          blur-3xl
        "
      />

      {/* Header */}
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="
              flex h-9 w-9 items-center justify-center rounded-xl
              bg-gradient-to-br from-emerald-400 to-teal-500
              shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]
            "
          >
            <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Answer
            </h2>
            {timestamp && (
              <p className="text-xs text-slate-500">{timestamp}</p>
            )}
          </div>
        </div>

        {!isEmpty && (
          <button
            type="button"
            onClick={handleCopy}
            className="
              inline-flex items-center gap-1.5 rounded-lg
              px-2.5 py-1.5 text-xs font-medium
              text-slate-600 hover:text-slate-900
              bg-slate-50 hover:bg-slate-100
              ring-1 ring-slate-200/70
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
            "
            aria-label={copied ? 'Copied' : 'Copy answer'}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                Copy
              </>
            )}
          </button>
        )}
      </header>

      {/* Body */}
      <div
        className={`
          relative rounded-2xl p-5 sm:p-6
          leading-7 text-[15px]
          ring-1
          ${isEmpty
            ? 'bg-slate-50/70 text-slate-400 italic ring-dashed ring-slate-200'
            : 'bg-gradient-to-br from-slate-50 to-white text-slate-800 ring-slate-200/60'
          }
        `}
      >
        {/* Accent rail */}
        {!isEmpty && (
          <span
            aria-hidden
            className="
              absolute left-0 top-4 bottom-4 w-[3px] rounded-full
              bg-gradient-to-b from-indigo-500 to-violet-500
            "
          />
        )}
        <div className={!isEmpty ? 'pl-4' : ''}>
          {answer || 'No answer returned yet.'}
        </div>
      </div>

      {/* Sources footer */}
      {sources?.length > 0 && (
        <footer className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Sources
          </span>
          {sources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center rounded-full
                bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700
                ring-1 ring-indigo-100
                hover:bg-indigo-100 transition-colors
              "
            >
              {s.title || s.url}
            </a>
          ))}
        </footer>
      )}
    </section>
  )
}