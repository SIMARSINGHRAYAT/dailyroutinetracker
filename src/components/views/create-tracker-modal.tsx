"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    days: number;
    taskNames: string[];
    startDate: string | null;
  }) => Promise<void>;
};

const makeUnique = (names: string[]) => {
  const seen = new Map<string, number>();
  return names.map((raw) => {
    const base = raw.trim();
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
};

export function CreateTrackerModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [days, setDays] = useState(3);
  const [tasksCount, setTasksCount] = useState(5);
  const [taskNames, setTaskNames] = useState<string[]>(["", "", "", "", ""]);
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleTasks = useMemo(
    () => Array.from({ length: tasksCount }, (_, i) => taskNames[i] || ""),
    [taskNames, tasksCount]
  );

  const cells = days * tasksCount;

  if (!open) return null;

  const updateTaskName = (index: number, value: string) => {
    setTaskNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const submit = async () => {
    const sanitizedName = name.trim();
    const cleanedTasks = visibleTasks.map((t) => t.trim()).filter(Boolean);

    if (!sanitizedName) {
      setError("Please provide a tracker name.");
      return;
    }

    if (days < 1 || days > 3650) {
      setError("Days must be between 1 and 3650.");
      return;
    }

    if (cleanedTasks.length < 1) {
      setError("Please write your tasks.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onCreate({
        name: sanitizedName,
        days,
        taskNames: makeUnique(cleanedTasks),
        startDate: startDate || null,
      });
      setName("");
      setDays(3);
      setTasksCount(5);
      setTaskNames(["", "", "", "", ""]);
      setStartDate("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-transparent p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24, rotateX: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10, rotateX: 6 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          style={{ transformStyle: "preserve-3d", perspective: 1200 }}
          className="w-full max-w-3xl rounded-3xl border border-white/25 bg-transparent p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Generate Tracker</h2>
            <button onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Tracker Name</span>
              <input
                className="bg-transparent"
                placeholder="30-Day Coding Challenge"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>How Many Days Would You Like to Track?</span>
              <input
                className="bg-transparent"
                type="number"
                min={1}
                max={3650}
                value={days}
                onChange={(e) => setDays(Number(e.target.value || 1))}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>How Many Tasks Would You Like to Track?</span>
              <input
                className="bg-transparent"
                type="number"
                min={1}
                max={60}
                value={tasksCount}
                onChange={(e) => setTasksCount(Math.max(1, Math.min(60, Number(e.target.value || 1))))}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Optional Start Date</span>
              <input
                className="bg-transparent"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
          </div>

          <section className="mt-5">
            <p className="mb-2 text-sm font-medium">Task Names</p>
            <div className="grid gap-3 md:grid-cols-2">
              {visibleTasks.map((task, idx) => (
                <label key={idx} className="space-y-1 text-sm">
                  <span>Task {idx + 1}</span>
                  <input
                    className="bg-transparent"
                    value={task}
                    onChange={(e) => updateTaskName(idx, e.target.value)}
                    placeholder="Please write your task"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="mt-5 rounded-xl border border-white/20 bg-transparent p-4 text-sm">
            <p className="font-medium">Live Preview</p>
            <p className="mt-1 text-[var(--muted)]">
              {name || "Untitled Tracker"} • {days} days • {tasksCount} tasks • {cells} activity cells
            </p>
          </section>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <div className="mt-6 flex justify-end gap-2">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submit} disabled={saving}>
              {saving ? "Creating..." : "Create Tracker"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
