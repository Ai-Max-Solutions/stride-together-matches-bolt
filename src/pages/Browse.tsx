import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { profileQueries, memoizeQuery } from '@/lib/database-queries';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import MatchCard from '@/components/common/match-card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { usePagination } from '@/hooks/use-pagination';
import { useFlashRuns } from '@/hooks/use-flash-runs';
import { FlashRunsList } from '@/components/flash-runs/FlashRunsList';
import { FlashRunFAB } from '@/components/flash-runs/FlashRunFAB';
import { 
  LazyFlashRunModal,
  LazyFlashRideModal,
  LazyFlashWorkoutModal,
  LazyFlashYogaModal,
  preloadFlashRunModals
} from '@/components/flash-runs/lazy-modals';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
import { 
  Search, 
  Filter, 
  Users,
  Sparkles,
  Shield,
  ChevronLeft,
  ChevronRight,
  Bot,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageCircle,
  Trophy,
  Target,
  Medal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import { AISuggestions } from '@/components/chat/AISuggestions';
import { BROWSE_SPORTS_OPTIONS, BROWSE_EXPERIENCE_LEVELS } from '@/constants';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { VerificationBadge, VerificationStatus } from '@/components/verification/EliteVerificationBadge';
import { TrainingPlanCard } from '@/components/training/TrainingPlanCard';
import { LeaderboardCard } from '@/components/competition/LeaderboardCard';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  sports: string[] | null;
  experience_level: string | null;
  pace_metrics: Record<string, any>;
  fitness_goals: string[] | null;
  city: string | null;
  region: string | null;
  location_visible: boolean | null;
  availability: Record<string, string[]> | null;
  age_range_min: number | null;
  age_range_max: number | null;
  created_at: string;
  is_mentor_available: boolean | null;
  years_experience: number | null;
  mentor_specialties: string[] | null;
  trust_score: number | null;
  last_active_at: string | null;
  verification_level?: 'amateur' | 'competitive' | 'elite' | 'professional' | 'olympic';
  verifications?: string[];
  performance_metrics?: {
    weeklyDistance: number;
    avgPace: string;
    personalBests: number;
    recentAchievements: string[];
  };
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

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchScores, setMatchScores] = useState<Map<string, MatchScore>>(new Map());
  
  // Pagination hook
  const {
    paginatedData: paginatedProfiles,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    totalItems
  } = usePagination({ data: filteredProfiles, itemsPerPage: 12 });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // AI Assistant states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Elite features states
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [showTrainingPlans, setShowTrainingPlans] = useState(false);
  const [showLeaderboards, setShowLeaderboards] = useState(false);
  
  // Flash Events states
  const [showFlashRunModal, setShowFlashRunModal] = useState(false);
  const [showFlashRideModal, setShowFlashRideModal] = useState(false);
  const [showFlashWorkoutModal, setShowFlashWorkoutModal] = useState(false);
  const [showYogaModal, setShowYogaModal] = useState(false);
  const [flashEventTab, setFlashEventTab] = useState<'runs' | 'rides' | 'workouts' | 'yoga'>('runs');
  
  // Get Flash Runs, Rides, Workouts, and Yoga separately
  const { flashRuns: flashRunsData, loading: flashRunsLoading, createFlashRun, joinFlashRun: joinFlashRunAction, leaveFlashRun: leaveFlashRunAction } = useFlashRuns('running');
  const { flashRuns: flashRidesData, loading: flashRidesLoading, createFlashRun: createFlashRide, joinFlashRun: joinFlashRideAction, leaveFlashRun: leaveFlashRideAction } = useFlashRuns('cycling');
  const { flashRuns: flashWorkoutsData, loading: flashWorkoutsLoading, createFlashRun: createFlashWorkout, joinFlashRun: joinFlashWorkoutAction, leaveFlashRun: leaveFlashWorkoutAction } = useFlashRuns('workout');
  const { flashRuns: flashYogaData, loading: flashYogaLoading, createFlashRun: createFlashYoga, joinFlashRun: joinFlashYogaAction, leaveFlashRun: leaveFlashYogaAction } = useFlashRuns('yoga');
  
  // Determine user's primary sport for smart FAB
  const userPrimarySport = currentUserProfile?.sports?.[0] || 'running';
  const workoutSports = ['gym', 'crossfit', 'boxing', 'strength', 'hiit'];
  const yogaSports = ['yoga', 'pilates', 'mobility', 'meditation', 'stretching'];
  const shouldShowYogaFAB = yogaSports.some(sport => userPrimarySport.toLowerCase().includes(sport.toLowerCase()));
  const shouldShowWorkoutFAB = workoutSports.some(sport => userPrimarySport.toLowerCase().includes(sport.toLowerCase()));
  const shouldShowCyclingFAB = userPrimarySport === 'cycling';
  const shouldShowBothSports = currentUserProfile?.sports?.includes('running') && currentUserProfile?.sports?.includes('cycling');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchCurrentUserProfile();
      fetchProfiles();
    }
  }, [user, authLoading]);

  useEffect(() => {
    applyFilters();
    resetPagination(); // Reset to page 1 when filters change
  }, [profiles, searchQuery, selectedSport, selectedExperience, currentUserProfile]);

  const fetchCurrentUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const cacheKey = `current-user-profile-${user.id}`;
      const { data, error } = await memoizeQuery(
        cacheKey,
        () => profileQueries.getCurrentProfile(user.id),
        5 * 60 * 1000 // 5 minute cache
      );

      if (error) throw error;
      if (data) {
        setCurrentUserProfile({
          ...data,
          pace_metrics: (data.pace_metrics as Record<string, any>) || {},
          availability: (data.availability as Record<string, string[]>) || {}
        });
      }
    } catch (err: any) {
      console.error('Error fetching current user profile:', err);
    }
  };

  const fetchProfiles = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const filters = {
        sports: selectedSport ? [selectedSport] : undefined,
        experience: selectedExperience || undefined
      };
      
      const { data, error } = await profileQueries.getBrowseProfiles({
        currentUserId: user.id,
        limit: 50, // Reasonable limit for initial load
        offset: 0,
        ...filters
      });

      if (error) throw error;
      
      const typedProfiles = (data || []).map(profile => ({
        ...profile,
        pace_metrics: (profile.pace_metrics as Record<string, any>) || {},
        availability: (profile.availability as Record<string, string[]>) || {}
      }));
      
      setProfiles(typedProfiles);
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

  const calculateMatchScore = useCallback((profile: Profile): MatchScore => {
    if (!currentUserProfile) return { score: 0, reasons: [], tags: [] };

    let score = 0;
    const reasons: string[] = [];
    const tags: string[] = [];

    // Sport compatibility (40 points)
    const userSports = currentUserProfile.sports || [];
    const profileSports = profile.sports || [];
    const commonSports = profileSports.filter(sport => 
      userSports.includes(sport)
    );
    if (commonSports.length > 0) {
      score += 40;
      reasons.push(`Both compete in ${commonSports.join(', ')}`);
      tags.push(`${commonSports[0]} athlete`);
    }

    // Performance level match (25 points)
    if (profile.experience_level === currentUserProfile.experience_level) {
      score += 25;
      reasons.push(`Same ${profile.experience_level} performance level`);
      tags.push(`${profile.experience_level} athlete`);
    } else if (
      (profile.experience_level === 'intermediate' && currentUserProfile.experience_level === 'beginner') ||
      (profile.experience_level === 'beginner' && currentUserProfile.experience_level === 'intermediate')
    ) {
      score += 15;
      reasons.push('Compatible performance levels');
    }

    // Location proximity (20 points)
    if (profile.city === currentUserProfile.city && profile.location_visible) {
      score += 20;
      reasons.push('Same city');
      tags.push('nearby');
    } else if (profile.region === currentUserProfile.region && profile.location_visible) {
      score += 10;
      reasons.push('Same region');
    }

    // Fitness goals alignment (15 points)
    const userGoals = currentUserProfile.fitness_goals || [];
    const profileGoals = profile.fitness_goals || [];
    const commonGoals = profileGoals.filter(goal =>
      userGoals.includes(goal)
    );
    if (commonGoals.length > 0) {
      score += 15;
      reasons.push(`Shared goals: ${commonGoals.join(', ')}`);
    }

    // Availability overlap (bonus points)
    const userAvailability = currentUserProfile.availability || {};
    const profileAvailability = profile.availability || {};
    const hasOverlap = Object.keys(profileAvailability).some(day =>
      profileAvailability[day]?.some(time =>
        userAvailability[day]?.includes(time)
      )
    );
    if (hasOverlap) {
      score += 10;
      reasons.push('Aligned training schedules');
      tags.push('training sync');
    }

    // Elite coaching boost for developing athletes
    if (profile.is_mentor_available && profile.years_experience && profile.years_experience >= 3) {
      // Boost for first-time marathoners
      if (userGoals.includes('first_marathon')) {
        score += 30;
        reasons.push('Elite coach for marathon performance');
        tags.push('marathon coach');
      }
      
      // Boost for developing athletes
      if (currentUserProfile.experience_level === 'beginner') {
        score += 20;
        reasons.push('Elite coaching available');
        tags.push('coach available');
      }
      
      // Specialty matching
      const relevantSpecialties = profile.mentor_specialties?.filter(specialty =>
        userGoals.some(goal => {
          if (goal === 'first_marathon' && specialty === 'pacing_strategies') return true;
          if (goal === 'weight_loss' && specialty === 'nutrition_planning') return true;
          if (goal === 'strength' && specialty === 'strength_training') return true;
          return false;
        })
      ) || [];
      
      if (relevantSpecialties.length > 0) {
        score += 25;
        reasons.push(`Expert in ${relevantSpecialties.join(', ').replace(/_/g, ' ')}`);
      }
    }

    // Recent activity bonus
    const daysSinceJoined = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceJoined <= 7) {
      tags.push('new member');
    }

    // Performance compatibility tag
    if (score >= 70) {
      tags.unshift('elite compatible');
    } else if (score >= 50) {
      tags.unshift('performance match');
    }

    return { score, reasons, tags };
  }, [currentUserProfile]);

  const applyFilters = () => {
    let filtered = [...profiles];

    // Calculate match scores for all profiles (optimized)
    const scores = new Map<string, MatchScore>();
    filtered.forEach(profile => {
      const cacheKey = `match-${currentUserProfile?.id}-${profile.id}`;
      const matchScore = calculateMatchScore(profile);
      scores.set(profile.id, matchScore);
    });
    setMatchScores(scores);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(profile =>
        profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sport filter
    if (selectedSport !== 'all') {
      filtered = filtered.filter(profile =>
        profile.sports.includes(selectedSport)
      );
    }

    // Apply experience filter
    if (selectedExperience !== 'all') {
      filtered = filtered.filter(profile =>
        profile.experience_level === selectedExperience
      );
    }

    // Sort by match score (highest first)
    filtered.sort((a, b) => {
      const scoreA = scores.get(a.id)?.score || 0;
      const scoreB = scores.get(b.id)?.score || 0;
      return scoreB - scoreA;
    });

    setFilteredProfiles(filtered);
  };

  const handleConnect = async (profileId: string) => {
    try {
      // Get or create conversation
      const { data: conversationId, error } = await supabase
        .rpc('get_or_create_conversation', {
          user1_id: user?.id,
          user2_id: profileId
        });

      if (error) throw error;

      // Navigate to chat
      navigate(`/chat/${conversationId}`);
    } catch (err: any) {
      toast({
        title: "Error starting conversation",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const formatLocation = (profile: Profile) => {
    if (!profile.location_visible) return 'Location private';
    if (profile.city && profile.region) {
      return `${profile.city}, ${profile.region}`;
    }
    return profile.city || profile.region || 'Location not set';
  };

  const getAvailabilityText = (availability: Record<string, string[]>) => {
    const activeDays = Object.keys(availability).filter(day => 
      availability[day] && availability[day].length > 0
    );
    if (activeDays.length === 0) return 'Schedule not set';
    return `Available ${activeDays.length} days/week`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" message="Finding your perfect workout partners..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Find Your Perfect Workout Partner</h1>
              <p className="text-muted-foreground">
                Connect. Train. Succeed—together. From couch-to-5K beginners to seasoned marathoners.
              </p>
            </div>
            
            {/* AI Assistant Toggle Button */}
            <div className="relative">
              <Button
                variant={showAIAssistant ? "default" : "outline"}
                size="lg"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="flex items-center gap-2 min-h-[44px] hover-scale transition-all duration-200"
                aria-label="Toggle AI Assistant"
              >
                <Bot className="h-5 w-5" />
                <span className="hidden sm:inline">AI Assistant</span>
                {showAIAssistant ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              
              {/* AI Suggestions Panel - Positioned below the button */}
              {showAIAssistant && (
                <div 
                  className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] z-50 animate-slide-down"
                  style={{ 
                    maxHeight: 'calc(100vh - 200px)', 
                    overflowY: 'auto' 
                  }}
                >
                  <AISuggestions
                    currentUser={currentUserProfile}
                    otherUser={null}
                    conversationHistory={[]}
                    onSendMessage={(message) => {
                      toast({
                        title: "AI Suggestion Generated",
                        description: "Use this for inspiration when connecting with partners!",
                      });
                      // In a real implementation, this could copy to clipboard or show a modal
                    }}
                    className="shadow-2xl border-2"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name, bio, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-3">
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BROWSE_SPORTS_OPTIONS.map(sport => (
                      <SelectItem key={sport} value={sport}>
                        {sport === 'all' ? 'All Sports' : sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BROWSE_EXPERIENCE_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>
                        {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Distance Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Any distance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5km">Within 5km</SelectItem>
                        <SelectItem value="10km">Within 10km</SelectItem>
                        <SelectItem value="25km">Within 25km</SelectItem>
                        <SelectItem value="any">Any distance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Availability</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="weekend">Weekends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Recently Active</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Active today</SelectItem>
                        <SelectItem value="week">This week</SelectItem>
                        <SelectItem value="month">This month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Elite Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Performance Dashboard Toggle */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 text-white border-slate-600 cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-400" />
              <h3 className="font-semibold mb-1">Performance Analytics</h3>
              <p className="text-xs text-slate-300">Track your fitness journey</p>
            </CardContent>
          </Card>

          {/* Training Plans Toggle */}
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-400 cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowTrainingPlans(!showTrainingPlans)}>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-white" />
              <h3 className="font-semibold mb-1">Personalized Training Plans</h3>
              <p className="text-xs text-amber-100">Expert coaching for all levels</p>
            </CardContent>
          </Card>

          {/* Leaderboards Toggle */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500 cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowLeaderboards(!showLeaderboards)}>
            <CardContent className="p-4 text-center">
              <Medal className="h-8 w-8 mx-auto mb-2 text-white" />
              <h3 className="font-semibold mb-1">Competitions</h3>
              <p className="text-xs text-blue-100">Community challenges</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Dashboard */}
        {showPerformanceDashboard && currentUserProfile?.performance_metrics && (
          <div className="mb-8">
            <PerformanceDashboard 
              metrics={{
                weeklyDistance: currentUserProfile.performance_metrics.weeklyDistance || 0,
                weeklyDistanceChange: 12,
                avgPace: currentUserProfile.performance_metrics.avgPace || "5:30",
                avgPaceChange: -15,
                weeklyWorkouts: 5,
                workoutChange: 2,
                personalBests: currentUserProfile.performance_metrics.personalBests || 3,
                currentStreak: 7,
                upcomingGoals: ["Sub 3:30 Marathon", "10K PR", "Weekly 50K"],
                recentAchievements: currentUserProfile.performance_metrics.recentAchievements || ["10K PR", "Marathon Finisher"]
              }}
              sportType={currentUserProfile.sports?.[0] || 'running'}
            />
          </div>
        )}

        {/* Training Plans Section */}
        {showTrainingPlans && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-600" />
                Personalized Training Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TrainingPlanCard 
                  plan={{
                    id: "1",
                    title: "Expert Marathon Training",
                    description: "Advanced 16-week marathon preparation for sub-3:00 times",
                    duration: 16,
                    difficulty: "expert",
                    sport: "Running",
                    goal: "Marathon PR",
                    weeklyHours: 12,
                    sessionsPerWeek: 6,
                    author: {
                      name: "Coach Sarah Miller",
                      isVerified: true,
                      isCoach: true
                    },
                    stats: {
                      downloads: 1247,
                      rating: 4.9,
                      reviews: 89,
                      likes: 432
                    },
                    tags: ["marathon", "advanced", "speed", "endurance"],
                    isPremium: true,
                    price: 99
                  }}
                />
                <TrainingPlanCard 
                  plan={{
                    id: "2", 
                    title: "Cycling Power Development",
                    description: "8-week FTP improvement program for competitive cyclists",
                    duration: 8,
                    difficulty: "advanced",
                    sport: "Cycling",
                    goal: "Power Increase",
                    weeklyHours: 10,
                    sessionsPerWeek: 5,
                    author: {
                      name: "Expert Cycling Academy",
                      isVerified: true,
                      isCoach: true
                    },
                    stats: {
                      downloads: 856,
                      rating: 4.8,
                      reviews: 67,
                      likes: 298
                    },
                    tags: ["cycling", "power", "FTP", "intervals"],
                    isPremium: false
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboards Section */}
        {showLeaderboards && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-amber-600" />
                Community Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardCard 
                competition={{
                  id: "monthly-5k",
                  title: "Monthly 5K Challenge",
                  description: "Fastest 5K time this month wins personal coaching session",
                  type: "time",
                  sport: "Running",
                  duration: "Monthly",
                  participantCount: 1247,
                  prize: "Personal Coaching Session",
                  endDate: "Dec 31",
                  isActive: true
                }}
                entries={[
                  {
                    rank: 1,
                    athlete: {
                      id: "1",
                      name: "Alex Johnson",
                      location: "San Francisco, CA",
                      isVerified: true
                    },
                    score: 100,
                    metric: "time",
                    metricValue: "15:42",
                    change: 2,
                    joinedDate: "2024-12-01"
                  },
                  {
                    rank: 2,
                    athlete: {
                      id: "2", 
                      name: "Maria Garcia",
                      location: "Austin, TX",
                      isVerified: true
                    },
                    score: 98,
                    metric: "time", 
                    metricValue: "16:18",
                    change: -1,
                    joinedDate: "2024-12-02"
                  },
                  {
                    rank: 3,
                    athlete: {
                      id: "3",
                      name: "David Chen", 
                      location: "Seattle, WA",
                      isVerified: false
                    },
                    score: 95,
                    metric: "time",
                    metricValue: "16:45",
                    change: 1,
                    joinedDate: "2024-12-01"
                  }
                ]}
                currentUserRank={8}
              />
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations Section */}
        {currentUserProfile && filteredProfiles.length > 0 && (
          <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/8 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                <h3 className="text-xl font-semibold text-foreground">Perfect Training Matches</h3>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-50 text-amber-700">
                  Pace & goal matched
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {filteredProfiles.slice(0, 2).map((profile) => {
                  const matchData = matchScores.get(profile.id);
                  if (!matchData || matchData.score < 50) return null;
                  
                  return (
                    <Card 
                      key={profile.id} 
                      className={cn(
                        "relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                        "bg-card/95 backdrop-blur-sm border border-border/50",
                        "shadow-md hover:shadow-primary/20"
                      )}
                    >
                      {/* Gradient accent strip for high matches */}
                      {matchData.score >= 90 && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary animate-pulse" />
                      )}
                      
                      <CardContent className="p-5 bg-gradient-to-br from-background/90 to-muted/30">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Avatar className="h-14 w-14 shadow-lg ring-2 ring-primary/20">
                              <AvatarImage src={profile.profile_picture_url} className="object-cover" />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold text-foreground">
                                {profile.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online indicator for high trust score */}
                            {profile.trust_score && profile.trust_score > 80 && (
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success rounded-full border-2 border-background" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg text-foreground truncate">
                                {profile.full_name}
                              </h4>
                              <Badge 
                                className={cn(
                                  "text-xs font-bold shadow-sm",
                                  matchData.score >= 90 
                                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground animate-pulse" 
                                    : "bg-primary text-primary-foreground"
                                )}
                              >
                                {matchData.score}% match
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {formatLocation(profile)}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {matchData.tags.slice(0, 3).map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="text-xs bg-orange-500 text-white border-orange-400 hover:bg-orange-600 transition-colors"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                              {matchData.reasons.slice(0, 2).join(' • ')}
                            </p>
                            
                            {/* Connect Button */}
                            <Button 
                              onClick={() => handleConnect(profile.id)}
                              size="sm"
                              className="w-full bg-gradient-primary hover:shadow-premium text-primary-foreground"
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              Partner Up
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flash Events Section with Smart Display */}
        {(() => {
          // Check if any tab has events
          const hasRuns = flashRunsData.length > 0;
          const hasRides = flashRidesData.length > 0;
          const hasWorkouts = flashWorkoutsData.length > 0;
          const hasYoga = flashYogaData.length > 0;
          const hasAnyEvents = hasRuns || hasRides || hasWorkouts || hasYoga;

          // If no events at all, show simplified create-only interface
          if (!hasAnyEvents && !flashRunsLoading && !flashRidesLoading && !flashWorkoutsLoading && !flashYogaLoading) {
            return (
              <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Create Flash Events</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Organize high-intensity training sessions, competitive runs, cycling groups, and specialized workshops. 
                        Connect with elite athletes instantly!
                      </p>
                    </div>
                    
                    {/* Create Event Buttons Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                      <Button
                        onClick={() => setShowFlashRunModal(true)}
                        onMouseEnter={() => preloadFlashRunModals()}
                        variant="outline"
                        className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        <span className="text-2xl">🏃</span>
                        <span className="text-sm font-medium">Flash Run</span>
                      </Button>
                      <Button
                        onClick={() => setShowFlashRideModal(true)}
                        onMouseEnter={() => preloadFlashRunModals()}
                        variant="outline"
                        className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        <span className="text-2xl">🚴</span>
                        <span className="text-sm font-medium">Flash Ride</span>
                      </Button>
                      <Button
                        onClick={() => setShowFlashWorkoutModal(true)}
                        onMouseEnter={() => preloadFlashRunModals()}
                        variant="outline"
                        className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        <span className="text-2xl">💪</span>
                        <span className="text-sm font-medium">Flash Workout</span>
                      </Button>
                      <Button
                        onClick={() => setShowYogaModal(true)}
                        variant="outline"
                        className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        <span className="text-2xl">🧘</span>
                        <span className="text-sm font-medium">Flash Yoga</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          // If there are events, show the full interface with tabs
          return (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Flash Events</h3>
                  <div className="flex items-center gap-4">
                    {/* Create Flash Event Button */}
                    <Button
                      onClick={() => {
                        if (flashEventTab === 'yoga') {
                          setShowYogaModal(true);
                        } else if (flashEventTab === 'workouts') {
                          setShowFlashWorkoutModal(true);
                        } else if (flashEventTab === 'rides') {
                          setShowFlashRideModal(true);
                        } else {
                          setShowFlashRunModal(true);
                        }
                      }}
                      className="bg-gradient-primary hover:shadow-premium text-primary-foreground shadow-md hover:scale-105 transition-all"
                      size="sm"
                    >
                      <span className="mr-2">+</span>
                      Create Flash Event
                    </Button>
                    
                    {/* Tab Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant={flashEventTab === 'runs' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFlashEventTab('runs')}
                        className="flex items-center gap-2"
                      >
                        🏃 Flash Runs
                        {hasRuns && <Badge variant="secondary" className="ml-1 h-4 text-xs">{flashRunsData.length}</Badge>}
                      </Button>
                      <Button
                        variant={flashEventTab === 'rides' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFlashEventTab('rides')}
                        className="flex items-center gap-2"
                      >
                        🚴 Flash Rides
                        {hasRides && <Badge variant="secondary" className="ml-1 h-4 text-xs">{flashRidesData.length}</Badge>}
                      </Button>
                      <Button
                        variant={flashEventTab === 'workouts' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFlashEventTab('workouts')}
                        className="flex items-center gap-2"
                      >
                        💪 Flash Workouts
                        {hasWorkouts && <Badge variant="secondary" className="ml-1 h-4 text-xs">{flashWorkoutsData.length}</Badge>}
                      </Button>
                      <Button
                        variant={flashEventTab === 'yoga' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFlashEventTab('yoga')}
                        className="flex items-center gap-2"
                      >
                        🧘 Flash Yoga
                        {hasYoga && <Badge variant="secondary" className="ml-1 h-4 text-xs">{flashYogaData.length}</Badge>}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flashEventTab === 'runs' && (
                    <FlashRunsList
                      flashRuns={flashRunsData}
                      loading={flashRunsLoading}
                      onJoin={joinFlashRunAction}
                      onLeave={leaveFlashRunAction}
                    />
                  )}
                  {flashEventTab === 'rides' && (
                    <FlashRunsList
                      flashRuns={flashRidesData}
                      loading={flashRidesLoading}
                      onJoin={joinFlashRideAction}
                      onLeave={leaveFlashRideAction}
                    />
                  )}
                  {flashEventTab === 'workouts' && (
                    <FlashRunsList
                      flashRuns={flashWorkoutsData}
                      loading={flashWorkoutsLoading}
                      onJoin={joinFlashWorkoutAction}
                      onLeave={leaveFlashWorkoutAction}
                    />
                  )}
                  {flashEventTab === 'yoga' && (
                    <FlashRunsList
                      flashRuns={flashYogaData}
                      loading={flashYogaLoading}
                      onJoin={joinFlashYogaAction}
                      onLeave={leaveFlashYogaAction}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Results Count & Pagination Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {totalItems} training partners found
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </p>
          {currentUserProfile && (
            <Badge variant="outline" className="gap-2">
              <Trophy className="h-3 w-3" />
              Pace & Goal Matching
            </Badge>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🏃‍♀️</div>
            <h3 className="text-xl font-semibold mb-2">No training partners nearby yet?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Keep your profile updated and start a Flash Run! New athletes join our community daily.
            </p>
            <Button onClick={() => navigate('/profile-setup')} className="button-bounce">
              Update Profile
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {/* Section Header */}
              <div className="text-center pb-4">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Dedicated Athletes & Coaches
                </h2>
                <p className="text-muted-foreground">
                  Connect with committed athletes and certified coaches at every level
                </p>
              </div>
              
              {/* Enhanced Grid with Better Styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProfiles.map((profile) => {
                  const matchData = matchScores.get(profile.id);
                  return (
                    <div
                      key={profile.id}
                      className="transform transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                    >
                      <MatchCard
                        profile={profile}
                        matchScore={matchData}
                        onConnect={handleConnect}
                        currentUserId={user?.id}
                        className="shadow-lg hover:shadow-xl border-border/50 bg-card/95 backdrop-blur-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => goToPreviousPage()}
                        className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        aria-disabled={!hasPreviousPage}
                      />
                    </PaginationItem>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => goToPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                            aria-label={`Go to page ${pageNumber}`}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => goToPage(totalPages)}
                            className="cursor-pointer"
                            aria-label={`Go to page ${totalPages}`}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => goToNextPage()}
                        className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        aria-disabled={!hasNextPage}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Safety Notice */}
        <Alert className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Safety First:</strong> Always meet in public places, share your plans with someone you trust, 
            and trust your instincts. Report any inappropriate behavior using our in-app reporting feature.
          </AlertDescription>
        </Alert>
      </div>


      {/* Flash Run Modal */}
      <LazyFlashRunModal
        isOpen={showFlashRunModal}
        onClose={() => setShowFlashRunModal(false)}
        onSubmit={async (data) => {
          const result = await createFlashRun({
            ...data,
            sport_type: 'running'
          });
          return !!result;
        }}
      />

      {/* Flash Ride Modal */}
      <LazyFlashRideModal
        open={showFlashRideModal}
        onOpenChange={setShowFlashRideModal}
        onCreateFlashRide={createFlashRide}
      />

      {/* Flash Workout Modal */}
      <LazyFlashWorkoutModal
        isOpen={showFlashWorkoutModal}
        onClose={() => setShowFlashWorkoutModal(false)}
        onSubmit={async (data) => {
          const result = await createFlashWorkout({
            ...data,
            sport_type: 'workout'
          });
          return !!result;
        }}
      />

      {/* Flash Yoga Modal */}
      <LazyFlashYogaModal 
        open={showYogaModal} 
        onOpenChange={setShowYogaModal} 
      />
    </div>
  );
}