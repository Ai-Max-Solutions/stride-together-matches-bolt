import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export const LandingCTA = () => {
  return <section className="container mx-auto px-4 py-20">
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
          <Button variant="outline" size="xl" className="border-white hover:bg-white/10 text-gray-950">
            Learn More
          </Button>
        </div>
      </div>
    </section>;
};