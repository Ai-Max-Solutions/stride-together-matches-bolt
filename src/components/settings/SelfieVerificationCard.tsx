import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Camera, Smartphone } from 'lucide-react';
import { SelfieVerificationModal } from './SelfieVerificationModal';
import { useToast } from '@/hooks/use-toast';

interface SelfieVerificationCardProps {
  isVerified: boolean;
  onVerificationComplete: (verified: boolean) => void;
}

export function SelfieVerificationCard({ isVerified, onVerificationComplete }: SelfieVerificationCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const handleVerificationSuccess = (verified: boolean) => {
    setShowModal(false);
    onVerificationComplete(verified);
    
    if (verified) {
      toast({
        title: "Verification Complete!",
        description: "Your profile is now verified with a selfie check.",
      });
    }
  };

  if (isVerified) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Profile Verified</CardTitle>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
          <CardDescription>
            Your profile has been verified with a selfie check. This helps build trust with other users.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Verify with Selfie</CardTitle>
            <Badge variant="outline" className="text-muted-foreground">
              Optional
            </Badge>
          </div>
          <CardDescription>
            Build trust with other users by verifying your profile with a one-time selfie check.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4 mt-0.5 text-blue-600" />
            <div>
              <p className="font-medium">Best on mobile</p>
              <p>Use your phone's camera for the best experience</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Camera className="h-4 w-4 mt-0.5 text-green-600" />
            <div>
              <p className="font-medium">Privacy protected</p>
              <p>We don't store your selfie - only the verification status</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => setShowModal(true)} className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              Verify Now
            </Button>
            <Button variant="ghost" className="text-muted-foreground">
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>

      <SelfieVerificationModal
        open={showModal}
        onOpenChange={setShowModal}
        onVerificationComplete={handleVerificationSuccess}
      />
    </>
  );
}