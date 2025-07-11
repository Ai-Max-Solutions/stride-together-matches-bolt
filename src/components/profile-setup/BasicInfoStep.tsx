import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileValidation } from '@/hooks/use-profile-validation';
import { SelfieVerificationCard } from '@/components/settings/SelfieVerificationCard';

interface BasicInfoStepProps {
  data: {
    full_name: string;
    bio: string;
    profile_picture_url?: string;
    selfie_verified?: boolean;
  };
  onChange: (updates: any) => void;
}

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const { user } = useAuth();
  const { validateField } = useProfileValidation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { uploadFile, uploading } = useImageUpload({
    bucket: 'profile-pictures'
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const url = await uploadFile(file, fileName);
      
      onChange({ profile_picture_url: url });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Real-time validation
    const error = validateField(field as any, value);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
    
    onChange({ [field]: value });
  };

  const handleVerificationComplete = (verified: boolean) => {
    onChange({ selfie_verified: verified });
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={data.profile_picture_url} />
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
            <Button type="button" variant="outline" disabled={uploading} asChild>
              <span>
                <Camera className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </span>
            </Button>
          </Label>
        </div>
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          value={data.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          placeholder="Enter your full name"
          className={errors.full_name ? 'border-destructive' : ''}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">About Me</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself, your fitness journey, and what you're looking for in a workout partner..."
          value={data.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className={errors.bio ? 'border-destructive' : ''}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.bio && (
            <p className="text-sm text-destructive">{errors.bio}</p>
          )}
          <p className="text-xs text-muted-foreground ml-auto">
            {data.bio.length}/500 characters
          </p>
        </div>
      </div>

      {/* Selfie Verification */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Profile Verification</Label>
        <SelfieVerificationCard
          isVerified={data.selfie_verified || false}
          onVerificationComplete={handleVerificationComplete}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Tips for a great profile:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use a clear photo where you're easily recognizable</li>
          <li>• Mention your fitness goals and favorite activities</li>
          <li>• Share what you're looking for in a workout partner</li>
          <li>• Verify your profile with a selfie to build trust</li>
        </ul>
      </div>
    </div>
  );
}