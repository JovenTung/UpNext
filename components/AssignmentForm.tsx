"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as chrono from "chrono-node";
import { useStore } from "@/lib/store/useStore";
import type { Assignment, UserPreferences } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2),
  course: z.string().optional(),
  dueDate: z.string().min(4),
  estimatedHours: z.coerce.number().min(0.5).max(200),
  understanding: z.coerce.number().int().min(1).max(5),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AssignmentForm() {
  const addAssignment = useStore((s) => s.addAssignment);
  const assignments = useStore((s) => s.assignments);
  const preferences = useStore((s) => s.preferences);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { understanding: 3, estimatedHours: 6 },
  });

  const onParse = (text: string) => {
    const res = chrono.parse(text, new Date());
    const date = res[0]?.start?.date();
    if (date) setValue("dueDate", date.toISOString().slice(0, 10));
  };

  const onSubmit = async (values: FormValues) => {
    const a: Assignment = {
      id: `${Date.now()}`,
      title: values.title,
      course: values.course,
      dueDate: new Date(values.dueDate).toISOString(),
      estimatedHours: values.estimatedHours,
      understanding: values.understanding as 1 | 2 | 3 | 4 | 5,
      notes: values.notes,
    };
    addAssignment(a);
    if (preferences) {
      // Call planner API to generate events
      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignments: [...assignments, a],
            preferences,
          }),
        });
        const data = await res.json();
        const events = data.events as any[];
        // bubble an event to indicate events were created; store updates handled at page level
        const event = new CustomEvent("upnext:planned", { detail: events });
        window.dispatchEvent(event);
      } catch (e) {
        console.error("Failed to plan", e);
      }
    }
  };

  return (
    <form className="space-y-4 max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          className="mt-1 w-full rounded border p-2"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">Course</label>
        <input
          className="mt-1 w-full rounded border p-2"
          {...register("course")}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Due date</label>
          <input
            type="date"
            className="mt-1 w-full rounded border p-2"
            {...register("dueDate")}
          />
          {errors.dueDate && (
            <p className="text-sm text-red-600">{errors.dueDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Estimated hours</label>
          <input
            type="number"
            step="0.5"
            className="mt-1 w-full rounded border p-2"
            {...register("estimatedHours")}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">
          Understanding (1=low, 5=high)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          className="mt-2 w-full"
          {...register("understanding")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Paste description (auto-detect dates)
        </label>
        <textarea
          className="mt-1 w-full rounded border p-2"
          rows={3}
          onBlur={(e) => onParse(e.currentTarget.value)}
          placeholder="Paste assignment details here"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          className="mt-1 w-full rounded border p-2"
          rows={2}
          {...register("notes")}
        />
      </div>
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={isSubmitting}
      >
        Add and Plan
      </button>
    </form>
  );
}
