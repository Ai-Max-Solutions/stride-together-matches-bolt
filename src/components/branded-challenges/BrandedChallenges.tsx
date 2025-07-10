import { useState } from 'react';
import { useBrandedChallenges, BrandedChallenge } from '@/hooks/use-branded-challenges';
import { BrandedChallengeCard } from './BrandedChallengeCard';
import { ChallengeLeaderboard } from './ChallengeLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Calendar, 
  Activity,
  Plus,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BrandedChallenges() {
  const { challenges, loading, joinChallenge, updateProgress } = useBrandedChallenges();
  const { toast } = useToast();
  
  const [selectedChallenge, setSelectedChallenge] = useState<BrandedChallenge | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progressDistance, setProgressDistance] = useState('');
  const [progressChallengeId, setProgressChallengeId] = useState('');

  const activeChallenges = challenges.filter(c => 
    new Date(c.ends_at) > new Date()
  );
  
  const participatingChallenges = activeChallenges.filter(c => 
    c.user_progress?.is_participating
  );
  
  const availableChallenges = activeChallenges.filter(c => 
    !c.user_progress?.is_participating
  );

  const completedChallenges = challenges.filter(c => 
    c.user_progress?.is_completed
  );

  const handleViewLeaderboard = (challenge: BrandedChallenge) => {
    setSelectedChallenge(challenge);
    setShowLeaderboard(true);
  };

  const handleUpdateProgress = (challengeId: string) => {
    setProgressChallengeId(challengeId);
    setShowProgressDialog(true);
  };

  const handleSubmitProgress = async () => {
    const distance = parseFloat(progressDistance);
    if (!distance || distance <= 0) {
      toast({
        title: "Invalid Distance",
        description: "Please enter a valid distance",
        variant: "destructive"
      });
      return;
    }

    const success = await updateProgress(progressChallengeId, distance);
    if (success) {
      setShowProgressDialog(false);
      setProgressDistance('');
      setProgressChallengeId('');
      toast({
        title: "Progress Updated!",
        description: `Added ${distance} km to your challenge progress`,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Branded Challenges</h1>
        <p className="text-muted-foreground">
          Complete brand challenges to earn rewards, badges, and exclusive coupons
        </p>
      </div>

      {/* Quick Stats */}
      {(participatingChallenges.length > 0 || completedChallenges.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{participatingChallenges.length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{completedChallenges.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">
                {participatingChallenges.reduce((sum, c) => 
                  sum + (c.user_progress?.current_distance || 0), 0
                ).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Total KM</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{availableChallenges.length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Challenge Tabs */}
      <Tabs defaultValue="participating" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="participating" className="gap-2">
            <Activity className="h-4 w-4" />
            Participating
            {participatingChallenges.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {participatingChallenges.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-2">
            <Plus className="h-4 w-4" />
            Available
            {availableChallenges.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {availableChallenges.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <Trophy className="h-4 w-4" />
            Completed
            {completedChallenges.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {completedChallenges.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participating" className="space-y-4">
          {participatingChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
                <p className="text-muted-foreground mb-4">
                  Join a challenge to start tracking your progress
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {participatingChallenges.map((challenge) => (
                <BrandedChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={joinChallenge}
                  onViewLeaderboard={handleViewLeaderboard}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {availableChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No New Challenges</h3>
                <p className="text-muted-foreground">
                  Check back later for new brand challenges
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableChallenges.map((challenge) => (
                <BrandedChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={joinChallenge}
                  onViewLeaderboard={handleViewLeaderboard}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Completed Challenges</h3>
                <p className="text-muted-foreground">
                  Complete challenges to earn rewards and badges
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedChallenges.map((challenge) => (
                <BrandedChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={joinChallenge}
                  onViewLeaderboard={handleViewLeaderboard}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Leaderboard Dialog */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Challenge Leaderboard</DialogTitle>
          </DialogHeader>
          {selectedChallenge && (
            <ChallengeLeaderboard challenge={selectedChallenge} />
          )}
        </DialogContent>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={progressDistance}
                onChange={(e) => setProgressDistance(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitProgress}
                className="flex-1"
                disabled={!progressDistance || parseFloat(progressDistance) <= 0}
              >
                Update Progress
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowProgressDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}