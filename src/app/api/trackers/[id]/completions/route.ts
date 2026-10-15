import { NextRequest, NextResponse } from "next/server";
import {
  clearAllCompletions,
  clearDayCompletions,
  toggleCompletion,
} from "@/server/tracker-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = await ctx.params;

    if (body?.action === "clear-all") {
      const data = await clearAllCompletions(id);
      return NextResponse.json({ data });
    }

    if (body?.action === "clear-day") {
      const dayIndex = Number(body?.dayIndex ?? 0);
      const data = await clearDayCompletions(id, dayIndex);
      return NextResponse.json({ data });
    }

    const dayIndex = Number(body?.dayIndex);
    const taskId = String(body?.taskId ?? "");

    if (!dayIndex || !taskId) {
      return NextResponse.json(
        { error: "taskId and dayIndex are required" },
        { status: 400 }
      );
    }

    const data = await toggleCompletion(id, taskId, dayIndex, Boolean(body?.completed));
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update completion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
