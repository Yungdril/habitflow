import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  const { data: habits, isLoading: habitsLoading } = trpc.habits.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Set first habit as selected by default
  useMemo(() => {
    if (habits && habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  const { data: trackingData, isLoading: trackingLoading } = trpc.tracking.getHistory.useQuery(
    {
      habitId: selectedHabitId || 0,
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    },
    { enabled: !!user && !!selectedHabitId }
  );

  // Generate calendar grid
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // Check if a date is completed
  const isDateCompleted = (date: Date) => {
    if (!trackingData) return false;
    const dateStr = date.toISOString().split("T")[0];
    return trackingData.some((track: any) => track.completedDate === dateStr || track.completedDate?.split("T")[0] === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <DashboardLayout>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground mt-2">View your habit completion history</p>
      </div>

      {/* Habit Selection */}
      <Card className="bg-card/30 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Select Habit</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedHabitId?.toString() || ""}
            onValueChange={(value) => setSelectedHabitId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a habit" />
            </SelectTrigger>
            <SelectContent>
              {habits?.map((habit) => (
                <SelectItem key={habit.id} value={habit.id.toString()}>
                  {habit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Calendar */}
      {selectedHabitId && (
        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{monthName}</CardTitle>
                <CardDescription>Green = completed, Red = missed, Gray = no data</CardDescription>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  ← Prev
                </button>
                <button
                  onClick={handleNextMonth}
                  className="px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {trackingLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <div className="space-y-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {days.map((day) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isCompleted = isDateCompleted(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={day}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                          isCompleted
                            ? "bg-green-500/80 text-white shadow-lg"
                            : isToday
                            ? "bg-primary/30 border-2 border-primary text-foreground"
                            : "bg-card/50 text-foreground hover:bg-card/80"
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex gap-6 mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/80"></div>
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-card/50"></div>
                    <span className="text-sm text-muted-foreground">Not Completed</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedHabitId && trackingData && (
        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle>This Month's Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Days Completed</p>
                <p className="text-2xl font-bold text-primary">{trackingData.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-accent">
                  {Math.round((trackingData.length / 30) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {Math.max(0, 30 - trackingData.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
