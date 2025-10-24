"use client";

import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import type { Assignment, StudyEvent, UserPreferences } from "../types";

interface State {
  user: { id: string; name: string } | null;
  preferences: UserPreferences | null;
  assignments: Assignment[];
  events: StudyEvent[];
  setUser: (u: State["user"]) => void;
  setPreferences: (p: UserPreferences) => void;
  addAssignment: (a: Assignment) => void;
  upsertEvents: (evts: StudyEvent[]) => void;
  updateEvent: (id: string, update: Partial<StudyEvent>) => void;
  clearAll: () => void;
}

const creator: StateCreator<State> = (set: any, get: any) => ({
  user: null,
  preferences: null,
  assignments: [],
  events: [],
  setUser: (u: State["user"]) => set({ user: u }),
  setPreferences: (p: UserPreferences) => set({ preferences: p }),
  addAssignment: (a: Assignment) =>
    set({ assignments: [...get().assignments, a] }),
  upsertEvents: (evts: StudyEvent[]) => {
    const existing = new Map<string, StudyEvent>(
      get().events.map((e: StudyEvent) => [e.id, e])
    );
    for (const e of evts)
      existing.set(e.id, {
        ...(existing.get(e.id) || ({} as StudyEvent)),
        ...e,
      });
    set({ events: Array.from(existing.values()) });
  },
  updateEvent: (id: string, update: Partial<StudyEvent>) => {
    set({
      events: get().events.map((e) => (e.id === id ? { ...e, ...update } : e)),
    });
  },
  clearAll: () =>
    set({ user: null, preferences: null, assignments: [], events: [] }),
});

export const useStore = create<State>()(
  persist(creator, { name: "upnext-store" })
);
