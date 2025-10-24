"use client";

import AssignmentForm from "@/components/AssignmentForm";
import { useEffect } from "react";
import { useStore } from "@/lib/store/useStore";
import type { StudyEvent } from "@/lib/types";

export default function UploadPage() {
  const upsertEvents = useStore((s) => s.upsertEvents);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<StudyEvent[]>;
      if (Array.isArray(custom.detail)) {
        upsertEvents(custom.detail);
      }
    };
    window.addEventListener("upnext:planned", handler as any);
    return () => window.removeEventListener("upnext:planned", handler as any);
  }, [upsertEvents]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Add an assignment</h1>
      <AssignmentForm />
    </div>
  );
}
