"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type Reminder } from "@/lib/api";

type Props = {
  trackerId: string;
  trackerName: string;
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function nowLocalTime() {
  return new Date().toTimeString().slice(0, 5);
}

export function ReminderPanel({ trackerId, trackerName }: Props) {
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setPermission(typeof Notification !== "undefined" ? Notification.permission : "denied");
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await api.getReminder(trackerId);
      if (mounted) {
        setReminder(data);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [trackerId]);

  useEffect(() => {
    if (!reminder?.enabled) return;

    const timer = window.setInterval(() => {
      const today = new Date();
      const day = today.getDay();
      const current = nowLocalTime();
      const key = `${today.toDateString()}-${trackerId}-${reminder.reminderTime}`;

      if (!reminder.daysOfWeek.includes(day)) return;
      if (current !== reminder.reminderTime) return;

      if (localStorage.getItem(key) === "sent") return;
      localStorage.setItem(key, "sent");

      if (permission === "granted") {
        new Notification("Your Daily Routine", {
          body: `Time to complete today's activities for ${trackerName}.`,
        });
      }
    }, 20000);

    return () => window.clearInterval(timer);
  }, [reminder, permission, trackerId, trackerName]);

  const supported = typeof Notification !== "undefined";

  const toggleDay = (day: number) => {
    if (!reminder) return;
    const next = reminder.daysOfWeek.includes(day)
      ? reminder.daysOfWeek.filter((d) => d !== day)
      : [...reminder.daysOfWeek, day];
    setReminder({ ...reminder, daysOfWeek: next });
  };

  const save = async () => {
    if (!reminder) return;
    const saved = await api.updateReminder(trackerId, {
      enabled: reminder.enabled,
      reminderTime: reminder.reminderTime,
      daysOfWeek: reminder.daysOfWeek,
      quietHoursStart: reminder.quietHoursStart,
      quietHoursEnd: reminder.quietHoursEnd,
      timezone: reminder.timezone,
    });
    setReminder(saved);
  };

  const supportMessage = useMemo(() => {
    if (!supported) return "Browser notifications are not supported on this device/browser.";
    if (permission === "denied") return "Notification permission denied. Enable in browser settings.";
    if (permission === "default") return "Notification permission not granted yet.";
    return "Notifications enabled for this browser.";
  }, [supported, permission]);

  if (loading || !reminder) {
    return <p className="text-sm text-[var(--muted)]">Loading reminder settings...</p>;
  }

  return (
    <div className="card mt-5 p-4">
      <h3 className="text-lg font-semibold">Reminder Settings</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">{supportMessage}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Closed-browser background scheduling requires push services + service workers and is not simulated with normal timers.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>Enable Reminders</span>
          <select
            value={reminder.enabled ? "yes" : "no"}
            onChange={(e) => setReminder({ ...reminder, enabled: e.target.value === "yes" })}
          >
            <option value="yes">Enabled</option>
            <option value="no">Disabled</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span>Reminder Time</span>
          <input
            type="time"
            value={reminder.reminderTime}
            onChange={(e) => setReminder({ ...reminder, reminderTime: e.target.value })}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Quiet Hours Start</span>
          <input
            type="time"
            value={reminder.quietHoursStart || "22:00"}
            onChange={(e) => setReminder({ ...reminder, quietHoursStart: e.target.value })}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Quiet Hours End</span>
          <input
            type="time"
            value={reminder.quietHoursEnd || "07:00"}
            onChange={(e) => setReminder({ ...reminder, quietHoursEnd: e.target.value })}
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm">Days of Week</p>
        <div className="flex flex-wrap gap-2">
          {dayNames.map((name, index) => {
            const active = reminder.daysOfWeek.includes(index);
            return (
              <button
                key={name}
                className={active ? "btn-primary !px-3 !py-1.5 text-xs" : "btn-secondary !px-3 !py-1.5 text-xs"}
                onClick={() => toggleDay(index)}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="btn-secondary"
          onClick={async () => {
            if (!supported) return;
            const value = await Notification.requestPermission();
            setPermission(value);
          }}
        >
          Request Permission
        </button>
        <button className="btn-primary" onClick={save}>
          Save Reminder
        </button>
      </div>
    </div>
  );
}
