'use client'

import { useMemo, useRef, useState } from 'react'
import { useStore } from '@/lib/store/useStore'
import ProgressRing from '@/components/ProgressRing'

/** Minimal exam type (used if your store doesn't export one yet) */
type Exam = {
  id: string
  subject?: string
  name: string
  examDateISO: string
  startReviseISO?: string
  finishReviseISO?: string
  confidence: 1 | 2 | 3 | 4 | 5
  started: 'yes' | 'partly' | 'no'
  toughTopics?: string
  specType?: 'pdf' | 'text'
  specText?: string
  specFileName?: string
  progress?: number
}

export default function ExamsPage() {
  // If your store has exams/addExam, use them; otherwise fall back to local state.
  // @ts-ignore
  const storeExams: Exam[] | undefined = useStore((s) => s.exams)
  // @ts-ignore
  const storeAddExam: ((e: Exam) => void) | undefined = useStore((s) => s.addExam)

  const [localExams, setLocalExams] = useState<Exam[]>([])
  const exams = storeExams ?? localExams
  const addExam = (e: Exam) => (storeAddExam ? storeAddExam(e) : setLocalExams((prev) => [e, ...prev]))

  const [tab, setTab] = useState<'add' | 'view'>(exams.length ? 'view' : 'add')

  const [specMode, setSpecMode] = useState<'pdf' | 'text' | null>(null)
  const [specText, setSpecText] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  // simple progress heuristic (confidence + started)
  const computeProgress = (e: Partial<Exam>) => {
    const c = Number(e.confidence ?? 1)
    const started = e.started === 'yes' ? 1 : e.started === 'partly' ? 0.5 : 0
    const base = ((c - 1) / 4) * 70 + started * 30 // 0–100
    return Math.round(Math.max(0, Math.min(100, base)))
  }

  const onAdd: React.FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    const subject = String(fd.get('subject') || '')
    const name = String(fd.get('name') || '')
    const examDate = String(fd.get('examDate') || '')
    const startRevise = String(fd.get('startRevise') || '')
    const finishRevise = String(fd.get('finishRevise') || '')
    const toughTopics = String(fd.get('toughTopics') || '')
    const confidence = Number(fd.get('confidence') || 1) as 1 | 2 | 3 | 4 | 5
    const started = String(fd.get('started') || 'no') as 'yes' | 'partly' | 'no'
    const file = (fileRef.current?.files && fileRef.current.files[0]) || null

    const specType = specMode ?? (file ? 'pdf' : specText.trim() ? 'text' : undefined)

    const exam: Exam = {
      id: `${Date.now()}`,
      subject: subject || undefined,
      name,
      examDateISO: examDate ? new Date(examDate).toISOString() : new Date().toISOString(),
      startReviseISO: startRevise ? new Date(startRevise).toISOString() : undefined,
      finishReviseISO: finishRevise ? new Date(finishRevise).toISOString() : undefined,
      toughTopics: toughTopics || undefined,
      confidence,
      started,
      specType,
      specText: specType === 'text' ? specText : undefined,
      specFileName: specType === 'pdf' && file ? file.name : undefined,
      progress: computeProgress({ confidence, started }),
    }

    addExam(exam)
    setTab('view')
    ev.currentTarget.reset()
    setSpecMode(null)
    setSpecText('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <section className="loggedIn-bg min-h-[130vh] w-full pt-32 md:pt-40 lg:pt-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-[#CCD8E1]/50 bg-[#CCD8E1]/50 p-6 shadow-xl backdrop-blur-md">
          {/* local tabs */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setTab('add')}
              type="button"
              className={`nav-pill ${tab === 'add' ? 'bg-white font-bold text-slate-900 shadow-sm' : ''}`}
            >
              Add new exam
            </button>
            <button
              onClick={() => setTab('view')}
              type="button"
              className={`nav-pill ${tab === 'view' ? 'bg-white font-bold text-slate-900 shadow-sm' : ''}`}
            >
              View exams
            </button>
          </div>

          {tab === 'add' ? (
            <form onSubmit={onAdd} className="space-y-6">
              {/* spec row */}
              <div className="flex flex-wrap items-center gap-4">
                <p className="font-semibold text-slate-900">Enter your exam specifications:</p>
                <div className="flex gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0F205A] px-3 py-2 text-sm font-semibold text-white hover:opacity-95">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={() => setSpecMode('pdf')}
                    />
                    <span>Select PDF file</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSpecMode('text')}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    Enter Text
                  </button>
                </div>
              </div>

              {/* subject & date */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">Subject</label>
                  <input
                    name="subject"
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner placeholder:text-slate-400"
                    placeholder="e.g., Algorithms"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800">Exam date</label>
                  <input
                    name="examDate"
                    type="date"
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
              </div>

              {/* exam name */}
              <div>
                <label className="block text-sm font-semibold text-slate-800">Exam Name</label>
                <input
                  name="name"
                  className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                  placeholder="e.g., Algorithms Final Paper"
                />
              </div>

              {/* confidence slider */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  How confident are you in this subject so far?
                </label>
                <input name="confidence" defaultValue={1} type="range" min={1} max={5} className="w-full" />
                <div className="flex justify-between text-xs text-slate-600">
                  <span>
                    <span className="font-semibold">1</span> Not confident
                  </span>
                  <span>
                    <span className="font-semibold">5</span> Very confident
                  </span>
                </div>
              </div>

              {/* started revising? */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">Have you started revising yet?</label>
                <div className="flex gap-3">
                  {[
                    { label: 'Yes', value: 'yes' },
                    { label: 'Partly', value: 'partly' },
                    { label: 'No', value: 'no' },
                  ].map((o) => (
                    <label key={o.value} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="started"
                        value={o.value}
                        defaultChecked={o.value === 'no'}
                        className="peer hidden"
                      />
                      <span className="inline-flex select-none items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-[#CCD8E1]/70 peer-checked:bg-[#0F205A] peer-checked:text-white peer-checked:ring-[#0F205A]">
                        {o.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* tough topics */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    Which topics do you find most challenging or need more focus on?
                  </label>
                  <input
                    name="toughTopics"
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                    placeholder="e.g., Dynamic Programming, Graph Traversal…"
                  />
                </div>
              </div>

              {/* dates for revision */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    When would you like to start revising?
                  </label>
                  <input
                    name="startRevise"
                    type="date"
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    How many days before the exam would you like to finish your main revision?
                  </label>
                  <input
                    name="finishRevise"
                    type="date"
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
              </div>

              {/* spec text (optional) */}
              {specMode === 'text' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-800">Exam Specification (text)</label>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                    rows={4}
                    value={specText}
                    onChange={(e) => setSpecText(e.target.value)}
                    placeholder="Paste or type details here…"
                  />
                </div>
              )}

              {/* submit */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-[#0F205A] px-8 py-3 text-white shadow hover:opacity-95"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div />
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-[#CCD8E1]/70">
                  Filter
                </button>
              </div>

              <div className="space-y-4">
                {exams.length === 0 ? (
                  <p className="text-center text-slate-700">No exams yet. Add your first one.</p>
                ) : (
                  exams.map((e) => <ExamCard key={e.id} e={e} />)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ExamCard({ e }: { e: Exam }) {
  const examDate = useMemo(() => new Date(e.examDateISO), [e.examDateISO])
  const examDateStr = useMemo(
    () =>
      examDate.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    [examDate]
  )

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 p-6 shadow ring-1 ring-white/60">
      <div className="flex min-w-0 items-start gap-4">
        {e.subject && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
            {e.subject}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm text-slate-800">
            <span className="font-semibold">Date:</span> {examDateStr}
          </p>
          <h3 className="truncate text-lg font-semibold text-slate-900">{e.name}</h3>
        </div>
      </div>
      <ProgressRing value={e.progress ?? 0} />
    </div>
  )
}
