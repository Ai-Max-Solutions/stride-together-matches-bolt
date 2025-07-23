import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'premium' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export const MobileOptimizedCard = forwardRef<HTMLDivElement, MobileOptimizedCardProps>(
  ({ children, className, variant = 'default', size = 'md', hover = false, onClick }, ref) => {
    const baseClasses = cn(
      // Base card styling
      "rounded-xl border transition-all duration-300 ease-out",
      "focus-within:ring-2 focus-within:ring-primary/20",
      
      // Mobile-first responsive padding
      size === 'sm' && "p-3 sm:p-4",
      size === 'md' && "p-4 sm:p-6",
      size === 'lg' && "p-6 sm:p-8",
      
      // Variant-specific styling
      variant === 'default' && "bg-card border-border shadow-card",
      variant === 'glass' && "glass-effect border-white/20",
      variant === 'premium' && "glass-card bg-gradient-card border-primary/10",
      variant === 'interactive' && "glass-card cursor-pointer hover-lift active-scale",
      
      // Hover effects (only on non-touch devices)
      hover && "hover:shadow-card-hover hover:border-primary/20",
      
      // Click handler styling
      onClick && "cursor-pointer select-none",
      
      // Touch optimization
      "touch-manipulation",
      
      className
    );

    return (
      <div
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
      >
        {children}
      </div>
    );
  }
);

MobileOptimizedCard.displayName = 'MobileOptimizedCard';

// Card Header Component
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4", className)}>
    {children}
  </div>
);

// Card Title Component
interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = ({ children, className, as: Component = 'h3' }: CardTitleProps) => (
  <Component className={cn(
    "font-semibold leading-none tracking-tight",
    "text-lg sm:text-xl", // Responsive text sizing
    className
  )}>
    {children}
  </Component>
);

// Card Description Component
interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const CardDescription = ({ children, className }: CardDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground leading-relaxed", className)}>
    {children}
  </p>
);

// Card Content Component
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent = ({ children, className }: CardContentProps) => (
  <div className={cn("space-y-4", className)}>
    {children}
  </div>
);

// Card Footer Component
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className }: CardFooterProps) => (
  <div className={cn("flex items-center pt-4 border-t border-border/50", className)}>
    {children}
  </div>
);

// Specialized Cards for Common Use Cases

// Profile Card
interface ProfileCardProps {
  avatar: ReactNode;
  name: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ProfileCard = ({ 
  avatar, 
  name, 
  subtitle, 
  actions, 
  children, 
  className,
  onClick 
}: ProfileCardProps) => (
  <MobileOptimizedCard 
    variant="premium" 
    hover 
    onClick={onClick}
    className={className}
  >
    <CardHeader>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="truncate">{name}</CardTitle>
          {subtitle && (
            <CardDescription className="truncate">{subtitle}</CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </CardHeader>
    {children && (
      <CardContent>
        {children}
      </CardContent>
    )}
  </MobileOptimizedCard>
);

// Stats Card
interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export const StatsCard = ({ icon, title, value, change, className }: StatsCardProps) => (
  <MobileOptimizedCard variant="glass" size="sm" className={className}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      {change && (
        <div className={cn(
          "text-sm font-medium",
          change.trend === 'up' && "text-success",
          change.trend === 'down' && "text-destructive",
          change.trend === 'neutral' && "text-muted-foreground"
        )}>
          {change.value}
        </div>
      )}
    </div>
  </MobileOptimizedCard>
);

// Action Card
interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
  className?: string;
}

export const ActionCard = ({ icon, title, description, action, className }: ActionCardProps) => (
  <MobileOptimizedCard variant="interactive" className={className}>
    <CardHeader>
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-primary text-white">
          {icon}
        </div>
        <div className="flex-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardFooter>
      {action}
    </CardFooter>
  </MobileOptimizedCard>
);