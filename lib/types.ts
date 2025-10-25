export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // Sunday=0

export interface WorkWindow {
  day: DayOfWeek
  start: string // 'HH:mm'
  end: string // 'HH:mm'
}

export interface UserPreferences {
  dailyMaxHours: number
  workWindows: WorkWindow[]
  stressLevel: 1 | 2 | 3 | 4 | 5
  proficiencies: Record<string, 1 | 2 | 3 | 4 | 5> // course or skill -> level
}

export interface Assignment {
  id: string
  title: string
  course?: string
  /** Subject or category, e.g. "Data Science" */
  subject?: string
  dueDate: string // ISO string
  estimatedHours: number
  understanding: 1 | 2 | 3 | 4 | 5
  notes?: string
  /** Optional specification source */
  specType?: 'pdf' | 'text'
  /** Free-text specification when user chooses "Enter Text" */
  specText?: string
  /** File name when a PDF is selected (we don't persist file bytes in localStorage) */
  specFileName?: string
  /** Self-reported confidence in the topic */
  confidence?: 1 | 2 | 3 | 4 | 5
  /** Has the user started researching/brainstorming */
  started?: 'yes' | 'partly' | 'no'
  /** Optional ideal date to begin working */
  idealStartDate?: string // ISO string
  /** Optional date user would be comfortable finishing */
  comfortableDueDate?: string // ISO string
  /** Tracked/derived progress percentage 0-100 */
  progress?: number
}

export interface StudyEvent {
  id: string
  assignmentId: string
  title: string
  start: string // ISO
  end: string // ISO
  completed?: boolean
}
