import { ReactNode } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetOverlay } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  className
}: MobileBottomSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetOverlay className="glass-effect bg-black/20 backdrop-blur-sm" />
      <SheetContent 
        side="bottom" 
        className={cn(
          "h-[85vh] rounded-t-3xl border-t-2 border-primary/10",
          "glass-heavy backdrop-blur-xl",
          "shadow-2xl shadow-black/20",
          "transform transition-transform duration-300 ease-out",
          className
        )}
      >
        <SheetHeader className="space-y-2 pb-6 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SheetTitle className="text-left text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-left text-sm text-muted-foreground mt-2 leading-relaxed">
                  {description}
                </SheetDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full glass-button hover-scale"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Pull indicator */}
          <div className="w-12 h-1.5 bg-gradient-primary rounded-full mx-auto opacity-60 animate-pulse" />
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto scrollbar-premium px-1">
          {children}
        </div>
        
        {/* Safe area padding for iOS */}
        <div className="safe-bottom" />
      </SheetContent>
    </Sheet>
  );
}