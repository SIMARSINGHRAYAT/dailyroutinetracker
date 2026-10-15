"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TrackerHydrated } from "@/lib/tracker-math";
import { computeDayDate, computeTrackerStats, isCellComplete } from "@/lib/tracker-math";

function formatDate(input: string | null) {
  if (!input) return "N/A";
  return new Date(input).toLocaleDateString();
}

export async function exportTrackerPdf(
  tracker: TrackerHydrated,
  mode: "progress" | "analytics" | "complete"
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const stats = computeTrackerStats(tracker);
  const tasks = tracker.tasks.filter((t) => !t.archived).sort((a, b) => a.sortOrder - b.sortOrder);

  const title = "YOUR DAILY ROUTINE";
  doc.setFontSize(22);
  doc.text(title, 40, 40);
  doc.setFontSize(12);
  doc.text(`${tracker.name} • ${mode.toUpperCase()} REPORT`, 40, 62);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 80);

  doc.text(`Days: ${tracker.activeDays}`, 40, 102);
  doc.text(`Tasks: ${tasks.length}`, 140, 102);
  doc.text(`Completion: ${stats.completionRate}%`, 240, 102);

  let currentY = 120;

  if (mode === "progress" || mode === "complete") {
    const head = ["Day", ...tasks.map((t) => t.name)];
    const body = Array.from({ length: tracker.activeDays }, (_, idx) => {
      const dayIndex = idx + 1;
      const date = computeDayDate(tracker.startDate, dayIndex);
      const label = date
        ? `Day ${dayIndex} (${date.toLocaleDateString()})`
        : `Day ${dayIndex}`;

      return [
        label,
        ...tasks.map((task) => (isCellComplete(tracker.completions, task.id, dayIndex) ? "✓" : "—")),
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [head],
      body,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255] },
      margin: { left: 35, right: 35 },
      theme: "grid",
    });

    currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? currentY;
    currentY += 20;
  }

  if (mode === "analytics" || mode === "complete") {
    autoTable(doc, {
      startY: currentY,
      head: [["Metric", "Value"]],
      body: [
        ["Overall Completion Rate", `${stats.completionRate}%`],
        ["Completed Activities", String(stats.completedCells)],
        ["Pending Activities", String(stats.pendingCells)],
        ["Fully Completed Days", String(stats.fullyCompletedDays)],
        ["Average Daily Completion", `${stats.averageDailyCompletion}%`],
        ["Longest Full-Day Streak", `${stats.longestFullDayStreak} days`],
        ["Start Date", formatDate(tracker.startDate)],
      ],
      theme: "striped",
      styles: { fontSize: 10 },
      margin: { left: 35, right: 35 },
    });

    currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? currentY;

    autoTable(doc, {
      startY: currentY + 16,
      head: [["Task", "Completed Days", "Total Days", "Rate"]],
      body: stats.taskStats.map((task) => [
        task.taskName,
        String(task.completedCount),
        String(task.totalCount),
        `${task.completionRate}%`,
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      margin: { left: 35, right: 35 },
    });
  }

  const fileName = `${tracker.name.replace(/\s+/g, "-").toLowerCase()}-${mode}-report.pdf`;
  doc.save(fileName);
}
