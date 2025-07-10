export interface SelfieVerificationResult {
  success: boolean;
  verified: boolean;
  message: string;
  error?: string;
}

export interface TruepicResponse {
  authenticity_score: number;
  face_detection: {
    faces: Array<{
      confidence: number;
      bounding_box: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
  };
  metadata: {
    image_format: string;
    image_size: number;
    processing_time: number;
  };
}