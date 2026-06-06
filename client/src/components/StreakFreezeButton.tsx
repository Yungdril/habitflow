import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Zap, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StreakFreezeButtonProps {
  habitId: number;
  habitName: string;
}

export default function StreakFreezeButton({ habitId, habitName }: StreakFreezeButtonProps) {
  const [open, setOpen] = useState(false);
  const [freezeType, setFreezeType] = useState<'daily' | 'weekly'>('daily');

  const createFreezeMutation = trpc.streakFreeze.create.useMutation({
    onSuccess: () => {
      toast.success(`Streak freeze applied for "${habitName}"!`);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply streak freeze');
    },
  });

  const handleApplyFreeze = () => {
    createFreezeMutation.mutate({
      habitId,
      freezeType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-yellow-500/30 hover:bg-yellow-500/10"
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          Use Freeze
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use Streak Freeze</DialogTitle>
          <DialogDescription>
            Skip today without breaking your streak for "{habitName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Message */}
          <div className="flex gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-semibold mb-1">Limited Resource</p>
              <p>You have a limited number of streak freezes per month. Use them wisely!</p>
            </div>
          </div>

          {/* Freeze Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Freeze Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFreezeType('daily')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  freezeType === 'daily'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <p className="font-semibold text-sm">Daily</p>
                <p className="text-xs text-gray-400 mt-1">Skip 1 day</p>
              </button>
              <button
                onClick={() => setFreezeType('weekly')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  freezeType === 'weekly'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <p className="font-semibold text-sm">Weekly</p>
                <p className="text-xs text-gray-400 mt-1">Skip 1 week</p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyFreeze}
              disabled={createFreezeMutation.isPending}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              {createFreezeMutation.isPending ? 'Applying...' : 'Apply Freeze'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
