import { NextRequest, NextResponse } from "next/server";
import { getReminder, updateReminder } from "@/server/tracker-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const data = await getReminder(id);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load reminder settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const data = await updateReminder(id, {
      enabled:
        body?.enabled !== undefined ? Boolean(body.enabled) : undefined,
      reminderTime: body?.reminderTime,
      daysOfWeek: Array.isArray(body?.daysOfWeek)
        ? body.daysOfWeek.map(Number)
        : undefined,
      quietHoursStart: body?.quietHoursStart,
      quietHoursEnd: body?.quietHoursEnd,
      timezone: body?.timezone,
    });

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update reminder settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
