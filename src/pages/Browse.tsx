import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner, Skeleton } from '@/components/ui/loading-spinner';
import { MobileOptimizedCard, ProfileCard, StatsCard, ActionCard } from '@/components/ui/mobile-optimized-card';
import { OptimizedButton, FloatingActionButton } from '@/components/ui/optimized-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { MobileNav } from '@/components/ui/mobile-nav';
import { useFlashRuns } from '@/hooks/use-flash-runs';
import { FlashRunsList, FlashRunFAB, FlashRunModal, FlashRideModal, FlashWorkoutModal, FlashYogaModal } from '@/components/flash-runs';
import { AIMatchingCard } from '@/components/AIMatchingCard';
import { TrainingPlanCard } from '@/components/training/TrainingPlanCard';
import { LeaderboardCard } from '@/components/competition/LeaderboardCard';
import MatchCard from '@/components/common/match-card';
import ProfileCard from '@/components/ProfileCard';
import Navigation from '@/components/Navigation';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Zap, 
  Target, 
  Trophy,
  TrendingUp,
  Calendar,
  Activity,
  Heart,
  Star,
  Plus,
  Sparkles,
  Clock,
  Award,
  Dumbbell,
  Bike,
  Waves
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  city: string | null;
  region: string | null;
  sports: string[] | null;
  experience_level: string | null;
  fitness_goals: string[] | null;
  mentor_specialties: string[] | null;
  is_mentor_available: boolean | null;
  years_experience: number | null;
  availability: Record<string, string[]> | null;
  trust_score: number | null;
  profile_picture_url: string | null;
  last_active_at: string | null;
  verification_level?: 'amateur' | 'competitive' | 'expert' | 'professional' | 'olympic';
  verifications?: string[];
}

interface MatchScore {
  score: number;
  reasons: string[];
  tags: string[];
}

