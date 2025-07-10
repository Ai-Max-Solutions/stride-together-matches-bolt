import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar, Target, Trophy } from 'lucide-react';

interface ChallengeProgressProps {
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal';
  currentCount: number;
  targetCount: number;
  pointsReward: number;
  endDate: string;
  completed?: boolean;
  className?: string;
}

export const ChallengeProgress: React.FC<ChallengeProgressProps> = ({
  title,
  description,
  type,
  currentCount,
  targetCount,
  pointsReward,
  endDate,
  completed = false,
  className
}) => {
  const progress = Math.min((currentCount / targetCount) * 100, 100);
  const remainingDays = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const typeColors = {
    weekly: 'bg-blue-500',
    monthly: 'bg-purple-500', 
    seasonal: 'bg-amber-500'
  };

  const typeIcons = {
    weekly: '📅',
    monthly: '🗓️',
    seasonal: '🌟'
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      completed && "border-primary bg-primary/5",
      className
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{typeIcons[type]}</span>
                <h3 className="font-semibold text-base">{title}</h3>
                {completed && <Trophy className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <Badge variant={completed ? "default" : "secondary"} className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {pointsReward} pts
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress: {currentCount} / {targetCount}
              </span>
              <span className={cn(
                "font-medium",
                completed ? "text-primary" : "text-foreground"
              )}>
                {Math.round(progress)}%
              </span>
            </div>
            
            <Progress 
              value={progress} 
              className={cn(
                "h-2",
                completed && "bg-primary/20"
              )}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {remainingDays > 0 
                  ? `${remainingDays} days left`
                  : completed 
                    ? 'Completed!' 
                    : 'Expired'
                }
              </span>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize text-xs",
                typeColors[type].replace('bg-', 'border-').replace('500', '200')
              )}
            >
              {type}
            </Badge>
          </div>

          {/* Completion Message */}
          {completed && (
            <div className="mt-3 p-2 rounded-md bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary font-medium">
                🎉 Challenge completed! You earned {pointsReward} points!
              </p>
            </div>
          )}

          {/* Motivation Message */}
          {!completed && progress > 0 && progress < 100 && (
            <div className="mt-3 p-2 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">
                💪 You're {Math.round(progress)}% there - keep going!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};