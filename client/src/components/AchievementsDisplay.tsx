import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Star, Trophy, Zap, Heart } from 'lucide-react';

const categoryIcons = {
  streak: Trophy,
  completion: Star,
  consistency: Heart,
  milestone: Zap,
  special: Award,
};

const categoryColors = {
  streak: 'text-yellow-400',
  completion: 'text-blue-400',
  consistency: 'text-green-400',
  milestone: 'text-purple-400',
  special: 'text-pink-400',
};

export default function AchievementsDisplay() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: achievements, isLoading } = trpc.achievement.list.useQuery();

  const categories = achievements
    ? Array.from(new Set(achievements.map((a) => a.category)))
    : [];

  const filteredAchievements = selectedCategory
    ? achievements?.filter((a) => a.category === selectedCategory)
    : achievements;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-400">No achievements yet. Keep building habits!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All ({achievements.length})
          </button>
          {categories.map((category) => {
            const count = achievements.filter((a) => a.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Achievements Grid */}
      {filteredAchievements && filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredAchievements.map((achievement) => {
            const IconComponent = categoryIcons[achievement.category as keyof typeof categoryIcons];
            const colorClass = categoryColors[achievement.category as keyof typeof categoryColors];

            return (
              <Card
                key={achievement.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`text-3xl ${colorClass}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2">{achievement.badgeName}</h3>
                  {achievement.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">{achievement.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No achievements in this category yet.</p>
        </div>
      )}

      {/* Stats Summary */}
      {achievements && achievements.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-400">{achievements.length}</p>
              <p className="text-xs text-gray-400">Total Achievements</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{categories.length}</p>
              <p className="text-xs text-gray-400">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-400">
                {achievements.filter((a) => {
                  const date = new Date(a.earnedAt);
                  const today = new Date();
                  return (
                    date.getFullYear() === today.getFullYear() &&
                    date.getMonth() === today.getMonth() &&
                    date.getDate() === today.getDate()
                  );
                }).length}
              </p>
              <p className="text-xs text-gray-400">Today</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
