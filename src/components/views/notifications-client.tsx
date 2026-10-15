"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Reminder } from "@/lib/api";
import { useTrackers } from "@/components/tracker-provider";

export function NotificationsClient() {
  const { trackers } = useTrackers();
  const [map, setMap] = useState<Record<string, Reminder | null>>({});

  useEffect(() => {
    let mounted = true;

    (async () => {
      const entries = await Promise.all(
        trackers.map(async (tracker) => [tracker.id, await api.getReminder(tracker.id)] as const)
      );

      if (!mounted) return;
      setMap(Object.fromEntries(entries));
    })();

    return () => {
      mounted = false;
    };
  }, [trackers]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Notifications & Reminders</h1>
      <p className="mt-1 text-[var(--muted)]">Manage reminder coverage across all trackers.</p>

      {trackers.length === 0 ? (
        <div className="card mt-5 p-8 text-center">
          No trackers available yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {trackers.map((tracker) => {
            const reminder = map[tracker.id];
            return (
              <article key={tracker.id} className="card p-4">
                <h2 className="text-lg font-semibold">{tracker.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {reminder?.enabled ? `Enabled at ${reminder.reminderTime}` : "Reminders disabled"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Active days: {reminder?.daysOfWeek?.length ? reminder.daysOfWeek.join(", ") : "-"}
                </p>
                <Link className="btn-secondary mt-3" href={`/trackers/${tracker.id}`}>
                  Open Reminder Settings
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
