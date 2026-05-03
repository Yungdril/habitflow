import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, CheckCircle, AlertCircle, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";

export function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch notifications
  const { data: notifications, refetch: refetchNotifications } = trpc.notifications.list.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: autoRefresh ? 30000 : false, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Mark as read mutation
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
    },
  });

  // Dismiss mutation
  const dismissMutation = trpc.notifications.dismiss.useMutation({
    onSuccess: () => {
      refetchNotifications();
    },
  });

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ notificationId });
  };

  const handleDismiss = (notificationId: number) => {
    dismissMutation.mutate({ notificationId });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "pending_habit":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "streak_milestone":
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case "achievement":
        return <Trophy className="w-5 h-5 text-purple-500" />;
      case "reminder":
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "pending_habit":
        return "bg-amber-500/10 border-amber-500/20";
      case "streak_milestone":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "achievement":
        return "bg-purple-500/10 border-purple-500/20";
      case "reminder":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
      >
        <Bell className="w-5 h-5 text-primary" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-card border border-white/10 rounded-lg shadow-lg z-50 backdrop-blur-xl">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
            </p>
          </div>

          <div className="divide-y divide-white/10">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${getNotificationColor(notification.type)} border-l-4 flex items-start gap-3 hover:bg-white/5 transition-colors`}
                >
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{notification.title}</p>
                    {notification.message && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
