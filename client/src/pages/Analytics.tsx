import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate: new Date() });

  const { data: stats, isLoading } = trpc.analytics.getStats.useQuery(
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { enabled: !!user }
  );

  const { data: habits } = trpc.habits.list.useQuery(undefined, { enabled: !!user });

  // Generate mock data for charts (in a real app, this would come from the backend)
  const weeklyData = [
    { week: "Week 1", completed: 12, total: 14 },
    { week: "Week 2", completed: 15, total: 14 },
    { week: "Week 3", completed: 13, total: 14 },
    { week: "Week 4", completed: 14, total: 14 },
  ];

  const habitData = habits?.map((habit) => ({
    name: habit.name,
    completions: habit.totalCompletions,
    streak: habit.currentStreak,
  })) || [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">Track your habit completion trends and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.totalHabits || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Active habits being tracked</p>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-2">Overall completion rate</p>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.completedToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Habits completed today</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completion Chart */}
        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle>Weekly Completion</CardTitle>
            <CardDescription>Habits completed per week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                <Bar dataKey="total" fill="rgba(255,255,255,0.1)" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Habit Completion Distribution */}
        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle>Habit Distribution</CardTitle>
            <CardDescription>Completion count by habit</CardDescription>
          </CardHeader>
          <CardContent>
            {habitData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={habitData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, completions }) => `${name}: ${completions}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="completions"
                  >
                    {habitData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No habits to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Habit Streaks */}
      <Card className="bg-card/30 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle>Current Streaks</CardTitle>
          <CardDescription>Your active habit streaks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habitData.length > 0 ? (
              habitData.map((habit, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                  <div>
                    <p className="font-semibold text-foreground">{habit.name}</p>
                    <p className="text-sm text-muted-foreground">{habit.completions} total completions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{habit.streak}</div>
                    <p className="text-xs text-muted-foreground">day streak</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No habits yet. Create one to get started!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
