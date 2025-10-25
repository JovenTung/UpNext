'use client'

import { useState, useId } from 'react'
import { useStore } from '@/lib/store/useStore'

type Choice = { id: string; label: string }
function PillGroup({
  label,
  choices,
  value,
  onChange,
  multiple = false,
}: {
  label: string
  choices: Choice[]
  value: string[] | string
  onChange: (val: string[] | string) => void
  multiple?: boolean
}) {
  const isActive = (id: string) =>
    Array.isArray(value) ? value.includes(id) : value === id

  const toggle = (id: string) => {
    if (multiple) {
      const current = new Set(Array.isArray(value) ? value : [])
      current.has(id) ? current.delete(id) : current.add(id)
      onChange(Array.from(current))
    } else {
      onChange(id)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(c.id)}
            className={[
              'rounded-full px-4 py-2 text-sm transition',
              'ring-1 ring-[#CCD8E1]/50 shadow-sm',
              'hover:-translate-y-[1px] hover:shadow',
              isActive(c.id)
                ? 'bg-[#0F205A] text-white ring-[#0F205A]'
                : 'bg-white/80 text-slate-800 backdrop-blur',
              'focus:outline-none focus:ring-2 focus:ring-[#0F205A]/40',
            ].join(' ')}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

type Subject = { id: string; name: string; color: string }
const COLOR_SWATCHES = ['#E57373', '#64B5F6', '#81C784', '#E5A345', '#9575CD']

function SubjectsPanel() {
  const gen = useId()
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: gen + '-1', name: 'Data Science', color: '#E57373' },
    { id: gen + '-2', name: 'Algorithms & Analysis', color: '#81C784' },
    { id: gen + '-3', name: 'Usability Engineering', color: '#E5A345'},
  ])
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_SWATCHES[1])

  const add = () => {
    const n = name.trim()
    if (!n) return
    setSubjects((s) => [...s, { id: crypto.randomUUID(), name: n, color }])
    setName('')
  }
  const remove = (id: string) => setSubjects((s) => s.filter((x) => x.id !== id))

  return (
    <div className="space-y-6 p-6">
      <p className="text-sm text-slate-600">Subjects currently enrolled in:</p>

      <div className="space-y-3">
        {subjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-center text-sm text-slate-500">
            No subjects yet. Add your first one below 👇
          </div>
        ) : (
          subjects.map((s) => (
            <div
              key={s.id}
              className="group flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-slate-200 shadow-sm transition hover:-translate-y-[1px] hover:shadow"
              style={{ boxShadow: `inset 0 0 0 9999px ${s.color}20` }}
            >
              <div className="flex items-center gap-3">
                <span className="inline-block h-3.5 w-3.5 rounded-full ring-2 ring-white" style={{ background: s.color }} />
                <span className="text-base font-semibold text-slate-800">{s.name}</span>
              </div>
              <button
                onClick={() => remove(s.id)}
                className="h-8 w-8 rounded-full bg-white/80 text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-800"
                title="Remove"
              >
                —
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Enter subject name…"
          className="flex-1 rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full ring-2 ring-white transition focus:ring-4 focus:ring-indigo-200"
              style={{
                background: c,
                boxShadow: color === c ? `0 0 0 2px ${c}66, 0 0 0 4px #fff` : undefined,
              }}
              aria-label={`choose ${c}`}
            />
          ))}
        </div>
        <button
          onClick={add}
          className="rounded-2xl bg-[#0F205A] px-5 py-3 text-sm font-medium text-white shadow hover:bg-indigo-500"
        >
          Add subject
        </button>
      </div>
    </div>
  )
}

