import {
  addMinutes,
  differenceInMinutes,
  endOfDay,
  isBefore,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { Assignment, StudyEvent, UserPreferences, WorkWindow } from "../types";

export interface PlanInput {
  assignments: Assignment[];
  preferences: UserPreferences;
  existing?: StudyEvent[];
}

export function plan({
  assignments,
  preferences,
  existing = [],
}: PlanInput): StudyEvent[] {
  // Simple heuristic:
  // - For each assignment sorted by due date, compute total minutes = estimatedHours * 60 * difficultyFactor
  // - difficultyFactor increases if understanding is low and stress is high
  // - Create study blocks of 60-90 minutes with 10 minute buffer, placed into preferred windows before deadline
  // - Avoid overlaps with existing events

  const planned: StudyEvent[] = [];

  const sorted = [...assignments].sort(
    (a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
  );

  const busy = [...existing];

  for (const a of sorted) {
    const due = parseISO(a.dueDate);
    const baseMinutes = a.estimatedHours * 60;
    const understandingFactor = 1 + (6 - a.understanding) * 0.12; // 1.0 .. 1.6
    const stressFactor = 1 + (preferences.stressLevel - 3) * 0.08; // 0.84 .. 1.16
    const totalMinutes = Math.ceil(
      baseMinutes * understandingFactor * stressFactor
    );

    let remaining = totalMinutes;
    let cursor = new Date();
    // Start scheduling from today to due date
    while (remaining > 0 && isBefore(cursor, endOfDay(due))) {
      const day = cursor.getDay() as WorkWindow["day"];
      const todaysWindows = preferences.workWindows.filter(
        (w) => w.day === day
      );
      for (const w of todaysWindows) {
        // Window start/end on this date
        const [sh, sm] = w.start.split(":").map(Number);
        const [eh, em] = w.end.split(":").map(Number);
        let wStart = setMinutes(setHours(startOfDay(cursor), sh), sm);
        let wEnd = setMinutes(setHours(startOfDay(cursor), eh), em);
        if (!isBefore(wStart, wEnd)) continue;

        // Break into sessions of 60-90 mins
        while (remaining > 0 && isBefore(wStart, wEnd)) {
          const sessionLength = Math.min(remaining, 90);
          const sessionEnd = addMinutes(wStart, sessionLength);
          if (isBefore(sessionEnd, wEnd) || isSameDay(sessionEnd, wEnd)) {
            // Check overlap with busy
            const overlaps = busy.some(
              (e) =>
                // overlap if start < otherEnd && end > otherStart
                parseISO(e.start) < sessionEnd && parseISO(e.end) > wStart
            );
            if (!overlaps) {
              const id = `${a.id}-${wStart.toISOString()}`;
              const evt: StudyEvent = {
                id,
                assignmentId: a.id,
                title: `${a.title} — Study`,
                start: wStart.toISOString(),
                end: sessionEnd.toISOString(),
              };
              planned.push(evt);
              busy.push(evt);
              remaining -= sessionLength;
              // 10 min buffer
              wStart = addMinutes(sessionEnd, 10);
              continue;
            }
          }
          // If can't fit, move start forward by 15 mins
          wStart = addMinutes(wStart, 15);
        }
      }
      // Advance to next day
      cursor = addMinutes(endOfDay(cursor), 60); // next day early hour
      cursor = startOfDay(cursor);
    }
  }

  return planned;
}
