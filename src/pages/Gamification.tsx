import React from 'react';
import Navigation from '@/components/Navigation';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';

const Gamification: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              🏆 Your Progress
            </h1>
            <p className="text-muted-foreground">
              Track your achievements, complete challenges, and earn points as you build your fitness community.
            </p>
          </div>

          <GamificationDashboard />
        </div>
      </main>
    </div>
  );
};

export default Gamification;