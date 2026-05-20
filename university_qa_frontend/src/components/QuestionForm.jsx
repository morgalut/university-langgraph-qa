import { Loader2, Send, Sparkles, Wand2, CornerDownLeft } from 'lucide-react'
import { useRef, useEffect } from 'react'

const examples = [
  { icon: '👥', text: 'List all teachers' },
  { icon: '📊', text: 'What is the average grade per course?' },
  { icon: '🏆', text: 'Which teacher has the highest average grade in Fall 2025?' },
  { icon: '📈', text: 'How many students enrolled in Algorithms in Fall 2025?' },
  { icon: '🎓', text: 'Show all students enrolled in courses taught by Dr. Smith' },
]

const MAX_LEN = 500
const MIN_LEN = 3

export default function QuestionForm({ question, setQuestion, onSubmit, loading }) {
  const textareaRef = useRef(null)

  // Auto-grow the textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`
  }, [question])

  const trimmed = question.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_LEN
  const overLimit = question.length > MAX_LEN
  const canSubmit = !loading && trimmed.length >= MIN_LEN && !overLimit

  const handleKeyDown = (e) => {
    // Cmd/Ctrl + Enter submits
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  return (
    <section
      className="
        relative overflow-hidden isolate
        rounded-3xl bg-white/80 backdrop-blur-xl
        p-6 sm:p-7
        shadow-[0_4px_12px_rgba(15,23,42,0.06),0_2px_4px_rgba(15,23,42,0.04)]
        ring-1 ring-slate-200/70
        transition-all duration-300
        hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.12),0_8px_16px_-8px_rgba(15,23,42,0.08)]
      "
    >
      {/* Decorative glow */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full
          bg-gradient-to-br from-indigo-400/20 via-violet-400/10 to-transparent
          blur-3xl -z-10
        "
      />

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="
              flex h-9 w-9 items-center justify-center rounded-xl
              bg-gradient-to-br from-indigo-500 to-violet-600
              shadow-[0_8px_24px_-8px_rgba(99,102,241,0.5)]
            ">
              <Wand2 className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <label
              htmlFor="question"
              className="text-base font-semibold tracking-tight text-slate-950"
            >
              Ask a question
            </label>
          </div>
          <CharCounter current={question.length} max={MAX_LEN} />
        </div>

        {/* Textarea */}
        <div
          className={`
            group relative rounded-2xl
            bg-gradient-to-br from-slate-50 to-white
            ring-1 transition-all duration-200
            ${overLimit
              ? 'ring-rose-300 focus-within:ring-rose-400 focus-within:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]'
              : 'ring-slate-200 focus-within:ring-indigo-400 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]'
            }
          `}
        >
          <textarea
            ref={textareaRef}
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="
              block w-full resize-none rounded-2xl bg-transparent
              p-4 pb-12 text-[15px] leading-relaxed text-slate-900
              placeholder:text-slate-400
              outline-none
            "
            placeholder="Ask about teachers, students, courses, enrollments, semesters, averages, counts, or grades…"
          />

          {/* Bottom toolbar inside textarea */}
          <div className="
            pointer-events-none absolute inset-x-3 bottom-3
            flex items-center justify-between
          ">
            <span className="text-[11px] text-slate-400">
              {tooShort ? (
                <span className="text-amber-600">
                  At least {MIN_LEN} characters
                </span>
              ) : (
                <>
                  Press
                  <kbd className="
                    mx-1 inline-flex items-center gap-0.5
                    rounded border border-slate-200 bg-white
                    px-1.5 py-0.5 text-[10px] font-medium text-slate-600
                  ">
                    ⌘
                    <CornerDownLeft className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </kbd>
                  to send
                </>
              )}
            </span>
          </div>
        </div>

        {/* Examples */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-indigo-500" strokeWidth={2.5} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Try an example
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => {
              const active = question === ex.text
              return (
                <button
                  key={ex.text}
                  type="button"
                  onClick={() => setQuestion(ex.text)}
                  className={`
                    group/ex inline-flex items-center gap-1.5
                    rounded-full px-3 py-1.5 text-xs font-medium
                    ring-1 transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
                    ${active
                      ? 'bg-indigo-50 text-indigo-700 ring-indigo-200 shadow-[0_2px_8px_-2px_rgba(99,102,241,0.3)]'
                      : 'bg-white/70 text-slate-700 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 hover:-translate-y-0.5'
                    }
                  `}
                >
                  <span className="text-sm leading-none">{ex.icon}</span>
                  <span>{ex.text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit row */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4">
          <p className="text-xs text-slate-500">
            The agent will generate SQL, query the database, and explain results.
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="
              group inline-flex items-center justify-center gap-2
              rounded-2xl px-5 py-2.5 text-sm font-semibold text-white
              bg-gradient-to-br from-indigo-500 to-violet-600
              shadow-[0_8px_24px_-8px_rgba(99,102,241,0.5)]
              hover:shadow-[0_12px_36px_-8px_rgba(99,102,241,0.65)]
              hover:-translate-y-0.5
              active:translate-y-0
              transition-all duration-200
              disabled:cursor-not-allowed disabled:opacity-50
              disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_24px_-8px_rgba(99,102,241,0.5)]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2
            "
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Thinking…
              </>
            ) : (
              <>
                <Send
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.5}
                />
                Ask Agent
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

function CharCounter({ current, max }) {
  const ratio = current / max
  const over = current > max
  const near = ratio > 0.8

  if (current === 0) return null

  return (
    <span
      className={`
        text-[11px] font-medium tabular-nums
        ${over ? 'text-rose-600' : near ? 'text-amber-600' : 'text-slate-400'}
      `}
    >
      {current}/{max}
    </span>
  )
}