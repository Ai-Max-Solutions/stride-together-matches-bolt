import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProfileData, FitnessDetails } from '@/types/profile';
import { useState } from 'react';

interface FitnessDetailsStepProps {
  data: ProfileData;
  onChange: (updates: Partial<ProfileData>) => void;
}

interface SportCardProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const SportCard: React.FC<SportCardProps> = ({ title, isExpanded, onToggle, children }) => (
  <Card className="mb-4">
    <CardHeader className="pb-2">
      <Button 
        variant="ghost" 
        onClick={onToggle}
        className="w-full justify-between p-0 h-auto font-medium text-left"
      >
        <CardTitle className="text-lg">{title}</CardTitle>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </Button>
    </CardHeader>
    {isExpanded && (
      <CardContent className="pt-2">
        {children}
      </CardContent>
    )}
  </Card>
);

const InfoTooltip: React.FC<{ content: string }> = ({ content }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-muted-foreground ml-1 cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function FitnessDetailsStep({ data, onChange }: FitnessDetailsStepProps) {
  const selectedSports = data.sports || [];
  const fitnessDetails = data.fitness_details || {};
  
  // Track which sport cards are expanded
  const [expandedSports, setExpandedSports] = useState<Set<string>>(
    new Set(selectedSports.length <= 2 ? selectedSports : [])
  );

  const toggleExpanded = (sport: string) => {
    const newExpanded = new Set(expandedSports);
    if (newExpanded.has(sport)) {
      newExpanded.delete(sport);
    } else {
      newExpanded.add(sport);
    }
    setExpandedSports(newExpanded);
  };

  const updateFitnessDetail = (sport: string, field: string, value: any) => {
    const updatedDetails = {
      ...fitnessDetails,
      [sport]: {
        ...fitnessDetails[sport as keyof FitnessDetails],
        [field]: value
      }
    };
    onChange({ fitness_details: updatedDetails });
  };

  if (selectedSports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No sports selected yet. Please go back to select your sports first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Help us find your perfect workout buddy by sharing your fitness details for each sport you selected.
        </p>
      </div>

      {selectedSports.includes('running') && (
        <SportCard 
          title="🏃‍♀️ Running" 
          isExpanded={expandedSports.has('running')}
          onToggle={() => toggleExpanded('running')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                5K Time
                <InfoTooltip content="Your best or typical 5K time helps us match you with similarly paced runners" />
              </Label>
              <Input
                placeholder="e.g., 25:30"
                value={fitnessDetails.running?.fiveKTime || ''}
                onChange={(e) => updateFitnessDetail('running', 'fiveKTime', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center">
                Average Pace
                <InfoTooltip content="Your comfortable running pace per km or mile" />
              </Label>
              <Input
                placeholder="e.g., 5:30/km"
                value={fitnessDetails.running?.averagePace || ''}
                onChange={(e) => updateFitnessDetail('running', 'averagePace', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center">
                Longest Recent Run
                <InfoTooltip content="Distance of your longest run in the past month" />
              </Label>
              <Input
                placeholder="e.g., 10 km"
                value={fitnessDetails.running?.longestRun || ''}
                onChange={(e) => updateFitnessDetail('running', 'longestRun', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Preferred Unit</Label>
              <Select 
                value={fitnessDetails.running?.preferredUnit || 'km'}
                onValueChange={(value) => updateFitnessDetail('running', 'preferredUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometers</SelectItem>
                  <SelectItem value="miles">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SportCard>
      )}

      {selectedSports.includes('cycling') && (
        <SportCard 
          title="🚴‍♀️ Cycling" 
          isExpanded={expandedSports.has('cycling')}
          onToggle={() => toggleExpanded('cycling')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                Average Distance per Ride
                <InfoTooltip content="Typical distance you cover in a single cycling session" />
              </Label>
              <Input
                placeholder="e.g., 25 km"
                value={fitnessDetails.cycling?.averageDistance || ''}
                onChange={(e) => updateFitnessDetail('cycling', 'averageDistance', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center">
                Average Speed
                <InfoTooltip content="Your comfortable cycling speed" />
              </Label>
              <Input
                placeholder="e.g., 20 km/h"
                value={fitnessDetails.cycling?.averageSpeed || ''}
                onChange={(e) => updateFitnessDetail('cycling', 'averageSpeed', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Preferred Unit</Label>
              <Select 
                value={fitnessDetails.cycling?.preferredUnit || 'km'}
                onValueChange={(value) => updateFitnessDetail('cycling', 'preferredUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometers</SelectItem>
                  <SelectItem value="miles">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SportCard>
      )}

      {selectedSports.includes('swimming') && (
        <SportCard 
          title="🏊‍♀️ Swimming" 
          isExpanded={expandedSports.has('swimming')}
          onToggle={() => toggleExpanded('swimming')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                Preferred Stroke
                <InfoTooltip content="Your main or favorite swimming stroke" />
              </Label>
              <Select 
                value={fitnessDetails.swimming?.preferredStroke || ''}
                onValueChange={(value) => updateFitnessDetail('swimming', 'preferredStroke', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stroke" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freestyle">Freestyle</SelectItem>
                  <SelectItem value="backstroke">Backstroke</SelectItem>
                  <SelectItem value="breaststroke">Breaststroke</SelectItem>
                  <SelectItem value="butterfly">Butterfly</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center">
                Average Distance
                <InfoTooltip content="Typical distance you swim in one session" />
              </Label>
              <Input
                placeholder="e.g., 1000m"
                value={fitnessDetails.swimming?.averageDistance || ''}
                onChange={(e) => updateFitnessDetail('swimming', 'averageDistance', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center">
                Comfortable Pace
                <InfoTooltip content="Your relaxed swimming pace per 100m" />
              </Label>
              <Input
                placeholder="e.g., 2:00/100m"
                value={fitnessDetails.swimming?.comfortablePace || ''}
                onChange={(e) => updateFitnessDetail('swimming', 'comfortablePace', e.target.value)}
              />
            </div>
          </div>
        </SportCard>
      )}

      {(selectedSports.includes('gym') || selectedSports.includes('strength training')) && (
        <SportCard 
          title="💪 Gym & Strength Training" 
          isExpanded={expandedSports.has('gym')}
          onToggle={() => toggleExpanded('gym')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                Typical Workout Duration
                <InfoTooltip content="How long your typical gym session lasts" />
              </Label>
              <Select 
                value={fitnessDetails.gym?.workoutDuration || ''}
                onValueChange={(value) => updateFitnessDetail('gym', 'workoutDuration', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30-45min">30-45 minutes</SelectItem>
                  <SelectItem value="45-60min">45-60 minutes</SelectItem>
                  <SelectItem value="60-90min">60-90 minutes</SelectItem>
                  <SelectItem value="90min+">90+ minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center">
                Experience Level
                <InfoTooltip content="Your current fitness and strength training experience" />
              </Label>
              <Select 
                value={fitnessDetails.gym?.level || ''}
                onValueChange={(value) => updateFitnessDetail('gym', 'level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SportCard>
      )}

      <div className="bg-accent/50 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Don't worry if you're not sure!</strong> You can always update these details later in your profile settings.
        </p>
      </div>
    </div>
  );
}