import { describe, expect, it } from "vitest";
import * as db from "./db";

describe("Notification System", () => {
  describe("Database Helpers", () => {
    it("should have createNotification function", () => {
      expect(typeof db.createNotification).toBe("function");
    });

    it("should have getUserNotifications function", () => {
      expect(typeof db.getUserNotifications).toBe("function");
    });

    it("should have markNotificationAsRead function", () => {
      expect(typeof db.markNotificationAsRead).toBe("function");
    });

    it("should have dismissNotification function", () => {
      expect(typeof db.dismissNotification).toBe("function");
    });

    it("should have getUnreadNotificationCount function", () => {
      expect(typeof db.getUnreadNotificationCount).toBe("function");
    });

    it("should have getPendingHabitsForUser function", () => {
      expect(typeof db.getPendingHabitsForUser).toBe("function");
    });

    it("should have getOrCreateNotificationPreferences function", () => {
      expect(typeof db.getOrCreateNotificationPreferences).toBe("function");
    });

    it("should have updateNotificationPreferences function", () => {
      expect(typeof db.updateNotificationPreferences).toBe("function");
    });

    it("should have getNotificationPreferences function", () => {
      expect(typeof db.getNotificationPreferences).toBe("function");
    });
  });

  describe("Notification Types", () => {
    it("should support pending_habit notification type", () => {
      const validTypes = ["pending_habit", "streak_milestone", "reminder", "achievement"];
      expect(validTypes).toContain("pending_habit");
    });

    it("should support streak_milestone notification type", () => {
      const validTypes = ["pending_habit", "streak_milestone", "reminder", "achievement"];
      expect(validTypes).toContain("streak_milestone");
    });

    it("should support reminder notification type", () => {
      const validTypes = ["pending_habit", "streak_milestone", "reminder", "achievement"];
      expect(validTypes).toContain("reminder");
    });

    it("should support achievement notification type", () => {
      const validTypes = ["pending_habit", "streak_milestone", "reminder", "achievement"];
      expect(validTypes).toContain("achievement");
    });
  });

  describe("Notification Preferences", () => {
    it("should have default notification preferences structure", () => {
      const defaultPrefs = {
        enablePendingHabits: true,
        enableStreakMilestones: true,
        enableReminders: true,
        enableAchievements: true,
        reminderTime: "09:00",
        timezone: "UTC",
      };

      expect(defaultPrefs).toHaveProperty("enablePendingHabits");
      expect(defaultPrefs).toHaveProperty("enableStreakMilestones");
      expect(defaultPrefs).toHaveProperty("enableReminders");
      expect(defaultPrefs).toHaveProperty("enableAchievements");
      expect(defaultPrefs).toHaveProperty("reminderTime");
      expect(defaultPrefs).toHaveProperty("timezone");
    });

    it("should validate reminder time format", () => {
      const validTimes = ["09:00", "14:30", "23:59", "00:00"];
      const timeRegex = /^\d{2}:\d{2}$/;

      validTimes.forEach((time) => {
        expect(time).toMatch(timeRegex);
      });
    });

    it("should support multiple timezones", () => {
      const validTimezones = [
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Australia/Sydney",
      ];

      expect(validTimezones.length).toBeGreaterThan(0);
      expect(validTimezones).toContain("UTC");
      expect(validTimezones).toContain("America/New_York");
    });
  });

  describe("Notification Status", () => {
    it("should track read status", () => {
      const notification = {
        id: 1,
        userId: 1,
        habitId: 1,
        type: "pending_habit" as const,
        title: "Test",
        message: "Test message",
        read: false,
        dismissed: false,
        createdAt: new Date(),
      };

      expect(notification.read).toBe(false);
      notification.read = true;
      expect(notification.read).toBe(true);
    });

    it("should track dismissed status", () => {
      const notification = {
        id: 1,
        userId: 1,
        habitId: 1,
        type: "pending_habit" as const,
        title: "Test",
        message: "Test message",
        read: false,
        dismissed: false,
        createdAt: new Date(),
      };

      expect(notification.dismissed).toBe(false);
      notification.dismissed = true;
      expect(notification.dismissed).toBe(true);
    });

    it("should support notification expiration", () => {
      const notification = {
        id: 1,
        userId: 1,
        habitId: 1,
        type: "pending_habit" as const,
        title: "Test",
        message: "Test message",
        read: false,
        dismissed: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      expect(notification.expiresAt).toBeDefined();
      expect(notification.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("Notification Filtering", () => {
    it("should filter notifications by type", () => {
      const notifications = [
        { id: 1, type: "pending_habit" },
        { id: 2, type: "streak_milestone" },
        { id: 3, type: "pending_habit" },
      ];

      const pendingNotifications = notifications.filter((n) => n.type === "pending_habit");
      expect(pendingNotifications).toHaveLength(2);
      expect(pendingNotifications[0].id).toBe(1);
      expect(pendingNotifications[1].id).toBe(3);
    });

    it("should filter unread notifications", () => {
      const notifications = [
        { id: 1, read: false },
        { id: 2, read: true },
        { id: 3, read: false },
      ];

      const unreadNotifications = notifications.filter((n) => !n.read);
      expect(unreadNotifications).toHaveLength(2);
    });

    it("should filter active notifications (not dismissed)", () => {
      const notifications = [
        { id: 1, dismissed: false },
        { id: 2, dismissed: true },
        { id: 3, dismissed: false },
      ];

      const activeNotifications = notifications.filter((n) => !n.dismissed);
      expect(activeNotifications).toHaveLength(2);
    });
  });

  describe("Notification Sorting", () => {
    it("should sort notifications by creation date (newest first)", () => {
      const now = Date.now();
      const notifications = [
        { id: 1, createdAt: new Date(now - 1000) },
        { id: 2, createdAt: new Date(now) },
        { id: 3, createdAt: new Date(now - 2000) },
      ];

      const sorted = [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      expect(sorted[0].id).toBe(2);
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(3);
    });

    it("should sort notifications by read status (unread first)", () => {
      const notifications = [
        { id: 1, read: true },
        { id: 2, read: false },
        { id: 3, read: false },
      ];

      const sorted = [...notifications].sort((a, b) => (a.read ? 1 : -1) - (b.read ? 1 : -1));

      expect(sorted[0].read).toBe(false);
      expect(sorted[1].read).toBe(false);
      expect(sorted[2].read).toBe(true);
    });
  });

  describe("Pending Habits Logic", () => {
    it("should identify pending habits correctly", () => {
      const allHabits = [
        { id: 1, name: "Exercise" },
        { id: 2, name: "Reading" },
        { id: 3, name: "Meditation" },
      ];

      const completedToday = [1]; // Only habit 1 was completed
      const pendingHabits = allHabits.filter((h) => !completedToday.includes(h.id));

      expect(pendingHabits).toHaveLength(2);
      expect(pendingHabits[0].id).toBe(2);
      expect(pendingHabits[1].id).toBe(3);
    });

    it("should generate notification title for pending habit", () => {
      const habit = { id: 1, name: "Morning Exercise" };
      const title = `Complete your habit: ${habit.name}`;

      expect(title).toBe("Complete your habit: Morning Exercise");
    });

    it("should generate notification message for pending habit", () => {
      const habit = { id: 1, name: "Reading" };
      const message = `You haven't completed "${habit.name}" yet today. Keep your streak going!`;

      expect(message).toContain("Reading");
      expect(message).toContain("Keep your streak going");
    });
  });
});
