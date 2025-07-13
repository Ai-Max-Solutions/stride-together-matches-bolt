import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  User,
  Download,
  Heart,
  Share2,
  Star,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  duration: number; // weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  sport: string;
  goal: string;
  weeklyHours: number;
  sessionsPerWeek: number;
  author: {
    name: string;
    avatar?: string;
    isVerified: boolean;
    isCoach: boolean;
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
    likes: number;
  };
  tags: string[];
  isPremium: boolean;
  price?: number;
}

interface TrainingPlanCardProps {
  plan: TrainingPlan;
  className?: string;
  onDownload?: (planId: string) => void;
  onLike?: (planId: string) => void;
  onShare?: (planId: string) => void;
}

export const TrainingPlanCard = ({ 
  plan, 
  className, 
  onDownload,
  onLike,
  onShare
}: TrainingPlanCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'elite': return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-amber-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSportIcon = (sport: string) => {
    // Could be enhanced with sport-specific icons
    return Target;
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
              {plan.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {plan.description}
            </p>
          </div>
          {plan.isPremium && (
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white">
              <Trophy className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={plan.author.avatar} />
            <AvatarFallback className="text-xs">
              {plan.author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{plan.author.name}</span>
              {plan.author.isVerified && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  Verified
                </Badge>
              )}
              {plan.author.isCoach && (
                <Badge variant="outline" className="text-xs px-1 py-0 border-amber-400 text-amber-700">
                  Coach
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Difficulty & Sport */}
        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(plan.difficulty)}>
            {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
          </Badge>
          <Badge variant="outline">
            {plan.sport}
          </Badge>
          <Badge variant="outline">
            {plan.goal}
          </Badge>
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y">
          <div className="text-center">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-sm font-semibold">{plan.duration} weeks</p>
          </div>
          <div className="text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Weekly</p>
            <p className="text-sm font-semibold">{plan.weeklyHours}h</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Sessions</p>
            <p className="text-sm font-semibold">{plan.sessionsPerWeek}/week</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {plan.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {plan.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{plan.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{plan.stats.downloads}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              <span>{plan.stats.rating}</span>
              <span className="text-xs">({plan.stats.reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{plan.stats.likes}</span>
            </div>
          </div>
          {plan.isPremium && plan.price && (
            <div className="font-semibold text-primary">
              ${plan.price}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1" 
            onClick={() => onDownload?.(plan.id)}
            disabled={plan.isPremium}
          >
            <Download className="h-4 w-4 mr-2" />
            {plan.isPremium ? 'Get Premium' : 'Download'}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onLike?.(plan.id)}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onShare?.(plan.id)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};