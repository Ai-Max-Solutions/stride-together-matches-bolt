import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { conversationId, isHelpful } = await req.json();

    if (!conversationId || typeof isHelpful !== 'boolean') {
      throw new Error('conversationId and isHelpful are required');
    }

    console.log('Chatbot feedback from user:', user.id, 'Conversation:', conversationId, 'Helpful:', isHelpful);

    // Check if conversation belongs to user
    const { data: conversation, error: conversationError } = await supabase
      .from('chatbot_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (conversationError || !conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    // Upsert feedback (allow users to change their feedback)
    const { error: feedbackError } = await supabase
      .from('chatbot_feedback')
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        is_helpful: isHelpful
      }, {
        onConflict: 'conversation_id,user_id'
      });

    if (feedbackError) {
      console.error('Error storing feedback:', feedbackError);
      throw new Error('Error storing feedback');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Feedback recorded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-feedback function:', error);
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});