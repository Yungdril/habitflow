import { useState, useEffect } from "react";
import type { Habit } from "@shared/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const HABIT_ICONS = ["circle", "star", "heart", "flame", "zap", "target", "book", "dumbbell"];
const HABIT_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

interface EditHabitModalProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditHabitModal({
  habit,
  open,
  onOpenChange,
  onSuccess,
}: EditHabitModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  const [frequency, setFrequency] = useState("");

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || "");
      setIcon(habit.icon);
      setColor(habit.color);
      setFrequency(habit.frequency);
    }
  }, [habit, open]);

  const updateMutation = trpc.habits.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        habitId: habit.id,
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        frequency: frequency as "daily" | "weekly" | "custom",
      });
      
      toast.success("Habit updated successfully!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to update habit");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Update your habit details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Habit Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Morning Exercise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={updateMutation.isPending}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="edit-icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon} disabled={updateMutation.isPending}>
              <SelectTrigger id="edit-icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HABIT_ICONS.map((ic) => (
                  <SelectItem key={ic} value={ic}>
                    {ic.charAt(0).toUpperCase() + ic.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  disabled={updateMutation.isPending}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="edit-frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency} disabled={updateMutation.isPending}>
              <SelectTrigger id="edit-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
