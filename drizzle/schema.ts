import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, boolean, decimal, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Habits table: stores user habits with metadata like name, color, icon, and frequency.
 */
export const habits = mysqlTable(
  "habits",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    color: varchar("color", { length: 7 }).default("#3b82f6").notNull(), // hex color
    icon: varchar("icon", { length: 64 }).default("circle").notNull(), // lucide-react icon name
    frequency: mysqlEnum("frequency", ["daily", "weekly", "custom"]).default("daily").notNull(),
    targetDaysPerWeek: int("targetDaysPerWeek").default(7),
    currentStreak: int("currentStreak").default(0).notNull(),
    longestStreak: int("longestStreak").default(0).notNull(),
    totalCompletions: int("totalCompletions").default(0).notNull(),
    lastCompletedDate: date("lastCompletedDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userIdIdx").on(table.userId),
  })
);

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;

/**
 * Habit tracking table: stores daily completion records for each habit.
 * Each record represents one day's completion status for a habit.
 */
export const habitTracking = mysqlTable(
  "habit_tracking",
  {
    id: int("id").autoincrement().primaryKey(),
    habitId: int("habitId").notNull(),
    userId: int("userId").notNull(),
    completedDate: date("completedDate").notNull(),
    completed: boolean("completed").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    habitIdIdx: index("habitIdIdx").on(table.habitId),
    userIdIdx: index("userIdIdx").on(table.userId),
    completedDateIdx: index("completedDateIdx").on(table.completedDate),
  })
);

export type HabitTracking = typeof habitTracking.$inferSelect;
export type InsertHabitTracking = typeof habitTracking.$inferInsert;

/**
 * Relations: define relationships between tables for Drizzle ORM.
 */
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  trackings: many(habitTracking),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  trackings: many(habitTracking),
}));

export const habitTrackingRelations = relations(habitTracking, ({ one }) => ({
  habit: one(habits, {
    fields: [habitTracking.habitId],
    references: [habits.id],
  }),
  user: one(users, {
    fields: [habitTracking.userId],
    references: [users.id],
  }),
}));

/**
 * Notifications table: stores in-app notifications for pending habits and other events.
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    habitId: int("habitId"),
    type: mysqlEnum("type", ["pending_habit", "streak_milestone", "reminder", "achievement"]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    read: boolean("read").default(false).notNull(),
    dismissed: boolean("dismissed").default(false).notNull(),
    actionUrl: varchar("actionUrl", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"),
  },
  (table) => ({
    userIdIdx: index("notif_userIdIdx").on(table.userId),
    habitIdIdx: index("notif_habitIdIdx").on(table.habitId),
    createdAtIdx: index("notif_createdAtIdx").on(table.createdAt),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification preferences table: stores user notification settings.
 */
export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    enablePendingHabits: boolean("enablePendingHabits").default(true).notNull(),
    enableStreakMilestones: boolean("enableStreakMilestones").default(true).notNull(),
    enableReminders: boolean("enableReminders").default(true).notNull(),
    enableAchievements: boolean("enableAchievements").default(true).notNull(),
    reminderTime: varchar("reminderTime", { length: 5 }).default("09:00"),
    timezone: varchar("timezone", { length: 64 }).default("UTC"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("pref_userIdIdx").on(table.userId),
  })
);

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;

/**
 * Relations for notifications.
 */
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  habit: one(habits, {
    fields: [notifications.habitId],
    references: [habits.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));
