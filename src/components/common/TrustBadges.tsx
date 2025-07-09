import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgesProps {
  profile: {
    created_at?: string;
    email?: string;
    sports?: string[];
    full_name?: string;
  };
  className?: string;
  size?: 'sm' | 'md';
}

export function TrustBadges({ profile, className, size = 'md' }: TrustBadgesProps) {
  const getBadges = () => {
    const badges = [];
    
    // Verified email badge
    if (profile.email) {
      badges.push({
        icon: CheckCircle,
        label: 'Verified',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
      });
    }
    
    // Community member badge (based on creation date)
    if (profile.created_at) {
      const createdAt = new Date(profile.created_at);
      const monthsAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsAgo >= 3) {
        badges.push({
          icon: Shield,
          label: 'Trusted Member',
          color: 'text-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
        });
      } else if (monthsAgo >= 1) {
        badges.push({
          icon: Clock,
          label: 'Active Member',
          color: 'text-purple-600',
          bg: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
        });
      }
    }
    
    // Multi-sport badge
    if (profile.sports && profile.sports.length >= 3) {
      badges.push({
        icon: null,
        label: 'Multi-Sport',
        color: 'text-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
      });
    }
    
    return badges.slice(0, 2); // Show max 2 badges
  };

  const badges = getBadges();
  
  if (badges.length === 0) return null;

  return (
    <div className={cn("flex gap-1", className)}>
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <Badge 
            key={index}
            variant="outline" 
            className={cn(
              "flex items-center gap-1 border",
              badge.bg,
              badge.color,
              size === 'sm' ? 'text-[10px] px-1.5 py-0.5 h-5' : 'text-xs'
            )}
          >
            {Icon && <Icon className={cn(size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />}
            {badge.label}
          </Badge>
        );
      })}
    </div>
  );
}