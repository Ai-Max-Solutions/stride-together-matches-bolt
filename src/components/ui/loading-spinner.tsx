import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8'
};

export function LoadingSpinner({ className, size = 'md', message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={cn(
        "relative animate-spin rounded-full border-2 border-transparent",
        "bg-gradient-primary bg-clip-border",
        "before:content-[''] before:absolute before:inset-0 before:rounded-full",
        "before:bg-gradient-to-r before:from-primary before:to-accent before:p-[2px]",
        "before:mask-composite:exclude before:mask-radial-gradient",
        sizeClasses[size],
        className
      )}>
        <div className={cn(
          "rounded-full bg-background",
          sizeClasses[size]
        )} />
      </div>
      {message && (
        <p className="text-muted-foreground mt-3 text-sm font-medium animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Alternative spinner with dots
export function DotsSpinner({ className, size = 'md' }: Omit<LoadingSpinnerProps, 'message'>) {
  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-primary animate-pulse",
            dotSize[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
}

// Skeleton loader component
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded animate-shimmer"
            style={{
              width: i === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-shimmer",
        variant === 'circular' && "rounded-full",
        variant === 'rectangular' && "rounded-lg",
        variant === 'text' && "h-4 rounded",
        className
      )}
      style={{ width, height }}
    />
  );
}