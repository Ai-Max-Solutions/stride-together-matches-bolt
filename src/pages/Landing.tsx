import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  MapPin, 
  MessageCircle, 
  Zap, 
  Shield,
  ArrowRight,
  Play,
  Star
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Stride Together
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden md:inline-flex">
                How it Works
              </Button>
              <Link to="/auth">
                <Button variant="outline">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero" size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-accent text-accent-foreground px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Fitness Matching
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
            Find Your Perfect 
            <br />
            Workout Buddy
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with runners, cyclists, and fitness enthusiasts who match your pace, 
            goals, and schedule. Train together, stay motivated, achieve more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Create My Free Profile
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="group">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              See How It Works
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mb-12 relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center"
                alt="People running together outdoors" 
                className="w-full h-64 md:h-80 object-cover"
              />
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/lovable-uploads/5c3d2b7b-4d6d-46ba-8599-c2c76c3470c9.png)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-accent/60"></div>
            </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
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

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Stride Together Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get matched with compatible workout partners in 3 simple steps. 
            Our AI considers your fitness level, goals, location, and schedule.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: Target,
              title: "Create Your Profile",
              description: "Tell us your sports, fitness level, pace goals, location, and when you're available to train.",
              color: "running",
              step: "01"
            },
            {
              icon: Users,
              title: "Get AI Matches",
              description: "Our smart algorithm finds workout partners who match your pace, goals, and schedule perfectly.",
              color: "cycling", 
              step: "02"
            },
            {
              icon: MessageCircle,
              title: "Meet & Train",
              description: "Chat with matches, plan safe meetups in public spaces, and start achieving your fitness goals together.",
              color: "fitness",
              step: "03"
            }
          ].map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-card transition-all duration-300 bg-gradient-card">
              <CardContent className="p-8 text-center">
                <div className="absolute top-6 right-6 text-4xl font-bold text-muted-foreground/20">
                  {feature.step}
                </div>
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-${feature.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Sports Categories */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Every Sport, Every Level
          </h2>
          <p className="text-lg text-muted-foreground">
            From beginners taking their first steps to experienced athletes pushing limits. 
            Find your tribe in any sport.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { 
              sport: "Running", 
              icon: "🏃‍♂️", 
              color: "running", 
              count: "150+ runners",
              image: "/lovable-uploads/7d539b51-cdd4-4ca6-9327-910e9eec8dde.png"
            },
            { 
              sport: "Cycling", 
              icon: "🚴‍♀️", 
              color: "cycling", 
              count: "120+ cyclists",
              image: "/lovable-uploads/d2784c9d-f260-4c80-9845-3c4dce3ad979.png"
            },
            { 
              sport: "Swimming", 
              icon: "🏊‍♂️", 
              color: "fitness", 
              count: "80+ swimmers",
              image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=200&fit=crop"
            },
            { 
              sport: "Gym Training", 
              icon: "🏋️‍♀️", 
              color: "primary", 
              count: "200+ lifters",
              image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop"
            }
          ].map((category, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="relative">
                <img 
                  src={category.image} 
                  alt={category.sport}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-white font-semibold">
                  {category.sport}
                </div>
              </div>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <p className="text-sm text-muted-foreground mb-3">{category.count}</p>
                <Link to="/auth">
                  <Button variant={category.color as any} size="sm" className="w-full">
                    Find Partners
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Safety & Privacy */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-success/10 text-success border-success/20">
                <Shield className="w-4 h-4 mr-2" />
                Safety First
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Your Safety & Privacy Matter
              </h2>
              <div className="space-y-4">
                {[
                  "Location sharing only when you choose",
                  "Verified profiles and secure messaging",
                  "Meet in public spaces recommendations",
                  "Report and block features for safety"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-success/20 to-primary/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-24 h-24 text-success/60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-hero rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Workout Buddy?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of athletes who've already found their perfect training partners. 
            Start your fitness journey together today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="secondary" size="xl" className="bg-white text-primary hover:bg-white/90">
                Create My Free Profile
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Stride Together</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting fitness enthusiasts worldwide. Find your perfect workout buddy, 
                train together safely, and achieve your goals faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>How it Works</div>
                <div>Safety</div>
                <div>Pricing</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Community</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Safety Guidelines</div>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
            © 2024 Stride Together. All rights reserved. • Connecting fitness enthusiasts worldwide.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;