export default function Browse() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isMobile } = useMobileDetection();

  // State management
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');

  // Flash Runs
  const { flashRuns, loading: flashRunsLoading, createFlashRun, joinFlashRun, leaveFlashRun } = useFlashRuns();
  const [showFlashRunModal, setShowFlashRunModal] = useState(false);
  const [showFlashRideModal, setShowFlashRideModal] = useState(false);
  const [showFlashWorkoutModal, setShowFlashWorkoutModal] = useState(false);
  const [showFlashYogaModal, setShowFlashYogaModal] = useState(false);

  // Mock data for enhanced features
  const mockAIRecommendations = [
    {
      profile: {
        id: '1',
        name: 'Sarah Chen',
        sport: 'Running',
        pace: '5:30/km',
        location: 'San Francisco, CA',
        matchPercentage: 94
      },
      reasons: [
        { type: 'pace' as const, description: 'Similar 5K pace (5:25 vs 5:30)', score: 0.95 },
        { type: 'location' as const, description: 'Lives 2.3km away', score: 0.9 },
        { type: 'goals' as const, description: 'Both training for half marathon', score: 0.98 },
        { type: 'availability' as const, description: 'Free mornings and weekends', score: 0.85 }
      ],
      confidenceScore: 0.92
    }
  ];

  const mockTrainingPlans = [
    {
      id: '1',
      title: 'Expert Marathon Training',
      description: 'Advanced 16-week program for sub-3:30 marathon',
      duration: 16,
      difficulty: 'expert' as const,
      sport: 'Running',
      goal: 'Marathon PR',
      weeklyHours: 8,
      sessionsPerWeek: 5,
      author: {
        name: 'Coach Martinez',
        avatar: '',
        isVerified: true,
        isCoach: true
      },
      stats: {
        downloads: 1247,
        rating: 4.8,
        reviews: 89,
        likes: 234
      },
      tags: ['Advanced', 'Marathon', 'Speed Work'],
      isPremium: false
    }
  ];

  const mockLeaderboard = {
    id: '1',
    title: 'Weekly Distance Challenge',
    description: 'Most kilometers run this week',
    type: 'distance' as const,
    sport: 'Running',
    duration: '7 days',
    participantCount: 156,
    prize: 'Personal Coaching Session',
    endDate: 'in 3 days',
    isActive: true
  };

  const mockLeaderboardEntries = [
    {
      rank: 1,
      athlete: {
        id: '1',
        name: 'Alex Rodriguez',
        avatar: '',
        location: 'San Francisco, CA',
        isVerified: true
      },
      score: 87.5,
      metric: 'distance',
      metricValue: '87.5 km',
      change: 2,
      joinedDate: '2024-01-15'
    }
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchProfiles();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchQuery, selectedSport, selectedLevel, selectedLocation]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id)
        .order('last_active_at', { ascending: false, nullsLast: true });

      if (error) throw error;
      setProfiles((data || []) as Profile[]);
    } catch (err: any) {
      toast({
        title: "Error loading profiles",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    if (searchQuery) {
      filtered = filtered.filter(profile =>
        profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSport !== 'all') {
      filtered = filtered.filter(profile =>
        profile.sports?.includes(selectedSport)
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(profile =>
        profile.experience_level === selectedLevel
      );
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(profile =>
        profile.city?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredProfiles(filtered);
  };

  const generateMatchScore = (profile: Profile): MatchScore => {
    const score = Math.floor(Math.random() * 30) + 70; // 70-100%
    return {
      score,
      reasons: ['Compatible pace', 'Similar goals', 'Great location match'],
      tags: ['Running Buddy', 'Morning Workouts', 'Marathon Training']
    };
  };

  const handleConnect = async (profileId: string) => {
    try {
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;

      const { data: conversationId } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user?.id,
        user2_id: profile.user_id
      });

      if (conversationId) {
        navigate(`/chat/${conversationId}`);
      }
    } catch (err: any) {
      toast({
        title: "Connection failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const uniqueSports = useMemo(() => {
    const sports = new Set<string>();
    profiles.forEach(profile => {
      profile.sports?.forEach(sport => sports.add(sport));
    });
    return Array.from(sports);
  }, [profiles]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    profiles.forEach(profile => {
      if (profile.city) locations.add(profile.city);
    });
    return Array.from(locations);
  }, [profiles]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your fitness community..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {!isMobile && <Navigation />}
      
      <div className={cn(
        "container mx-auto px-4 max-w-7xl",
        isMobile ? "pt-4 pb-24" : "py-8"
      )}>
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Find Your Perfect Workout Partner
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Connect. Train. Succeed—together. From couch-to-5K beginners to seasoned marathoners.
              </p>
            </div>
            {!isMobile && <ThemeToggle variant="dropdown" />}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={<Users className="h-5 w-5" />}
              title="Active Athletes"
              value={profiles.length}
              change={{ value: "+12%", trend: "up" }}
            />
            <StatsCard
              icon={<Zap className="h-5 w-5" />}
              title="Flash Runs"
              value={flashRuns.length}
              change={{ value: "Live now", trend: "neutral" }}
            />
            <StatsCard
              icon={<Target className="h-5 w-5" />}
              title="Perfect Matches"
              value="94%"
              change={{ value: "AI Powered", trend: "up" }}
            />
            <StatsCard
              icon={<Trophy className="h-5 w-5" />}
              title="Success Rate"
              value="89%"
              change={{ value: "+5%", trend: "up" }}
            />
          </div>
        </div>

        {/* Search and Filters */}
        <MobileOptimizedCard variant="glass" className="mb-6 animate-fade-in">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, sport, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-light border-white/20 min-h-[48px]"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <OptimizedButton
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                icon={<Filter className="h-4 w-4" />}
                className="glass-button"
              >
                Filters
                {(selectedSport !== 'all' || selectedLevel !== 'all' || selectedLocation !== 'all') && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {[selectedSport, selectedLevel, selectedLocation].filter(f => f !== 'all').length}
                  </Badge>
                )}
              </OptimizedButton>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="glass-light">
                  {filteredProfiles.length} athletes
                </Badge>
              </div>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/20 animate-slide-down">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sport</label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger className="glass-light border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-modal">
                      <SelectItem value="all">All Sports</SelectItem>
                      {uniqueSports.map(sport => (
                        <SelectItem key={sport} value={sport} className="capitalize">
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Experience</label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="glass-light border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-modal">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="glass-light border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-modal">
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </MobileOptimizedCard>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass-light border border-white/20 p-1">
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Perfect Matches</span>
              <span className="sm:hidden">Matches</span>
            </TabsTrigger>
            <TabsTrigger value="flash" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Flash Runs</span>
              <span className="sm:hidden">Flash</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Training Plans</span>
              <span className="sm:hidden">Training</span>
            </TabsTrigger>
            <TabsTrigger value="compete" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Competitions</span>
              <span className="sm:hidden">Compete</span>
            </TabsTrigger>
          </TabsList>

          {/* Perfect Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            {/* AI Recommendations */}
            <AIMatchingCard recommendations={mockAIRecommendations} />

            {/* Profile Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MobileOptimizedCard key={i} variant="glass">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Skeleton variant="circular" width={48} height={48} />
                        <div className="space-y-2 flex-1">
                          <Skeleton variant="text" width="60%" height={16} />
                          <Skeleton variant="text" width="40%" height={14} />
                        </div>
                      </div>
                      <Skeleton variant="text" lines={2} />
                      <div className="flex gap-2">
                        <Skeleton width={60} height={24} />
                        <Skeleton width={80} height={24} />
                      </div>
                    </div>
                  </MobileOptimizedCard>
                ))}
              </div>
            ) : filteredProfiles.length === 0 ? (
              <MobileOptimizedCard variant="glass" className="text-center py-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search terms to find more workout partners.
                    </p>
                  </div>
                  <OptimizedButton
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSport('all');
                      setSelectedLevel('all');
                      setSelectedLocation('all');
                    }}
                  >
                    Clear Filters
                  </OptimizedButton>
                </div>
              </MobileOptimizedCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                  <MatchCard
                    key={profile.id}
                    profile={profile}
                    matchScore={generateMatchScore(profile)}
                    onConnect={handleConnect}
                    currentUserId={user?.id}
                    className="animate-fade-in hover-lift"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Flash Runs Tab */}
          <TabsContent value="flash" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Flash Runs List */}
              <div className="lg:col-span-2">
                <FlashRunsList
                  flashRuns={flashRuns}
                  loading={flashRunsLoading}
                  onJoin={joinFlashRun}
                  onLeave={leaveFlashRun}
                />
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <MobileOptimizedCard variant="premium">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Create Flash Event</h3>
                      <p className="text-sm text-muted-foreground">
                        Start a spontaneous workout and find partners nearby
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <OptimizedButton
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFlashRunModal(true)}
                        icon={<Activity className="h-4 w-4" />}
                        className="glass-button"
                      >
                        Run
                      </OptimizedButton>
                      <OptimizedButton
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFlashRideModal(true)}
                        icon={<Bike className="h-4 w-4" />}
                        className="glass-button"
                      >
                        Ride
                      </OptimizedButton>
                      <OptimizedButton
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFlashWorkoutModal(true)}
                        icon={<Dumbbell className="h-4 w-4" />}
                        className="glass-button"
                      >
                        Workout
                      </OptimizedButton>
                      <OptimizedButton
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFlashYogaModal(true)}
                        icon={<Heart className="h-4 w-4" />}
                        className="glass-button"
                      >
                        Yoga
                      </OptimizedButton>
                    </div>
                  </div>
                </MobileOptimizedCard>

                {/* Flash Run Stats */}
                <StatsCard
                  icon={<Clock className="h-5 w-5" />}
                  title="Avg Response Time"
                  value="3 min"
                  change={{ value: "Fast!", trend: "up" }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Training Plans Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mockTrainingPlans.map((plan) => (
                <TrainingPlanCard
                  key={plan.id}
                  plan={plan}
                  className="animate-fade-in"
                />
              ))}
            </div>
          </TabsContent>

          {/* Competitions Tab */}
          <TabsContent value="compete" className="space-y-6">
            <LeaderboardCard
              competition={mockLeaderboard}
              entries={mockLeaderboardEntries}
              currentUserRank={15}
              className="animate-fade-in"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Buttons */}
      {isMobile && (
        <>
          <FlashRunFAB onClick={() => setShowFlashRunModal(true)} />
          <FloatingActionButton
            position="bottom-left"
            icon={<Plus className="h-6 w-6" />}
            onClick={() => setActiveTab('flash')}
            className="bg-gradient-accent"
          />
        </>
      )}

      {/* Modals */}
      <FlashRunModal
        isOpen={showFlashRunModal}
        onClose={() => setShowFlashRunModal(false)}
        onSubmit={createFlashRun}
      />
      <FlashRideModal
        open={showFlashRideModal}
        onOpenChange={setShowFlashRideModal}
        onCreateFlashRide={createFlashRun}
      />
      <FlashWorkoutModal
        isOpen={showFlashWorkoutModal}
        onClose={() => setShowFlashWorkoutModal(false)}
        onSubmit={createFlashRun}
      />
      <FlashYogaModal
        open={showFlashYogaModal}
        onOpenChange={setShowFlashYogaModal}
      />

      {/* Mobile Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}