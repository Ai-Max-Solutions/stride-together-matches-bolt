import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, X } from 'lucide-react';
import { ConfettiEffect } from './ConfettiEffect';
import { cn } from '@/lib/utils';

interface MatchToastProps {
  isVisible: boolean;
  otherUser: {
    name: string;
    avatar?: string;
  };
  isMatch: boolean;
  onStartChat: () => void;
  onDismiss: () => void;
}

export function MatchToast({ isVisible, otherUser, isMatch, onStartChat, onDismiss }: MatchToastProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible && isMatch) {
      setShowConfetti(true);
      // Stop confetti after animation
      const timeout = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, isMatch]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <ConfettiEffect isActive={showConfetti} />
      
      <div className={cn(
        "relative max-w-sm w-full bg-card rounded-2xl shadow-2xl border border-border p-6 text-center animate-fade-in-up",
        isMatch && "bg-gradient-to-br from-primary/5 to-accent/5"
      )}>
        {isMatch && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-5 animate-pulse"></div>
        )}
        
        <div className="relative z-10">
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className={cn(
                "h-16 w-16 ring-4 transition-all duration-500",
                isMatch ? "ring-primary/30" : "ring-muted"
              )}>
                <AvatarImage src={otherUser.avatar} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {otherUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {isMatch && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center animate-bounce-light">
                  <Heart className="h-4 w-4 text-white fill-white" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              {isMatch ? (
                <>
                  <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    It's a Match! 🎉
                  </h3>
                  <p className="text-muted-foreground">
                    You and <span className="font-semibold text-foreground">{otherUser.name}</span> both want to connect!
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">Connection Sent! ✨</h3>
                  <p className="text-muted-foreground">
                    Your connection request has been sent to <span className="font-semibold text-foreground">{otherUser.name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We'll notify them when they're back online!
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3 w-full">
              {isMatch ? (
                <>
                  <Button
                    onClick={onStartChat}
                    className="flex-1 bg-gradient-primary hover:shadow-primary button-bounce"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chatting
                  </Button>
                  <Button variant="outline" onClick={onDismiss} className="button-bounce">
                    Later
                  </Button>
                </>
              ) : (
                <Button onClick={onDismiss} variant="outline" className="w-full button-bounce">
                  Got it!
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}