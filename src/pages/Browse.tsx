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
import { MatchCard } from '@/components/common/match-card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { usePagination } from '@/hooks/use-pagination';
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
  ChevronRight
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { BROWSE_SPORTS_OPTIONS, BROWSE_EXPERIENCE_LEVELS } from '@/constants';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  profile_picture_url?: string;
  sports: string[];
  experience_level: string;
  pace_metrics: Record<string, any>;
  fitness_goals: string[];
  city: string;
  region: string;
  location_visible: boolean;
  availability: Record<string, string[]>;
  age_range_min: number;
  age_range_max: number;
  created_at: string;
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
          <h1 className="text-3xl font-bold mb-2">Discover Your Perfect Workout Partners</h1>
          <p className="text-muted-foreground">
            Find compatible training buddies based on your fitness level, goals, and location
          </p>
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
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI-Powered Top Matches</h3>
                <Badge variant="outline" className="border-primary/20">
                  Personalized for you
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredProfiles.slice(0, 2).map((profile) => {
                  const matchData = matchScores.get(profile.id);
                  if (!matchData || matchData.score < 50) return null;
                  
                  return (
                    <Card key={profile.id} className="border-primary/10">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile.profile_picture_url} />
                            <AvatarFallback>
                              {profile.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium truncate">{profile.full_name}</h4>
                              <Badge className="bg-primary text-primary-foreground">
                                {matchData.score}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {formatLocation(profile)}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {matchData.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {matchData.reasons.slice(0, 1).join(' • ')}
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
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or check back later for new members
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedSport('all');
                setSelectedExperience('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProfiles.map((profile) => {
                const matchData = matchScores.get(profile.id);
                return (
                  <Card 
                    key={profile.id} 
                    className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    onClick={() => handleConnect(profile.user_id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Connect with ${profile.full_name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleConnect(profile.user_id);
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="h-16 w-16 mx-auto mb-3 rounded-full overflow-hidden">
                        <OptimizedImage
                          src={profile.profile_picture_url}
                          alt={`${profile.full_name || 'User'} profile picture`}
                          width={64}
                          height={64}
                          fallback="/placeholder.svg"
                          className="rounded-full"
                        />
                      </div>

                      <div className="text-center space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1 truncate">{profile.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatLocation(profile)}
                          </p>
                        </div>

                        {/* Match Score Badge */}
                        {matchData && (
                          <div className="flex justify-center">
                            <Badge 
                              variant={matchData.score >= 70 ? "default" : matchData.score >= 50 ? "secondary" : "outline"}
                              className="gap-1"
                            >
                              <Sparkles className="h-3 w-3" />
                              {matchData.score}% match
                            </Badge>
                          </div>
                        )}

                        {/* Sports and Tags */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {profile.sports.slice(0, 2).map((sport, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {sport}
                              </Badge>
                            ))}
                          </div>
                          
                          {matchData && matchData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {matchData.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {profile.bio}
                          </p>
                        )}

                        {/* Experience Level and Availability */}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="capitalize">{profile.experience_level} level</p>
                          <p>{getAvailabilityText(profile.availability)}</p>
                        </div>

                        {/* Connect Button */}
                        <Button 
                          className="w-full mt-4 min-h-[44px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(profile.user_id);
                          }}
                          size="sm"
                        >
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
        <Alert className="mt-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Safety First:</strong> Always meet in public places, share your plans with someone you trust, 
            and trust your instincts. Report any inappropriate behavior using our in-app reporting feature.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}