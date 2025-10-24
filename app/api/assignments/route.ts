import { NextRequest, NextResponse } from "next/server";

// Simple stub: echo back assignment payload
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ ok: true, assignment: body });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  // No server storage; instruct client to use local storage
  return NextResponse.json({ assignments: [] });
}
