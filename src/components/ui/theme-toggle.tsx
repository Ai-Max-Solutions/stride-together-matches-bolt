import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'dropdown' | 'switch';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ 
  className, 
  variant = 'button', 
  size = 'md' 
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
    
    // Store preference
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
      default:
        return Sun;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System theme';
      default:
        return 'Toggle theme';
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("glass-button", className)}
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Sun className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={toggleTheme}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            "glass-effect hover:glass-medium",
            theme === 'dark' ? "bg-primary" : "bg-muted"
          )}
          aria-label={getThemeLabel()}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              "shadow-lg",
              theme === 'dark' ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  if (variant === 'dropdown') {
    const Icon = getThemeIcon();
    
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={cn(
            "glass-button hover-scale transition-all duration-300",
            size === 'sm' && "h-8 w-8",
            size === 'lg' && "h-12 w-12"
          )}
          aria-label={getThemeLabel()}
        >
          <Icon className={cn(
            "transition-all duration-300",
            size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-6 w-6" : "h-4 w-4"
          )} />
        </Button>
        
        {/* Theme indicator */}
        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-primary/20 border border-primary/40 animate-pulse" />
      </div>
    );
  }

  // Default button variant
  const Icon = getThemeIcon();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "glass-button hover-scale transition-all duration-300 relative overflow-hidden",
        size === 'sm' && "h-8 w-8",
        size === 'lg' && "h-12 w-12",
        className
      )}
      aria-label={getThemeLabel()}
    >
      <Icon className={cn(
        "transition-all duration-300",
        size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-6 w-6" : "h-4 w-4"
      )} />
      
      {/* Animated background on theme change */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
    </Button>
  );
}

// Hook for theme detection
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);

    const updateResolvedTheme = () => {
      if (savedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(savedTheme as 'light' | 'dark');
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateResolvedTheme);

    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, []);

  return { theme, resolvedTheme };
}