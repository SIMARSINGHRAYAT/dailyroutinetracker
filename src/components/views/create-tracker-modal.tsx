"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X } from "lucide-react";

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
  const dateInputRef = useRef<HTMLInputElement>(null);

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
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="relative w-full max-w-xl md:max-w-3xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border border-white/20 bg-black/90 backdrop-blur-2xl shadow-2xl shadow-black/90 text-slate-100"
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 sm:px-7 py-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                Generate Tracker
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">Set up your routine duration, tasks, and schedule</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:border-white/25 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 space-y-5">
            <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-slate-300">Tracker Name</span>
                <input
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition"
                  placeholder="e.g. 30-Day Fitness Challenge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-slate-300">How Many Days Would You Like to Track?</span>
                <input
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition"
                  type="number"
                  min={1}
                  max={3650}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value || 1))}
                />
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-slate-300">How Many Tasks Would You Like to Track?</span>
                <input
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition"
                  type="number"
                  min={1}
                  max={60}
                  value={tasksCount}
                  onChange={(e) => setTasksCount(Math.max(1, Math.min(60, Number(e.target.value || 1))))}
                />
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-slate-300">Optional Start Date</span>
                <div className="relative flex items-center">
                  <input
                    ref={dateInputRef}
                    className="w-full rounded-xl border border-white/15 bg-black/60 pl-3.5 pr-11 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition cursor-pointer [color-scheme:dark]"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={() => {
                      try {
                        dateInputRef.current?.showPicker?.();
                      } catch {}
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        dateInputRef.current?.showPicker?.();
                      } catch {
                        dateInputRef.current?.focus();
                      }
                    }}
                    className="absolute right-2.5 flex items-center justify-center rounded-lg p-1.5 text-cyan-300 hover:text-cyan-100 hover:bg-white/10 transition"
                    title="Choose start date"
                    aria-label="Choose start date"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </label>
            </div>

            {/* Task list section */}
            <section className="mt-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">Task Names</p>
                <span className="text-xs text-slate-400">{visibleTasks.length} tasks</span>
              </div>
              <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                {visibleTasks.map((task, idx) => (
                  <label key={idx} className="space-y-1 text-sm">
                    <span className="text-xs text-slate-400">Task {idx + 1}</span>
                    <input
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition"
                      value={task}
                      onChange={(e) => updateTaskName(idx, e.target.value)}
                      placeholder="Please write your task"
                    />
                  </label>
                ))}
              </div>
            </section>

            {/* Live Preview */}
            <section className="rounded-xl border border-white/15 bg-black/50 p-3.5 sm:p-4 text-xs sm:text-sm backdrop-blur-sm">
              <p className="font-medium text-slate-200">Live Preview</p>
              <p className="mt-1 text-slate-400">
                <span className="text-cyan-300 font-semibold">{name || "Untitled Tracker"}</span> • {days} days • {tasksCount} tasks • {cells} activity cells
              </p>
            </section>

            {error && <p className="text-sm font-medium text-red-400">{error}</p>}
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-white/10 px-5 sm:px-7 py-3.5 bg-black/40 rounded-b-2xl sm:rounded-b-3xl">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-300/50 bg-transparent px-6 py-2.5 text-sm sm:text-base font-semibold text-cyan-200 transition hover:scale-[1.02] hover:bg-cyan-500/10 hover:border-cyan-300 disabled:opacity-50 disabled:pointer-events-none"
              onClick={submit}
              disabled={saving}
            >
              {saving ? "Creating..." : "+ Create Tracker"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
