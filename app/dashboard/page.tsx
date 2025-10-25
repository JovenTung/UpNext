'use client'
import { useStore } from '@/lib/store/useStore'
import React, { useMemo, useState } from 'react'

// Deterministic date formatter to avoid server/client locale mismatches
const formatDateDDMMYYYY = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

type SubjectKey = 'data-science' | 'algorithms' | 'usability'
type TaskType = 'focus' | 'blocked' | 'rest'

type RepeatRule =
  | { kind: 'none' }
  | { kind: 'daily'; interval?: number; endAt?: string }
  | { kind: 'weekly'; interval?: number; byWeekday?: number[]; endAt?: string } // 0=Sun..6=Sat
  | { kind: 'monthly'; interval?: number; endAt?: string }

interface Task {
  id: string
  title: string
  type: TaskType
  subject?: SubjectKey
  color: string
  start: string // ISO datetime
  end: string // ISO datetime
  repeat: RepeatRule
  isDone?: boolean
  isAiBreak?: boolean
  assignmentId?: string   // ← NEW: link a task to an assignment
}


// Default export for the /dashboard route
export default function Page() {
  return <LoggedInHome />
}

interface AssignmentSummary {
  id: string
  subject: SubjectKey
  subjectLabel: string
  dueDate: string // ISO date
  title: string
  progress: number // 0..100
}

// Subject palette
const SUBJECTS: Record<
  SubjectKey,
  { label: string; color: string; badgeBg: string }
> = {
  'data-science': {
    label: 'Data Science',
    color: '#DC4453',
    badgeBg: 'bg-[#DC4453] text-white',
  },
  algorithms: {
    label: 'Algorithms',
    color: '#5EADA9',
    badgeBg: 'bg-[#5EADA9] text-white',
  },
  usability: {
    label: 'Usability Engineering',
    color: '#E5A345',
    badgeBg: 'bg-[#E5A345] text-white',
  },
}

const COMMIT_COLOR = '#000000'
const REST_COLOR = '#0F205A'

