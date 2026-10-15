import { NextRequest, NextResponse } from "next/server";
import { duplicateTracker } from "@/server/tracker-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = await ctx.params;
    const deviceId =
      req.headers.get("x-device-id") ||
      req.cookies.get("drt-device-id")?.value ||
      "default";

    const data = await duplicateTracker(id, Boolean(body?.copyHistory), deviceId);

    if (!data) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to duplicate tracker";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
