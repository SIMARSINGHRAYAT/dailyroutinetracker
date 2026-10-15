import type { TrackerHydrated } from "@/lib/tracker-math";

export type Reminder = {
  id: string;
  trackerId: string;
  enabled: boolean;
  reminderTime: string;
  daysOfWeek: number[];
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  timezone: string;
  updatedAt: string;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.error || "Request failed");
  }

  return json.data as T;
}

export const api = {
  listTrackers: () => request<TrackerHydrated[]>("/api/trackers"),
  createTracker: (payload: {
    name: string;
    days: number;
    taskNames: string[];
    startDate?: string | null;
    color?: string;
    icon?: string;
  }) => request<TrackerHydrated>("/api/trackers", { method: "POST", body: JSON.stringify(payload) }),
  updateTracker: (id: string, payload: Record<string, unknown>) =>
    request<TrackerHydrated>(`/api/trackers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteTracker: (id: string) =>
    request<{ ok: boolean }>(`/api/trackers/${id}`, { method: "DELETE" }),
  duplicateTracker: (id: string, copyHistory: boolean) =>
    request<TrackerHydrated>(`/api/trackers/${id}/duplicate`, {
      method: "POST",
      body: JSON.stringify({ copyHistory }),
    }),
  addTask: (id: string, name: string) =>
    request<TrackerHydrated>(`/api/trackers/${id}/tasks`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  updateTask: (id: string, taskId: string, payload: Record<string, unknown>) =>
    request<TrackerHydrated>(`/api/trackers/${id}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  reorderTasks: (id: string, items: Array<{ id: string; sortOrder: number }>) =>
    request<TrackerHydrated>(`/api/trackers/${id}/tasks`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),
  deleteTasks: (id: string, taskIds: string[]) =>
    request<TrackerHydrated>(`/api/trackers/${id}/tasks`, {
      method: "DELETE",
      body: JSON.stringify({ taskIds }),
    }),
  addDays: (id: string, additionalDays: number) =>
    request<TrackerHydrated>(`/api/trackers/${id}/days`, {
      method: "POST",
      body: JSON.stringify({ additionalDays }),
    }),
  toggleCompletion: (id: string, payload: { taskId: string; dayIndex: number; completed: boolean }) =>
    request<TrackerHydrated>(`/api/trackers/${id}/completions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  clearAll: (id: string) =>
    request<TrackerHydrated>(`/api/trackers/${id}/completions`, {
      method: "POST",
      body: JSON.stringify({ action: "clear-all" }),
    }),
  clearDay: (id: string, dayIndex: number) =>
    request<TrackerHydrated>(`/api/trackers/${id}/completions`, {
      method: "POST",
      body: JSON.stringify({ action: "clear-day", dayIndex }),
    }),
  getReminder: (id: string) => request<Reminder | null>(`/api/trackers/${id}/reminder`),
  updateReminder: (id: string, payload: Record<string, unknown>) =>
    request<Reminder>(`/api/trackers/${id}/reminder`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  importBackup: (trackers: TrackerHydrated[]) =>
    request<TrackerHydrated[]>("/api/trackers", {
      method: "POST",
      body: JSON.stringify({ mode: "import", trackers }),
    }),
};
