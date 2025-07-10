import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import MatchCard from '@/components/common/match-card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { usePagination } from '@/hooks/use-pagination';
import { useFlashRuns } from '@/hooks/use-flash-runs';
import { FlashRunsList } from '@/components/flash-runs/FlashRunsList';
import { FlashRunFAB } from '@/components/flash-runs/FlashRunFAB';
import { FlashRunModal } from '@/components/flash-runs/FlashRunModal';
import { FlashRideModal } from '@/components/flash-runs/FlashRideModal';
import { FlashWorkoutModal } from '@/components/flash-runs/FlashWorkoutModal';
import { FlashYogaModal } from '@/components/flash-runs/FlashYogaModal';
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
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import { AISuggestions } from '@/components/chat/AISuggestions';
import { BROWSE_SPORTS_OPTIONS, BROWSE_EXPERIENCE_LEVELS } from '@/constants';

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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

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
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id) // Exclude current user
        .order('created_at', { ascending: false });

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

  const calculateMatchScore = (profile: Profile): MatchScore => {
    if (!currentUserProfile) return { score: 0, reasons: [], tags: [] };

    let score = 0;
    const reasons: string[] = [];
    const tags: string[] = [];

    // Sport compatibility (40 points)
    const commonSports = profile.sports.filter(sport => 
      currentUserProfile.sports.includes(sport)
    );
    if (commonSports.length > 0) {
      score += 40;
      reasons.push(`Both enjoy ${commonSports.join(', ')}`);
      tags.push(`${commonSports[0]} buddy`);
    }

    // Experience level match (25 points)
    if (profile.experience_level === currentUserProfile.experience_level) {
      score += 25;
      reasons.push(`Same ${profile.experience_level} level`);
      tags.push(`${profile.experience_level} level`);
    } else if (
      (profile.experience_level === 'intermediate' && currentUserProfile.experience_level === 'beginner') ||
      (profile.experience_level === 'beginner' && currentUserProfile.experience_level === 'intermediate')
    ) {
      score += 15;
      reasons.push('Compatible skill levels');
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
    const commonGoals = profile.fitness_goals.filter(goal =>
      currentUserProfile.fitness_goals.includes(goal)
    );
    if (commonGoals.length > 0) {
      score += 15;
      reasons.push(`Shared goals: ${commonGoals.join(', ')}`);
    }

    // Availability overlap (bonus points)
    const hasOverlap = Object.keys(profile.availability).some(day =>
      profile.availability[day]?.some(time =>
        currentUserProfile.availability[day]?.includes(time)
      )
    );
    if (hasOverlap) {
      score += 10;
      reasons.push('Compatible schedules');
      tags.push('good timing');
    }

    // Mentor boost for beginners and first marathoners
    if (profile.is_mentor_available && profile.years_experience && profile.years_experience >= 3) {
      // Boost for first-time marathoners
      if (currentUserProfile.fitness_goals.includes('first_marathon')) {
        score += 30;
        reasons.push('Experienced mentor for marathon training');
        tags.push('marathon mentor');
      }
      
      // Boost for beginners
      if (currentUserProfile.experience_level === 'beginner') {
        score += 20;
        reasons.push('Experienced mentor available');
        tags.push('mentor available');
      }
      
      // Specialty matching
      const relevantSpecialties = profile.mentor_specialties?.filter(specialty =>
        currentUserProfile.fitness_goals.some(goal => {
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

    // Top match tag
    if (score >= 70) {
      tags.unshift('top match');
    } else if (score >= 50) {
      tags.unshift('good match');
    }

    return { score, reasons, tags };
  };

  const applyFilters = () => {
    let filtered = [...profiles];

    // Calculate match scores for all profiles
    const scores = new Map<string, MatchScore>();
    filtered.forEach(profile => {
      scores.set(profile.id, calculateMatchScore(profile));
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
              <h1 className="text-3xl font-bold mb-2">Discover Your Perfect Workout Partners</h1>
              <p className="text-muted-foreground">
                Find compatible training buddies based on your fitness level, goals, and location
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

        {/* AI Recommendations Section */}
        {currentUserProfile && filteredProfiles.length > 0 && (
          <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/8 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <h3 className="text-xl font-semibold text-foreground">AI-Powered Top Matches</h3>
                <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                  Personalized for you
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
                            
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {matchData.reasons.slice(0, 2).join(' • ')}
                            </p>
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

        {/* Flash Events Section with Tabs */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Flash Events</h3>
              <div className="flex gap-2">
                <Button
                  variant={flashEventTab === 'runs' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlashEventTab('runs')}
                  className="flex items-center gap-2"
                >
                  🏃 Flash Runs
                </Button>
                <Button
                  variant={flashEventTab === 'rides' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlashEventTab('rides')}
                  className="flex items-center gap-2"
                >
                  🚴 Flash Rides
                </Button>
                <Button
                  variant={flashEventTab === 'workouts' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlashEventTab('workouts')}
                  className="flex items-center gap-2"
                >
                  💪 Flash Workouts
                </Button>
                <Button
                  variant={flashEventTab === 'yoga' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlashEventTab('yoga')}
                  className="flex items-center gap-2"
                >
                  🧘 Flash Yoga
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Results Count & Pagination Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {totalItems} workout partners found
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </p>
          {currentUserProfile && (
            <Badge variant="outline" className="gap-2">
              <Sparkles className="h-3 w-3" />
              AI-Powered Matching
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
            <h3 className="text-xl font-semibold mb-2">No matches yet?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Keep your profile up to date and come back soon! More amazing workout partners join every day.
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
                  Workout Partners Found
                </h2>
                <p className="text-muted-foreground">
                  Connect with amazing fitness enthusiasts in your area
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

      {/* Smart FAB - Shows based on user's primary sport */}
      <FlashRunFAB 
        sportType={shouldShowYogaFAB ? 'yoga' : shouldShowWorkoutFAB ? 'workout' : shouldShowCyclingFAB ? 'cycling' : 'running'}
        onClick={() => {
          if (shouldShowYogaFAB) {
            setShowYogaModal(true);
          } else if (shouldShowWorkoutFAB) {
            setShowFlashWorkoutModal(true);
          } else if (shouldShowCyclingFAB) {
            setShowFlashRideModal(true);
          } else {
            setShowFlashRunModal(true);
          }
        }} 
      />

      {/* Flash Run Modal */}
      <FlashRunModal
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
      <FlashRideModal
        open={showFlashRideModal}
        onOpenChange={setShowFlashRideModal}
        onCreateFlashRide={createFlashRide}
      />

      {/* Flash Workout Modal */}
      <FlashWorkoutModal
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
      <FlashYogaModal 
        open={showYogaModal} 
        onOpenChange={setShowYogaModal} 
      />
    </div>
  );
}