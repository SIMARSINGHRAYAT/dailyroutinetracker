import { NextRequest, NextResponse } from "next/server";
import { addTask, bulkDeleteTasks, reorderTasks } from "@/server/tracker-service";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Task name is required" }, { status: 400 });
  }

  const data = await addTask(id, name);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  const normalized = items
    .map((item: unknown) => {
      if (typeof item !== "object" || !item) return null;
      const obj = item as { id?: string; sortOrder?: number };
      if (!obj.id || obj.sortOrder === undefined) return null;
      return { id: String(obj.id), sortOrder: Number(obj.sortOrder) };
    })
    .filter(Boolean) as Array<{ id: string; sortOrder: number }>;

  const data = await reorderTasks(id, normalized);
  return NextResponse.json({ data });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const taskIds = Array.isArray(body?.taskIds) ? body.taskIds.map(String) : [];

  const data = await bulkDeleteTasks(id, taskIds);
  return NextResponse.json({ data });
}
