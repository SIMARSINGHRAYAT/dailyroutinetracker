import { NextRequest, NextResponse } from "next/server";
import { duplicateTracker } from "@/server/tracker-service";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const body = await req.json().catch(() => ({}));
  const { id } = await ctx.params;
  const data = await duplicateTracker(id, Boolean(body?.copyHistory));

  if (!data) {
    return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
