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
    <div className="flex flex-col items-center justify-center">
      <div className={cn(
        "animate-spin rounded-full border-b-2 border-primary",
        sizeClasses[size],
        className
      )} />
      {message && (
        <p className="text-muted-foreground mt-2 text-sm">{message}</p>
      )}
    </div>
  );
}