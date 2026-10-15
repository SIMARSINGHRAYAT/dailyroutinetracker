import "server-only";

import { db } from "@/db";
import { ensureDatabaseSchema } from "@/db/init";
import {
  reminderSettings,
  trackerCompletions,
  trackers,
  trackerTasks,
} from "@/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  sql,
} from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { TrackerHydrated } from "@/lib/tracker-math";

export type CreateTrackerInput = {
  name: string;
  days: number;
  taskNames: string[];
  startDate?: string | null;
  color?: string;
  icon?: string;
  deviceId?: string;
};

const mapHydrated = async (trackerId: string): Promise<TrackerHydrated | null> => {
  await ensureDatabaseSchema();
  const [tracker] = await db
    .select()
    .from(trackers)
    .where(eq(trackers.id, trackerId))
    .limit(1);

  if (!tracker) return null;

  const tasks = await db
    .select()
    .from(trackerTasks)
    .where(eq(trackerTasks.trackerId, trackerId))
    .orderBy(asc(trackerTasks.sortOrder));

  const completions = await db
    .select({
      taskId: trackerCompletions.taskId,
      dayIndex: trackerCompletions.dayIndex,
      completed: trackerCompletions.completed,
    })
    .from(trackerCompletions)
    .where(eq(trackerCompletions.trackerId, trackerId));

  return {
    id: tracker.id,
    name: tracker.name,
    startDate: tracker.startDate ? tracker.startDate.toISOString() : null,
    activeDays: tracker.activeDays,
    totalDaysEver: tracker.totalDaysEver,
    archived: tracker.archived,
    color: tracker.color,
    icon: tracker.icon,
    createdAt: tracker.createdAt.toISOString(),
    updatedAt: tracker.updatedAt.toISOString(),
    tasks: tasks.map((t) => ({
      id: t.id,
      name: t.name,
      sortOrder: t.sortOrder,
      archived: t.archived,
    })),
    completions,
  };
};

export async function listTrackers(deviceId?: string) {
  await ensureDatabaseSchema();
  if (deviceId && deviceId !== "all") {
    return db
      .select()
      .from(trackers)
      .where(eq(trackers.deviceId, deviceId))
      .orderBy(desc(trackers.createdAt));
  }
  return db.select().from(trackers).orderBy(desc(trackers.createdAt));
}

export async function listHydratedTrackers(deviceId?: string) {
  await ensureDatabaseSchema();
  const all = await listTrackers(deviceId);
  const result = await Promise.all(all.map((t) => mapHydrated(t.id)));
  return result.filter(Boolean) as TrackerHydrated[];
}

export async function getHydratedTracker(trackerId: string) {
  return mapHydrated(trackerId);
}

