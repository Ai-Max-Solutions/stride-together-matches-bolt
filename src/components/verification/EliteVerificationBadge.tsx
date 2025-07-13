import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  Crown, 
  Shield,
  CheckCircle2,
  Verified
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type VerificationLevel = 
  | 'amateur'
  | 'competitive' 
  | 'elite'
  | 'professional'
  | 'olympic'
  | 'coach_certified'
  | 'coach_elite'
  | 'verified_strava'
  | 'verified_results';

interface VerificationBadgeProps {
  level: VerificationLevel;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const verificationConfig = {
  amateur: {
    icon: Star,
    label: 'Amateur',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Regular fitness enthusiast'
  },
  competitive: {
    icon: Medal,
    label: 'Competitive',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Competes in local races'
  },
  elite: {
    icon: Trophy,
    label: 'Advanced',
    color: 'bg-amber-100 text-amber-800 border-amber-400',
    description: 'Advanced performance level'
  },
  professional: {
    icon: Award,
    label: 'Professional',
    color: 'bg-purple-100 text-purple-800 border-purple-400',
    description: 'Professional athlete'
  },
  olympic: {
    icon: Crown,
    label: 'Olympic',
    color: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-amber-500',
    description: 'Olympic/International level'
  },
  coach_certified: {
    icon: Shield,
    label: 'Certified Coach',
    color: 'bg-green-100 text-green-800 border-green-400',
    description: 'Certified fitness coach'
  },
  coach_elite: {
    icon: Crown,
    label: 'Expert Coach',
    color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500',
    description: 'Expert/professional coach'
  },
  verified_strava: {
    icon: CheckCircle2,
    label: 'Strava Verified',
    color: 'bg-orange-100 text-orange-800 border-orange-400',
    description: 'Strava account verified'
  },
  verified_results: {
    icon: Verified,
    label: 'Results Verified',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-400',
    description: 'Race results verified'
  }
};

export const VerificationBadge = ({ 
  level, 
  className, 
  showLabel = true,
  size = 'md' 
}: VerificationBadgeProps) => {
  const config = verificationConfig[level];
  const IconComponent = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border-2 shadow-sm',
        config.color,
        sizeClasses[size],
        className
      )}
      title={config.description}
    >
      <IconComponent className={iconSizes[size]} />
      {showLabel && config.label}
    </Badge>
  );
};

// Verification level checker component
interface VerificationStatusProps {
  verifications: VerificationLevel[];
  className?: string;
}

export const VerificationStatus = ({ verifications, className }: VerificationStatusProps) => {
  const getHighestLevel = (): VerificationLevel => {
    const hierarchy: VerificationLevel[] = [
      'amateur', 'competitive', 'elite', 'professional', 'olympic'
    ];
    
    for (let i = hierarchy.length - 1; i >= 0; i--) {
      if (verifications.includes(hierarchy[i])) {
        return hierarchy[i];
      }
    }
    return 'amateur';
  };

  const highestLevel = getHighestLevel();
  const hasCoachVerification = verifications.some(v => v.startsWith('coach_'));
  const hasDataVerification = verifications.some(v => v.startsWith('verified_'));

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* Primary level badge */}
      <VerificationBadge level={highestLevel} />
      
      {/* Coach certification */}
      {hasCoachVerification && (
        <VerificationBadge 
          level={verifications.includes('coach_elite') ? 'coach_elite' : 'coach_certified'} 
          size="sm"
        />
      )}
      
      {/* Data verifications */}
      {verifications.includes('verified_strava') && (
        <VerificationBadge level="verified_strava" size="sm" showLabel={false} />
      )}
      {verifications.includes('verified_results') && (
        <VerificationBadge level="verified_results" size="sm" showLabel={false} />
      )}
    </div>
  );
};

// Legacy export for backwards compatibility
export const EliteVerificationBadge = VerificationBadge;