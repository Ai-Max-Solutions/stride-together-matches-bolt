import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiEffectProps {
  isActive: boolean;
  className?: string;
}

export function ConfettiEffect({ isActive, className }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; rotation: number; color: string }>>([]);

  useEffect(() => {
    if (isActive) {
      // Generate random confetti particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        color: [
          'hsl(var(--confetti-1))',
          'hsl(var(--confetti-2))',
          'hsl(var(--confetti-3))',
          'hsl(var(--confetti-4))',
          'hsl(var(--confetti-5))'
        ][Math.floor(Math.random() * 5)]
      }));
      
      setParticles(newParticles);
      
      // Clear particles after animation
      const timeout = setTimeout(() => {
        setParticles([]);
      }, 1200);
      
      return () => clearTimeout(timeout);
    }
  }, [isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confetti-fall 1.2s ease-out forwards`,
            animationDelay: `${Math.random() * 0.3}s`
          }}
        />
      ))}
      <style>{`
        .animate-confetti {
          animation: confetti-fall 1.2s ease-out forwards;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}