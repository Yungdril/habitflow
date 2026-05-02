import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  habits: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserHabits(ctx.user.id)),

    get: protectedProcedure
      .input(z.object({ habitId: z.number() }))
      .query(({ ctx, input }) => db.getHabitById(input.habitId, ctx.user.id)),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          description: z.string().optional(),
          color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
          icon: z.string().max(64).optional(),
          frequency: z.enum(["daily", "weekly", "custom"]).optional(),
          targetDaysPerWeek: z.number().min(1).max(7).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await db.createHabit({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          color: input.color || "#3b82f6",
          icon: input.icon || "circle",
          frequency: input.frequency || "daily",
          targetDaysPerWeek: input.targetDaysPerWeek || 7,
        });
        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          habitId: z.number(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
          icon: z.string().max(64).optional(),
          frequency: z.enum(["daily", "weekly", "custom"]).optional(),
          targetDaysPerWeek: z.number().min(1).max(7).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const habit = await db.getHabitById(input.habitId, ctx.user.id);
        if (!habit) throw new TRPCError({ code: "NOT_FOUND" });

        const updates: any = {};
        if (input.name !== undefined) updates.name = input.name;
        if (input.description !== undefined) updates.description = input.description;
        if (input.color !== undefined) updates.color = input.color;
        if (input.icon !== undefined) updates.icon = input.icon;
        if (input.frequency !== undefined) updates.frequency = input.frequency;
        if (input.targetDaysPerWeek !== undefined) updates.targetDaysPerWeek = input.targetDaysPerWeek;

        return db.updateHabit(input.habitId, ctx.user.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ habitId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const habit = await db.getHabitById(input.habitId, ctx.user.id);
        if (!habit) throw new TRPCError({ code: "NOT_FOUND" });
        return db.deleteHabit(input.habitId, ctx.user.id);
      }),
  }),

  tracking: router({
    getForDate: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(({ ctx, input }) => db.getTrackingForDate(ctx.user.id, input.date)),

    getForHabitAndDate: protectedProcedure
      .input(z.object({ habitId: z.number(), date: z.date() }))
      .query(({ ctx, input }) => db.getTrackingForHabitAndDate(input.habitId, ctx.user.id, input.date)),

    getHistory: protectedProcedure
      .input(z.object({ habitId: z.number(), startDate: z.date(), endDate: z.date() }))
      .query(({ ctx, input }) => db.getHabitTrackingHistory(input.habitId, ctx.user.id, input.startDate, input.endDate)),

    toggle: protectedProcedure
      .input(z.object({ habitId: z.number(), date: z.date(), completed: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const habit = await db.getHabitById(input.habitId, ctx.user.id);
        if (!habit) throw new TRPCError({ code: "NOT_FOUND" });

        const dateStr = input.date.toISOString().split("T")[0];
        const result = await db.upsertTracking({
          habitId: input.habitId,
          userId: ctx.user.id,
          completedDate: dateStr as any,
          completed: input.completed,
        });

        if (input.completed) {
          const today = new Date().toISOString().split("T")[0];
          if (dateStr === today) {
            const newTotal = (habit.totalCompletions || 0) + 1;
            await db.updateHabit(input.habitId, ctx.user.id, {
              totalCompletions: newTotal,
              lastCompletedDate: input.date,
            });
          }
        }

        return result;
      }),
  }),

  analytics: router({
    getStats: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(({ ctx, input }) => db.getCompletionStats(ctx.user.id, input.startDate, input.endDate)),
  }),
});

export type AppRouter = typeof appRouter;
