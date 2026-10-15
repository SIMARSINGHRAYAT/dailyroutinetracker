"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3, Download, Trash2 } from "lucide-react";
import type { TrackerHydrated } from "@/lib/tracker-math";
import { computeTrackerStats } from "@/lib/tracker-math";
import { useState } from "react";

type Props = {
  tracker: TrackerHydrated;
  onDelete: (trackerId: string) => Promise<void>;
  onExport: (tracker: TrackerHydrated, mode: "progress" | "analytics" | "complete") => Promise<void>;
};

export function TrackerCard({ tracker, onDelete, onExport }: Props) {
  const stats = computeTrackerStats(tracker);
  const [busy, setBusy] = useState(false);

  const status =
    stats.completedCells === 0 ? "Not Started" : stats.pendingCells === 0 ? "Completed" : "In Progress";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-white/20 bg-transparent p-4 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-blue-400/50"
    >
      <Link href={`/trackers/${tracker.id}`} className="block rounded-xl focus-visible:outline-none">
        <h3 className="text-lg font-semibold">{tracker.name}</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {tracker.activeDays} days • {stats.totalTasks} tasks • {stats.totalCells} total activities
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>{status}</span>
          <span>{stats.completionRate}%</span>
        </div>
        <div className="progress-track mt-2">
          <div className="progress-bar" style={{ width: `${stats.completionRate}%` }} />
        </div>
      </Link>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`/trackers/${tracker.id}`} className="btn-secondary text-sm bg-transparent">
          View Progress
        </Link>
        <Link href={`/trackers/${tracker.id}/analytics`} className="btn-secondary text-sm bg-transparent">
          <BarChart3 className="mr-1 h-4 w-4" /> Analytics
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <button className="btn-secondary bg-transparent" onClick={() => onExport(tracker, "complete")} disabled={busy}>
          <Download className="mr-1 h-3.5 w-3.5" /> Export PDF
        </button>

        <button
          className="btn-secondary bg-transparent text-red-300 hover:bg-red-500/10"
          onClick={async () => {
            if (!window.confirm("Delete this tracker permanently?")) return;
            setBusy(true);
            try {
              await onDelete(tracker.id);
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </motion.article>
  );
}
