import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, habits, habitTracking, Habit, InsertHabit, HabitTracking, InsertHabitTracking, notifications, notificationPreferences, Notification, InsertNotification, NotificationPreferences, InsertNotificationPreferences, streakFreezes, achievements, StreakFreeze, InsertStreakFreeze, Achievement, InsertAchievement } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ HABIT QUERIES ============

export async function getUserHabits(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(habits).where(eq(habits.userId, userId)).orderBy(desc(habits.updatedAt));
}

export async function getHabitById(habitId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createHabit(habit: InsertHabit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(habits).values(habit);
  return result;
}

export async function updateHabit(habitId: number, userId: number, updates: Partial<Habit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(habits)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
}

export async function deleteHabit(habitId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(habitTracking).where(eq(habitTracking.habitId, habitId));
  return db.delete(habits).where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
}

// ============ HABIT TRACKING QUERIES ============

export async function getTrackingForDate(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  const dateStr = date.toISOString().split("T")[0];
  return db
    .select()
    .from(habitTracking)
    .where(and(eq(habitTracking.userId, userId), eq(habitTracking.completedDate, dateStr as any)))
    .orderBy(desc(habitTracking.createdAt));
}

export async function getTrackingForHabitAndDate(habitId: number, userId: number, date: Date) {
  const db = await getDb();
  if (!db) return null;
  const dateStr = date.toISOString().split("T")[0];
  const result = await db
    .select()
    .from(habitTracking)
    .where(
      and(
        eq(habitTracking.habitId, habitId),
        eq(habitTracking.userId, userId),
        eq(habitTracking.completedDate, dateStr as any)
      )
    )
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getHabitTrackingHistory(habitId: number, userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];
  return db
    .select()
    .from(habitTracking)
    .where(
      and(
        eq(habitTracking.habitId, habitId),
        eq(habitTracking.userId, userId),
        gte(habitTracking.completedDate, startStr as any),
        lte(habitTracking.completedDate, endStr as any)
      )
    )
    .orderBy(desc(habitTracking.completedDate));
}

export async function upsertTracking(tracking: InsertHabitTracking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const dateStr = tracking.completedDate instanceof Date 
    ? tracking.completedDate.toISOString().split("T")[0]
    : tracking.completedDate;
  
  const existing = await db
    .select()
    .from(habitTracking)
    .where(
      and(
        eq(habitTracking.habitId, tracking.habitId),
        eq(habitTracking.userId, tracking.userId),
        eq(habitTracking.completedDate, dateStr as any)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return db
      .update(habitTracking)
      .set({ completed: tracking.completed, updatedAt: new Date() })
      .where(eq(habitTracking.id, existing[0].id));
  } else {
    return db.insert(habitTracking).values(tracking);
  }
}

export async function getCompletionStats(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return { totalHabits: 0, completedToday: 0, completionRate: 0 };
  
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];
  
  const userHabits = await db.select().from(habits).where(eq(habits.userId, userId));
  const completedCount = await db
    .select({ count: sql`COUNT(*)` })
    .from(habitTracking)
    .where(
      and(
        eq(habitTracking.userId, userId),
        eq(habitTracking.completed, true),
        gte(habitTracking.completedDate, startStr as any),
        lte(habitTracking.completedDate, endStr as any)
      )
    );

  const totalHabits = userHabits.length;
  const completed = (completedCount[0]?.count as number) || 0;
  const completionRate = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;

  return { totalHabits, completedToday: completed, completionRate };
}

export async function getWeeklySummary(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  const result = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const weekStart = new Date(current);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startStr = weekStart.toISOString().split("T")[0];
    const endStr = weekEnd.toISOString().split("T")[0];

    const completed = await db
      .select({ count: sql`COUNT(*)` })
      .from(habitTracking)
      .where(
        and(
          eq(habitTracking.userId, userId),
          eq(habitTracking.completed, true),
          gte(habitTracking.completedDate, startStr as any),
          lte(habitTracking.completedDate, endStr as any)
        )
      );

    result.push({
      week: `Week of ${startStr}`,
      completed: (completed[0]?.count as number) || 0,
    });

    current.setDate(current.getDate() + 7);
  }

  return result;
}

export async function getMonthlySummary(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  const result = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= endDate) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    const startStr = monthStart.toISOString().split("T")[0];
    const endStr = monthEnd.toISOString().split("T")[0];

    const completed = await db
      .select({ count: sql`COUNT(*)` })
      .from(habitTracking)
      .where(
        and(
          eq(habitTracking.userId, userId),
          eq(habitTracking.completed, true),
          gte(habitTracking.completedDate, startStr as any),
          lte(habitTracking.completedDate, endStr as any)
        )
      );

    result.push({
      month: monthStart.toLocaleString("default", { month: "long", year: "numeric" }),
      completed: (completed[0]?.count as number) || 0,
    });

    current.setMonth(current.getMonth() + 1);
  }

  return result;
}


// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

export async function createNotification(notification: InsertNotification): Promise<Notification | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(notifications).values(notification);
  const inserted = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, (result as any).insertId))
    .limit(1);

  return inserted.length > 0 ? inserted[0] : null;
}

export async function getUserNotifications(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.dismissed, false)))
    .orderBy(sql`${notifications.createdAt} DESC`)
    .limit(limit);
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  return db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function dismissNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  return db
    .update(notifications)
    .set({ dismissed: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false), eq(notifications.dismissed, false)));

  return (result[0]?.count as number) || 0;
}

export async function getPendingHabitsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const today = new Date().toISOString().split("T")[0];

  // Get all habits for the user
  const userHabits = await db.select().from(habits).where(eq(habits.userId, userId));

  // Check which ones are not completed today
  const completedToday = await db
    .select({ habitId: habitTracking.habitId })
    .from(habitTracking)
    .where(
      and(
        eq(habitTracking.userId, userId),
        eq(habitTracking.completed, true),
        eq(habitTracking.completedDate, today as any)
      )
    );

  const completedIds = new Set(completedToday.map((t) => t.habitId));
  return userHabits.filter((h) => !completedIds.has(h.id));
}

export async function getOrCreateNotificationPreferences(userId: number): Promise<NotificationPreferences> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create default preferences
  await db.insert(notificationPreferences).values({
    userId,
    enablePendingHabits: true,
    enableStreakMilestones: true,
    enableReminders: true,
    enableAchievements: true,
    reminderTime: "09:00",
    timezone: "UTC",
  });

  const created = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  return created[0];
}

export async function updateNotificationPreferences(userId: number, updates: Partial<InsertNotificationPreferences>) {
  const db = await getDb();
  if (!db) return null;

  return db
    .update(notificationPreferences)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(notificationPreferences.userId, userId));
}

export async function getNotificationPreferences(userId: number): Promise<NotificationPreferences | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


// ============================================================================
// Streak Freeze Functions
// ============================================================================

export async function createStreakFreeze(data: InsertStreakFreeze): Promise<StreakFreeze | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(streakFreezes).values(data);
  if (!result || !result[0]) return null;

  const freeze = await db
    .select()
    .from(streakFreezes)
    .where(eq(streakFreezes.habitId, data.habitId))
    .orderBy(desc(streakFreezes.createdAt))
    .limit(1);

  return freeze.length > 0 ? freeze[0] : null;
}

export async function getStreakFreezesForHabit(habitId: number, userId: number): Promise<StreakFreeze[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(streakFreezes)
    .where(and(eq(streakFreezes.habitId, habitId), eq(streakFreezes.userId, userId)))
    .orderBy(desc(streakFreezes.freezeDate));
}

export async function getUnusedStreakFreeze(habitId: number, userId: number): Promise<StreakFreeze | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(streakFreezes)
    .where(
      and(
        eq(streakFreezes.habitId, habitId),
        eq(streakFreezes.userId, userId),
        sql`${streakFreezes.usedAt} IS NULL`
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function useStreakFreeze(freezeId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(streakFreezes)
    .set({ usedAt: new Date() })
    .where(eq(streakFreezes.id, freezeId));
}

// ============================================================================
// Achievement Functions
// ============================================================================

export async function createAchievement(data: InsertAchievement): Promise<Achievement | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(achievements).values(data);
  if (!result || !result[0]) return null;

  const achievement = await db
    .select()
    .from(achievements)
    .where(and(eq(achievements.userId, data.userId), eq(achievements.badgeId, data.badgeId)))
    .orderBy(desc(achievements.createdAt))
    .limit(1);

  return achievement.length > 0 ? achievement[0] : null;
}

export async function getUserAchievements(userId: number): Promise<Achievement[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.earnedAt));
}

export async function checkAchievementExists(userId: number, badgeId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(achievements)
    .where(and(eq(achievements.userId, userId), eq(achievements.badgeId, badgeId)))
    .limit(1);

  return result.length > 0;
}

export async function getAchievementsByCategory(userId: number, category: string): Promise<Achievement[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(achievements)
    .where(and(eq(achievements.userId, userId), eq(achievements.category, category as any)))
    .orderBy(desc(achievements.earnedAt));
}
