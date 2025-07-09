import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SportsBadges } from '@/components/common/sports-badges';
import { Badge } from '@/components/ui/badge';
import { MapPin, Target, Clock, User, Edit, Activity } from 'lucide-react';
import { EXPERIENCE_LEVELS, DAYS_OF_WEEK, TIME_SLOTS } from '@/constants';
import { ProfileData, FitnessDetails } from '@/types/profile';

interface ReviewStepProps {
  data: ProfileData;
  onEdit: (step: number) => void;
}

export function ReviewStep({ data, onEdit }: ReviewStepProps) {
  const getExperienceLabel = (level: string) => {
    return EXPERIENCE_LEVELS.find(l => l.value === level)?.label || level;
  };

  const getAvailabilityText = () => {
    const totalSlots = Object.values(data.availability).flat().length;
    if (totalSlots === 0) return 'No availability set';
    
    const availableDays = Object.keys(data.availability).filter(
      day => data.availability[day].length > 0
    );
    
    return `Available ${totalSlots} time slots across ${availableDays.length} days`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review Your Profile</h3>
        <p className="text-muted-foreground">
          Take a moment to review your information before completing your profile.
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic Information
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(0)}
            className="text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={data.profile_picture_url} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h5 className="font-medium">{data.full_name || 'No name provided'}</h5>
            <p className="text-sm text-muted-foreground mt-1">
              {data.bio || 'No bio provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Sports & Experience */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Sports & Experience</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium">Sports:</span>
            {data.sports.length > 0 ? (
              <div className="mt-1">
                <SportsBadges selectedSports={data.sports} variant="display" />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground ml-2">None selected</span>
            )}
          </div>
          
          <div>
            <span className="text-sm font-medium">Experience Level:</span>
            <span className="ml-2 text-sm">
              {data.experience_level ? getExperienceLabel(data.experience_level) : 'Not specified'}
            </span>
          </div>
          
          {data.fitness_goals.length > 0 && (
            <div>
              <span className="text-sm font-medium">Goals:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.fitness_goals.map(goal => (
                  <Badge key={goal} variant="secondary" className="text-xs">
                    {goal.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fitness Details */}
      {data.sports.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Fitness Details
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              className="text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          
          <div className="space-y-3">
            {data.sports.map(sport => {
              const sportDetails = data.fitness_details?.[sport as keyof FitnessDetails];
              if (!sportDetails || Object.keys(sportDetails).length === 0) return null;

              return (
                <div key={sport} className="border-l-2 border-primary/20 pl-3">
                  <h5 className="font-medium text-sm capitalize mb-1">{sport}</h5>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {sport === 'running' && sportDetails && 'fiveKTime' in sportDetails && (
                      <>
                        {sportDetails.fiveKTime && <div>5K Time: {sportDetails.fiveKTime}</div>}
                        {sportDetails.averagePace && <div>Average Pace: {sportDetails.averagePace}</div>}
                        {sportDetails.longestRun && <div>Longest Run: {sportDetails.longestRun}</div>}
                      </>
                    )}
                    {sport === 'cycling' && sportDetails && 'averageDistance' in sportDetails && (
                      <>
                        {sportDetails.averageDistance && <div>Average Distance: {sportDetails.averageDistance}</div>}
                        {'averageSpeed' in sportDetails && sportDetails.averageSpeed && <div>Average Speed: {sportDetails.averageSpeed}</div>}
                      </>
                    )}
                    {sport === 'swimming' && sportDetails && 'preferredStroke' in sportDetails && (
                      <>
                        {sportDetails.preferredStroke && <div>Preferred Stroke: {sportDetails.preferredStroke}</div>}
                        {sportDetails.averageDistance && <div>Average Distance: {sportDetails.averageDistance}</div>}
                        {sportDetails.comfortablePace && <div>Comfortable Pace: {sportDetails.comfortablePace}</div>}
                      </>
                    )}
                    {(sport === 'gym' || sport === 'strength training') && sportDetails && 'workoutDuration' in sportDetails && (
                      <>
                        {sportDetails.workoutDuration && <div>Workout Duration: {sportDetails.workoutDuration}</div>}
                        {sportDetails.level && <div>Level: {sportDetails.level}</div>}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            
            {!data.sports.some(sport => {
              const sportDetails = data.fitness_details?.[sport as keyof FitnessDetails];
              return sportDetails && Object.keys(sportDetails).length > 0;
            }) && (
              <p className="text-sm text-muted-foreground">
                No fitness details provided yet. Add them to help find better matches!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Location & Preferences */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location & Preferences
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(3)}
            className="text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Location:</span>
            <span className="ml-2">
              {data.city && data.region 
                ? `${data.city}, ${data.region}` 
                : data.city || data.region || 'Not specified'}
            </span>
            {!data.location_visible && (
              <Badge variant="secondary" className="ml-2 text-xs">Hidden</Badge>
            )}
          </div>
          
          <div>
            <span className="font-medium">Age Range:</span>
            <span className="ml-2">{data.age_range_min} - {data.age_range_max} years</span>
          </div>
          
          <div>
            <span className="font-medium">Gender Preference:</span>
            <span className="ml-2 capitalize">{data.gender_preference}</span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Availability
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(4)}
            className="text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        
        <p className="text-sm">{getAvailabilityText()}</p>
        
        {Object.keys(data.availability).length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {DAYS_OF_WEEK.map(day => {
              const slots = data.availability[day] || [];
              if (slots.length === 0) return null;
              
              return (
                <div key={day} className="flex items-center gap-2">
                  <span className="font-medium capitalize">{day.slice(0, 3)}:</span>
                  <div className="flex gap-1">
                    {slots.map(slot => (
                      <Badge key={slot} variant="outline" className="text-xs px-1 py-0">
                        {slot.charAt(0).toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <h4 className="font-semibold text-sm mb-2">Ready to find your workout buddy?</h4>
        <p className="text-sm text-muted-foreground">
          Your profile looks great! Once you complete it, you'll be able to browse and connect 
          with other fitness enthusiasts in your area.
        </p>
      </div>
    </div>
  );
}