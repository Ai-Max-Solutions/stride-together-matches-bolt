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
        {features.map((feature, index) => (
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
  );
};