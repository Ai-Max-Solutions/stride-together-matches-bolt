import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  userProfile?: {
    full_name?: string;
    profile_picture_url?: string;
  };
  isVisible: boolean;
}

export function TypingIndicator({ userProfile, isVisible }: TypingIndicatorProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-center gap-2 bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
        <Avatar className="h-6 w-6 ring-1 ring-primary/10">
          <AvatarImage src={userProfile?.profile_picture_url} />
          <AvatarFallback className="text-xs bg-primary/10">
            {userProfile?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">
            {userProfile?.full_name?.split(' ')[0] || 'User'} is typing
          </span>
          <span className="text-primary font-bold min-w-[20px]">{dots}</span>
        </div>
      </div>
    </div>
  );
}