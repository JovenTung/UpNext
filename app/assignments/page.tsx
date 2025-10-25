'use client'

import { useMemo, useRef, useState } from 'react'
import { useStore } from '@/lib/store/useStore'
import type { Assignment } from '@/lib/types'
import ProgressRing from '@/components/ProgressRing'

export default function AssignmentsPage() {
  const assignments = useStore((s) => s.assignments)
  const addAssignment = useStore((s) => s.addAssignment)

  const [tab, setTab] = useState<'add' | 'view'>(
    assignments.length ? 'view' : 'add'
  )

  const [specMode, setSpecMode] = useState<'pdf' | 'text' | null>(null)
  const [specText, setSpecText] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  // simple progress heuristic combining started + understanding + confidence
  const computeProgress = (a: Partial<Assignment>) => {
    const u = Number(a.understanding ?? 1)
    const c = Number(a.confidence ?? 1)
    const started = a.started === 'yes' ? 1 : a.started === 'partly' ? 0.5 : 0
    const base = ((u - 1) / 4) * 40 + ((c - 1) / 4) * 40 + started * 20
    return Math.round(Math.max(0, Math.min(100, base)))
  }

  const onAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const subject = String(fd.get('subject') || '')
    const title = String(fd.get('title') || '')
    const dueDate = String(fd.get('dueDate') || '')
    const idealStartDate = String(fd.get('idealStartDate') || '')
    const comfortableDueDate = String(fd.get('comfortableDueDate') || '')
    const understanding = Number(fd.get('understanding') || 1) as
      | 1
      | 2
      | 3
      | 4
      | 5
    const confidence = Number(fd.get('confidence') || 1) as 1 | 2 | 3 | 4 | 5
    const started = String(fd.get('started') || 'no') as 'yes' | 'partly' | 'no'
    const course = String(fd.get('course') || '')
    const file = (fileRef.current?.files && fileRef.current.files[0]) || null

    const specType =
      specMode ?? (file ? 'pdf' : specText.trim() ? 'text' : undefined)

    const a: Assignment = {
      id: `${Date.now()}`,
      title,
      course: course || undefined,
      subject: subject || undefined,
      dueDate: dueDate
        ? new Date(dueDate).toISOString()
        : new Date().toISOString(),
      idealStartDate: idealStartDate
        ? new Date(idealStartDate).toISOString()
        : undefined,
      comfortableDueDate: comfortableDueDate
        ? new Date(comfortableDueDate).toISOString()
        : undefined,
      estimatedHours: Number(fd.get('estimatedHours') || 6),
      understanding,
      confidence,
      started,
      notes: String(fd.get('notes') || '') || undefined,
      specType,
      specText: specType === 'text' ? specText : undefined,
      specFileName: specType === 'pdf' && file ? file.name : undefined,
      progress: computeProgress({ understanding, confidence, started }),
    }

    addAssignment(a)
    setTab('view')
    e.currentTarget.reset()
    setSpecMode(null)
    setSpecText('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <section className="landing-animated min-h-[100vh] w-full py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Tabs were moved inside the content panel to avoid overlap with the navbar */}

        <div className="rounded-3xl border border-white/30 bg-white/60 p-6 shadow-xl backdrop-blur-md md:p-10">
          {/* Local tabs inside the panel */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setTab('add')}
              type="button"
              className={`nav-pill ${
                tab === 'add'
                  ? 'bg-white font-bold text-slate-900 shadow-sm'
                  : ''
              }`}
            >
              Add new assignment
            </button>
            <button
              onClick={() => setTab('view')}
              type="button"
              className={`nav-pill ${
                tab === 'view'
                  ? 'bg-white font-bold text-slate-900 shadow-sm'
                  : ''
              }`}
            >
              View assignments
            </button>
          </div>
          {tab === 'add' ? (
            <form onSubmit={onAdd} className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-slate-900 font-semibold">
                  Enter your assignment specifications:
                </p>
                <div className="flex gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Subject
                  </label>
                  <input
                    name="subject"
                    className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner placeholder:text-slate-400"
                    placeholder="e.g., Data Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Due date
                  </label>
                  <input
                    name="dueDate"
                    type="date"
                    className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800">
                  Assignment Name
                </label>
                <input
                  name="title"
                  className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner"
                  placeholder="Give this assignment a name"
                />
              </div>

              {/* Understanding slider */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  How well do you understand this assignment so far?
                </label>
                <input
                  name="understanding"
                  defaultValue={1}
                  type="range"
                  min={1}
                  max={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-600">
                  <span>
                    <span className="font-semibold">1</span> Not at all
                  </span>
                  <span>
                    <span className="font-semibold">5</span> Very well
                  </span>
                </div>
              </div>

              {/* Confidence slider */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  How confident are you in this topic area?
                </label>
                <input
                  name="confidence"
                  defaultValue={1}
                  type="range"
                  min={1}
                  max={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-600">
                  <span>
                    <span className="font-semibold">1</span> Not confident
                  </span>
                  <span>
                    <span className="font-semibold">5</span> Very confident
                  </span>
                </div>
              </div>

              {/* Started? */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Have you started researching or brainstorming yet?
                </label>
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
                      <span className="peer-checked:bg-slate-900 peer-checked:text-white inline-flex cursor-pointer select-none items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
                        {o.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    When would you ideally like to start working on this?
                  </label>
                  <input
                    name="idealStartDate"
                    type="date"
                    className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    When would you feel comfortable having this done by?
                  </label>
                  <input
                    name="comfortableDueDate"
                    type="date"
                    className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
              </div>

              {/* Spec text if chosen */}
              {specMode === 'text' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Assignment Specification (text)
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner"
                    rows={4}
                    value={specText}
                    onChange={(e) => setSpecText(e.target.value)}
                    placeholder="Paste or type details here..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Estimated hours
                  </label>
                  <input
                    name="estimatedHours"
                    type="number"
                    step="0.5"
                    defaultValue={6}
                    className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Course (optional)
                  </label>
                  <input
                    name="course"
                    className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-8 py-3 text-white shadow hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div />
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
                  Filter
                </button>
              </div>
              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <p className="text-center text-slate-600">
                    No assignments yet. Add your first one.
                  </p>
                ) : (
                  assignments
                    .slice()
                    .reverse()
                    .map((a) => <AssignmentCard key={a.id} a={a} />)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function AssignmentCard({ a }: { a: Assignment }) {
  const due = useMemo(() => new Date(a.dueDate), [a.dueDate])
  const dueStr = useMemo(
    () =>
      due.toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [due]
  )

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 p-6 shadow ring-1 ring-white/60">
      <div className="flex min-w-0 items-start gap-4">
        {a.subject && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            {a.subject}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm text-slate-800">
            <span className="font-semibold">Due:</span> {dueStr}
          </p>
          <h3 className="truncate text-lg font-semibold text-slate-900">
            {a.title}
          </h3>
        </div>
      </div>
      <ProgressRing value={a.progress ?? 0} />
    </div>
  )
}
