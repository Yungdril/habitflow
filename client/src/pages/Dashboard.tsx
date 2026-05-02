import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import HabitCard from "@/components/HabitCard";
import CreateHabitModal from "@/components/CreateHabitModal";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: habits, isLoading, refetch } = trpc.habits.list.useQuery(undefined, {
    enabled: !!user,
  });

  const handleCreateHabit = async () => {
    setIsCreateModalOpen(false);
    await refetch();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">HabitFlow</h1>
            <p className="text-muted-foreground mt-2">Track your daily habits and build momentum</p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            New Habit
          </Button>
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading your habits...</p>
            </div>
          ) : habits && habits.length > 0 ? (
            habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onUpdate={() => refetch()}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">No habits yet. Create your first one!</p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Habit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Habit Modal */}
      <CreateHabitModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateHabit}
      />
    </DashboardLayout>
  );
}
