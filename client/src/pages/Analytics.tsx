import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { user } = useAuth();

  // Get current date range (last 30 days)
  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const date = new Date(endDate);
    date.setDate(date.getDate() - 30);
    return date;
  }, [endDate]);

  const { data: stats, isLoading: statsLoading } = trpc.analytics.getStats.useQuery(
    { startDate, endDate },
    { enabled: !!user }
  );

  const { data: weeklySummary, isLoading: weeklyLoading } = trpc.analytics.getWeeklySummary.useQuery(
    { startDate, endDate },
    { enabled: !!user }
  );

  const { data: monthlySummary, isLoading: monthlyLoading } = trpc.analytics.getMonthlySummary.useQuery(
    { startDate, endDate },
    { enabled: !!user }
  );

  const { data: habits } = trpc.habits.list.useQuery(undefined, { enabled: !!user });

  const habitData = habits?.map((habit) => ({
    name: habit.name,
    completions: habit.totalCompletions,
    streak: habit.currentStreak,
  })) || [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const isLoading = statsLoading || weeklyLoading || monthlyLoading;

  return (
    <DashboardLayout>
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
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-primary">{stats?.totalHabits || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-accent">{stats?.completionRate || 0}%</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-primary">{stats?.completedToday || 0}</div>
              )}
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
              {weeklyLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : weeklySummary && weeklySummary.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklySummary}>
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
                    <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Completion Chart */}
          <Card className="bg-card/30 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle>Monthly Completion</CardTitle>
              <CardDescription>Habits completed per month</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : monthlySummary && monthlySummary.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Habit Distribution */}
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

        {/* Current Streaks */}
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
    </DashboardLayout>
  );
}
