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

    // Convert image to base64 for Truepic API
    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));

    // Call Truepic Vision API
    const truepicApiKey = Deno.env.get('TRUEPIC_API_KEY');
    if (!truepicApiKey) {
      throw new Error('Truepic API key not configured');
    }

    const truepicResponse = await fetch('https://api.truepic.com/v1/vision', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${truepicApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        format: imageFile.type.split('/')[1],
        options: {
          face_detection: true,
          authenticity_check: true
        }
      }),
    });

    if (!truepicResponse.ok) {
      const errorData = await truepicResponse.text();
      console.error('Truepic API error:', errorData);
      throw new Error('Verification service temporarily unavailable');
    }

    const truepicData = await truepicResponse.json();
    
    // Determine if verification passed
    // Truepic returns authenticity score and face detection results
    const isVerified = truepicData.authenticity_score >= 0.7 && 
                      truepicData.face_detection?.faces?.length > 0;

    console.log('Verification result:', { 
      score: truepicData.authenticity_score, 
      faces: truepicData.face_detection?.faces?.length,
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