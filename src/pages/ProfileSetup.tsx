import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SportsBadges } from '@/components/common/sports-badges';
import { AvailabilityPicker } from '@/components/common/availability-picker';
import { User, MapPin, Target, Camera, Clock } from 'lucide-react';
import { EXPERIENCE_LEVELS, FITNESS_GOALS, SPORTS_OPTIONS, DAYS_OF_WEEK, TIME_SLOTS } from '@/constants';


interface ProfileData {
  full_name: string;
  bio: string;
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
  gender_preference: string;
  profile_picture_url?: string;
}

export default function ProfileSetup() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileExists, setProfileExists] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    bio: '',
    sports: [],
    experience_level: '',
    pace_metrics: {},
    fitness_goals: [],
    city: '',
    region: '',
    location_visible: true,
    availability: {},
    age_range_min: 18,
    age_range_max: 65,
    gender_preference: 'any'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfileExists(true);
        setProfileData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          sports: data.sports || [],
          experience_level: data.experience_level || '',
          pace_metrics: (data.pace_metrics as Record<string, any>) || {},
          fitness_goals: data.fitness_goals || [],
          city: data.city || '',
          region: data.region || '',
          location_visible: data.location_visible ?? true,
          availability: (data.availability as Record<string, string[]>) || {},
          age_range_min: data.age_range_min || 18,
          age_range_max: data.age_range_max || 65,
          gender_preference: data.gender_preference || 'any',
          profile_picture_url: data.profile_picture_url || undefined
        });
      }
    } catch (err: any) {
      setError('Failed to load profile data');
    }
  };

  const handleSportToggle = (sport: string) => {
    setProfileData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setProfileData(prev => ({
      ...prev,
      fitness_goals: prev.fitness_goals.includes(goal)
        ? prev.fitness_goals.filter(g => g !== goal)
        : [...prev.fitness_goals, goal]
    }));
  };

  const handleAvailabilityToggle = (day: string, timeSlot: string) => {
    setProfileData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day]?.includes(timeSlot)
          ? prev.availability[day].filter(t => t !== timeSlot)
          : [...(prev.availability[day] || []), timeSlot]
      }
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setProfileData(prev => ({
        ...prev,
        profile_picture_url: data.publicUrl
      }));

      toast({
        title: "Profile picture uploaded!",
        description: "Your profile picture has been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          ...profileData
        });

      if (error) throw error;

      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });

      navigate('/browse');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {profileExists ? 'Update Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-muted-foreground">
            Tell us about your fitness journey to find perfect workout partners
          </p>
        </div>

        <Card className="bg-card border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              This information helps us match you with compatible fitness partners
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.profile_picture_url} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-picture"
                  />
                  <Label htmlFor="profile-picture" className="cursor-pointer">
                    <Button type="button" variant="outline" disabled={uploadingImage} asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">About Me</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your fitness journey, and what you're looking for in a workout partner..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              {/* Sports */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Sports & Activities *</Label>
                <SportsBadges 
                  selectedSports={profileData.sports}
                  onSportToggle={handleSportToggle}
                  variant="interactive"
                />
              </div>

              {/* Experience Level */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Experience Level *</Label>
                <Select
                  value={profileData.experience_level}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, experience_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fitness Goals */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Fitness Goals</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FITNESS_GOALS.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={profileData.fitness_goals.includes(goal)}
                        onCheckedChange={() => handleGoalToggle(goal)}
                      />
                      <Label htmlFor={goal} className="capitalize">
                        {goal.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="e.g., San Francisco"
                      value={profileData.city}
                      onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">State/Region</Label>
                    <Input
                      id="region"
                      placeholder="e.g., California"
                      value={profileData.region}
                      onChange={(e) => setProfileData(prev => ({ ...prev, region: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="location_visible"
                    checked={profileData.location_visible}
                    onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, location_visible: checked }))}
                  />
                  <Label htmlFor="location_visible">
                    Make my location visible to other users
                  </Label>
                </div>
              </div>

              {/* Availability */}
              <AvailabilityPicker
                availability={profileData.availability}
                onAvailabilityToggle={handleAvailabilityToggle}
              />

              {/* Matching Preferences */}
              <div className="space-y-4">
                <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Matching Preferences
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age_range_min">Preferred Age Range</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="age_range_min"
                        type="number"
                        min="18"
                        max="100"
                        value={profileData.age_range_min}
                        onChange={(e) => setProfileData(prev => ({ ...prev, age_range_min: parseInt(e.target.value) }))}
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="number"
                        min="18"
                        max="100"
                        value={profileData.age_range_max}
                        onChange={(e) => setProfileData(prev => ({ ...prev, age_range_max: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gender_preference">Gender Preference</Label>
                    <Select
                      value={profileData.gender_preference}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, gender_preference: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/browse')}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={loading || profileData.sports.length === 0 || !profileData.experience_level}
                  className="flex-1"
                  variant="hero"
                >
                  {loading ? 'Saving...' : (profileExists ? 'Update Profile' : 'Complete Profile')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}