import { forwardRef, ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface OptimizedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'glass' | 'hero';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  glow?: boolean;
  className?: string;
}

export const OptimizedButton = forwardRef<HTMLButtonElement, OptimizedButtonProps>(
  ({
    children,
    variant = 'default',
    size = 'md',
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    rounded = 'lg',
    glow = false,
    className,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = cn(
      // Base button styling
      "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "touch-manipulation select-none",
      "will-change-transform",
      
      // Size variants
      size === 'sm' && "h-9 px-3 text-sm min-w-[36px]",
      size === 'md' && "h-11 px-4 text-sm min-w-[44px]",
      size === 'lg' && "h-12 px-6 text-base min-w-[48px]",
      size === 'xl' && "h-14 px-8 text-lg min-w-[56px]",
      size === 'icon' && "h-11 w-11",
      
      // Border radius
      rounded === 'sm' && "rounded-md",
      rounded === 'md' && "rounded-lg",
      rounded === 'lg' && "rounded-xl",
      rounded === 'xl' && "rounded-2xl",
      rounded === 'full' && "rounded-full",
      
      // Full width
      fullWidth && "w-full",
      
      // Glow effect
      glow && "hover:shadow-lg hover:shadow-primary/25",
      
      // Interactive states
      !disabled && !loading && "hover-scale active-scale",
      
      className
    );

    const variantClasses = cn(
      // Variant-specific styling
      variant === 'default' && "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg",
      variant === 'primary' && "bg-gradient-primary text-white shadow-primary hover:shadow-lg hover:scale-105",
      variant === 'secondary' && "bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/90",
      variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
      variant === 'outline' && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      variant === 'glass' && "glass-button hover:glass-medium",
      variant === 'hero' && "bg-gradient-hero text-white shadow-xl hover:shadow-2xl hover:scale-105"
    );

    const isLoading = loading || disabled;
    const showIcon = icon && !loading;
    const showLoadingIcon = loading;

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses)}
        disabled={isLoading}
        {...props}
      >
        {/* Loading spinner */}
        {showLoadingIcon && (
          <Loader2 className={cn(
            "animate-spin",
            size === 'sm' ? "h-3 w-3" : "h-4 w-4",
            (children || loadingText) && "mr-2"
          )} />
        )}
        
        {/* Left icon */}
        {showIcon && iconPosition === 'left' && (
          <span className={cn(
            size === 'sm' ? "h-3 w-3" : "h-4 w-4",
            children && "mr-2"
          )}>
            {icon}
          </span>
        )}
        
        {/* Button text */}
        {loading && loadingText ? loadingText : children}
        
        {/* Right icon */}
        {showIcon && iconPosition === 'right' && (
          <span className={cn(
            size === 'sm' ? "h-3 w-3" : "h-4 w-4",
            children && "ml-2"
          )}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);

OptimizedButton.displayName = 'OptimizedButton';

// Button Group Component
interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonGroup = ({ 
  children, 
  className, 
  orientation = 'horizontal',
  size = 'md' 
}: ButtonGroupProps) => (
  <div className={cn(
    "inline-flex",
    orientation === 'horizontal' ? "flex-row" : "flex-col",
    "rounded-xl overflow-hidden shadow-md",
    "glass-light border border-white/20",
    className
  )}>
    {children}
  </div>
);

// Floating Action Button
interface FABProps extends Omit<OptimizedButtonProps, 'variant' | 'size'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset?: 'sm' | 'md' | 'lg';
}

export const FloatingActionButton = ({ 
  children, 
  position = 'bottom-right',
  offset = 'md',
  className,
  ...props 
}: FABProps) => {
  const positionClasses = cn(
    "fixed z-50",
    position === 'bottom-right' && "bottom-4 right-4",
    position === 'bottom-left' && "bottom-4 left-4",
    position === 'top-right' && "top-4 right-4",
    position === 'top-left' && "top-4 left-4",
    
    offset === 'sm' && "m-2",
    offset === 'md' && "m-4",
    offset === 'lg' && "m-6"
  );

  return (
    <OptimizedButton
      variant="primary"
      size="lg"
      rounded="full"
      glow
      className={cn(
        positionClasses,
        "h-14 w-14 shadow-2xl hover:shadow-primary/40",
        "animate-bounce-light",
        className
      )}
      {...props}
    >
      {children}
    </OptimizedButton>
  );
};

// Icon Button
interface IconButtonProps extends Omit<OptimizedButtonProps, 'children'> {
  icon: ReactNode;
  label: string;
  tooltip?: string;
}

export const IconButton = ({ 
  icon, 
  label, 
  tooltip, 
  size = 'md',
  ...props 
}: IconButtonProps) => (
  <OptimizedButton
    size="icon"
    aria-label={label}
    title={tooltip || label}
    {...props}
  >
    {icon}
  </OptimizedButton>
);

// Toggle Button
interface ToggleButtonProps extends Omit<OptimizedButtonProps, 'variant'> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

export const ToggleButton = ({ 
  pressed = false, 
  onPressedChange,
  children,
  className,
  ...props 
}: ToggleButtonProps) => (
  <OptimizedButton
    variant={pressed ? 'primary' : 'outline'}
    className={cn(
      "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
      pressed && "bg-primary text-primary-foreground",
      className
    )}
    onClick={() => onPressedChange?.(!pressed)}
    aria-pressed={pressed}
    {...props}
  >
    {children}
  </OptimizedButton>
);