export async function createTracker(input: CreateTrackerInput) {
  await ensureDatabaseSchema();
  const trackerId = randomUUID();
  const now = new Date();

  await db.insert(trackers).values({
    id: trackerId,
    deviceId: input.deviceId || "default",
    name: input.name,
    startDate: input.startDate ? new Date(input.startDate) : null,
    activeDays: input.days,
    totalDaysEver: input.days,
    color: input.color ?? "blue",
    icon: input.icon ?? "check-circle",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(trackerTasks).values(
    input.taskNames.map((taskName, index) => ({
      id: randomUUID(),
      trackerId,
      name: taskName,
      sortOrder: index,
      archived: false,
      createdAt: now,
      updatedAt: now,
    }))
  );

  await db.insert(reminderSettings).values({
    trackerId,
    enabled: false,
    reminderTime: "20:00",
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    updatedAt: now,
  });

  return mapHydrated(trackerId);
}

export async function updateTrackerBasics(
  trackerId: string,
  updates: Partial<Pick<CreateTrackerInput, "name" | "startDate" | "color" | "icon">> & {
    activeDays?: number;
  }
) {
  await ensureDatabaseSchema();
  const [existing] = await db
    .select()
    .from(trackers)
    .where(eq(trackers.id, trackerId))
    .limit(1);

  if (!existing) return null;

  const nextActiveDays = updates.activeDays ?? existing.activeDays;

  await db
    .update(trackers)
    .set({
      name: updates.name ?? existing.name,
      startDate:
        updates.startDate !== undefined
          ? updates.startDate
            ? new Date(updates.startDate)
            : null
          : existing.startDate,
      color: updates.color ?? existing.color,
      icon: updates.icon ?? existing.icon,
      activeDays: nextActiveDays,
      totalDaysEver: Math.max(existing.totalDaysEver, nextActiveDays),
      updatedAt: new Date(),
    })
    .where(eq(trackers.id, trackerId));

  return mapHydrated(trackerId);
}

export async function addTask(trackerId: string, name: string) {
  await ensureDatabaseSchema();
  const [maxOrder] = await db
    .select({ max: sql<number>`coalesce(max(${trackerTasks.sortOrder}), -1)` })
    .from(trackerTasks)
    .where(eq(trackerTasks.trackerId, trackerId));

  await db.insert(trackerTasks).values({
    id: randomUUID(),
    trackerId,
    name,
    sortOrder: (maxOrder?.max ?? -1) + 1,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db
    .update(trackers)
    .set({ updatedAt: new Date() })
    .where(eq(trackers.id, trackerId));

  return mapHydrated(trackerId);
}

export async function updateTask(
  trackerId: string,
  taskId: string,
  updates: { name?: string; sortOrder?: number; archived?: boolean }
) {
  await ensureDatabaseSchema();
  await db
    .update(trackerTasks)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(trackerTasks.trackerId, trackerId), eq(trackerTasks.id, taskId)));

  await db
    .update(trackers)
    .set({ updatedAt: new Date() })
    .where(eq(trackers.id, trackerId));

  return mapHydrated(trackerId);
}

export async function reorderTasks(
  trackerId: string,
  payload: Array<{ id: string; sortOrder: number }>
) {
  await ensureDatabaseSchema();
  await db.transaction(async (tx) => {
    for (const item of payload) {
      await tx
        .update(trackerTasks)
        .set({ sortOrder: item.sortOrder + 10000, updatedAt: new Date() })
        .where(and(eq(trackerTasks.id, item.id), eq(trackerTasks.trackerId, trackerId)));
    }

    for (const item of payload) {
      await tx
        .update(trackerTasks)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
        .where(and(eq(trackerTasks.id, item.id), eq(trackerTasks.trackerId, trackerId)));
    }

    await tx
      .update(trackers)
      .set({ updatedAt: new Date() })
      .where(eq(trackers.id, trackerId));
  });

  return mapHydrated(trackerId);
}

export async function addDays(trackerId: string, additionalDays: number) {
  await ensureDatabaseSchema();
  const [tracker] = await db
    .select()
    .from(trackers)
    .where(eq(trackers.id, trackerId))
    .limit(1);

  if (!tracker) return null;

  const next = tracker.activeDays + additionalDays;

  await db
    .update(trackers)
    .set({
      activeDays: next,
      totalDaysEver: Math.max(tracker.totalDaysEver, next),
      updatedAt: new Date(),
    })
    .where(eq(trackers.id, trackerId));

  return mapHydrated(trackerId);
}

export async function toggleCompletion(
  trackerId: string,
  taskId: string,
  dayIndex: number,
  completed: boolean
) {
  await ensureDatabaseSchema();
  await db
    .insert(trackerCompletions)
    .values({
      id: randomUUID(),
      trackerId,
      taskId,
      dayIndex,
      completed,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        trackerCompletions.trackerId,
        trackerCompletions.taskId,
        trackerCompletions.dayIndex,
      ],
      set: {
        completed,
        updatedAt: new Date(),
      },
    });

  await db
    .update(trackers)
    .set({ updatedAt: new Date() })
    .where(eq(trackers.id, trackerId));

  return mapHydrated(trackerId);
}

export async function clearAllCompletions(trackerId: string) {
  await ensureDatabaseSchema();
  await db
    .delete(trackerCompletions)
    .where(eq(trackerCompletions.trackerId, trackerId));

  await db
    .update(trackers)
    .set({ updatedAt: new Date() })
    .where(eq(trackers.id, trackerId));

  return mapHydrated(trackerId);
}

export async function clearDayCompletions(trackerId: string, dayIndex: number) {
  await ensureDatabaseSchema();
  await db
    .delete(trackerCompletions)
    .where(and(eq(trackerCompletions.trackerId, trackerId), eq(trackerCompletions.dayIndex, dayIndex)));

  await db
    .update(trackers)
    .set({ updatedAt: new Date() })
    .where(eq(trackers.id, trackerId));

  return mapHydrated(trackerId);
}

export async function deleteTracker(trackerId: string) {
  await ensureDatabaseSchema();
  await db.delete(trackers).where(eq(trackers.id, trackerId));
}

export async function archiveTracker(trackerId: string, archived: boolean) {
  await ensureDatabaseSchema();
  await db
    .update(trackers)
    .set({ archived, updatedAt: new Date() })
    .where(eq(trackers.id, trackerId));

  return mapHydrated(trackerId);
}

export async function duplicateTracker(trackerId: string, copyHistory: boolean, deviceId?: string) {
  await ensureDatabaseSchema();
  const source = await mapHydrated(trackerId);
  if (!source) return null;

  const idMap = new Map<string, string>();
  const clonedTaskNames = source.tasks
    .filter((t) => !t.archived)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => t.name);

  const clone = await createTracker({
    name: `${source.name} (Copy)`,
    days: source.activeDays,
    taskNames: clonedTaskNames,
    startDate: source.startDate,
    color: source.color,
    icon: source.icon,
    deviceId: deviceId || "default",
  });

  if (!clone) return null;

  const sourceTasks = source.tasks
    .filter((t) => !t.archived)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const targetTasks = clone.tasks
    .filter((t) => !t.archived)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  sourceTasks.forEach((s, i) => {
    const target = targetTasks[i];
    if (target) {
      idMap.set(s.id, target.id);
    }
  });

  if (copyHistory) {
    const rows = source.completions
      .filter((c) => c.completed && c.dayIndex <= source.activeDays)
      .map((c) => ({
        id: randomUUID(),
        trackerId: clone.id,
        taskId: idMap.get(c.taskId) ?? c.taskId,
        dayIndex: c.dayIndex,
        completed: true,
        updatedAt: new Date(),
      }))
      .filter((row) => targetTasks.some((t) => t.id === row.taskId));

    if (rows.length) {
      await db.insert(trackerCompletions).values(rows);
    }
  }

  return mapHydrated(clone.id);
}

