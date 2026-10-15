"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Download, Flame } from "lucide-react";
import { useTrackers } from "@/components/tracker-provider";
import { api } from "@/lib/api";
import { computeDayDate, computeTrackerStats, isCellComplete } from "@/lib/tracker-math";
import { exportTrackerPdf } from "@/lib/pdf";

type Props = {
  trackerId: string;
};

function uniqueName(base: string, existing: string[]) {
  const cleaned = base.trim();
  if (!cleaned) return "Task";
  if (!existing.includes(cleaned.toLowerCase())) return cleaned;
  let n = 2;
  while (existing.includes(`${cleaned} (${n})`.toLowerCase())) n += 1;
  return `${cleaned} (${n})`;
}

export function TrackerProgressClient({ trackerId }: Props) {
  const { trackers, loading, setTrackers } = useTrackers();
  const tracker = trackers.find((t) => t.id === trackerId);
  const [saving, setSaving] = useState(false);

  const orderedTasks = useMemo(() => {
    if (!tracker) return [];
    return tracker.tasks.filter((t) => !t.archived).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [tracker]);

  const stats = useMemo(() => (tracker ? computeTrackerStats(tracker) : null), [tracker]);

  if (loading) {
    return <section className="mx-auto max-w-7xl px-4 py-8">Loading tracker...</section>;
  }

  if (!tracker || !stats) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-xl font-semibold">Tracker not found</p>
        <p className="mt-2 text-[var(--muted)]">This tracker may have been deleted or moved.</p>
        <Link href="/dashboard" className="btn-primary mt-5">
          Back to Dashboard
        </Link>
      </section>
    );
  }

  const visibleDays = Array.from({ length: tracker.activeDays }, (_, i) => i + 1);

  const replaceTracker = (next: typeof tracker) => {
    setTrackers((prev) => prev.map((t) => (t.id === trackerId ? next : t)));
  };

  const streak = stats.longestFullDayStreak;
  const badgeLabel = streak >= 10 ? "Legend Streak" : streak >= 5 ? "On Fire" : streak >= 1 ? "Starter Flame" : "No Streak Yet";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard" className="btn-secondary bg-transparent">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">{tracker.name}</h1>
          <p className="mt-2 text-[var(--muted)]">
            {tracker.activeDays} days • {orderedTasks.length} tasks • {stats.completionRate}% completed
          </p>
          <div className="progress-track mt-3 max-w-xl">
            <div className="progress-bar" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0.7, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.9 }}
          className="rounded-2xl border border-orange-300/40 bg-transparent px-4 py-3 text-right"
        >
          <p className="text-xs text-slate-300">Streak Badge</p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-orange-200">
            <Flame className="h-4 w-4" /> {badgeLabel}
          </p>
          <p className="text-xs text-slate-300">{streak} full-day streak</p>
        </motion.div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {[
          ["Total Days", stats.totalDays],
          ["Total Tasks", stats.totalTasks],
          ["Completed", stats.completedCells],
          ["Pending", stats.pendingCells],
          ["Completion Rate", `${stats.completionRate}%`],
          ["Full Days", stats.fullyCompletedDays],
        ].map(([label, value]) => (
          <article key={label} className="card p-3">
            <p className="text-xs text-[var(--muted)]">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
          </article>
        ))}
      </div>

      <div className="card mt-6 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            onClick={async () => {
              const raw = window.prompt("Task name", "");
              if (!raw) return;
              const name = uniqueName(
                raw,
                orderedTasks.map((t) => t.name.toLowerCase())
              );
              setSaving(true);
              try {
                const updated = await api.addTask(tracker.id, name);
                replaceTracker(updated);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            Add Task
          </button>

          <button
            className="btn-secondary"
            onClick={async () => {
              const amount = Number(window.prompt("How many days to add?", "1") || "0");
              if (!amount || amount < 1) return;
              setSaving(true);
              try {
                const updated = await api.addDays(tracker.id, amount);
                replaceTracker(updated);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            Add Day
          </button>

          <button
            className="btn-secondary"
            onClick={async () => {
              const list = orderedTasks.map((t, idx) => `${idx + 1}. ${t.name}`).join("\n");
              const which = Number(window.prompt(`Remove which task number?\n${list}`, "1") || "0");
              const picked = orderedTasks[which - 1];
              if (!picked) return;
              if (!window.confirm(`Remove task "${picked.name}"?`)) return;
              setSaving(true);
              try {
                const updated = await api.deleteTasks(tracker.id, [picked.id]);
                replaceTracker(updated);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            Remove Task
          </button>

          <button
            className="btn-secondary"
            onClick={async () => {
              if (tracker.activeDays <= 1) return;
              const day = Number(window.prompt(`Remove which day (1-${tracker.activeDays})?`, String(tracker.activeDays)) || "0");
              if (!day || day < 1 || day > tracker.activeDays) return;
              setSaving(true);
              try {
                if (day !== tracker.activeDays) {
                  await api.clearDay(tracker.id, day);
                }
                const updated = await api.updateTracker(tracker.id, {
                  activeDays: Math.max(1, tracker.activeDays - 1),
                });
                replaceTracker(updated);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            Remove Day
          </button>

          <button
            className="btn-secondary"
            onClick={async () => {
              const mode = (window.prompt("Edit what? Type: tracker or task", "tracker") || "tracker").toLowerCase();
              if (mode === "tracker") {
                const nextName = window.prompt("Tracker name", tracker.name) || tracker.name;
                const updated = await api.updateTracker(tracker.id, { name: nextName });
                replaceTracker(updated);
                return;
              }

              if (mode === "task") {
                const list = orderedTasks.map((t, idx) => `${idx + 1}. ${t.name}`).join("\n");
                const which = Number(window.prompt(`Edit which task number?\n${list}`, "1") || "0");
                const picked = orderedTasks[which - 1];
                if (!picked) return;
                const newNameRaw = window.prompt("New task name", picked.name);
                if (!newNameRaw) return;
                const newName = uniqueName(
                  newNameRaw,
                  orderedTasks.filter((t) => t.id !== picked.id).map((t) => t.name.toLowerCase())
                );
                const updated = await api.updateTask(tracker.id, picked.id, { name: newName });
                replaceTracker(updated);
              }
            }}
            disabled={saving}
          >
            Edit
          </button>
        </div>
      </div>

      <div className="table-shell mt-6">
        <table className="ydr-table">
          <thead>
            <tr>
              <th className="sticky-col min-w-[170px]">Day</th>
              {orderedTasks.map((task) => (
                <th key={task.id} className="min-w-[150px]">
                  <span className="text-sm font-medium">{task.name}</span>
                </th>
              ))}
              <th className="min-w-[130px]">Day Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleDays.map((dayIndex) => {
              const date = computeDayDate(tracker.startDate, dayIndex);
              const dayStat = stats.dayStats[dayIndex - 1];

              return (
                <tr key={dayIndex} id={`day-row-${dayIndex}`} className="hover:bg-white/5">
                  <td className="sticky-col font-medium">
                    <div>
                      <p>Day {dayIndex}</p>
                      {date && <p className="text-xs text-[var(--muted)]">{date.toLocaleDateString()}</p>}
                    </div>
                  </td>

                  {orderedTasks.map((task) => {
                    const checked = isCellComplete(tracker.completions, task.id, dayIndex);
                    return (
                      <td key={task.id}>
                        <label className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={async (e) => {
                              const updated = await api.toggleCompletion(tracker.id, {
                                dayIndex,
                                taskId: task.id,
                                completed: e.target.checked,
                              });
                              replaceTracker(updated);
                            }}
                            className="h-5 w-5 accent-emerald-500"
                            aria-label={`Day ${dayIndex} ${task.name}`}
                          />
                        </label>
                      </td>
                    );
                  })}

                  <td>
                    {dayStat.completedCount}/{dayStat.totalCount} • {dayStat.completionRate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link href={`/trackers/${tracker.id}/analytics`} className="btn-secondary">
          <BarChart3 className="mr-1 h-4 w-4" /> View Analytics
        </Link>
        <button className="btn-secondary" onClick={() => exportTrackerPdf(tracker, "progress")}>
          <Download className="mr-1 h-4 w-4" /> Export Progress PDF
        </button>
      </div>
    </section>
  );
}
