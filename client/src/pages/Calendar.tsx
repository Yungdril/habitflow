import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  const { data: habits } = trpc.habits.list.useQuery(undefined, { enabled: !!user });
  const { data: tracking } = trpc.tracking.getHistory.useQuery(
    {
      habitId: selectedHabitId || 0,
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    },
    { enabled: !!user && selectedHabitId !== null }
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

  // Get completion data
  const completionMap = new Map(
    tracking?.map((entry) => {
      const date = new Date(entry.completedDate);
      return [date.getDate(), entry.completed];
    }) || []
  );

  const getCompletionColor = (day: number) => {
    const completed = completionMap.get(day);
    if (completed === undefined) return "bg-card/30";
    if (completed) return "bg-primary/70 border-primary/50";
    return "bg-destructive/30 border-destructive/50";
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a habit to view" />
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
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of month */}
              {days.map((day) => (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg border transition-all ${getCompletionColor(
                    day
                  )} hover:shadow-lg cursor-pointer`}
                  title={`${currentDate.toLocaleString("default", { month: "long" })} ${day}`}
                >
                  <span className="text-sm font-medium text-foreground">{day}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/70 border border-primary/50" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive/30 border border-destructive/50" />
                <span className="text-sm text-muted-foreground">Missed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-card/30" />
                <span className="text-sm text-muted-foreground">No Data</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedHabitId && (
        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Select a habit above to view its completion calendar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
