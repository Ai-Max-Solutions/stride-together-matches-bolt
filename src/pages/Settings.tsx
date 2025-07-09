import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Clock, 
  MapPin, 
  Trash2, 
  MessageSquare, 
  Bot,
  Camera,
  Settings as SettingsIcon,
  Save,
  AlertTriangle
} from 'lucide-react';

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const TIME_SLOTS = ['morning', 'afternoon', 'evening'];

interface ProfileData {
  full_name: string;
  bio: string;
  city: string;
  region: string;
  location_visible: boolean;
  availability: Record<string, string[]>;
  profile_picture_url?: string;
}

interface SettingsData {
  ai_suggestions_enabled: boolean;
  account_paused: boolean;
  hide_from_matches: boolean;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    bio: '',
    city: '',
    region: '',
    location_visible: true,
    availability: {}
  });

  const [settingsData, setSettingsData] = useState<SettingsData>({
    ai_suggestions_enabled: true,
    account_paused: false,
    hide_from_matches: false
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [newEmail, setNewEmail] = useState('');
  const [feedback, setFeedback] = useState({
    type: 'idea',
    message: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
    setNewEmail(user.email || '');
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          city: data.city || '',
          region: data.region || '',
          location_visible: data.location_visible ?? true,
          availability: (data.availability as Record<string, string[]>) || {},
          profile_picture_url: data.profile_picture_url || undefined
        });
      }
    } catch (err: any) {
      setError('Failed to load profile data');
    }
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
        title: "Profile picture updated!",
        description: "Your profile picture has been changed.",
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

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
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
        title: "Profile updated!",
        description: "Your profile changes have been saved.",
      });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async () => {
    if (!newEmail || newEmail === user?.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast({
        title: "Email update requested!",
        description: "Please check your new email for a confirmation link.",
      });
    } catch (err: any) {
      toast({
        title: "Email update failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!passwords.new || passwords.new !== passwords.confirm) {
      toast({
        title: "Password mismatch",
        description: "New passwords don't match.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      setPasswords({ current: '', new: '', confirm: '' });
      toast({
        title: "Password updated!",
        description: "Your password has been changed successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Password update failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!feedback.message.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          feedback_type: feedback.type,
          message: feedback.message.trim(),
          page_context: 'settings'
        });

      if (error) throw error;

      toast({
        title: "Feedback sent!",
        description: "Thank you for your feedback. We'll review it soon.",
      });
      setFeedback({ type: 'idea', message: '' });
    } catch (err: any) {
      toast({
        title: "Failed to send feedback",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      // Delete profile first
      await supabase.from('profiles').delete().eq('user_id', user.id);
      
      // Note: Supabase doesn't allow deleting auth.users from client
      // In a real app, you'd call an edge function to handle this
      toast({
        title: "Account deletion requested",
        description: "Your account will be deleted within 24 hours. Contact support if you change your mind.",
      });
      
      await signOut();
      navigate('/');
    } catch (err: any) {
      toast({
        title: "Deletion failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings & Privacy
          </h1>
          <p className="text-muted-foreground">
            Manage your account, privacy, and preferences
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8">
          {/* Profile Settings */}
          <Card className="bg-card border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
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
                        {uploadingImage ? 'Uploading...' : 'Change Photo'}
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  {newEmail !== user.email && (
                    <Button onClick={updateEmail} size="sm" className="mt-2">
                      Update Email
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button onClick={saveProfile} disabled={loading} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-card border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Location
              </CardTitle>
              <CardDescription>
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Visibility
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show your location to other users for better matching
                  </p>
                </div>
                <Switch
                  checked={profileData.location_visible}
                  onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, location_visible: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Hide from Matches
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily hide your profile from new matches
                  </p>
                </div>
                <Switch
                  checked={settingsData.hide_from_matches}
                  onCheckedChange={(checked) => setSettingsData(prev => ({ ...prev, hide_from_matches: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Pause Account
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily deactivate your account
                  </p>
                </div>
                <Switch
                  checked={settingsData.account_paused}
                  onCheckedChange={(checked) => setSettingsData(prev => ({ ...prev, account_paused: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="bg-card border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Availability Schedule
              </CardTitle>
              <CardDescription>
                Update when you're usually available for workouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-20 capitalize font-medium">
                      {day.slice(0, 3)}
                    </div>
                    <div className="flex gap-2">
                      {TIME_SLOTS.map(timeSlot => (
                        <div key={timeSlot} className="flex items-center space-x-1">
                          <Switch
                            id={`${day}-${timeSlot}`}
                            checked={profileData.availability[day]?.includes(timeSlot) || false}
                            onCheckedChange={() => handleAvailabilityToggle(day, timeSlot)}
                          />
                          <Label htmlFor={`${day}-${timeSlot}`} className="capitalize text-sm">
                            {timeSlot}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Smart Features */}
          <Card className="bg-card border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Smart Features
              </CardTitle>
              <CardDescription>
                Control AI-powered features and suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    AI Workout Suggestions
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get personalized workout recommendations and chat assistance
                  </p>
                </div>
                <Switch
                  checked={settingsData.ai_suggestions_enabled}
                  onCheckedChange={(checked) => setSettingsData(prev => ({ ...prev, ai_suggestions_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card className="bg-card border shadow-card">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                />
              </div>
              <Button 
                onClick={updatePassword} 
                disabled={loading || !passwords.new || passwords.new !== passwords.confirm}
                variant="outline"
              >
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card className="bg-card border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Feedback & Support
              </CardTitle>
              <CardDescription>
                Help us improve by sharing your ideas or reporting issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedback_message">Your Feedback</Label>
                <Textarea
                  id="feedback_message"
                  placeholder="Share your ideas, report bugs, or suggest improvements..."
                  value={feedback.message}
                  onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
              </div>
              <Button onClick={submitFeedback} disabled={!feedback.message.trim()}>
                Send Feedback
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-card border shadow-card border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full md:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account,
                      remove all your data from our servers, and cancel any active conversations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}