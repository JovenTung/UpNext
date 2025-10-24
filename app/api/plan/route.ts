import { NextRequest, NextResponse } from "next/server";
import { plan } from "@/lib/services/planner";
import type { Assignment, StudyEvent, UserPreferences } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      assignments: Assignment[];
      preferences: UserPreferences;
      existing?: StudyEvent[];
    };
    const events = plan({
      assignments: body.assignments,
      preferences: body.preferences,
      existing: body.existing,
    });
    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
