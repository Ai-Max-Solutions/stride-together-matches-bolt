import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, X } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SelfieCameraProps {
  onCapture: (imageFile: File) => void;
  onCancel: () => void;
}

export function SelfieCamera({ onCapture, onCancel }: SelfieCameraProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please check permissions and try again.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    startCamera();
  }, [capturedImage, startCamera]);

  const confirmPhoto = useCallback(() => {
    if (!capturedImage) return;

    // Convert the captured image to a File object
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        onCapture(file);
        URL.revokeObjectURL(capturedImage);
      });
  }, [capturedImage, onCapture]);

  // Start camera on component mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-600" />
          Take a Selfie
        </DialogTitle>
        <DialogDescription>
          Position your face in the circle and take a clear photo. Make sure you're in good lighting.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          {cameraError ? (
            <div className="aspect-[4/3] flex items-center justify-center text-white text-center p-4">
              <div>
                <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">{cameraError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={startCamera}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="aspect-[4/3] relative">
              <img 
                src={capturedImage} 
                alt="Captured selfie" 
                className="w-full h-full object-cover"
              />
              {/* Face guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/50 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/3] relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Face guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/70 rounded-full"></div>
              </div>
              {/* Instructions overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-sm bg-black/50 rounded px-2 py-1">
                  Center your face in the circle
                </p>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-2">
          {capturedImage ? (
            <>
              <Button onClick={confirmPhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Use This Photo
              </Button>
              <Button variant="outline" onClick={retakePhoto}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={capturePhoto} 
                disabled={!stream || cameraError !== null}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button variant="ghost" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Your selfie will not be stored after verification
        </p>
      </div>
    </>
  );
}