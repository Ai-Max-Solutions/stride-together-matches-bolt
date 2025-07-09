import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseImageUploadOptions {
  bucket: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  compressionQuality?: number;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
}

export function useImageUpload({
  bucket,
  maxSizeBytes = 2 * 1024 * 1024, // 2MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  compressionQuality = 0.8
}: UseImageUploadOptions) {
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    url: null
  });

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type not supported. Please use: ${allowedTypes.join(', ')}`;
    }
    
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size: ${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB`;
    }
    
    return null;
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1024px)
        const maxSize = 1024;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          compressionQuality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File, fileName: string): Promise<string> => {
    setUploadState(prev => ({ ...prev, uploading: true, progress: 0, error: null }));

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Compress image
      const compressedFile = await compressImage(file);
      
      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressedFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        progress: 100, 
        url: data.publicUrl 
      }));

      toast({
        title: "Upload successful!",
        description: "Your image has been uploaded.",
      });

      return data.publicUrl;
    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        error: errorMessage 
      }));
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const reset = () => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      url: null
    });
  };

  return {
    uploadFile,
    ...uploadState,
    reset
  };
}