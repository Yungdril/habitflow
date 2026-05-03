import { useState } from "react";
import type { Habit } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EditHabitModal from "./EditHabitModal";

// Shared type for Habit
export type { Habit };

interface HabitCardProps {
  habit: Habit;
  onUpdate: () => void;
}

export default function HabitCard({ habit, onUpdate }: HabitCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCheckedToday, setIsCheckedToday] = useState(false);

  const utils = trpc.useUtils();
  const toggleMutation = trpc.tracking.toggle.useMutation({
    onMutate: async ({ habitId, date, completed }) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await utils.habits.list.cancel();
      
      // Snapshot the previous value
      const previousHabits = utils.habits.list.getData();
      
      // Optimistically update the cache
      if (previousHabits) {
        utils.habits.list.setData(undefined, (old) => {
          if (!old) return old;
          return old.map((h) => {
            if (h.id === habitId) {
              return {
                ...h,
                currentStreak: completed ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
                totalCompletions: completed ? h.totalCompletions + 1 : Math.max(0, h.totalCompletions - 1),
              };
            }
            return h;
          });
        });
      }
      
      return { previousHabits };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousHabits) {
        utils.habits.list.setData(undefined, context.previousHabits);
      }
      toast.error("Failed to update habit");
    },
    onSuccess: () => {
      toast.success("Habit updated!");
    },
  });
  
  const deleteMutation = trpc.habits.delete.useMutation({
    onSuccess: () => {
      utils.habits.list.invalidate();
      toast.success("Habit deleted successfully");
      onUpdate();
    },
    onError: () => {
      toast.error("Failed to delete habit");
    },
  });

  const handleToggleToday = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newState = !isCheckedToday;
    setIsCheckedToday(newState);
    
    try {
      await toggleMutation.mutateAsync({
        habitId: habit.id,
        date: today,
        completed: newState,
      });
    } catch (error) {
      // Error handling is done in onError callback
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this habit?")) return;
    
    try {
      await deleteMutation.mutateAsync({ habitId: habit.id });
    } catch (error) {
      // Error handling is done in onError callback
    }
  };

  const completionRate = habit.totalCompletions > 0 ? Math.round((habit.totalCompletions / 30) * 100) : 0;

  return (
    <>
      <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:bg-card/40 hover:border-white/20 hover:shadow-lg hover:shadow-primary/10 group">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            >
              {habit.icon.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{habit.name}</h3>
              {habit.description && (
                <p className="text-sm text-muted-foreground truncate">{habit.description}</p>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Streak and stats */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{habit.currentStreak}</span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
            <p className="text-xs text-muted-foreground">Best: {habit.longestStreak} days</p>
          </div>
          
          {/* Check-off button */}
          <Button
            onClick={handleToggleToday}
            disabled={toggleMutation.isPending}
            className={`h-14 w-14 rounded-full p-0 flex-shrink-0 transition-all ${
              isCheckedToday
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                : "bg-card/50 border border-white/20 hover:bg-card/70"
            }`}
          >
            <Check className="w-6 h-6" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Completion Rate</span>
            <span className="text-xs font-semibold text-primary">{completionRate}%</span>
          </div>
          <div className="relative h-2 bg-card/50 rounded-full overflow-hidden" style={{ boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)' }}>
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditHabitModal
        habit={habit}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => {
          setIsEditModalOpen(false);
          onUpdate();
        }}
      />
    </>
  );
}