// ---------- utils ----------
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
const addDays = (date: Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const fmtHM = (date: Date) => {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const formatLongDate = (d: Date) =>
  `${WEEKDAY_LONG[d.getDay()]}, ${
    MONTH_SHORT[d.getMonth()]
  } ${d.getDate()}, ${d.getFullYear()}`
const formatMonthYear = (d: Date) =>
  `${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`
const formatMonthDay = (d: Date) =>
  `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`
const formatMonthDayYear = (d: Date) =>
  `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
const toISO = (date: Date) => date.toISOString()
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n))

// Expand repeating tasks into instances within a window
function expandTaskInstances(
  task: Task,
  windowStart: Date,
  windowEnd: Date
): Task[] {
  const out: Task[] = []
  const firstStart = new Date(task.start)
  const firstEnd = new Date(task.end)

  if (task.repeat.kind === 'none') {
    if (firstEnd >= windowStart && firstStart <= windowEnd) out.push(task)
    return out
  }

  let currentStart = new Date(task.start)
  let currentEnd = new Date(task.end)
  const limit = 400

  // figure out the repetition cutoff
  const rule: any = task.repeat
  const hardEnd: Date | null = rule?.endAt ? new Date(rule.endAt) : null
  const effectiveWindowEnd = hardEnd
    ? new Date(Math.min(+hardEnd, +windowEnd))
    : windowEnd

  for (let i = 0; i < limit && currentStart <= effectiveWindowEnd; i++) {
    if (currentEnd >= windowStart) {
      out.push({ ...task, start: toISO(currentStart), end: toISO(currentEnd) })
    }

    const interval = rule?.interval ?? 1
    if (task.repeat.kind === 'daily') {
      currentStart = addDays(currentStart, interval)
      currentEnd = addDays(currentEnd, interval)
    } else if (task.repeat.kind === 'weekly') {
      currentStart = addDays(currentStart, 7 * interval)
      currentEnd = addDays(currentEnd, 7 * interval)
    } else if (task.repeat.kind === 'monthly') {
      currentStart = new Date(
        currentStart.getFullYear(),
        currentStart.getMonth() + interval,
        currentStart.getDate(),
        currentStart.getHours(),
        currentStart.getMinutes()
      )
      currentEnd = new Date(
        currentEnd.getFullYear(),
        currentEnd.getMonth() + interval,
        currentEnd.getDate(),
        currentEnd.getHours(),
        currentEnd.getMinutes()
      )
    }
  }
  return out
}

// ===========================
// Logged-in Home
// ===========================
function LoggedInHome() {
  const name = useStore((s) => s.user?.name ?? 'User')

  // Mock assignments
  const assignments: AssignmentSummary[] = [
    {
      id: 'a1',
      subject: 'data-science',
      subjectLabel: SUBJECTS['data-science'].label,
      dueDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 2
      ).toISOString(),
      title: 'Practical Data Science with Python Assignment 3',
      progress: 60,
    },
    {
      id: 'a2',
      subject: 'algorithms',
      subjectLabel: SUBJECTS['algorithms'].label,
      dueDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 10
      ).toISOString(),
      title: 'Algorithms Final Paper',
      progress: 0,
    },
    {
      id: 'a3',
      subject: 'usability',
      subjectLabel: SUBJECTS['usability'].label,
      dueDate: new Date(2025, 10, 7).toISOString(),
      title: 'Assignment B3',
      progress: 0,
    },
  ]

  const dueMap = useMemo(() => {
    const m = new Map<string, AssignmentSummary[]>()
    for (const a of assignments) {
      const d = new Date(a.dueDate)
      const key = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate()
      ).toISOString()
      const arr = m.get(key) ?? []
      arr.push(a)
      m.set(key, arr)
    }
    return m
  }, [assignments])

  // Mock tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    // 26 Oct 2025 — local times
    const d = (h: number, m = 0) => new Date(2025, 9, 26, h, m) // month is 0-based (9 = October)

    return [
      {
        id: 't_algorithms_focus',
        title: 'Study Greedy Algorithms',
        type: 'focus', // was "study"
        subject: 'algorithms',
        color: SUBJECTS['algorithms'].color,
        start: d(10, 0).toISOString(),
        end: d(12, 0).toISOString(),
        repeat: { kind: 'none' },
      },
      {
        id: 't_ds_focus',
        title: 'Finalise report — Data Science Assignment 3',
        type: 'focus', // was "assignment"
        subject: 'data-science',
        color: SUBJECTS['data-science'].color,
        start: d(14, 0).toISOString(),
        end: d(16, 0).toISOString(),
        repeat: { kind: 'none' },
      },
      {
        id: 't_rest_1',
        title: 'Rest',
        type: 'rest', // was "break"
        color: REST_COLOR,
        start: d(16, 0).toISOString(),
        end: d(18, 0).toISOString(),
        repeat: { kind: 'none' },
        isAiBreak: true,
      },
      {
        id: 't_commit_pick',
        title: 'Pickleball',
        type: 'blocked', // was "unavailable"
        color: COMMIT_COLOR,
        start: d(18, 0).toISOString(),
        end: d(20, 0).toISOString(),
        repeat: { kind: 'none' },
      },
    ]
  })

  const [showBreaks, setShowBreaks] = useState(true)

  const upsertTask = (t: Task) => {
    setTasks((prev) => {
      const i = prev.findIndex((p) => p.id === t.id)
      if (i === -1) return [...prev, t]
      const copy = [...prev]
      copy[i] = t
      return copy
    })
  }

  const removeTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id))

  return (
    <section className="loggedIn-bg md:pt-20 lg:pt-18">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl">
          Welcome back <span className="font-extrabold">{name}</span>, ready to
          make progress today?
        </h1>

        {/* Upcoming Assignments Card */}
        <div className="mt-6 rounded-2xl bg-[#CCD8E180] p-4 shadow-sm md:p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-center text-lg font-bold md:text-xl">
              Upcoming Assignments
            </h2>
          </div>

          <div
            className="space-y-3 md:h-[11.5rem] overflow-y-auto pr-1 overscroll-contain"
            role="list"
          >
            {assignments.map((a) => (
              <AssignmentRow key={a.id} a={a} />
            ))}
          </div>
        </div>

        {/* Calendar Section */}
<div className="mt-6 rounded-2xl bg-[#CCD8E180] p-4 shadow-sm md:p-6">
  <div className="mb-2 flex items-center justify-between">
    <h2 className="text-lg font-bold md:text-xl">Schedule</h2>
  </div>

  <CalendarCard
    tasks={tasks}
    showBreaks={showBreaks}
    onToggleBreaks={() => setShowBreaks((s) => !s)}
    onUpsertTask={upsertTask}
    onRemoveTask={removeTask}
    dueMap={dueMap}
    assignments={assignments}   // ← NEW
  />
</div>

      </div>
    </section>
  )
}

// ---------- Upcoming assignment row + progress ring ----------
function AssignmentRow({ a }: { a: AssignmentSummary }) {
  const subject = SUBJECTS[a.subject]
  const due = new Date(a.dueDate)

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#E0E0E0A3] p-3">
      <span
        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${subject.badgeBg}`}
      >
        {subject.label}
      </span>
      <div className="min-w-24 text-sm font-bold text-slate-600">
        Due: {formatDateDDMMYYYY(due)}
      </div>
      <div className="flex-1 text-sm text-slate-700">{a.title}</div>
      <div className="relative h-12 w-12">
        <ProgressRing value={clamp(a.progress)} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
          {Math.round(clamp(a.progress))}%
        </div>
      </div>
    </div>
  )
}

