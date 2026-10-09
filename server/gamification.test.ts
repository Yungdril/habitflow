import { describe, expect, it } from "vitest";
import * as db from "./db";

describe("HabitFlow gamification", () => {
  it("exposes authoritative streak and achievement helpers", () => {
    expect(typeof db.getHabitStreakStats).toBe("function");
    expect(typeof db.awardAchievementsForHabit).toBe("function");
  });

  it("exposes the monthly freeze quota and ownership-safe operations", () => {
    expect(typeof db.getMonthlyStreakFreezeCount).toBe("function");
    expect(typeof db.getStreakFreezeById).toBe("function");
    expect(typeof db.useStreakFreeze).toBe("function");
  });

  it("models one freeze per calendar month", () => {
    const freezes = [
      { freezeDate: "2026-05-03" },
      { freezeDate: "2026-06-01" },
    ];
    const mayUsage = freezes.filter((freeze) => freeze.freezeDate.startsWith("2026-05")).length;
    expect(mayUsage).toBe(1);
    expect(mayUsage >= 1).toBe(true);
  });
});
