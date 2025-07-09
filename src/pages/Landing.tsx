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
                FitConnect
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
            Find Your Perfect Workout Partner
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
            Train Together, 
            <br />
            Achieve More
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with runners, cyclists, and fitness enthusiasts at your pace. 
            Find training partners who match your goals, location, and ability level.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Start Matching
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="group">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple steps to find your ideal training partner and start achieving your fitness goals together.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: Target,
              title: "Set Your Goals",
              description: "Tell us your sport, pace, distance goals, and preferred workout times.",
              color: "running"
            },
            {
              icon: Users,
              title: "Smart Matching",
              description: "Our AI finds compatible partners based on your fitness level and location.",
              color: "cycling"
            },
            {
              icon: MessageCircle,
              title: "Connect & Train",
              description: "Chat securely, plan meetups, and start training together safely.",
              color: "fitness"
            }
          ].map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-card transition-all duration-300 bg-gradient-card">
              <CardContent className="p-8 text-center">
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
            Find Partners for Every Sport
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're a beginner or a pro, find someone at your level.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { sport: "Running", icon: "🏃‍♂️", color: "running", count: "150+ runners" },
            { sport: "Cycling", icon: "🚴‍♀️", color: "cycling", count: "120+ cyclists" },
            { sport: "Swimming", icon: "🏊‍♂️", color: "fitness", count: "80+ swimmers" },
            { sport: "Gym Training", icon: "🏋️‍♀️", color: "primary", count: "200+ lifters" }
          ].map((category, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="font-semibold mb-2">{category.sport}</h3>
                <p className="text-sm text-muted-foreground mb-4">{category.count}</p>
                <Button variant={category.color as any} size="sm" className="w-full">
                  Find Partners
                </Button>
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
            Ready to Find Your Training Partner?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join hundreds of athletes already training together and achieving their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="secondary" size="xl" className="bg-white text-primary hover:bg-white/90">
                Create Free Profile
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
                <span className="text-lg font-bold">FitConnect</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting fitness enthusiasts worldwide for better training experiences.
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
            © 2024 FitConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;