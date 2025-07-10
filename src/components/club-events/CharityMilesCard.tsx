import { Award, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CharityMilesCardProps {
  totalMiles: number;
  recentEvents?: number;
}

export const CharityMilesCard = ({ totalMiles, recentEvents = 0 }: CharityMilesCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Charity Miles</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalMiles.toFixed(1)} km</div>
        <CardDescription className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {recentEvents} events this month
        </CardDescription>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>Making a difference, one step at a time</span>
        </div>
      </CardContent>
    </Card>
  );
};