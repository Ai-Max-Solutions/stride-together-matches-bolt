import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export const LandingSafety = () => {
  const safetyFeatures = [
    "Location sharing only when you choose",
    "Verified profiles and secure messaging",
    "Meet in public spaces recommendations",
    "Report and block features for safety"
  ];

  return (
    <section className="container mx-auto px-4 py-12">
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
              {safetyFeatures.map((feature, index) => (
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
  );
};