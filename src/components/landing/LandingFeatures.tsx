import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, MessageCircle } from "lucide-react";

export const LandingFeatures = () => {
  const features = [
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
  ];

  return (
    <section className="container mx-auto px-4 py-12">
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
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className="relative group hover:shadow-card-hover transition-all duration-500 glass-card hover-lift animate-fade-in-up"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <CardContent className="p-8 text-center">
              <div className="absolute top-6 right-6 text-4xl font-bold text-primary/10">
                {feature.step}
              </div>
              <div className={cn(
                "w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center",
                "bg-gradient-primary/10 group-hover:bg-gradient-primary/20",
                "group-hover:scale-110 transition-all duration-500",
                "shadow-lg group-hover:shadow-xl"
              )}>
                <feature.icon className={`w-8 h-8 text-${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-balance">
                {feature.description}
              </p>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-colors duration-500" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};