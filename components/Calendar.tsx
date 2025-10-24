"use client";

import {
  Calendar as RBCalendar,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import type { StudyEvent } from "@/lib/types";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type Props = {
  events: StudyEvent[];
  onMove?: (id: string, start: Date, end: Date) => void;
};

const DnDCalendar = withDragAndDrop(RBCalendar as any);

export function Calendar({ events, onMove }: Props) {
  const rbcEvents = events.map((e) => ({
    id: e.id,
    title: e.title + (e.completed ? " ✓" : ""),
    start: new Date(e.start),
    end: new Date(e.end),
    allDay: false,
  }));

  return (
    <div className="h-[700px]">
      <DnDCalendar
        localizer={localizer}
        events={rbcEvents}
        defaultView={Views.WEEK}
        resizable
        onEventDrop={(data: any) =>
          onMove?.(String(data.event.id), data.start, data.end)
        }
        onEventResize={(data: any) =>
          onMove?.(String(data.event.id), data.start, data.end)
        }
      />
    </div>
  );
}

export default Calendar;
