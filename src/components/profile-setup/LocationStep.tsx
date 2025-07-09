import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Target } from 'lucide-react';
import { useProfileValidation } from '@/hooks/use-profile-validation';

interface LocationStepProps {
  data: {
    city: string;
    region: string;
    location_visible: boolean;
    age_range_min: number;
    age_range_max: number;
    gender_preference: string;
  };
  onChange: (updates: any) => void;
}

export function LocationStep({ data, onChange }: LocationStepProps) {
  const { validateField, validateAgeRange } = useProfileValidation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    // Real-time validation
    const error = validateField(field as any, value);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
    
    onChange({ [field]: value });
  };

  const handleAgeChange = (field: 'age_range_min' | 'age_range_max', value: number) => {
    const newData = { ...data, [field]: value };
    
    // Validate age range
    const ageError = validateAgeRange(newData.age_range_min, newData.age_range_max);
    setErrors(prev => ({ ...prev, age_range: ageError || '' }));
    
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-4">
        <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Help us find workout partners near you
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g., San Francisco"
              value={data.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={errors.city ? 'border-destructive' : ''}
            />
            {errors.city && (
              <p className="text-sm text-destructive mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <Label htmlFor="region">State/Region</Label>
            <Input
              id="region"
              placeholder="e.g., California"
              value={data.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className={errors.region ? 'border-destructive' : ''}
            />
            {errors.region && (
              <p className="text-sm text-destructive mt-1">{errors.region}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="location_visible"
            checked={data.location_visible}
            onCheckedChange={(checked) => onChange({ location_visible: checked })}
          />
          <Label htmlFor="location_visible" className="text-sm">
            Make my location visible to other users
          </Label>
        </div>
      </div>

      {/* Matching Preferences */}
      <div className="space-y-4">
        <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
          <Target className="h-4 w-4" />
          Matching Preferences
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Set your preferences for workout partner matching
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age_range_min">Preferred Age Range</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="age_range_min"
                type="number"
                min="18"
                max="100"
                value={data.age_range_min}
                onChange={(e) => handleAgeChange('age_range_min', parseInt(e.target.value))}
                className={errors.age_range ? 'border-destructive' : ''}
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                min="18"
                max="100"
                value={data.age_range_max}
                onChange={(e) => handleAgeChange('age_range_max', parseInt(e.target.value))}
                className={errors.age_range ? 'border-destructive' : ''}
              />
            </div>
            {errors.age_range && (
              <p className="text-sm text-destructive mt-1">{errors.age_range}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="gender_preference">Gender Preference</Label>
            <Select
              value={data.gender_preference}
              onValueChange={(value) => onChange({ gender_preference: value })}
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

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Privacy & Safety:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Your exact location is never shared - only general area</li>
          <li>• You can always adjust these preferences later</li>
          <li>• All meetups should be in public, safe locations</li>
        </ul>
      </div>
    </div>
  );
}