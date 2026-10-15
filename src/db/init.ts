import { sql } from "drizzle-orm";
import { db } from "./index";

let initPromise: Promise<void> | null = null;

export async function ensureDatabaseSchema(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS trackers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id VARCHAR(128) NOT NULL DEFAULT 'default',
        name VARCHAR(160) NOT NULL,
        start_date TIMESTAMP,
        active_days INTEGER NOT NULL DEFAULT 3,
        total_days_ever INTEGER NOT NULL DEFAULT 3,
        archived BOOLEAN NOT NULL DEFAULT FALSE,
        color VARCHAR(40) NOT NULL DEFAULT 'blue',
        icon VARCHAR(40) NOT NULL DEFAULT 'check-circle',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE trackers ADD COLUMN IF NOT EXISTS device_id VARCHAR(128) NOT NULL DEFAULT 'default';
      CREATE INDEX IF NOT EXISTS trackers_device_id_idx ON trackers(device_id);

      CREATE TABLE IF NOT EXISTS tracker_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tracker_id UUID NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
        name VARCHAR(160) NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        archived BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tracker_completions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tracker_id UUID NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
        task_id UUID NOT NULL REFERENCES tracker_tasks(id) ON DELETE CASCADE,
        day_index INTEGER NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reminder_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tracker_id UUID NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
        enabled BOOLEAN NOT NULL DEFAULT FALSE,
        reminder_time VARCHAR(10) NOT NULL DEFAULT '20:00',
        days_of_week JSONB NOT NULL DEFAULT '[1,2,3,4,5,6,0]'::jsonb,
        quiet_hours_start VARCHAR(10) DEFAULT '22:00',
        quiet_hours_end VARCHAR(10) DEFAULT '07:00',
        timezone TEXT NOT NULL DEFAULT 'UTC',
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS tracker_task_tracker_order_unique 
        ON tracker_tasks(tracker_id, sort_order);

      CREATE UNIQUE INDEX IF NOT EXISTS tracker_completion_unique_cell 
        ON tracker_completions(tracker_id, task_id, day_index);
    `);
  })().catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}
