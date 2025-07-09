import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileBottomSheet } from '@/components/ui/mobile-bottom-sheet';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { 
  Shield,
  MapPin,
  Clock,
  Users,
  Phone,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SafetyTipsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  meetupType?: string;
}

const SAFETY_TIPS = [
  {
    icon: MapPin,
    title: "Meet in public places",
    description: "Choose well-lit, populated areas like parks, gyms, or running tracks",
    color: "text-green-600"
  },
  {
    icon: Clock,
    title: "Plan during daylight",
    description: "Schedule meetups during daytime hours when visibility is best",
    color: "text-blue-600"
  },
  {
    icon: Users,
    title: "Tell someone your plans",
    description: "Share your meetup details with a friend or family member",
    color: "text-purple-600"
  },
  {
    icon: Phone,
    title: "Keep your phone charged",
    description: "Ensure your phone has enough battery and emergency contacts saved",
    color: "text-orange-600"
  }
];

export function SafetyTipsSheet({ isOpen, onClose, onAccept, meetupType = "workout" }: SafetyTipsSheetProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const { isMobile } = useMobileDetection();

  const handleAccept = () => {
    setAcknowledged(true);
    onAccept();
    onClose();
  };

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Safety First! 🛡️"
      description={`Before planning your ${meetupType}, let's review some safety guidelines`}
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Your safety matters</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Meeting new workout partners should be fun and safe. Follow these guidelines to ensure a positive experience.
          </p>
        </div>

        <div className="space-y-4">
          {SAFETY_TIPS.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className={`p-2 rounded-full bg-background ${tip.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-700 dark:text-red-400 text-sm">Trust your instincts</span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-300">
            If something feels off or unsafe, don't hesitate to cancel or leave. Report any inappropriate behavior immediately.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={handleAccept}
            className="w-full h-12 rounded-xl font-medium"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            I understand - Plan {meetupType}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Review later
          </Button>
        </div>

        <div className="text-center pt-2">
          <Badge variant="outline" className="text-xs">
            These tips help keep our community safe
          </Badge>
        </div>
      </div>
    </MobileBottomSheet>
  );
}