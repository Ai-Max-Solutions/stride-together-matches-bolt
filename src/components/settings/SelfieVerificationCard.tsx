import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Camera, Smartphone, CheckCircle, Star, Lock } from 'lucide-react';
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
        title: "🎉 Elite Verification Complete!",
        description: "You now have trusted athlete status! Expect 3x more training requests.",
      });
    }
  };

  if (isVerified) {
    return (
      <Card className="border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-200/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-full">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Elite Verified Profile
                </CardTitle>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
                  <Star className="h-3 w-3 mr-1" />
                  Trusted
                </Badge>
              </div>
              <CardDescription className="text-green-700 font-medium">
                ✓ Your profile has been verified with advanced selfie authentication. Elite athletes trust verified profiles 3x more.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl shadow-orange-200/50 hover:shadow-2xl hover:shadow-orange-300/60 transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-3 rounded-full">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                !
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  🔒 Verify Your Identity
                </CardTitle>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md animate-pulse">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Build Trust
                </Badge>
              </div>
              <CardDescription className="text-orange-800 font-semibold">
                ⚡ Get 3x more training partner requests! Elite athletes prefer verified profiles for safety and trust.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
            <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Why Verify? Elite Benefits:
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="bg-green-100 p-1 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">3x More Training Requests</p>
                  <p className="text-orange-700">Elite athletes trust verified profiles</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <div className="bg-blue-100 p-1 rounded-full">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Mobile Optimized</p>
                  <p className="text-orange-700">Quick 30-second verification process</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <div className="bg-purple-100 p-1 rounded-full">
                  <Lock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-800">Privacy Protected</p>
                  <p className="text-orange-700">Selfie deleted immediately - only verification status stored</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={() => setShowModal(true)} 
              className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-green-200 transition-all duration-300 hover:scale-105 text-base font-bold py-6"
            >
              <Shield className="h-5 w-5 mr-2" />
              🚀 Verify Now - Get Elite Status!
            </Button>
            <Button variant="outline" className="w-full sm:w-auto text-orange-600 border-orange-300 hover:bg-orange-50">
              Maybe Later
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