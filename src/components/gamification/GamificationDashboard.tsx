import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AchievementBadge } from './AchievementBadge';
import { ChallengeProgress } from './ChallengeProgress';
import { useAchievements } from '@/hooks/use-achievements';
import { useChallenges } from '@/hooks/use-challenges';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Star } from 'lucide-react';

export const GamificationDashboard: React.FC = () => {
  const { achievements, userAchievements, loading: achievementsLoading } = useAchievements();
  const { challenges, userProgress, loading: challengesLoading } = useChallenges();

  if (achievementsLoading || challengesLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalPoints = userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0);
  const completedChallenges = userProgress.filter(p => p.completed_at).length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{userAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{completedChallenges}</div>
            <div className="text-sm text-muted-foreground">Challenges</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Achievements and Challenges */}
      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="challenges">Active Challenges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {challenges.length > 0 ? (
                <div className="space-y-4">
                  {challenges.map((challenge) => {
                    const progress = userProgress.find(p => p.challenge_id === challenge.id);
                    return (
                      <ChallengeProgress
                        key={challenge.id}
                        title={challenge.title}
                        description={challenge.description}
                        type={challenge.type as 'weekly' | 'monthly' | 'seasonal'}
                        currentCount={progress?.current_count || 0}
                        targetCount={challenge.target_count}
                        pointsReward={challenge.points_reward}
                        endDate={challenge.ends_at}
                        completed={!!progress?.completed_at}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active challenges right now.</p>
                  <p className="text-sm">Check back soon for new challenges!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievement Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {achievements.map((achievement) => {
                    const earned = userAchievements.some(
                      ua => ua.achievement_id === achievement.id
                    );
                    return (
                      <AchievementBadge
                        key={achievement.id}
                        icon={achievement.icon}
                        title={achievement.title}
                        description={achievement.description}
                        points={achievement.points}
                        earned={earned}
                        size="md"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};