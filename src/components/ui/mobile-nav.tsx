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
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border",
        "safe-area-inset-bottom", // Handles iPhone notch
        className
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-2">
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
                  "flex flex-col items-center gap-1 h-auto py-2 px-3 min-h-[44px] min-w-[44px]",
                  "transition-colors duration-200",
                  isActive && "text-primary bg-primary/10"
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  {item.badge && item.badge > 0 && (
                    <span 
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]"
                      aria-label={`${item.badge} unread messages`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}