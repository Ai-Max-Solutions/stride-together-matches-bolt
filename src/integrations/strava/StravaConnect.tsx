import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity,
  Link,
  Trophy,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Zap
} from 'lucide-react';

interface StravaStats {
  totalActivities: number;
  totalDistance: number;
  totalElevation: number;
  averagePace: string;
  personalBests: {
    distance: string;
    time: string;
    type: string;
  }[];
  recentActivities: {
    id: string;
    name: string;
    type: string;
    distance: number;
    time: string;
    date: string;
  }[];
}

interface StravaConnectProps {
  isConnected?: boolean;
  stravaStats?: StravaStats;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSyncData?: () => void;
  className?: string;
}

export const StravaConnect = ({ 
  isConnected = false,
  stravaStats,
  onConnect,
  onDisconnect,
  onSyncData,
  className 
}: StravaConnectProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would redirect to Strava OAuth
      const redirectUrl = `https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=read,activity:read_all&state=strava_connect`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Strava connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await onSyncData?.();
    } catch (error) {
      console.error('Strava sync error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Connect Strava
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connect your Strava account to import workout data, track performance metrics, 
            and unlock elite athlete verification.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Benefits:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Auto-import workout data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Performance analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Elite athlete verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Competitive rankings
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Data Imported:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Recent activities</li>
                <li>• Performance metrics</li>
                <li>• Personal records</li>
                <li>• Training consistency</li>
              </ul>
            </div>
          </div>

          <Alert>
            <Trophy className="h-4 w-4" />
            <AlertDescription>
              Elite athletes with verified Strava data get priority matching and exclusive features.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Link className="h-4 w-4 mr-2" />
            {isLoading ? 'Connecting...' : 'Connect Strava Account'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Strava Connected
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      </CardHeader>
      
      {stravaStats && (
        <CardContent className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-1 text-orange-600" />
              <p className="text-sm text-muted-foreground">Activities</p>
              <p className="text-lg font-bold">{stravaStats.totalActivities}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="text-lg font-bold">{stravaStats.totalDistance}km</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Trophy className="h-6 w-6 mx-auto mb-1 text-amber-600" />
              <p className="text-sm text-muted-foreground">Elevation</p>
              <p className="text-lg font-bold">{stravaStats.totalElevation}m</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Zap className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <p className="text-sm text-muted-foreground">Avg Pace</p>
              <p className="text-lg font-bold">{stravaStats.averagePace}</p>
            </div>
          </div>

          {/* Personal Bests */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-600" />
              Personal Bests
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stravaStats.personalBests.slice(0, 3).map((pb, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">{pb.type}</p>
                  <p className="text-xs text-muted-foreground">{pb.distance}</p>
                  <p className="text-lg font-bold text-amber-600">{pb.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              Recent Activities
            </h4>
            <div className="space-y-2">
              {stravaStats.recentActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type} • {activity.distance}km • {activity.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleSync} disabled={isLoading} className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              {isLoading ? 'Syncing...' : 'Sync Latest Data'}
            </Button>
            <Button variant="outline" asChild>
              <a href="https://strava.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Strava
              </a>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};