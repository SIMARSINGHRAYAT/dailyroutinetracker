import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const trackers = pgTable("trackers", {
  id: uuid("id").defaultRandom().primaryKey(),
  deviceId: varchar("device_id", { length: 128 }).notNull().default("default"),
  name: varchar("name", { length: 160 }).notNull(),
  startDate: timestamp("start_date", { withTimezone: false, mode: "date" }),
  activeDays: integer("active_days").notNull().default(3),
  totalDaysEver: integer("total_days_ever").notNull().default(3),
  archived: boolean("archived").notNull().default(false),
  color: varchar("color", { length: 40 }).notNull().default("blue"),
  icon: varchar("icon", { length: 40 }).notNull().default("check-circle"),
  createdAt: timestamp("created_at", { withTimezone: false, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const trackerTasks = pgTable(
  "tracker_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trackerId: uuid("tracker_id")
      .notNull()
      .references(() => trackers.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    archived: boolean("archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: false, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("tracker_task_tracker_order_unique").on(t.trackerId, t.sortOrder)]
);

export const trackerCompletions = pgTable(
  "tracker_completions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trackerId: uuid("tracker_id")
      .notNull()
      .references(() => trackers.id, { onDelete: "cascade" }),
    taskId: uuid("task_id")
      .notNull()
      .references(() => trackerTasks.id, { onDelete: "cascade" }),
    dayIndex: integer("day_index").notNull(),
    completed: boolean("completed").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: false, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("tracker_completion_unique_cell").on(t.trackerId, t.taskId, t.dayIndex)]
);

export const reminderSettings = pgTable("reminder_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  trackerId: uuid("tracker_id")
    .notNull()
    .references(() => trackers.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(false),
  reminderTime: varchar("reminder_time", { length: 10 }).notNull().default("20:00"),
  daysOfWeek: jsonb("days_of_week").$type<number[]>().notNull().default([1, 2, 3, 4, 5, 6, 0]),
  quietHoursStart: varchar("quiet_hours_start", { length: 10 }).default("22:00"),
  quietHoursEnd: varchar("quiet_hours_end", { length: 10 }).default("07:00"),
  timezone: text("timezone").notNull().default("UTC"),
  updatedAt: timestamp("updated_at", { withTimezone: false, mode: "date" })
    .notNull()
    .defaultNow(),
});
