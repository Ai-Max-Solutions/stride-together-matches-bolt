import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation and sanitization
function validateImageInput(imageFile: File): { valid: boolean; error?: string } {
  const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 5 * 1024 * 1024; // Reduced to 5MB for security
  const minSize = 1000; // Minimum 1KB
  
  if (!validFormats.includes(imageFile.type)) {
    return { valid: false, error: 'Invalid image format. Please use JPEG or PNG.' };
  }
  
  if (imageFile.size > maxSize) {
    return { valid: false, error: 'Image too large. Please use an image smaller than 5MB.' };
  }
  
  if (imageFile.size < minSize) {
    return { valid: false, error: 'Image too small. Please provide a valid selfie.' };
  }
  
  return { valid: true };
}

Deno.serve(async (req) => {
  console.log('Selfie verification request received');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Initialize Supabase client with enhanced validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Service configuration error');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Enhanced auth header validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token || token.length < 10) {
      throw new Error('Invalid token format');
    }

    // Verify user with enhanced error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Authentication failed');
    }

    console.log('Processing selfie verification for user:', user.id);

    // Get the uploaded image from form data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      throw new Error('No image file provided');
    }

    // Enhanced input validation
    const validation = validateImageInput(imageFile);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Convert image to base64 with error handling
    let base64Image: string;
    try {
      const imageBytes = await imageFile.arrayBuffer();
      base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }

    console.log('Starting content moderation and face detection...');
    
    // Check for NSFW content using OpenAI Vision API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // SECURITY FIX: Fail securely if no API key
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured - failing verification for security');
      throw new Error('Verification service not available');
    }

    let contentSafe = false; // SECURITY FIX: Default to false (fail-secure)
    let moderationResult = '';

    try {
      const moderationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a strict content moderator for selfie verification. You must reject any inappropriate content, non-human faces, or unclear images. Respond with ONLY "SAFE" for appropriate selfies showing a clear human face, or "UNSAFE" for anything else. Be extremely strict about safety.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image for selfie verification. Requirements: clear human face, appropriate content, good quality. Respond ONLY with "SAFE" or "UNSAFE".'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageFile.type};base64,${base64Image}`,
                    detail: 'low'
                  }
                }
              ]
            }
          ],
          max_tokens: 10,
          temperature: 0 // Consistent responses
        }),
      });

      if (!moderationResponse.ok) {
        console.error('OpenAI API error:', moderationResponse.status);
        throw new Error('Content moderation failed');
      }

      const moderationData = await moderationResponse.json();
      moderationResult = moderationData.choices?.[0]?.message?.content?.trim().toLowerCase() || '';
      
      // SECURITY FIX: Only approve if explicitly marked as safe
      contentSafe = moderationResult === 'safe';
      
      console.log('Content moderation result:', { result: moderationResult, contentSafe });
      
    } catch (moderationError) {
      console.error('Content moderation error:', moderationError);
      // SECURITY FIX: Fail securely on moderation errors
      throw new Error('Content verification failed');
    }

    // SECURITY FIX: Stricter validation
    if (!contentSafe) {
      throw new Error('Image rejected: Please upload a clear, appropriate selfie showing only your face.');
    }

    // Additional validation checks
    const imageSizeKB = imageFile.size / 1024;
    if (imageSizeKB < 10) {
      throw new Error('Image too small. Please take a clear selfie.');
    }

    const isVerified = contentSafe;

    console.log('Verification result:', { 
      contentSafe, 
      imageSizeKB,
      verified: isVerified 
    });

    // Update user profile with verification status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ selfie_verified: isVerified })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update verification status');
    }

    // Security logging for audit trail
    console.log(`Selfie verification completed for user ${user.id}: ${isVerified ? 'APPROVED' : 'REJECTED'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: isVerified,
        message: isVerified 
          ? 'Selfie verification successful! Your profile is now verified.'
          : 'Verification could not be completed. Please try again with a clear selfie.'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Selfie verification error:', error);
    
    // SECURITY FIX: Don't expose internal error details
    const safeMessage = error.message?.includes('Service configuration') || 
                       error.message?.includes('Authentication') ||
                       error.message?.includes('Invalid') ||
                       error.message?.includes('No image') ||
                       error.message?.includes('too large') ||
                       error.message?.includes('too small') ||
                       error.message?.includes('Invalid image format') ||
                       error.message?.includes('Method not allowed') ||
                       error.message?.includes('Image rejected') ||
                       error.message?.includes('Verification service not available')
                       ? error.message 
                       : 'Verification service temporarily unavailable';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: safeMessage,
        verified: false
      }),
      { 
        status: error.message?.includes('Authentication') ? 401 : 
               error.message?.includes('Method not allowed') ? 405 : 
               error.message?.includes('Image rejected') ? 400 : 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});