function ProgressRing({
  value,
  color = '#0F205A',
  track = '#E5E7EB',
}: {
  value: number
  color?: string
  track?: string
}) {
  const size = 48
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const p = Math.max(0, Math.min(100, Number(value) || 0))
  const dashOffset = circumference * (1 - p / 100)

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={track}
        strokeWidth={stroke}
        fill="none"
      />

      {/* Progress arc */}
      {p > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

// =============== Calendar ===============
type ViewMode = 'month' | 'week' | 'day'

function CalendarCard({
  tasks,
  showBreaks,
  onToggleBreaks,
  onUpsertTask,
  onRemoveTask,
  dueMap,
  assignments, // ← NEW
}: {
  tasks: Task[]
  showBreaks: boolean
  onToggleBreaks: () => void
  onUpsertTask: (t: Task) => void
  onRemoveTask: (id: string) => void
  dueMap: Map<string, AssignmentSummary[]>
  assignments: AssignmentSummary[] // ← NEW
}) {

  const [mode, setMode] = useState<ViewMode>('month')
  const [cursor, setCursor] = useState<Date>(startOfDay(new Date()))
  const [modalState, setModalState] = useState<{
    open: boolean
    editing?: Task | null
  }>({
    open: false,
  })

  const [dueModalItems, setDueModalItems] = useState<
    AssignmentSummary[] | null
  >(null)

  // View window
  const { windowStart, windowEnd, label } = useMemo(() => {
    const d = new Date(cursor)
    if (mode === 'day') {
      return {
        label: formatLongDate(d),
        windowStart: startOfDay(d),
        windowEnd: endOfDay(d),
      }
    }
    if (mode === 'week') {
      const day = d.getDay()
      const ws = startOfDay(addDays(d, -day))
      const we = endOfDay(addDays(ws, 6))
      const rangeLabel = `${formatMonthDay(ws)} – ${formatMonthDayYear(we)}`
      return { label: rangeLabel, windowStart: ws, windowEnd: we }
    }
    const ws = new Date(d.getFullYear(), d.getMonth(), 1)
    const we = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    return {
      label: formatMonthYear(d),
      windowStart: ws,
      windowEnd: we,
    }
  }, [cursor, mode])

  const expanded = useMemo(() => {
    const base = showBreaks ? tasks : tasks.filter((t) => t.type !== 'rest')
    let out: Task[] = []
    for (const t of base)
      out = out.concat(expandTaskInstances(t, windowStart, windowEnd))
    // respect weekly byWeekday
    out = out.filter((t) => {
      const src = tasks.find((s) => s.id === t.id)
      if (src?.repeat.kind === 'weekly' && src.repeat.byWeekday?.length) {
        const wd = new Date(t.start).getDay()
        return src.repeat.byWeekday.includes(wd)
      }
      return true
    })
    return out
  }, [tasks, windowStart, windowEnd, showBreaks])

  const onAdd = () => setModalState({ open: true, editing: null })

  return (
    <div className="mt-6 rounded-2xl bg-[#CCD8E180] p-4 shadow-sm md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tab active={mode === 'month'} onClick={() => setMode('month')}>
            Monthly
          </Tab>
          <Tab active={mode === 'week'} onClick={() => setMode('week')}>
            Weekly
          </Tab>
          <Tab active={mode === 'day'} onClick={() => setMode('day')}>
            Daily
          </Tab>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">AI-Recommended Rest</span>
            <button
              onClick={onToggleBreaks}
              className={`relative h-5 w-10 rounded-full border transition ${
                showBreaks ? 'bg-[#0F205A]' : 'bg-slate-200'
              }`}
              aria-label="Toggle AI breaks"
            >
              <span
                className={`absolute top-0.5 ${
                  showBreaks ? 'left-5' : 'left-0.5'
                } inline-block h-4 w-4 rounded-full bg-white transition`}
              />
            </button>
          </div>
          <button
            aria-label="Add"
            onClick={onAdd}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F205A] text-white font-bold leading-none"
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">{label}</div>
        <div className="flex gap-2">
          <button
            className="rounded-lg bg-[#E0E0E0A3] px-2 py-1 font-bold text-xs"
            onClick={() => setCursor(new Date())}
          >
            Today
          </button>
          <button
            className="rounded-lg bg-[#E0E0E0A3] px-2 py-1 font-bold text-lg"
            onClick={() =>
              setCursor((d) =>
                mode === 'day'
                  ? addDays(d, -1)
                  : mode === 'week'
                  ? addDays(d, -7)
                  : new Date(d.getFullYear(), d.getMonth() - 1, 1)
              )
            }
          >
            ‹
          </button>
          <button
            className="rounded-lg bg-[#E0E0E0A3] px-2 py-1 font-bold text-lg"
            onClick={() =>
              setCursor((d) =>
                mode === 'day'
                  ? addDays(d, 1)
                  : mode === 'week'
                  ? addDays(d, 7)
                  : new Date(d.getFullYear(), d.getMonth() + 1, 1)
              )
            }
          >
            ›
          </button>
        </div>
      </div>

      {mode === 'month' && (
        <MonthGrid
          date={cursor}
          tasks={expanded}
          onTaskClick={(t) => setModalState({ open: true, editing: t })}
          dueMap={dueMap}
          onDueClick={(items) => setDueModalItems(items)}
        />
      )}
      {mode === 'week' && (
        <WeekView
          date={cursor}
          tasks={expanded}
          onTaskClick={(t) => setModalState({ open: true, editing: t })}
          dueMap={dueMap}
          onDueClick={(items) => setDueModalItems(items)}
        />
      )}
      {mode === 'day' && (
        <DayView
          date={cursor}
          tasks={expanded}
          onTaskClick={(t) => setModalState({ open: true, editing: t })}
          dueMap={dueMap}
          onDueClick={(items) => setDueModalItems(items)}
        />
      )}

      {modalState.open && (
  <TaskModal
    initial={modalState.editing ?? undefined}
    onClose={() => setModalState({ open: false })}
    onSave={(t) => {
      onUpsertTask(t)
      setModalState({ open: false })
    }}
    onDelete={(id) => {
      onRemoveTask(id)
      setModalState({ open: false })
    }}
    assignments={assignments}  // ← NEW
  />
)}


      {/* ✅ New: show the DueModal when due labels are clicked */}
      {dueModalItems && (
        <DueModal
          items={dueModalItems}
          onClose={() => setDueModalItems(null)}
        />
      )}
    </div>
  )
}

function Tab({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs ${
        active ? 'bg-[#E0E0E0A3]' : 'text-slate-600'
      }`}
    >
      {children}
    </button>
  )
}

// ---------- Month grid ----------
function MonthGrid({
  date,
  tasks,
  onTaskClick,
  dueMap,
  onDueClick,
}: {
  date: Date
  tasks: Task[]
  onTaskClick: (t: Task) => void
  dueMap: Map<string, AssignmentSummary[]>
  onDueClick: (items: AssignmentSummary[]) => void
}) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const startCell = addDays(first, -first.getDay())
  const totalCells = 42 // 6 weeks

  const days: Date[] = Array.from({ length: totalCells }, (_, i) => addDays(startCell, i))
  const today = new Date()

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      const s = new Date(t.start)
      const key = new Date(s.getFullYear(), s.getMonth(), s.getDate()).toISOString()
      const arr = map.get(key) ?? []
      arr.push(t)
      map.set(key, arr)
    }
    return map
  }, [tasks])

  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
        <div key={d} className="px-1 text-center text-[11px] font-semibold text-slate-600">
          {d}
        </div>
      ))}

      {days.map((d, idx) => {
        const isCurrentMonth = d.getMonth() === date.getMonth()
        const isToday = sameDay(d, today)
        const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
        const dayEvents = eventsByDay.get(key) ?? []
        const dueItems = dueMap.get(key) ?? []

        return (
          <div
            key={idx}
            className={`min-h-24 rounded-xl bg-[#E0E0E0A3] p-2 ${
              isCurrentMonth ? '' : 'opacity-40'
            }`}
          >
            {/* Date number */}
            <div className="mb-1 flex items-center justify-between">
              <div
                className={`text-[11px] font-semibold ${
                  isToday
                    ? 'text-black font-extrabold bg-white/70 rounded-full px-2 py-0.5 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                {d.getDate()}
              </div>

              {/* Due pills */}
              <div className="flex flex-wrap items-center gap-1">
                {dueItems.slice(0, 2).map((it) => (
                  <button
                    key={it.id}
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: SUBJECTS[it.subject].color }}
                    onClick={() => onDueClick(dueItems)}
                    title={it.title}
                  >
                    {SUBJECTS[it.subject].label}
                  </button>
                ))}
                {dueItems.length > 2 && (
                  <button
                    className="rounded-full bg-slate-600 px-2 py-0.5 text-[10px] font-bold text-white"
                    onClick={() => onDueClick(dueItems)}
                    title={`${dueItems.length - 2} more`}
                  >
                    +{dueItems.length - 2}
                  </button>
                )}
              </div>
            </div>

            {/* Events */}
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((t) => (
                <button
                  key={`${t.id}-${t.start}`}
                  onClick={() => onTaskClick(t)}
                  className="block w-full truncate rounded-md px-2 py-1 text-left text-[11px] text-white"
                  style={{ backgroundColor: t.color }}
                  title={`${t.title} • ${fmtHM(new Date(t.start))}–${fmtHM(new Date(t.end))}`}
                >
                  {t.title}
                </button>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[10px] text-slate-500">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}


// ---------- Week + Day views ----------
function WeekView({
  date,
  tasks,
  onTaskClick,
  dueMap,
  onDueClick,
}: {
  date: Date
  tasks: Task[]
  onTaskClick: (t: Task) => void
  dueMap: Map<string, AssignmentSummary[]>
  onDueClick: (items: AssignmentSummary[]) => void
}) {
  const today = new Date()
  const day0 = addDays(startOfDay(date), -date.getDay())
  const days = Array.from({ length: 7 }, (_, i) => addDays(day0, i))

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, i) => {
        const isToday = sameDay(d, today)
        return (
          <div key={i} className="rounded-xl bg-[#E0E0E0A3] p-2">
            <div
              className={`mb-1 text-[11px] font-semibold ${
                isToday
                  ? 'text-black font-extrabold bg-white/70 rounded-full px-2 py-0.5 shadow-sm inline-block'
                  : 'text-slate-600'
              }`}
            >
              {WEEKDAY_SHORT[d.getDay()]} {d.getDate()}
            </div>

            <DayColumn
              date={d}
              tasks={tasks.filter((t) => sameDay(new Date(t.start), d))}
              onTaskClick={onTaskClick}
              dueMap={dueMap}
              onDueClick={onDueClick}
              showTimesInBlock={false}
              compactTitles
            />
          </div>
        )
      })}
    </div>
  )
}


