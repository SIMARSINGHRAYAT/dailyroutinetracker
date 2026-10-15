import { NextRequest, NextResponse } from "next/server";
import {
  createTracker,
  importBackup,
  listHydratedTrackers,
} from "@/server/tracker-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listHydratedTrackers();
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load trackers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body?.mode === "import") {
      const imported = await importBackup(body.trackers ?? []);
      return NextResponse.json({ data: imported });
    }

    const name = String(body?.name ?? "").trim();
    const days = Number(body?.days ?? 3);
    const taskNames = Array.isArray(body?.taskNames)
      ? body.taskNames.map((t: unknown) => String(t || "").trim()).filter(Boolean)
      : [];

    if (!name) {
      return NextResponse.json({ error: "Tracker name is required" }, { status: 400 });
    }

    if (!Number.isFinite(days) || days < 1 || days > 3650) {
      return NextResponse.json({ error: "Days must be between 1 and 3650" }, { status: 400 });
    }

    if (!taskNames.length) {
      return NextResponse.json({ error: "At least one task is required" }, { status: 400 });
    }

    const created = await createTracker({
      name,
      days,
      taskNames,
      startDate: body?.startDate || null,
      color: body?.color,
      icon: body?.icon,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
