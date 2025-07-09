import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const LandingHeader = () => {
  return (
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
  );
};