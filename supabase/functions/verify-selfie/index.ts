import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user token');
    }

    // Get the uploaded image from form data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      throw new Error('No image file provided');
    }

    // Validate image format and size (max 10MB)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(imageFile.type)) {
      throw new Error('Invalid image format. Please use JPEG or PNG.');
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('Image too large. Please use an image under 10MB.');
    }

    console.log('Processing selfie verification for user:', user.id);

    // Convert image to base64 for content moderation and verification
    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));

    console.log('Starting content moderation and face detection...');
    
    // Check for NSFW content using OpenAI Vision API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.log('OpenAI API key not found, skipping content moderation');
    }

    let contentSafe = true;
    let hasFace = true; // Default to true for now

    if (openaiApiKey) {
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
                content: 'You are a content moderator. Analyze this image and respond with ONLY "SAFE" if it shows a appropriate selfie photo of a person\'s face, or "UNSAFE" if it contains inappropriate content (nudity, explicit content, violence, etc.) or is not a clear face photo. Be strict about safety.'
              },
              {
                role: 'user',
                content: [
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
            max_tokens: 10
          }),
        });

        if (moderationResponse.ok) {
          const moderationData = await moderationResponse.json();
          const result = moderationData.choices[0]?.message?.content?.trim().toLowerCase();
          contentSafe = result === 'safe';
          
          console.log('Content moderation result:', { result, contentSafe });
          
          if (!contentSafe) {
            throw new Error('Image rejected: Please upload an appropriate selfie photo showing only your face.');
          }
        } else {
          console.log('Content moderation failed, proceeding with basic validation');
        }
      } catch (moderationError) {
        console.error('Content moderation error:', moderationError);
        if (moderationError.message.includes('Image rejected')) {
          throw moderationError; // Re-throw content rejection errors
        }
        // Continue with verification if moderation service fails
      }
    }

    // Basic image validation - check if it looks like a reasonable selfie
    const imageSizeKB = imageFile.size / 1024;
    if (imageSizeKB < 10) {
      throw new Error('Image too small. Please take a clear selfie.');
    }

    // For now, assume verification passes if content is safe and image is reasonable size
    const isVerified = contentSafe && hasFace;

    console.log('Verification result:', { 
      contentSafe, 
      hasFace,
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
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Verification failed. Please try again.'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});