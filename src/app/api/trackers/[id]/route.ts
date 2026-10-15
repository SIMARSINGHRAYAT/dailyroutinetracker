import { NextRequest, NextResponse } from "next/server";
import {
  archiveTracker,
  deleteTracker,
  getHydratedTracker,
  updateTrackerBasics,
} from "@/server/tracker-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const tracker = await getHydratedTracker(id);
    if (!tracker) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    return NextResponse.json({ data: tracker });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load tracker";
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

    if (body?.action === "archive") {
      const next = await archiveTracker(id, Boolean(body?.archived));
      return NextResponse.json({ data: next });
    }

    const updated = await updateTrackerBasics(id, {
      name: body?.name,
      startDate: body?.startDate,
      activeDays:
        body?.activeDays !== undefined ? Number(body.activeDays) : undefined,
      color: body?.color,
      icon: body?.icon,
    });

    if (!updated) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update tracker";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    await deleteTracker(id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete tracker";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
