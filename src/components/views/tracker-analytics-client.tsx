"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Download, Table2 } from "lucide-react";
import { useMemo } from "react";
import { useTrackers } from "@/components/tracker-provider";
import { computeTrackerStats } from "@/lib/tracker-math";
import { exportTrackerPdf } from "@/lib/pdf";

type Props = {
  trackerId: string;
};

const heat = (value: number) => {
  if (value === 0) return "rgba(148, 163, 184, 0.25)";
  if (value < 40) return "rgba(59, 130, 246, 0.35)";
  if (value < 80) return "rgba(59, 130, 246, 0.65)";
  return "rgba(16, 185, 129, 0.75)";
};

export function TrackerAnalyticsClient({ trackerId }: Props) {
  const { trackers, loading } = useTrackers();
  const tracker = trackers.find((t) => t.id === trackerId);
  const stats = useMemo(() => (tracker ? computeTrackerStats(tracker) : null), [tracker]);

  if (loading) return <section className="mx-auto max-w-7xl px-4 py-8">Loading analytics...</section>;

  if (!tracker || !stats) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-xl font-semibold">Tracker not found</p>
        <Link className="btn-primary mt-4" href="/dashboard">
          Back to Dashboard
        </Link>
      </section>
    );
  }

  const hasProgress = stats.completedCells > 0;

  const pieData = [
    { name: "Completed", value: stats.completedCells },
    { name: "Pending", value: stats.pendingCells },
  ];

  const bestTask = [...stats.taskStats].sort((a, b) => b.completionRate - a.completionRate)[0];
  const lowTask = [...stats.taskStats].sort((a, b) => a.completionRate - b.completionRate)[0];
  const bestDay = [...stats.dayStats].sort((a, b) => b.completionRate - a.completionRate)[0];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard" className="btn-secondary">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </Link>
            <Link href={`/trackers/${tracker.id}`} className="btn-secondary">
              <Table2 className="mr-1 h-4 w-4" /> View Progress
            </Link>
            <button className="btn-secondary" onClick={() => exportTrackerPdf(tracker, "analytics")}>
              <Download className="mr-1 h-4 w-4" /> Export Analytics PDF
            </button>
          </div>
          <h1 className="mt-4 text-3xl font-semibold">{tracker.name} — Performance Analytics</h1>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Overall Completion", `${stats.completionRate}%`],
          ["Average Daily Completion", `${stats.averageDailyCompletion}%`],
          ["Fully Completed Days", stats.fullyCompletedDays],
          ["Task Consistency", `${Math.round((stats.taskStats.reduce((s, t) => s + t.completionRate, 0) / Math.max(stats.taskStats.length, 1)) * 100) / 100}%`],
          ["Longest Full-Day Streak", `${stats.longestFullDayStreak} days`],
        ].map(([label, value]) => (
          <article key={label} className="card p-3">
            <p className="text-xs text-[var(--muted)]">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
          </article>
        ))}
      </div>

      {!hasProgress ? (
        <div className="card mt-5 p-8 text-center">
          <p className="text-lg font-medium">No progress data yet</p>
          <p className="mt-1 text-[var(--muted)]">
            Start checking tasks in View Progress to unlock charts and insights.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <article className="card p-4">
              <h3 className="mb-3 text-lg font-semibold">Daily Completion Bar Chart</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dayStats.map((d) => ({ day: `D${d.dayIndex}`, rate: d.completionRate }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="card p-4">
              <h3 className="mb-3 text-lg font-semibold">Task-Wise Performance Chart</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.taskStats.map((t) => ({ task: t.taskName, rate: t.completionRate }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                    <XAxis dataKey="task" angle={-15} height={70} interval={0} textAnchor="end" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="card p-4">
              <h3 className="mb-3 text-lg font-semibold">Performance Trend Line</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dayStats.map((d) => ({ day: `D${d.dayIndex}`, rate: d.completionRate }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="card p-4">
              <h3 className="mb-3 text-lg font-semibold">Overall Completion Doughnut Chart</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100}>
                      {pieData.map((entry, idx) => (
                        <Cell key={entry.name} fill={idx === 0 ? "#10b981" : "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <article className="card mt-4 p-4">
            <h3 className="text-lg font-semibold">Consistency Heatmap</h3>
            <div className="mt-3 grid grid-cols-7 gap-2 md:grid-cols-14">
              {stats.dayStats.map((d) => (
                <div
                  key={d.dayIndex}
                  className="rounded-md border p-2 text-center text-xs"
                  style={{ background: heat(d.completionRate) }}
                  title={`Day ${d.dayIndex}: ${d.completedCount}/${d.totalCount} (${d.completionRate}%)`}
                >
                  D{d.dayIndex}
                </div>
              ))}
            </div>
          </article>

          <article className="card mt-4 p-4">
            <h3 className="text-lg font-semibold">Streak & Insights</h3>
            <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
              <li>Longest full-completion streak: {stats.longestFullDayStreak} day(s)</li>
              {bestTask && <li>Most consistent task: {bestTask.taskName} ({bestTask.completionRate}%)</li>}
              {lowTask && <li>Least completed task: {lowTask.taskName} ({lowTask.completionRate}%)</li>}
              {bestDay && <li>Highest-performing day: Day {bestDay.dayIndex} ({bestDay.completionRate}%)</li>}
            </ul>
          </article>
        </>
      )}
    </section>
  );
}