function DayView({
  date,
  tasks,
  onTaskClick,
  dueMap,
  onDueClick,
}: {
  date: Date
  tasks: Task[]
  onTaskClick: (t: Task) => void
  dueMap: Map<string, AssignmentSummary[]>
  onDueClick: (items: AssignmentSummary[]) => void
}) {
  return (
    <div className="rounded-xl bg-[#E0E0E0A3] p-2">
      <DayColumn
        date={startOfDay(date)}
        tasks={tasks.filter((t) => sameDay(new Date(t.start), date))}
        onTaskClick={onTaskClick}
        dueMap={dueMap}
        onDueClick={onDueClick}
      />
    </div>
  )
}

function DueModal({
  items,
  onClose,
}: {
  items: AssignmentSummary[]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Due items</h3>
          <button
            className="rounded-full p-2 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          {items.map((a) => (
            <AssignmentRow key={a.id} a={a} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DayColumn({
  date,
  tasks,
  onTaskClick,
  dueMap,
  onDueClick,
  showTimesInBlock = true,
  compactTitles = false,
}: {
  date: Date
  tasks: Task[]
  onTaskClick: (t: Task) => void
  dueMap: Map<string, AssignmentSummary[]>
  onDueClick: (items: AssignmentSummary[]) => void
  showTimesInBlock?: boolean
  compactTitles?: boolean
}) {
  const dayKey = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).toISOString()
  const dueItems = dueMap.get(dayKey) ?? []

  // Layout constants
  const hours = Array.from({ length: 14 }, (_, i) => 8 + i) // 8am–10pm
  const rowH = 40 // px per hour row
  const gutterW = 40 // px width reserved for time labels

  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    8,
    0
  )
  const dayEnd = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    22,
    0
  )
  const totalMs = +dayEnd - +dayStart

  const blockStyle = (t: Task) => {
    const s = new Date(t.start)
    const e = new Date(t.end)
    const top = ((+s - +dayStart) / totalMs) * 100
    const height = ((+e - +s) / totalMs) * 100
    return {
      top: `${Math.max(0, top)}%`,
      height: `${Math.max(4, height)}%`,
      backgroundColor: t.color,
    } as React.CSSProperties
  }

  return (
    <div className="relative" style={{ height: `${rowH * hours.length}px` }}>
      {/* Subject-coloured Due pills */}
      {dueItems.length > 0 && (
        <div className="absolute right-1 top-1 z-10 flex flex-wrap gap-1">
          {dueItems.slice(0, 2).map((it) => (
            <button
              key={it.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow"
              style={{ backgroundColor: SUBJECTS[it.subject].color }}
              onClick={() => onDueClick(dueItems)}
              title={`${it.title}`}
            >
              {SUBJECTS[it.subject].label}
            </button>
          ))}
          {dueItems.length > 2 && (
            <button
              className="rounded-full bg-slate-600 px-2 py-0.5 text-[10px] font-bold text-white shadow"
              onClick={() => onDueClick(dueItems)}
              title={`${dueItems.length - 2} more`}
            >
              +{dueItems.length - 2}
            </button>
          )}
        </div>
      )}

      {/* LEFT GUTTER: time labels only */}
      <div
        className="absolute left-0 top-0 h-full select-none"
        style={{ width: `${gutterW}px` }}
      >
        {hours.map((h) => (
          <div
            key={h}
            className="border-b border-dashed border-slate-200 pr-1 text-right text-[10px] leading-[40px] text-slate-400"
            style={{ height: `${rowH}px` }}
          >
            {h}:00
          </div>
        ))}
      </div>

      {/* RIGHT AREA: grid + events */}
      <div
        className="absolute top-0 right-0 bottom-0"
        style={{ left: `${gutterW}px` }}
      >
        {/* Hour grid (lines only) */}
        <div className="absolute inset-0">
          {hours.map((h) => (
            <div
              key={h}
              className="border-b border-dashed border-slate-200"
              style={{ height: `${rowH}px` }}
            />
          ))}
        </div>

        {/* Events */}
        <div className="absolute inset-0">
          {tasks.map((t) => {
            const start = new Date(t.start)
            const end = new Date(t.end)
            const tooltip = `${t.title} • ${fmtHM(start)}–${fmtHM(end)}`
            return (
              <button
                key={`${t.id}-${t.start}`}
                onClick={() => onTaskClick(t)}
                className={`absolute left-1 right-1 rounded-md text-left text-white shadow overflow-hidden ${
                  compactTitles ? 'px-1.5 py-1 text-[10px]' : 'p-2 text-[11px]'
                }`}
                style={blockStyle(t)}
                title={tooltip}
              >
                <div
                  className={`font-semibold leading-tight ${
                    compactTitles
                      ? 'whitespace-normal break-words line-clamp-2'
                      : 'truncate'
                  }`}
                >
                  {t.title}
                </div>
                {showTimesInBlock && (
                  <div className="opacity-80 text-[10px] truncate">
                    {fmtHM(start)} – {fmtHM(end)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---------- Task modal (add/edit) ----------
// ---------- Task modal (add/edit) ----------
function TaskModal({
  initial,
  onClose,
  onSave,
  onDelete,
  assignments, // ← NEW
}: {
  initial?: Task
  onClose: () => void
  onSave: (t: Task) => void
  onDelete: (id: string) => void
  assignments: AssignmentSummary[] // ← NEW
}) {
  const isEditing = Boolean(initial)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [type, setType] = useState<TaskType>(initial?.type ?? 'focus')
  const [subject, setSubject] = useState<SubjectKey | undefined>(initial?.subject)
  const [assignmentId, setAssignmentId] = useState<string | undefined>(initial?.assignmentId)

  const [start, setStart] = useState<string>(
    initial ? initial.start.slice(0, 16) : new Date().toISOString().slice(0, 16)
  )
  const [end, setEnd] = useState<string>(
    initial
      ? initial.end.slice(0, 16)
      : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  )

  const [repeatKind, setRepeatKind] = useState<RepeatRule['kind']>(initial?.repeat.kind ?? 'none')
  const [repeatInterval, setRepeatInterval] = useState<number>(1)
  const [byWeekday, setByWeekday] = useState<number[]>([])
  const [isDone, setIsDone] = useState<boolean>(initial?.isDone ?? false)

  // Repeat end controls
  const initialEndAt = (initial?.repeat as any)?.endAt as string | undefined
  const [repeatEndMode, setRepeatEndMode] = useState<'never' | 'on'>(initialEndAt ? 'on' : 'never')
  const [repeatEndDate, setRepeatEndDate] = useState<string>(
    initialEndAt ? new Date(initialEndAt).toISOString().slice(0, 10) : ''
  )

  const effectiveColor = useMemo(() => {
    if (type === 'blocked') return COMMIT_COLOR
    if (type === 'rest') return REST_COLOR
    if (subject) return SUBJECTS[subject].color
    return '#111827'
  }, [type, subject])

  const buildRepeat = (): RepeatRule => {
    const endAt =
      repeatEndMode === 'on' && repeatEndDate ? new Date(repeatEndDate).toISOString() : undefined
    if (repeatKind === 'none') return { kind: 'none' }
    if (repeatKind === 'daily') return { kind: 'daily', interval: repeatInterval, endAt }
    if (repeatKind === 'weekly') return { kind: 'weekly', interval: repeatInterval, byWeekday, endAt }
    return { kind: 'monthly', interval: repeatInterval, endAt }
  }

  const save = () => {
    const id = initial?.id ?? `t_${crypto.randomUUID()}`
    onSave({
      id,
      title: title || 'Untitled',
      type,
      subject: type === 'blocked' || type === 'rest' ? undefined : subject,
      color: effectiveColor,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      repeat: buildRepeat(),
      isDone: type === 'focus' ? isDone : undefined,
      isAiBreak: type === 'rest' ? true : undefined,
      assignmentId: type === 'focus' ? assignmentId : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-4 shadow-xl">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">{isEditing ? 'Edit task' : 'Add task'}</h3>
          <button className="rounded-full p-2 hover:bg-slate-100" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Title */}
          <label className="text-xs">
            <div className="mb-1 font-semibold">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
              placeholder="e.g., Study: Algorithms"
            />
          </label>

          {/* Type */}
          <label className="text-xs">
            <div className="mb-1 font-semibold">Type</div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
            >
              <option value="focus">Study/Coursework</option>
              <option value="blocked">Other Commitments</option>
              <option value="rest">Rest</option>
            </select>
          </label>

          {/* Subject + Assignment (same row for focus tasks) */}
          {type !== 'blocked' && type !== 'rest' && (
            <>
              {/* Subject */}
              <label className="text-xs">
                <div className="mb-1 font-semibold">Subject</div>
                <select
                  value={subject ?? ''} // allow none
                  onChange={(e) => {
                    const v = e.target.value
                    setSubject(v ? (v as SubjectKey) : undefined)
                  }}
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                >
                  <option value="">(None)</option>
                  {Object.entries(SUBJECTS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Assignment */}
              <label className="text-xs">
                <div className="mb-1 font-semibold">Assignment</div>
                <select
                  value={assignmentId ?? ''} // allow none
                  onChange={(e) => setAssignmentId(e.target.value || undefined)}
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                >
                  <option value="">(None)</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {/* Start */}
          <label className="text-xs">
            <div className="mb-1 font-semibold">Start</div>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
            />
          </label>

          {/* End */}
          <label className="text-xs">
            <div className="mb-1 font-semibold">End</div>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
            />
          </label>

          {/* Repeat box */}
          <div className="col-span-full mt-1 rounded-xl border bg-slate-50 p-3">
            <div className="mb-2 text-xs font-semibold">Repeat</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {(['none', 'daily', 'weekly', 'monthly'] as RepeatRule['kind'][]).map((k) => (
                <button
                  key={k}
                  className={`rounded-full px-3 py-1 ${repeatKind === k ? 'bg-black text-white' : 'bg-white'}`}
                  onClick={() => setRepeatKind(k)}
                >
                  {k}
                </button>
              ))}

              {repeatKind !== 'none' && (
                <>
                  <span className="text-slate-500">every</span>
                  <input
                    type="number"
                    min={1}
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(parseInt(e.target.value) || 1)}
                    className="w-16 rounded-lg border px-2 py-1"
                  />
                  <span className="text-slate-500">
                    {repeatKind === 'daily' ? 'day(s)' : repeatKind === 'weekly' ? 'week(s)' : 'month(s)'}
                  </span>
                </>
              )}

              {repeatKind === 'weekly' && (
                <div className="ml-2 flex items-center gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      onClick={() =>
                        setByWeekday((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
                      }
                      className={`rounded-md border px-2 py-1 ${byWeekday.includes(d) ? 'bg-black text-white' : 'bg-white'}`}
                    >
                      {'SMTWTFS'[d]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ends controls */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-slate-600">Ends</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 ${repeatEndMode === 'never' ? 'bg-black text-white' : 'bg-white'}`}
                  onClick={() => setRepeatEndMode('never')}
                >
                  Never
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 ${repeatEndMode === 'on' ? 'bg-black text-white' : 'bg-white'}`}
                  onClick={() => setRepeatEndMode('on')}
                >
                  On
                </button>
                {repeatEndMode === 'on' && (
                  <input
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                    className="rounded-lg border px-2 py-1"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Mark done (only for focus) */}
          {type === 'focus' && (
            <label className="col-span-full mt-1 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={isDone}
                onChange={(e) => setIsDone(e.target.checked)}
              />
              <span>Mark as done when completed</span>
            </label>
          )}
        </div>

        {/* Footer (Delete / Cancel / Save) */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Preview color</span>
            <span className="inline-block h-4 w-4 rounded" style={{ backgroundColor: effectiveColor }} />
          </div>

          <div className="flex gap-2">
            {isEditing && (
              <button
                className="rounded-lg border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => initial && onDelete(initial.id)}
              >
                Delete
              </button>
            )}
            <button className="rounded-lg bg-black px-3 py-2 text-sm text-white" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

