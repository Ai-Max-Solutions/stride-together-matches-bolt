import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Search, 
  MessageCircle, 
  User,
  Settings 
} from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: number;
}

interface MobileNavProps {
  unreadCount?: number;
  className?: string;
}

export function MobileNav({ unreadCount = 0, className }: MobileNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: 'Home',
      path: '/browse'
    },
    {
      icon: Search,
      label: 'Browse',
      path: '/browse'
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      path: '/messages',
      badge: unreadCount
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings'
    }
  ];

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "glass-nav border-t border-white/10",
        "backdrop-blur-xl bg-background/80",
        "shadow-2xl shadow-black/10",
        "safe-area-inset-bottom",
        className
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1.5 h-auto py-2 px-3 min-h-[52px] min-w-[52px]",
                  "transition-all duration-300 ease-out rounded-xl",
                  "hover-scale active-scale",
                  isActive 
                    ? "text-primary bg-gradient-primary/10 glass-light shadow-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-primary scale-110" : "text-muted-foreground"
                  )} />
                  {item.badge && item.badge > 0 && (
                    <span 
                      className={cn(
                        "absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]",
                        "bg-gradient-to-r from-destructive to-red-500 text-white",
                        "shadow-lg animate-pulse border-2 border-white/20"
                      )}
                      aria-label={`${item.badge} unread messages`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium transition-all duration-300",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </nav>
  );
}