"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTrackers } from "@/components/tracker-provider";
import { CreateTrackerModal } from "@/components/views/create-tracker-modal";
import { TrackerCard } from "@/components/views/tracker-card";
import { api } from "@/lib/api";
import { computeTrackerStats } from "@/lib/tracker-math";
import { exportTrackerPdf } from "@/lib/pdf";

export function DashboardClient() {
  const { trackers, loading, setTrackers } = useTrackers();
  const [openCreate, setOpenCreate] = useState(false);

  const list = useMemo(
    () => [...trackers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [trackers]
  );

  const summary = useMemo(() => {
    const stats = trackers.map((t) => computeTrackerStats(t));
    const totalTrackers = trackers.length;
    const completedActivities = stats.reduce((sum, s) => sum + s.completedCells, 0);
    const totalCells = stats.reduce((sum, s) => sum + s.totalCells, 0);
    const completion = totalCells ? Math.round((completedActivities / totalCells) * 10000) / 100 : 0;

    return {
      totalTrackers,
      completedActivities,
      completion,
      active: trackers.filter((t) => !t.archived).length,
    };
  }, [trackers]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300 bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
          Build Your Winning Streak
        </h1>
        <p className="mt-3 text-slate-300/90">
          Add trackers, complete actions daily, and keep your momentum visible.
        </p>
      </motion.div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center justify-center rounded-xl border border-cyan-300/50 bg-transparent px-5 py-2.5 font-semibold text-cyan-200 transition hover:scale-[1.02]"
          onClick={() => setOpenCreate(true)}
        >
          + Generate Tracker
        </button>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Trackers", value: summary.totalTrackers, tone: "from-purple-300 to-pink-300" },
          { label: "Active Trackers", value: summary.active, tone: "from-sky-300 to-blue-300" },
          {
            label: "Total Activities Completed",
            value: summary.completedActivities,
            tone: "from-emerald-300 to-teal-300",
          },
          { label: "Overall Completion Rate", value: `${summary.completion}%`, tone: "from-yellow-300 to-orange-300" },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-white/20 bg-transparent p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-slate-300/85">{item.label}</p>
            <p className={`mt-2 bg-gradient-to-r ${item.tone} bg-clip-text text-2xl font-semibold text-transparent`}>
              {item.value}
            </p>
          </article>
        ))}
      </div>

      {loading ? (
        <p className="mt-10 text-slate-300">Loading trackers...</p>
      ) : list.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((tracker) => (
            <TrackerCard
              key={tracker.id}
              tracker={tracker}
              onDelete={async (trackerId) => {
                await api.deleteTracker(trackerId);
                setTrackers((prev) => prev.filter((t) => t.id !== trackerId));
              }}
              onExport={async (item, mode) => {
                await exportTrackerPdf(item, mode);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-white/20 bg-transparent p-8 text-center backdrop-blur-sm">
          <p className="text-lg font-medium text-slate-100">No trackers yet</p>
          <p className="mt-2 text-slate-300">Generate your first tracker to begin your consistency journey.</p>
        </div>
      )}

      <CreateTrackerModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={async (payload) => {
          const created = await api.createTracker(payload);
          setTrackers((prev) => [created, ...prev]);
        }}
      />
    </section>
  );
}
