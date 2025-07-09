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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Target, 
  Star, 
  Zap,
  MessageCircle,
  Calendar,
  Activity,
  Users,
  Sparkles,
  Shield
} from 'lucide-react';
import Navigation from '@/components/Navigation';

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

const SPORTS_OPTIONS = [
  'all', 'running', 'cycling', 'gym', 'swimming', 'tennis', 'basketball',
  'soccer', 'volleyball', 'hiking', 'yoga', 'crossfit', 'boxing'
];

const EXPERIENCE_LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];

export default function Browse() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchScores, setMatchScores] = useState<Map<string, MatchScore>>(new Map());

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
    toast({
      title: "Coming soon!",
      description: "Chat functionality will be available soon.",
    });
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Finding your perfect workout partners...</p>
            </div>
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
                    {SPORTS_OPTIONS.map(sport => (
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
                    {EXPERIENCE_LEVELS.map(level => (
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

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredProfiles.length} workout partners found
          </p>
          {currentUserProfile && (
            <Badge variant="outline" className="gap-2">
              <Sparkles className="h-3 w-3" />
              AI-Powered Matching
            </Badge>
          )}
        </div>

        {/* Results */}
        {filteredProfiles.length === 0 ? (
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => {
              const matchData = matchScores.get(profile.id);
              return (
                <Card key={profile.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.profile_picture_url} />
                        <AvatarFallback>
                          {profile.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold truncate">{profile.full_name}</h3>
                          {matchData && matchData.score >= 70 && (
                            <Star className="h-4 w-4 text-warning fill-warning" />
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {formatLocation(profile)}
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {getAvailabilityText(profile.availability)}
                        </div>
                      </div>
                    </div>

                    {/* Match Tags */}
                    {matchData && matchData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {matchData.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant={tag === 'top match' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {tag === 'top match' && <Zap className="h-3 w-3 mr-1" />}
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Sports */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {profile.sports.slice(0, 3).map((sport, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {sport}
                          </Badge>
                        ))}
                        {profile.sports.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.sports.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div className="flex items-center mb-4 text-sm">
                      <Target className="h-3 w-3 mr-2 text-muted-foreground" />
                      <span className="capitalize">{profile.experience_level} level</span>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {/* AI Match Explanation */}
                    {matchData && matchData.score > 0 && (
                      <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {matchData.score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {matchData.reasons.slice(0, 2).join(' • ')}
                        </p>
                      </div>
                    )}

                    <Separator className="mb-4" />

                    {/* Connect Button */}
                    <Button 
                      className="w-full group-hover:scale-105 transition-transform"
                      onClick={() => handleConnect(profile.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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