export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday=0

export interface WorkWindow {
  day: DayOfWeek;
  start: string; // 'HH:mm'
  end: string; // 'HH:mm'
}

export interface UserPreferences {
  dailyMaxHours: number;
  workWindows: WorkWindow[];
  stressLevel: 1 | 2 | 3 | 4 | 5;
  proficiencies: Record<string, 1 | 2 | 3 | 4 | 5>; // course or skill -> level
}

export interface Assignment {
  id: string;
  title: string;
  course?: string;
  dueDate: string; // ISO string
  estimatedHours: number;
  understanding: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface StudyEvent {
  id: string;
  assignmentId: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  completed?: boolean;
}
