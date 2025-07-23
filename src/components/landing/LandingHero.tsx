import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, Play, Star, Heart, Users } from "lucide-react";

export const LandingHero = () => {
  return (
    <section className="container mx-auto px-4 py-12 text-center animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Badge className="mb-6 bg-gradient-accent text-accent-foreground px-4 py-2 animate-bounce-light">
          <Zap className="h-4 w-4 mr-2" />
          AI-Powered Fitness Matching
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight animate-fade-in-up">
          Find Your Perfect 
          <br />
          Workout Buddy
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up text-balance">
          Connect with runners, cyclists, and fitness enthusiasts who match your pace, 
          goals, and schedule. Train together, stay motivated, achieve more.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up">
          <Link to="/auth">
            <Button variant="hero" size="xl" className="group hover-lift button-bounce min-h-[56px] px-8">
              Create My Free Profile
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="outline" size="xl" className="group hover-scale glass-button min-h-[56px] px-8">
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            See How It Works
          </Button>
        </div>

        {/* Hero Image */}
        <div className="mb-12 relative animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl hover-lift glass-card">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center"
              alt="People running together outdoors" 
              className="w-full h-64 md:h-80 object-cover transition-transform duration-500 hover:scale-105"
              loading="eager"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            
            {/* Floating elements for visual interest */}
            <div className="absolute top-4 right-4 glass-light rounded-full p-2 animate-float">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <div className="absolute bottom-4 left-4 glass-light rounded-full p-2 animate-float" style={{ animationDelay: '1s' }}>
              <Users className="h-4 w-4 text-accent" />
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground animate-fade-in-up">
          <div className="flex items-center space-x-3 glass-light px-4 py-2 rounded-full">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 bg-gradient-primary rounded-full border-2 border-background animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="font-medium">500+ Active Athletes</span>
          </div>
          <div className="flex items-center space-x-2 glass-light px-4 py-2 rounded-full">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-warning text-warning animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span className="font-medium">4.9/5 Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
};