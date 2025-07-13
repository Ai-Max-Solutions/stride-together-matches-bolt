import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Clock, Star, Trophy, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgesProps {
  profile: {
    created_at?: string;
    email?: string;
    sports?: string[];
    full_name?: string;
    selfie_verified?: boolean;
  };
  className?: string;
  size?: 'sm' | 'md';
}

export function TrustBadges({ profile, className, size = 'md' }: TrustBadgesProps) {
  const getBadges = () => {
    const badges = [];
    
    // Elite Selfie verified badge (highest priority)
    if (profile.selfie_verified) {
      badges.push({
        icon: Crown,
        label: 'Elite Verified',
        color: 'text-white',
        bg: 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 shadow-lg shadow-green-200',
        isElite: true
      });
    } else if (profile.email) {
      // Email verified badge (fallback if no selfie verification)
      badges.push({
        icon: CheckCircle,
        label: 'Email Verified',
        color: 'text-green-700',
        bg: 'bg-green-100 border-green-300'
      });
    }
    
    // Community member badge (based on creation date)
    if (profile.created_at && !profile.selfie_verified) {
      const createdAt = new Date(profile.created_at);
      const monthsAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsAgo >= 3) {
        badges.push({
          icon: Trophy,
          label: 'Trusted Member',
          color: 'text-blue-700',
          bg: 'bg-blue-100 border-blue-300'
        });
      } else if (monthsAgo >= 1) {
        badges.push({
          icon: Star,
          label: 'Active Member',
          color: 'text-purple-700',
          bg: 'bg-purple-100 border-purple-300'
        });
      }
    }
    
    // Multi-sport badge
    if (profile.sports && profile.sports.length >= 3) {
      badges.push({
        icon: Star,
        label: 'Multi-Sport',
        color: 'text-orange-700',
        bg: 'bg-orange-100 border-orange-300'
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
              "flex items-center gap-1.5 border-2 font-semibold transition-all duration-300 hover:scale-105",
              badge.bg,
              badge.color,
              badge.isElite 
                ? size === 'sm' ? 'text-[11px] px-2 py-1 h-6' : 'text-sm px-3 py-1.5'
                : size === 'sm' ? 'text-[10px] px-1.5 py-0.5 h-5' : 'text-xs px-2 py-1',
              badge.isElite && 'animate-pulse shadow-md'
            )}
          >
            {Icon && <Icon className={cn(
              badge.isElite
                ? size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
                : size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'
            )} />}
            {badge.label}
            {badge.isElite && <span className="ml-1">✨</span>}
          </Badge>
        );
      })}
    </div>
  );
}