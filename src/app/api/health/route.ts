import { db } from "@/db";
import { ensureDatabaseSchema } from "@/db/init";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDatabaseSchema();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, status: "healthy", database: "connected" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return Response.json(
      { ok: false, status: "unhealthy", database: "disconnected", error: message },
      { status: 503 }
    );
  }
}