export async function getReminder(trackerId: string) {
  await ensureDatabaseSchema();
  const [row] = await db
    .select()
    .from(reminderSettings)
    .where(eq(reminderSettings.trackerId, trackerId))
    .limit(1);
  return row ?? null;
}

export async function updateReminder(
  trackerId: string,
  updates: {
    enabled?: boolean;
    reminderTime?: string;
    daysOfWeek?: number[];
    quietHoursStart?: string | null;
    quietHoursEnd?: string | null;
    timezone?: string;
  }
) {
  await ensureDatabaseSchema();
  const existing = await getReminder(trackerId);
  if (!existing) {
    await db.insert(reminderSettings).values({
      trackerId,
      enabled: updates.enabled ?? false,
      reminderTime: updates.reminderTime ?? "20:00",
      daysOfWeek: updates.daysOfWeek ?? [1, 2, 3, 4, 5, 6, 0],
      quietHoursStart: updates.quietHoursStart ?? "22:00",
      quietHoursEnd: updates.quietHoursEnd ?? "07:00",
      timezone: updates.timezone ?? "UTC",
      updatedAt: new Date(),
    });
  } else {
    await db
      .update(reminderSettings)
      .set({
        enabled: updates.enabled ?? existing.enabled,
        reminderTime: updates.reminderTime ?? existing.reminderTime,
        daysOfWeek: updates.daysOfWeek ?? (existing.daysOfWeek as number[]),
        quietHoursStart: updates.quietHoursStart ?? existing.quietHoursStart,
        quietHoursEnd: updates.quietHoursEnd ?? existing.quietHoursEnd,
        timezone: updates.timezone ?? existing.timezone,
        updatedAt: new Date(),
      })
      .where(eq(reminderSettings.trackerId, trackerId));
  }

  return getReminder(trackerId);
}

export async function importBackup(data: TrackerHydrated[], deviceId?: string) {
  await ensureDatabaseSchema();
  const targetDeviceId = deviceId || "default";

  await db.transaction(async (tx) => {
    // Only clear trackers for THIS device so imports do not delete other users' trackers
    const userTrackers = await tx
      .select({ id: trackers.id })
      .from(trackers)
      .where(eq(trackers.deviceId, targetDeviceId));

    const userTrackerIds = userTrackers.map((t) => t.id);
    if (userTrackerIds.length) {
      await tx.delete(trackerCompletions).where(inArray(trackerCompletions.trackerId, userTrackerIds));
      await tx.delete(trackerTasks).where(inArray(trackerTasks.trackerId, userTrackerIds));
      await tx.delete(reminderSettings).where(inArray(reminderSettings.trackerId, userTrackerIds));
      await tx.delete(trackers).where(inArray(trackers.id, userTrackerIds));
    }

    for (const tracker of data) {
      await tx.insert(trackers).values({
        id: tracker.id,
        deviceId: targetDeviceId,
        name: tracker.name,
        startDate: tracker.startDate ? new Date(tracker.startDate) : null,
        activeDays: tracker.activeDays,
        totalDaysEver: tracker.totalDaysEver,
        archived: tracker.archived,
        color: tracker.color,
        icon: tracker.icon,
        createdAt: new Date(tracker.createdAt),
        updatedAt: new Date(tracker.updatedAt),
      });

      if (tracker.tasks.length) {
        await tx.insert(trackerTasks).values(
          tracker.tasks.map((task) => ({
            id: task.id,
            trackerId: tracker.id,
            name: task.name,
            sortOrder: task.sortOrder,
            archived: task.archived,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        );
      }

      if (tracker.completions.length) {
        await tx.insert(trackerCompletions).values(
          tracker.completions.map((completion) => ({
            id: randomUUID(),
            trackerId: tracker.id,
            taskId: completion.taskId,
            dayIndex: completion.dayIndex,
            completed: completion.completed,
            updatedAt: new Date(),
          }))
        );
      }
    }
  });

  return listHydratedTrackers(targetDeviceId);
}

export async function bulkDeleteTasks(trackerId: string, taskIds: string[]) {
  await ensureDatabaseSchema();
  if (!taskIds.length) return mapHydrated(trackerId);

  await db
    .delete(trackerTasks)
    .where(and(eq(trackerTasks.trackerId, trackerId), inArray(trackerTasks.id, taskIds)));

  await db
    .update(trackers)
    .set({ updatedAt: new Date() })
    .where(eq(trackers.id, trackerId));

  return mapHydrated(trackerId);
}
