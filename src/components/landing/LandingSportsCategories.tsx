import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const LandingSportsCategories = () => {
  const categories = [
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
      image: "/lovable-uploads/0df162cc-d0d3-455b-8ee3-441bdb35b13c.png"
    },
    { 
      sport: "Gym Training", 
      icon: "🏋️‍♀️", 
      color: "primary", 
      count: "200+ lifters",
      image: "/lovable-uploads/7d3ee052-7f26-40d8-be1d-b115bd9fb0cb.png"
    }
  ];

  return (
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
        {categories.map((category, index) => (
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
                <Button 
                  variant={category.sport === "Gym Training" ? "default" : category.color as "running" | "cycling" | "fitness" | "default"} 
                  size="sm" 
                  className={`w-full ${category.sport === "Gym Training" ? "bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-105" : ""}`}
                >
                  Find Partners
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};