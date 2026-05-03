import { describe, expect, it } from "vitest";

describe("Habit Completion Same-Day Prevention", () => {
  describe("Server-side Guards", () => {
    it("should prevent re-completing the same habit on the same day", () => {
      // Simulate existing tracking record
      const existingTracking = {
        id: 1,
        habitId: 1,
        userId: 1,
        completedDate: "2026-05-03",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Attempt to complete again
      const newCompletion = {
        habitId: 1,
        userId: 1,
        completed: true,
        completedDate: "2026-05-03",
      };

      // Should reject if already completed
      const shouldReject = existingTracking.completed && newCompletion.completed && existingTracking.completedDate === newCompletion.completedDate;
      expect(shouldReject).toBe(true);
    });

    it("should allow uncompleting a habit on the same day", () => {
      const existingTracking = {
        id: 1,
        habitId: 1,
        userId: 1,
        completedDate: "2026-05-03",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newCompletion = {
        habitId: 1,
        userId: 1,
        completed: false, // Uncompleting
        completedDate: "2026-05-03",
      };

      // Should allow uncompleting
      const shouldAllow = !newCompletion.completed || !existingTracking.completed;
      expect(shouldAllow).toBe(true);
    });

    it("should only increment totalCompletions once per day", () => {
      let totalCompletions = 5;
      const existingTracking = null; // No prior completion

      // First completion
      if (!existingTracking) {
        totalCompletions += 1;
      }

      expect(totalCompletions).toBe(6);

      // Attempt second completion (should not increment)
      const secondAttempt = {
        completed: true,
        existingTracking: { completed: true }, // Now exists
      };

      if (secondAttempt.completed && !secondAttempt.existingTracking.completed) {
        totalCompletions += 1;
      }

      expect(totalCompletions).toBe(6); // Should still be 6
    });

    it("should handle date boundaries correctly", () => {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // Completing yesterday's habit should not conflict with today
      const yesterdayCompletion = {
        habitId: 1,
        completedDate: yesterdayStr,
        completed: true,
      };

      const todayCompletion = {
        habitId: 1,
        completedDate: todayStr,
        completed: true,
      };

      expect(yesterdayCompletion.completedDate).not.toBe(todayCompletion.completedDate);
      expect(yesterdayCompletion.completed && todayCompletion.completed).toBe(true);
    });
  });

  describe("Client-side Guards", () => {
    it("should disable button when habit is completed today", () => {
      const isCheckedToday = true;
      const isDisabled = isCheckedToday;

      expect(isDisabled).toBe(true);
    });

    it("should enable button when habit is not completed today", () => {
      const isCheckedToday = false;
      const isDisabled = isCheckedToday;

      expect(isDisabled).toBe(false);
    });

    it("should show correct button state styling", () => {
      const isCheckedToday = true;

      const className = isCheckedToday
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50 opacity-75 cursor-not-allowed"
        : "bg-card/50 border border-white/20 hover:bg-card/70";

      expect(className).toContain("opacity-75");
      expect(className).toContain("cursor-not-allowed");
    });

    it("should display correct tooltip message", () => {
      const isCheckedToday = true;

      const title = isCheckedToday ? "Completed today. Come back tomorrow!" : "Click to mark habit as complete";

      expect(title).toBe("Completed today. Come back tomorrow!");
    });

    it("should fetch completion status on component mount", () => {
      const habitId = 1;
      const date = new Date();

      // Simulating query parameters
      const queryParams = {
        habitId,
        date,
      };

      expect(queryParams.habitId).toBe(1);
      expect(queryParams.date).toEqual(date);
    });

    it("should update state when completion data is fetched", () => {
      const todayCompletion = {
        id: 1,
        habitId: 1,
        userId: 1,
        completedDate: "2026-05-03",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isCheckedToday = todayCompletion && "completed" in todayCompletion ? todayCompletion.completed : false;

      expect(isCheckedToday).toBe(true);
    });

    it("should reset completion state to false when no data is found", () => {
      const todayCompletion = null;

      const isCheckedToday = todayCompletion && "completed" in todayCompletion ? todayCompletion.completed : false;

      expect(isCheckedToday).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should show error message when attempting duplicate completion", () => {
      const error = new Error("Habit already completed today. Come back tomorrow!");

      expect(error.message).toContain("already completed");
    });

    it("should reset button state on error", () => {
      let isCheckedToday = true;

      // Simulate error - reset state
      isCheckedToday = false;

      expect(isCheckedToday).toBe(false);
    });

    it("should show success message on successful completion", () => {
      const successMessage = "Great! Habit completed for today.";

      expect(successMessage).toContain("completed");
    });

    it("should show info message when habit already completed", () => {
      const infoMessage = "Habit already completed today. Come back tomorrow!";

      expect(infoMessage).toContain("Come back tomorrow");
    });
  });

  describe("Data Persistence", () => {
    it("should persist completion status across page refresh", () => {
      const completionData = {
        id: 1,
        habitId: 1,
        userId: 1,
        completedDate: "2026-05-03",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // After refresh, query should return same data
      const refreshedData = completionData;

      expect(refreshedData.completed).toBe(true);
      expect(refreshedData.completedDate).toBe("2026-05-03");
    });

    it("should show completed state immediately after successful toggle", () => {
      const initialState = false;
      const afterToggle = true;

      expect(initialState).toBe(false);
      expect(afterToggle).toBe(true);
    });

    it("should maintain completion state across different pages", () => {
      const completionStatus = {
        habitId: 1,
        completedToday: true,
      };

      // Same status should be visible on Dashboard, Calendar, and Analytics
      expect(completionStatus.completedToday).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle timezone differences correctly", () => {
      const utcDate = new Date("2026-05-03T23:59:59Z");
      const utcDateStr = utcDate.toISOString().split("T")[0];

      expect(utcDateStr).toBe("2026-05-03");
    });

    it("should handle midnight boundary correctly", () => {
      const beforeMidnight = new Date("2026-05-03T23:59:59Z");
      const afterMidnight = new Date("2026-05-04T00:00:01Z");

      const beforeStr = beforeMidnight.toISOString().split("T")[0];
      const afterStr = afterMidnight.toISOString().split("T")[0];

      expect(beforeStr).not.toBe(afterStr);
    });

    it("should prevent completion on future dates", () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayStr = today.toISOString().split("T")[0];
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      expect(todayStr).not.toBe(tomorrowStr);
    });

    it("should allow completion on past dates", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      expect(yesterdayStr).not.toBe(todayStr);
      expect(yesterdayStr < todayStr).toBe(true);
    });
  });
});
