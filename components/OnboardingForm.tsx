"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import type { DayOfWeek, UserPreferences } from "@/lib/types";

const windowSchema = z.object({
  day: z.number().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

const schema = z.object({
  dailyMaxHours: z.coerce.number().min(1).max(12),
  stressLevel: z.coerce.number().int().min(1).max(5),
  workWindows: z.array(windowSchema).min(1),
});

type FormValues = z.infer<typeof schema>;

const defaultWindows: { day: DayOfWeek; start: string; end: string }[] = [
  { day: 1, start: "18:00", end: "22:00" },
  { day: 2, start: "18:00", end: "22:00" },
  { day: 3, start: "18:00", end: "22:00" },
  { day: 4, start: "18:00", end: "22:00" },
  { day: 6, start: "10:00", end: "14:00" },
];

export default function OnboardingForm() {
  const setPreferences = useStore((s) => s.setPreferences);
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dailyMaxHours: 4,
      stressLevel: 3,
      workWindows: defaultWindows,
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "workWindows",
    control,
  });

  const onSubmit = (values: FormValues) => {
    const prefs: UserPreferences = {
      dailyMaxHours: values.dailyMaxHours,
      stressLevel: values.stressLevel as 1 | 2 | 3 | 4 | 5,
      workWindows: values.workWindows as any,
      proficiencies: {},
    };
    setPreferences(prefs);
    router.push("/dashboard");
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Daily max hours</label>
          <input
            type="number"
            min={1}
            max={12}
            className="mt-1 w-full rounded border p-2"
            {...register("dailyMaxHours")}
          />
          {errors.dailyMaxHours && (
            <p className="text-sm text-red-600">
              {errors.dailyMaxHours.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Stress level</label>
          <input
            type="range"
            min={1}
            max={5}
            className="mt-2 w-full"
            {...register("stressLevel")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Preferred work windows</h3>
          <button
            type="button"
            className="rounded bg-gray-100 px-2 py-1"
            onClick={() => append({ day: 0, start: "09:00", end: "11:00" })}
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-12 items-end gap-2">
              <div className="col-span-4">
                <label className="block text-xs">Day</label>
                <select
                  className="mt-1 w-full rounded border p-2"
                  {...register(`workWindows.${idx}.day` as const, {
                    valueAsNumber: true,
                  })}
                >
                  {dayNames.map((n, i) => (
                    <option key={i} value={i}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-xs">Start</label>
                <input
                  type="time"
                  className="mt-1 w-full rounded border p-2"
                  {...register(`workWindows.${idx}.start` as const)}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs">End</label>
                <input
                  type="time"
                  className="mt-1 w-full rounded border p-2"
                  {...register(`workWindows.${idx}.end` as const)}
                />
              </div>
              <div className="col-span-2">
                <button
                  type="button"
                  className="w-full rounded bg-red-50 px-2 py-2 text-red-600"
                  onClick={() => remove(idx)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Save and continue
      </button>
    </form>
  );
}
