'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useStore } from '@/lib/store/useStore'
import type { Assignment } from '@/lib/types'
import ProgressRing from '@/components/ProgressRing'

export default function AssignmentsPage() {
  const assignments = useStore((s) => s.assignments)
  const addAssignment = useStore((s) => s.addAssignment)

  const [tab, setTab] = useState<'add' | 'view'>(() =>
    assignments.length ? 'view' : 'add'
  )

  // read query param on client after mount to avoid CSR-bailout warning
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const sp = new URLSearchParams(window.location.search)
      if (sp.get('tab') === 'add') setTab('add')
    } catch (e) {
      // ignore
    }
  }, [])

  const [specMode, setSpecMode] = useState<'pdf' | 'text' | null>(null)
  const [specText, setSpecText] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const computeProgress = (a: Partial<Assignment>) => {
    const u = Number(a.understanding ?? 1)
    const c = Number(a.confidence ?? 1)
    const started =
      (a as any).started === 'yes'
        ? 1
        : (a as any).started === 'partly'
        ? 0.5
        : 0
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

    // NEW: group/individual
    const workType = String(fd.get('workType') || 'individual') as
      | 'group'
      | 'individual'

    const file = (fileRef.current?.files && fileRef.current.files[0]) || null
    const specType =
      specMode ?? (file ? 'pdf' : specText.trim() ? 'text' : undefined)

    const a = {
      id: `${Date.now()}`,
      title,
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
      estimatedHours: 6,
      understanding,
      confidence,
      started,

      notes: String(fd.get('notes') || '') || undefined,
      specType,
      specText: specType === 'text' ? specText : undefined,
      specFileName: specType === 'pdf' && file ? file.name : undefined,
      progress: computeProgress({ understanding, confidence, started }),
      workType,
    } as any as Assignment

    addAssignment(a)
    setTab('view')
    e.currentTarget.reset()
    setSpecMode(null)
    setSpecText('')
    if (fileRef.current) fileRef.current.value = ''
    setFileName(null)
  }

  return (
    <section className="loggedIn-bg min-h-[130vh] w-full pt-32 md:pt-40 lg:pt-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-[#CCD8E1]/50 bg-[#CCD8E1]/50 p-6 shadow-xl backdrop-blur-md">
          {/* Local tabs inside the panel */}
          <div className="mb-8 flex items-center justify-center gap-3">
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
              {/* spec row */}
              <div className="flex flex-wrap items-center gap-4">
                <p className="font-semibold text-slate-900">
                  Enter your assignment specifications:
                </p>
                <div className="flex items-center gap-3">
                  <label
                    onClick={() => setSpecMode('pdf')}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-[#CCD8E1]/70 ${
                      specMode === 'pdf'
                        ? 'bg-[#0F205A] text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(ev) => {
                        const f =
                          ev.currentTarget.files && ev.currentTarget.files[0]
                        if (f) setFileName(f.name)
                        setSpecMode('pdf')
                      }}
                    />
                    <span>Select PDF file</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setSpecMode('text')}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-[#CCD8E1]/70 ${
                      specMode === 'text'
                        ? 'bg-[#0F205A] text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Enter Text
                  </button>

                  {fileName && (
                    <span className="ml-1 text-sm text-slate-700">
                      {fileName}
                    </span>
                  )}
                </div>
              </div>

              {/* subject & date */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Subject
                  </label>
                  <input
                    name="subject"
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner placeholder:text-slate-400"
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
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
              </div>

              {/* name */}
              <div>
                <label className="block text-sm font-semibold text-slate-800">
                  Assignment Name
                </label>
                <input
                  name="title"
                  className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                  placeholder="Give this assignment a name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Is this an individual assignment or group assignment?
                </label>
                <div className="flex gap-3">
                  {[
                    { label: 'Individual', value: 'individual' },
                    { label: 'Group', value: 'group' },
                  ].map((o) => (
                    <label key={o.value} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="workType"
                        value={o.value}
                        defaultChecked={o.value === 'individual'}
                        className="peer hidden"
                      />
                      <span className="inline-flex select-none items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-[#CCD8E1]/70 peer-checked:bg-[#0F205A] peer-checked:text-white peer-checked:ring-[#0F205A]">
                        {o.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {/* understanding */}
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

              {/* confidence */}
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

              {/* started? */}
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
                      <span className="inline-flex select-none items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-[#CCD8E1]/70 peer-checked:bg-[#0F205A] peer-checked:text-white peer-checked:ring-[#0F205A]">
                        {o.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* dates */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    When would you ideally like to start working on this?
                  </label>
                  <input
                    name="idealStartDate"
                    type="date"
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    When would you feel comfortable having this done by?
                  </label>
                  <input
                    name="comfortableDueDate"
                    type="date"
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                  />
                </div>
              </div>

              {/* spec text if chosen */}
              {specMode === 'text' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Assignment Specification (text)
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                    rows={4}
                    value={specText}
                    onChange={(e) => setSpecText(e.target.value)}
                    placeholder="Paste or type details here..."
                  />
                </div>
              )}

              {/* notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-800">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="mt-2 w-full rounded-xl border border-[#CCD8E1]/70 bg-white/80 px-3 py-2 shadow-inner"
                />
              </div>

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
  const dueStr = useMemo(() => {
    const dd = String(due.getDate()).padStart(2, '0')
    const mm = String(due.getMonth() + 1).padStart(2, '0')
    const yyyy = due.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }, [due])

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
      <ProgressRing value={(a as any).progress ?? 0} />
    </div>
  )
}
