import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  MapPin, 
  Zap,
  SlidersHorizontal,
  Heart,
  X
} from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import Navigation from "@/components/Navigation";
import AIMatchingCard from "@/components/AIMatchingCard";

// Mock data for development
const mockAIRecommendations = [
  {
    profile: {
      id: "ai-1",
      name: "Sarah Johnson",
      sport: "Running",
      pace: "8:30/mi",
      location: "Downtown, 2.3 mi",
      matchPercentage: 94
    },
    reasons: [
      { type: 'pace' as const, description: "Similar 8:30 pace for long runs", score: 0.95 },
      { type: 'location' as const, description: "Lives 2.3 miles away", score: 0.85 },
      { type: 'goals' as const, description: "Both training for marathons", score: 0.9 },
      { type: 'availability' as const, description: "Free mornings and weekends", score: 0.8 }
    ],
    confidenceScore: 0.94
  },
  {
    profile: {
      id: "ai-2",
      name: "Emma Rodriguez",
      sport: "Running",
      pace: "9:15/mi",
      location: "Midtown, 3.1 mi",
      matchPercentage: 92
    },
    reasons: [
      { type: 'pace' as const, description: "Compatible pace for training", score: 0.88 },
      { type: 'location' as const, description: "Close proximity", score: 0.75 },
      { type: 'goals' as const, description: "Focused on consistency like you", score: 0.95 },
      { type: 'availability' as const, description: "Flexible morning schedule", score: 0.9 }
    ],
    confidenceScore: 0.92
  }
];

const mockProfiles = [
  {
    id: "1",
    name: "Sarah Johnson",
    age: 28,
    location: "Downtown, 2.3 mi",
    sport: "Running",
    pace: "8:30/mi",
    distance: "5-10K",
    goals: ["Marathon Training", "Weight Loss", "Endurance"],
    availability: ["Morning", "Weekend"],
    rating: 4.8,
    completedWorkouts: 45,
    avatar: "SJ",
    matchPercentage: 94
  },
  {
    id: "2",
    name: "Mike Chen",
    age: 32,
    location: "Uptown, 1.8 mi",
    sport: "Cycling",
    pace: "18 mph avg",
    distance: "20-50K",
    goals: ["Century Ride", "Speed Training"],
    availability: ["Evening", "Weekend"],
    rating: 4.9,
    completedWorkouts: 67,
    avatar: "MC",
    matchPercentage: 87
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    age: 25,
    location: "Midtown, 3.1 mi",
    sport: "Running",
    pace: "9:15/mi",
    distance: "3-8K",
    goals: ["5K PR", "Consistency", "Fun Runs"],
    availability: ["Morning", "Lunch", "Weekend"],
    rating: 4.7,
    completedWorkouts: 32,
    avatar: "ER",
    matchPercentage: 92
  },
  {
    id: "4",
    name: "Alex Thompson",
    age: 29,
    location: "West Side, 4.2 mi",
    sport: "Swimming",
    pace: "1:45/100m",
    distance: "1500-3000m",
    goals: ["Triathlon Prep", "Technique", "Open Water"],
    availability: ["Evening", "Weekend"],
    rating: 4.6,
    completedWorkouts: 28,
    avatar: "AT",
    matchPercentage: 78
  }
];

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());

  const sports = ["Running", "Cycling", "Swimming", "Gym"];
  
  const filteredProfiles = mockProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.goals.some(goal => goal.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSport = !selectedSport || profile.sport === selectedSport;
    
    return matchesSearch && matchesSport;
  });

  const handleLike = (profileId: string) => {
    const newLiked = new Set(likedProfiles);
    if (newLiked.has(profileId)) {
      newLiked.delete(profileId);
    } else {
      newLiked.add(profileId);
    }
    setLikedProfiles(newLiked);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Page Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Browse Partners</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Zap className="w-3 h-3 mr-1" />
                {filteredProfiles.length} matches
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Liked ({likedProfiles.size})
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, sport, or goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                size="sm"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Near Me
              </Button>
            </div>
          </div>

          {/* Sport Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedSport === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSport(null)}
            >
              All Sports
            </Button>
            {sports.map((sport) => (
              <Button
                key={sport}
                variant={selectedSport === sport ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSport(selectedSport === sport ? null : sport)}
                className="relative"
              >
                {sport}
                {selectedSport === sport && (
                  <X className="w-3 h-3 ml-2" />
                )}
              </Button>
            ))}
          </div>

          {/* Advanced Filters (Collapsible) */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Advanced Filters</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Distance Range</label>
                    <div className="space-y-2">
                      {["Under 2 miles", "2-5 miles", "5-10 miles", "10+ miles"].map((range) => (
                        <label key={range} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Availability</label>
                    <div className="space-y-2">
                      {["Morning", "Lunch", "Evening", "Weekend"].map((time) => (
                        <label key={time} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{time}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience Level</label>
                    <div className="space-y-2">
                      {["Beginner", "Intermediate", "Advanced", "Elite"].map((level) => (
                        <label key={level} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" size="sm">Clear All</Button>
                  <Button size="sm">Apply Filters</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          <AIMatchingCard recommendations={mockAIRecommendations} />

          {/* Results */}
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters to find more partners.</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedSport(null);
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <div key={profile.id} className="relative">
                  <ProfileCard profile={profile} showMatchPercentage />
                  
                  {/* Like Button Overlay */}
                  <Button
                    variant="outline"
                    size="icon"
                    className={`absolute top-4 right-4 shadow-lg ${
                      likedProfiles.has(profile.id) 
                        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                        : 'bg-white hover:bg-red-50'
                    }`}
                    onClick={() => handleLike(profile.id)}
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        likedProfiles.has(profile.id) ? 'fill-current' : ''
                      }`} 
                    />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredProfiles.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Partners
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;