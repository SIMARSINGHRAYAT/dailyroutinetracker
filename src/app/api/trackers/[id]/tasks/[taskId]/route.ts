import { NextRequest, NextResponse } from "next/server";
import { updateTask } from "@/server/tracker-service";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const data = await updateTask(id, taskId, {
    name: body?.name,
    sortOrder:
      body?.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
    archived:
      body?.archived !== undefined ? Boolean(body.archived) : undefined,
  });

  return NextResponse.json({ data });
}
