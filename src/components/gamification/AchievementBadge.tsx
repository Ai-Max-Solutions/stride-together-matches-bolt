import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  points: number;
  earned?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showPoints?: boolean;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  title,
  description,
  points,
  earned = false,
  size = 'md',
  showPoints = true,
  className
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-24 h-24 text-base'
  };

  return (
    <div className={cn(
      "relative flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-300",
      earned 
        ? "border-primary bg-primary/5 shadow-md" 
        : "border-muted bg-muted/10 opacity-60",
      earned && "hover:scale-105 hover:shadow-lg",
      className
    )}>
      {/* Badge Icon */}
      <div className={cn(
        "flex items-center justify-center rounded-full bg-background border-2 mb-2",
        sizeClasses[size],
        earned ? "border-primary text-primary" : "border-muted text-muted-foreground"
      )}>
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Badge Info */}
      <div className="text-center space-y-1">
        <h4 className={cn(
          "font-semibold",
          earned ? "text-foreground" : "text-muted-foreground"
        )}>
          {title}
        </h4>
        
        {size !== 'sm' && (
          <p className={cn(
            "text-xs max-w-24 leading-tight",
            earned ? "text-muted-foreground" : "text-muted-foreground/70"
          )}>
            {description}
          </p>
        )}
        
        {showPoints && (
          <Badge 
            variant={earned ? "default" : "secondary"}
            className="text-xs"
          >
            {points} pts
          </Badge>
        )}
      </div>

      {/* Earned indicator */}
      {earned && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <span className="text-xs text-primary-foreground">✓</span>
        </div>
      )}

      {/* Lock indicator for unearned badges */}
      {!earned && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted rounded-full flex items-center justify-center border-2 border-background">
          <span className="text-xs text-muted-foreground">🔒</span>
        </div>
      )}
    </div>
  );
};