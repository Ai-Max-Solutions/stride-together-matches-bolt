import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Camera, CheckCircle, AlertCircle, Loader2, Star, Trophy } from 'lucide-react';
import { SelfieCamera } from './SelfieCamera';
import { supabase } from '@/integrations/supabase/client';

interface SelfieVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationComplete: (verified: boolean) => void;
}

export function SelfieVerificationModal({ open, onOpenChange, onVerificationComplete }: SelfieVerificationModalProps) {
  const [step, setStep] = useState<'consent' | 'camera' | 'processing' | 'result'>('consent');
  const [consent, setConsent] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; message: string } | null>(null);

  const handleConsentNext = () => {
    if (consent) {
      setStep('camera');
    }
  };

  const handleSelfieCapture = async (imageFile: File) => {
    setStep('processing');
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('verify-selfie', {
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw new Error(response.error.message);
      const data = response.data;
      
      setVerificationResult({
        verified: data.verified,
        message: data.message
      });
      setStep('result');
      
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        verified: false,
        message: 'Verification failed. Please try again.'
      });
      setStep('result');
    }
  };

  const handleComplete = () => {
    if (verificationResult) {
      onVerificationComplete(verificationResult.verified);
    }
    handleClose();
  };

  const handleClose = () => {
    setStep('consent');
    setConsent(false);
    setVerificationResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg border-2 border-green-300 shadow-2xl">
        {step === 'consent' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                🚀 Elite Verification Process
              </DialogTitle>
              <DialogDescription className="text-green-700 font-semibold text-base">
                Join the trusted elite athlete community with instant verification!
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-200 space-y-4">
                <h4 className="font-bold text-green-800 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Elite Benefits You'll Get:
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="bg-green-500 p-1 rounded-full">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Instant 30-second verification</p>
                      <p className="text-green-600">Quick mobile camera check</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-500 p-1 rounded-full">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Elite verified badge on your profile</p>
                      <p className="text-green-600">Stand out as a trusted athlete</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-500 p-1 rounded-full">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">3x more training partner requests</p>
                      <p className="text-green-600">Elite athletes prefer verified profiles</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  🔒 Privacy & Security Promise
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span><strong>No storage:</strong> Selfie deleted immediately after verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span><strong>Status only:</strong> We only save "verified" or "not verified"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span><strong>One-time:</strong> Never need to verify again</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span><strong>Optional:</strong> You can skip this anytime</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="consent" 
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                />
                <label htmlFor="consent" className="text-sm">
                  I understand and consent to the selfie verification process
                </label>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleConsentNext} 
                  disabled={!consent}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white border-0 shadow-lg hover:shadow-xl text-base font-bold py-6"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  🚀 Start Elite Verification!
                </Button>
                <Button variant="outline" onClick={handleClose} className="border-gray-300">
                  Maybe Later
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'camera' && (
          <SelfieCamera 
            onCapture={handleSelfieCapture}
            onCancel={handleClose}
          />
        )}

        {step === 'processing' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center">
                🔍 Elite Verification in Progress...
              </DialogTitle>
              <DialogDescription className="text-blue-700 font-semibold text-center">
                Our advanced AI is verifying your identity. This usually takes just 5-10 seconds.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                <div className="absolute inset-0 animate-pulse">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20"></div>
                </div>
              </div>
              <p className="text-sm text-blue-600 font-medium">✨ Processing your elite verification...</p>
            </div>
          </>
        )}

        {step === 'result' && verificationResult && (
          <>
            <DialogHeader className="text-center">
              <div className={`mx-auto mb-4 p-4 rounded-full w-16 h-16 flex items-center justify-center ${
                verificationResult.verified 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-600'
              }`}>
                {verificationResult.verified ? (
                  <CheckCircle className="h-8 w-8 text-white" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-white" />
                )}
              </div>
              <DialogTitle className={`text-2xl font-bold bg-gradient-to-r ${
                verificationResult.verified 
                  ? 'from-green-600 to-emerald-600' 
                  : 'from-amber-600 to-orange-600'
              } bg-clip-text text-transparent`}>
                {verificationResult.verified ? '🎉 Elite Verification Complete!' : '⚠️ Verification Needs Retry'}
              </DialogTitle>
              <DialogDescription className={`font-semibold ${
                verificationResult.verified ? 'text-green-700' : 'text-amber-700'
              }`}>
                {verificationResult.verified 
                  ? 'Welcome to the elite verified athlete community!' 
                  : verificationResult.message
                }
              </DialogDescription>
            </DialogHeader>

            {verificationResult.verified && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-full">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-green-800 text-lg">
                    🏆 Elite Status Unlocked!
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Verified badge</strong> now shows on your profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>3x more</strong> training partner requests expected</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Elite athlete</strong> community access</span>
                  </li>
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleComplete} 
                className={`flex-1 border-0 shadow-lg text-base font-bold py-6 ${
                  verificationResult.verified 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white' 
                    : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white'
                }`}
              >
                {verificationResult.verified ? '🎉 Awesome! Continue' : '🔄 Try Again'}
              </Button>
              {!verificationResult.verified && (
                <Button variant="outline" onClick={handleClose} className="border-gray-300">
                  Skip for now
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}