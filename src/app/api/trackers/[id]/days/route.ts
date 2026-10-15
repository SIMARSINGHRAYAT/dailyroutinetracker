import { NextRequest, NextResponse } from "next/server";
import { addDays } from "@/server/tracker-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const additionalDays = Number(body?.additionalDays ?? 0);

    if (!Number.isFinite(additionalDays) || additionalDays < 1 || additionalDays > 3650) {
      return NextResponse.json(
        { error: "additionalDays must be between 1 and 3650" },
        { status: 400 }
      );
    }

    const data = await addDays(id, additionalDays);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add days";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
