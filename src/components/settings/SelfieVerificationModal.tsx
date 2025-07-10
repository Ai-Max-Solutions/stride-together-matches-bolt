import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md">
        {step === 'consent' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Selfie Verification
              </DialogTitle>
              <DialogDescription>
                Help build trust in our community with a one-time selfie verification.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium">What happens:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                    Take a quick selfie with your camera
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                    We verify it's a real photo of a real person
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                    Get a verified badge on your profile
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Privacy Promise</h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• We don't store your selfie image</li>
                  <li>• Only the verification status is saved</li>
                  <li>• This is completely optional</li>
                  <li>• One-time verification only</li>
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

              <div className="flex gap-2">
                <Button 
                  onClick={handleConsentNext} 
                  disabled={!consent}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Continue
                </Button>
                <Button variant="ghost" onClick={handleClose}>
                  Skip for now
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
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                Verifying...
              </DialogTitle>
              <DialogDescription>
                Please wait while we verify your selfie. This usually takes just a few seconds.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          </>
        )}

        {step === 'result' && verificationResult && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {verificationResult.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                {verificationResult.verified ? 'Verification Successful!' : 'Verification Not Complete'}
              </DialogTitle>
              <DialogDescription>
                {verificationResult.message}
              </DialogDescription>
            </DialogHeader>

            {verificationResult.verified && (
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">
                    Your profile is now verified!
                  </span>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Other users will see a verification badge on your profile.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleComplete} className="flex-1">
                {verificationResult.verified ? 'Done' : 'Try Again'}
              </Button>
              {!verificationResult.verified && (
                <Button variant="ghost" onClick={handleClose}>
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