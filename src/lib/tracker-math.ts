export type TaskRecord = {
  id: string;
  name: string;
  sortOrder: number;
  archived: boolean;
};

export type CompletionRecord = {
  taskId: string;
  dayIndex: number;
  completed: boolean;
};

export type TrackerCore = {
  id: string;
  name: string;
  startDate: string | null;
  activeDays: number;
  totalDaysEver: number;
  archived: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackerHydrated = TrackerCore & {
  tasks: TaskRecord[];
  completions: CompletionRecord[];
};

export type DayStats = {
  dayIndex: number;
  completedCount: number;
  totalCount: number;
  completionRate: number;
};

export type TaskStats = {
  taskId: string;
  taskName: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
};

export type TrackerStats = {
  totalDays: number;
  totalTasks: number;
  totalCells: number;
  completedCells: number;
  pendingCells: number;
  completionRate: number;
  fullyCompletedDays: number;
  averageDailyCompletion: number;
  longestFullDayStreak: number;
  dayStats: DayStats[];
  taskStats: TaskStats[];
};

const round = (v: number) => Math.round(v * 100) / 100;

const rate = (numerator: number, denominator: number) => {
  if (!denominator) return 0;
  return round((numerator / denominator) * 100);
};

export function computeDayDate(startDate: string | null, dayIndex: number) {
  if (!startDate) return null;
  const base = new Date(startDate);
  const d = new Date(base);
  d.setDate(base.getDate() + dayIndex - 1);
  return d;
}

export function isCellComplete(
  completions: CompletionRecord[],
  taskId: string,
  dayIndex: number
) {
  return completions.some(
    (c) => c.taskId === taskId && c.dayIndex === dayIndex && c.completed
  );
}

export function computeTrackerStats(tracker: TrackerHydrated): TrackerStats {
  const activeTasks = tracker.tasks.filter((t) => !t.archived).sort((a, b) => a.sortOrder - b.sortOrder);
  const totalDays = tracker.activeDays;
  const totalTasks = activeTasks.length;
  const totalCells = totalDays * totalTasks;

  const completionSet = new Set(
    tracker.completions
      .filter((c) => c.completed && c.dayIndex <= totalDays)
      .map((c) => `${c.taskId}:${c.dayIndex}`)
  );

  const completedCells = [...completionSet].filter((key) => {
    const taskId = key.split(":")[0];
    return activeTasks.some((t) => t.id === taskId);
  }).length;

  const pendingCells = Math.max(0, totalCells - completedCells);

  const dayStats: DayStats[] = Array.from({ length: totalDays }, (_, i) => i + 1).map((dayIndex) => {
    const completedCount = activeTasks.reduce(
      (sum, task) => sum + (completionSet.has(`${task.id}:${dayIndex}`) ? 1 : 0),
      0
    );

    return {
      dayIndex,
      completedCount,
      totalCount: totalTasks,
      completionRate: rate(completedCount, totalTasks),
    };
  });

  const taskStats: TaskStats[] = activeTasks.map((task) => {
    const completedCount = dayStats.reduce(
      (sum, d) => sum + (completionSet.has(`${task.id}:${d.dayIndex}`) ? 1 : 0),
      0
    );

    return {
      taskId: task.id,
      taskName: task.name,
      completedCount,
      totalCount: totalDays,
      completionRate: rate(completedCount, totalDays),
    };
  });

  const fullyCompletedDays = dayStats.filter((d) => totalTasks > 0 && d.completedCount === totalTasks).length;

  let longest = 0;
  let current = 0;
  dayStats.forEach((d) => {
    if (totalTasks > 0 && d.completedCount === totalTasks) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });

  return {
    totalDays,
    totalTasks,
    totalCells,
    completedCells,
    pendingCells,
    completionRate: rate(completedCells, totalCells),
    fullyCompletedDays,
    averageDailyCompletion: rate(
      dayStats.reduce((sum, d) => sum + d.completionRate, 0),
      dayStats.length
    ),
    longestFullDayStreak: longest,
    dayStats,
    taskStats,
  };
}
