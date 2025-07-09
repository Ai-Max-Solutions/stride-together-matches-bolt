import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Stride Together's friendly, encouraging running buddy and coach. You help users with questions about using the app, basic workout advice, and safety tips.

WHAT YOU CAN HELP WITH:
- How to use the Stride Together app (profiles, matching, messaging, safety features)
- Basic running and fitness tips (warm-ups, pacing, beginner advice)
- Safety reminders for meeting workout partners
- General motivation and encouragement

WHAT YOU CANNOT DO:
- Give medical advice, diagnose injuries, or recommend treatments
- Provide legal advice
- Share personal information about other users
- Make guarantees about fitness results

GUIDELINES:
- Keep responses short, friendly, and encouraging
- Always prioritize safety when discussing meetups
- If asked about medical or legal topics, politely redirect to professionals
- Stay positive and supportive while being realistic
- Focus on the Stride Together community and safe fitness practices

If you're unsure about something, say: "I'm not sure about that — please check with a professional!"`;

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

    const { question, sessionId } = await req.json();

    if (!question || question.trim().length === 0) {
      throw new Error('Question is required');
    }

    console.log('Chatbot request from user:', user.id, 'Question:', question);

    // Check daily usage limit (5 questions per day)
    const today = new Date().toISOString().split('T')[0];
    
    const { data: usage, error: usageError } = await supabase
      .from('chatbot_usage')
      .select('questions_used')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error checking usage:', usageError);
      throw new Error('Error checking usage limits');
    }

    const questionsUsed = usage?.questions_used || 0;
    if (questionsUsed >= 5) {
      return new Response(JSON.stringify({ 
        error: 'Daily limit reached',
        message: 'You have reached your daily limit of 5 questions. Please try again tomorrow.',
        questionsRemaining: 0
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 200, // Keep responses concise
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    // Store conversation in database
    const { data: conversation, error: conversationError } = await supabase
      .from('chatbot_conversations')
      .insert({
        user_id: user.id,
        question: question.trim(),
        response: botResponse,
        session_id: sessionId
      })
      .select()
      .single();

    if (conversationError) {
      console.error('Error storing conversation:', conversationError);
      throw new Error('Error storing conversation');
    }

    // Update usage count
    const { error: upsertError } = await supabase
      .from('chatbot_usage')
      .upsert({
        user_id: user.id,
        date: today,
        questions_used: questionsUsed + 1
      }, {
        onConflict: 'user_id,date'
      });

    if (upsertError) {
      console.error('Error updating usage:', upsertError);
    }

    const questionsRemaining = 5 - (questionsUsed + 1);

    return new Response(JSON.stringify({ 
      response: botResponse,
      conversationId: conversation.id,
      questionsRemaining
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stride-chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Sorry, I encountered an error. Please try again.' 
    }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});