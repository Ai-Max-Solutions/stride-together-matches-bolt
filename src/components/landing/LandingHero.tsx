import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, Play, Star } from "lucide-react";

export const LandingHero = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Badge className="mb-6 bg-gradient-accent text-accent-foreground px-4 py-2 animate-bounce-light">
          <Zap className="h-4 w-4 mr-2" />
          AI-Powered Fitness Matching
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight animate-scale-in">
          Find Your Perfect 
          <br />
          Workout Buddy
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in">
          Connect with runners, cyclists, and fitness enthusiasts who match your pace, 
          goals, and schedule. Train together, stay motivated, achieve more.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link to="/auth">
            <Button variant="hero" size="xl" className="group hover-lift animate-pulse-glow">
              Create My Free Profile
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="outline" size="xl" className="group hover-scale">
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            See How It Works
          </Button>
        </div>

        {/* Hero Image */}
        <div className="mb-12 relative animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl shadow-card hover-lift">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center"
              alt="People running together outdoors" 
              className="w-full h-64 md:h-80 object-cover transition-transform duration-300 hover:scale-105"
            />
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/lovable-uploads/5c3d2b7b-4d6d-46ba-8599-c2c76c3470c9.png)' }}
            >
              <div className="absolute inset-0 bg-gradient-hero"></div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 bg-gradient-primary rounded-full border-2 border-background"></div>
              ))}
            </div>
            <span>500+ Active Users</span>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span>4.9/5 Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
};