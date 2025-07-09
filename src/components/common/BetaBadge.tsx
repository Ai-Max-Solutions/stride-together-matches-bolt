import { Badge } from '@/components/ui/badge';
import { TestTube } from 'lucide-react';

export const BetaBadge = () => {
  return (
    <Badge 
      variant="secondary" 
      className="fixed top-4 right-4 z-50 bg-primary/10 text-primary border-primary/20 font-medium"
    >
      <TestTube className="h-3 w-3 mr-1" />
      BETA
    </Badge>
  );
};