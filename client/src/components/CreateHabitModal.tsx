import { useState } from "react";
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
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

interface CreateHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateHabitModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateHabitModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("circle");
  const [color, setColor] = useState("#3b82f6");
  const [frequency, setFrequency] = useState("daily");

  const createMutation = trpc.habits.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        frequency: frequency as "daily" | "weekly" | "custom",
      });
      
      toast.success("Habit created successfully!");
      setName("");
      setDescription("");
      setIcon("circle");
      setColor("#3b82f6");
      setFrequency("daily");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to create habit");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            Add a new habit to track and build momentum
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Exercise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createMutation.isPending}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon} disabled={createMutation.isPending}>
              <SelectTrigger id="icon">
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
                  disabled={createMutation.isPending}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency} disabled={createMutation.isPending}>
              <SelectTrigger id="frequency">
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
              disabled={createMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? "Creating..." : "Create Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
