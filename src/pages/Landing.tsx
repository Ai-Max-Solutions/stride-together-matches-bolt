import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingSportsCategories } from "@/components/landing/LandingSportsCategories";
import { LandingSafety } from "@/components/landing/LandingSafety";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingSportsCategories />
      <LandingSafety />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
};

export default Landing;