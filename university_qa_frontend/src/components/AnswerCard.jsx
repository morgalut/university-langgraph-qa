import { CheckCircle2 } from 'lucide-react'

export default function AnswerCard({ answer }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <h2 className="text-xl font-bold text-slate-950">Answer</h2>
      </div>
      <div className="rounded-2xl bg-slate-100 p-5 leading-7 text-slate-800">
        {answer || 'No answer returned.'}
      </div>
    </section>
  )
}
