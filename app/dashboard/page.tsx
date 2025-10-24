"use client";

import Calendar from "@/components/Calendar";
import { useStore } from "@/lib/store/useStore";
import { isSameDay } from "date-fns";

export default function DashboardPage() {
  const events = useStore((s) => s.events);
  const updateEvent = useStore((s) => s.updateEvent);

  const onMove = (id: string, start: Date, end: Date) => {
    updateEvent(id, { start: start.toISOString(), end: end.toISOString() });
  };

  const today = new Date();
  const todays = events.filter((e) => isSameDay(new Date(e.start), today));

  const toggle = (id: string) => {
    const current = events.find((e) => e.id === id);
    updateEvent(id, { completed: !current?.completed });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-2 text-xl font-semibold">Your plan</h2>
        <Calendar events={events} onMove={onMove} />
      </div>
      <div>
        <h2 className="mb-2 text-xl font-semibold">Today</h2>
        <ul className="space-y-2">
          {todays.length === 0 && (
            <li className="text-gray-500">No sessions planned today.</li>
          )}
          {todays.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between rounded border p-2"
            >
              <div>
                <div className="font-medium">{e.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(e.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" - "}
                  {new Date(e.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!e.completed}
                  onChange={() => toggle(e.id)}
                />
                Done
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
