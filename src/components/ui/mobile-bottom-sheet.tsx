import { ReactNode } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
      <SheetContent 
        side="bottom" 
        className={cn(
          "h-[85vh] rounded-t-2xl border-t-2 border-primary/10",
          "bg-background/95 backdrop-blur-sm",
          className
        )}
      >
        <SheetHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SheetTitle className="text-left text-lg font-semibold">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-left text-sm text-muted-foreground mt-1">
                  {description}
                </SheetDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Pull indicator */}
          <div className="w-12 h-1 bg-muted rounded-full mx-auto" />
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}