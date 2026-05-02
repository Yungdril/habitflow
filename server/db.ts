import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, habits, habitTracking, Habit, InsertHabit, HabitTracking, InsertHabitTracking } from "../drizzle/schema";
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
  if (!db) return undefined;
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
  return result.length > 0 ? result[0] : undefined;
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