/* Profile form */
function ProfileForm() {
  const [taskStyle, setTaskStyle] = useState<string>('break')
  const [sessionStyle, setSessionStyle] = useState<string>('short')
  const [focusTime, setFocusTime] = useState<string[]>(['morning'])
  const [stress, setStress] = useState<number>(3)
  const [goal, setGoal] = useState<string>('Keep stress low.')

  return (
    <div className="space-y-8 p-6">
      <p className="text-sm text-slate-600">
        Feel free to change your answers anytime. The more accurate your preferences,
        the better your AI study planner can adapt to you.
      </p>

      <PillGroup
        label="How do you usually approach big tasks?"
        value={taskStyle}
        onChange={(v) => setTaskStyle(v as string)}
        choices={[
          { id: 'break', label: 'Break into smaller parts' },
          { id: 'all', label: 'Do it all at once' },
          { id: 'mix', label: 'Mix of both' },
        ]}
      />

      <PillGroup
        label="Do you prefer shorter frequent sessions or longer focused blocks?"
        value={sessionStyle}
        onChange={(v) => setSessionStyle(v as string)}
        choices={[
          { id: 'short', label: 'Shorter frequent sessions' },
          { id: 'long', label: 'Longer focused blocks' },
        ]}
      />

      <PillGroup
        label="When are you usually most focused?"
        multiple
        value={focusTime}
        onChange={(v) => setFocusTime(v as string[])}
        choices={[
          { id: 'morning', label: 'Morning' },
          { id: 'afternoon', label: 'Afternoon' },
          { id: 'night', label: 'Night' },
        ]}
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-800">
          How stressed do you feel about your studies right now?
        </p>
        <div className="flex items-center gap-4">
          <span className="w-12 text-xs text-slate-500">Low</span>
          <input
            type="range"
            min={1}
            max={5}
            value={stress}
            onChange={(e) => setStress(parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <span className="w-12 text-right text-xs text-slate-500">High</span>
        </div>
        <p className="text-xs text-slate-500">Current: {stress} / 5</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-800">What’s your main goal this semester?</p>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={2}
          className="w-full resize-y rounded-2xl border border-slate-300 bg-white/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
        />
      </div>
    </div>
  )
}

/* Page wrapper with tabs */
export default function ProfilePage() {
  const clearAll = useStore((s) => s.clearAll)
  const setUser = useStore((s) => s.setUser)
  const [activeTab, setActiveTab] = useState<'profile' | 'subjects'>('profile')

  return (
    <section className="min-h-[90vh] loggedIn-bg pt-28">
      <div className="mx-auto max-w-6xl gap-6 px-4 py-10 md:grid md:grid-cols-12">
        {/* Sidebar */}
        <aside className="mb-6 md:col-span-4 md:mb-0">
          <div className="rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-200 to-fuchsia-200 text-indigo-700 ring-1 ring-slate-200">
                <span className="text-base font-bold">EC</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Evelyn</p>
                <p className="text-sm text-slate-600">s4160608@student.rmit.edu.au</p>
                <p className="text-sm text-slate-600">Master of Information Technology</p>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <p className="text-sm font-medium text-slate-800">Settings</p>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Theme</li>
                <li>Policy</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-[#0F205A] px-4 py-2 text-sm text-white shadow hover:opacity-95"
                onClick={() => setUser(null)}
              >
                Log Out
              </button>
              <button
                className="rounded-full bg-white px-4 py-2 text-sm text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50"
                onClick={() => clearAll()}
              >
                Reset demo data
              </button>
            </div>
          </div>
        </aside>

        {/* Main card with tabs */}
        <main className="md:col-span-8">
        <div className="rounded-3xl bg-[#CCD8E1]/50 shadow-xl backdrop-blur-2xl">

            {/* Tabs header */}
            <div className="flex items-center gap-2 rounded-t-3xl border-b border-[#CCD8E1]/50 bg-white/60 px-6 py-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={
                  activeTab === 'profile'
                    ? 'rounded-full bg-[#0F205A] px-4 py-1.5 text-sm font-medium text-white'
                    : 'rounded-full bg-white px-4 py-1.5 text-sm text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
                }
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={
                  activeTab === 'subjects'
                    ? 'rounded-full bg-[#0F205A] px-4 py-1.5 text-sm font-medium text-white'
                    : 'rounded-full bg-white px-4 py-1.5 text-sm text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
                }
              >
                Subjects
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'profile' ? <ProfileForm /> : <SubjectsPanel />}

            {/* Sticky footer actions (only for profile form) */}
            {activeTab === 'profile' && (
              <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-b-3xl border-t border-[#CCD8E1]/50 bg-white/80 px-6 py-4 backdrop-blur">
                <button className="rounded-full bg-white px-4 py-2 text-sm text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">
                  Cancel
                </button>
                <button className="rounded-full bg-[#0F205A] px-5 py-2 text-sm font-medium text-white shadow hover:bg-[#0F205A]">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  )
}
