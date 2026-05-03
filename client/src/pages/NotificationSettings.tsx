import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertCircle, Clock, Globe } from "lucide-react";

export default function NotificationSettings() {
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState<any>(null);

  // Fetch preferences
  const { data: preferences, isLoading } = trpc.notifications.getPreferences.useQuery(undefined, {
    enabled: !!user,
  });

  // Update preferences mutation
  const updateMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification settings saved!");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  useEffect(() => {
    if (preferences) {
      setLocalSettings(preferences);
    }
  }, [preferences]);

  const handleToggle = (key: string) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        [key]: !localSettings[key],
      });
    }
  };

  const handleInputChange = (key: string, value: string) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        [key]: value,
      });
    }
  };

  const handleSave = () => {
    if (localSettings) {
      updateMutation.mutate({
        enablePendingHabits: localSettings.enablePendingHabits,
        enableStreakMilestones: localSettings.enableStreakMilestones,
        enableReminders: localSettings.enableReminders,
        enableAchievements: localSettings.enableAchievements,
        reminderTime: localSettings.reminderTime,
        timezone: localSettings.timezone,
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Notification Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your notification preferences</p>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">Customize how and when you receive notifications</p>
        </div>

        {/* Notification Type Toggles */}
        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>Choose which types of notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pending Habits */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-semibold text-foreground">Pending Habits</p>
                  <p className="text-sm text-muted-foreground">Get reminded about habits you haven't completed today</p>
                </div>
              </div>
              <Switch
                checked={localSettings?.enablePendingHabits || false}
                onCheckedChange={() => handleToggle("enablePendingHabits")}
              />
            </div>

            {/* Streak Milestones */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-semibold text-foreground">Streak Milestones</p>
                  <p className="text-sm text-muted-foreground">Celebrate when you reach streak milestones</p>
                </div>
              </div>
              <Switch
                checked={localSettings?.enableStreakMilestones || false}
                onCheckedChange={() => handleToggle("enableStreakMilestones")}
              />
            </div>

            {/* Reminders */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-semibold text-foreground">Daily Reminders</p>
                  <p className="text-sm text-muted-foreground">Get a daily reminder to complete your habits</p>
                </div>
              </div>
              <Switch
                checked={localSettings?.enableReminders || false}
                onCheckedChange={() => handleToggle("enableReminders")}
              />
            </div>

            {/* Achievements */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-semibold text-foreground">Achievements</p>
                  <p className="text-sm text-muted-foreground">Get notified when you unlock achievements</p>
                </div>
              </div>
              <Switch
                checked={localSettings?.enableAchievements || false}
                onCheckedChange={() => handleToggle("enableAchievements")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Settings */}
        <Card className="bg-card/30 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle>Reminder Settings</CardTitle>
            <CardDescription>Configure when and where you receive reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reminder Time */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Reminder Time (HH:MM)
              </Label>
              <Input
                type="time"
                value={localSettings?.reminderTime || "09:00"}
                onChange={(e) => handleInputChange("reminderTime", e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                You'll receive daily reminders at this time
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Timezone
              </Label>
              <select
                value={localSettings?.timezone || "UTC"}
                onChange={(e) => handleInputChange("timezone", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Select your timezone for accurate reminder scheduling
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setLocalSettings(preferences)}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
