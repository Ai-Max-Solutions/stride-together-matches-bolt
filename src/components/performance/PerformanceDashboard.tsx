import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Zap, 
  Trophy,
  Activity,
  BarChart3,
  Calendar,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  weeklyDistance: number;
  weeklyDistanceChange: number;
  avgPace: string;
  avgPaceChange: number;
  weeklyWorkouts: number;
  workoutChange: number;
  personalBests: number;
  currentStreak: number;
  upcomingGoals: string[];
  recentAchievements: string[];
}

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  sportType: string;
  className?: string;
}

export const PerformanceDashboard = ({ 
  metrics, 
  sportType = 'running',
  className 
}: PerformanceDashboardProps) => {
  const getMetricColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getMetricIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Activity;
  };

  const formatDistance = (distance: number) => {
    return sportType === 'cycling' ? `${distance} km` : `${distance} km`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Distance */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 text-white border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Weekly Distance</p>
                <p className="text-2xl font-bold">{formatDistance(metrics.weeklyDistance)}</p>
              </div>
              <Activity className="h-8 w-8 text-amber-400" />
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getMetricIcon(metrics.weeklyDistanceChange), {
                className: cn('h-4 w-4 mr-1', getMetricColor(metrics.weeklyDistanceChange))
              })}
              <span className={cn('text-sm', getMetricColor(metrics.weeklyDistanceChange))}>
                {metrics.weeklyDistanceChange > 0 ? '+' : ''}{metrics.weeklyDistanceChange}% from last week
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Average Pace */}
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Average Pace</p>
                <p className="text-2xl font-bold">{metrics.avgPace}</p>
              </div>
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getMetricIcon(metrics.avgPaceChange), {
                className: cn('h-4 w-4 mr-1', 'text-amber-100')
              })}
              <span className="text-sm text-amber-100">
                {metrics.avgPaceChange > 0 ? 'Faster' : 'Slower'} by {Math.abs(metrics.avgPaceChange)}s
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Workouts */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Weekly Sessions</p>
                <p className="text-2xl font-bold">{metrics.weeklyWorkouts}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getMetricIcon(metrics.workoutChange), {
                className: cn('h-4 w-4 mr-1', 'text-blue-100')
              })}
              <span className="text-sm text-blue-100">
                {metrics.workoutChange > 0 ? '+' : ''}{metrics.workoutChange} from last week
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Personal Bests */}
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Personal Bests</p>
                <p className="text-2xl font-bold">{metrics.personalBests}</p>
              </div>
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div className="flex items-center mt-2">
              <Zap className="h-4 w-4 mr-1 text-green-100" />
              <span className="text-sm text-green-100">
                {metrics.currentStreak} day streak
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              Performance Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.upcomingGoals.map((goal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{goal}</span>
                <Badge variant="outline" className="border-amber-500 text-amber-700">
                  Active
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Set New Goal
            </Button>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <Trophy className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-slate-800">{achievement}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              View All Achievements
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm">Log Workout</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MapPin className="h-6 w-6" />
              <span className="text-sm">Find Route</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Plan Training</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">View Stats</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};