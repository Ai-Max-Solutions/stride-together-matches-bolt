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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { type, conversationId, message, userProfile, otherUserProfile } = await req.json();

    console.log('Chat assistant request:', { type, conversationId, userProfile: userProfile?.full_name });

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'safety_check':
        systemPrompt = `You are a safety moderator for a fitness buddy app. Your job is to:
1. Check if messages contain inappropriate content, harassment, or safety concerns
2. Flag potential red flags for unsafe meetup requests
3. Be sensitive to context - fitness discussions are normal
4. Return ONLY a JSON response with: {"safe": boolean, "reason": string, "action": "none"|"warn"|"block"}`;
        
        userPrompt = `Please check this message for safety: "${message}"`;
        break;

      // New suggestion types for useAdvancedAI hook
      case 'smart_workout_suggestion':
        systemPrompt = `You are a helpful fitness assistant. Generate a concise workout suggestion (max 2 lines) based on user profiles.
User 1: ${userProfile?.full_name} - Sports: ${userProfile?.sports?.join(', ')} - Level: ${userProfile?.experience_level}
User 2: ${otherUserProfile?.full_name} - Sports: ${otherUserProfile?.sports?.join(', ')} - Level: ${otherUserProfile?.experience_level}
Location: ${userProfile?.city}, ${userProfile?.region}

Return a JSON response with: {"activity": string, "duration": string, "details": string}
Keep details under 2 sentences for chat use.`;
        
        userPrompt = `Suggest a specific workout for these two fitness buddies.`;
        break;

      case 'optimal_meeting_times':
        systemPrompt = `You are a scheduling assistant. Analyze user availability and suggest optimal meeting times.
Return a JSON response with: {"recommended_times": [{"day": string, "time": string, "confidence": number, "reason": string}], "ai_analysis": string}
Keep ai_analysis under 2 sentences for chat use.`;
        
        userPrompt = `Based on the shared availability data, suggest the best meeting times for these fitness buddies.`;
        break;

      case 'contextual_icebreaker':
        const sharedSports = userProfile?.sports?.filter(sport => 
          otherUserProfile?.sports?.includes(sport)
        ) || [];
        
        systemPrompt = `You are creating ice breaker suggestions for a fitness app. Create 2-3 short, specific conversation starters (max 1 sentence each).
${sharedSports.length > 0 ? `Shared sports: ${sharedSports.join(', ')}` : 'No shared sports'}
Both users' experience levels: ${userProfile?.experience_level} and ${otherUserProfile?.experience_level}
Location context: ${userProfile?.city === otherUserProfile?.city ? 'Same city' : 'Different cities'}

Return a JSON array of strings: ["message1", "message2", "message3"]`;
        
        userPrompt = `Create ice breaker messages that help these fitness buddies start a conversation.`;
        break;

      case 'safety_recommendations':
        systemPrompt = `You are a safety assistant for a fitness app. Provide concise safety tips for meetups.
Return a JSON response with: {"location_tips": ["tip1", "tip2"], "timing_recommendations": ["tip1", "tip2"], "general_safety": ["tip1"], "ai_details": string}
Keep each tip under 10 words and ai_details under 2 sentences.`;
        
        userPrompt = `Provide safety recommendations for ${userProfile?.full_name} and ${otherUserProfile?.full_name} meeting for fitness activities.`;
        break;

      // Legacy cases for backward compatibility
      case 'workout_suggestion':
        systemPrompt = `You are a helpful fitness assistant for a workout buddy app. Generate practical workout suggestions based on user profiles.
User 1: ${userProfile?.full_name} - Sports: ${userProfile?.sports?.join(', ')} - Level: ${userProfile?.experience_level}
User 2: ${otherUserProfile?.full_name} - Sports: ${otherUserProfile?.sports?.join(', ')} - Level: ${otherUserProfile?.experience_level}
Location: ${userProfile?.city}, ${userProfile?.region}

Provide helpful, specific workout suggestions. Keep responses concise and actionable.`;
        
        userPrompt = `Suggest a great workout for these two fitness buddies to do together.`;
        break;

      case 'meetup_planning':
        systemPrompt = `You are a helpful assistant for planning fitness meetups. Create structured, safe meetup suggestions.
Always recommend public locations and include safety tips.
Keep suggestions practical and consider both users' preferences.`;
        
        userPrompt = `Help plan a fitness meetup between ${userProfile?.full_name} and ${otherUserProfile?.full_name}. 
Their conversation context: "${message}"`;
        break;

      case 'message_suggestion':
        systemPrompt = `You are a helpful conversation assistant for a fitness app. Suggest friendly, appropriate responses that help users connect and plan workouts together. 
Keep suggestions natural, encouraging, and focused on fitness activities.`;
        
        userPrompt = `The user received this message: "${message}". Suggest 2-3 brief, friendly response options.`;
        break;

      case 'conversation_starter':
        systemPrompt = `You are a conversation assistant for a fitness buddy app. Generate personalized conversation starters based on user profiles.
Focus on shared interests, compatible experience levels, and local activities. Be friendly, specific, and actionable.
User 1: ${userProfile?.full_name} - Sports: ${userProfile?.sports?.join(', ')} - Level: ${userProfile?.experience_level} - Location: ${userProfile?.city}, ${userProfile?.region}
User 2: ${otherUserProfile?.full_name} - Sports: ${otherUserProfile?.sports?.join(', ')} - Level: ${otherUserProfile?.experience_level} - Location: ${otherUserProfile?.city}, ${otherUserProfile?.region}`;
        
        userPrompt = `Generate 3 personalized conversation starters for these two fitness buddies to help them connect.`;
        break;

      case 'ice_breaker':
        const legacySharedSports = userProfile?.sports?.filter(sport => 
          otherUserProfile?.sports?.includes(sport)
        ) || [];
        
        systemPrompt = `You are creating ice breaker suggestions for a fitness app. Create friendly, specific conversation starters.
${legacySharedSports.length > 0 ? `Shared sports: ${legacySharedSports.join(', ')}` : 'No shared sports'}
Both users' experience levels: ${userProfile?.experience_level} and ${otherUserProfile?.experience_level}
Location context: ${userProfile?.city === otherUserProfile?.city ? 'Same city' : 'Different cities'}`;
        
        userPrompt = `Create 2-3 ice breaker messages that help these fitness buddies start a conversation.`;
        break;

      default:
        throw new Error('Invalid request type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response received');

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const aiResponse = data.choices[0].message.content;

    // Handle different response formats based on type
    if (type === 'safety_check') {
      try {
        const safetyResult = JSON.parse(aiResponse);
        return new Response(JSON.stringify(safetyResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        // Fallback if JSON parsing fails
        return new Response(JSON.stringify({
          safe: true,
          reason: 'Could not parse safety check',
          action: 'none'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // For structured suggestion types, try to parse JSON
    if (['smart_workout_suggestion', 'optimal_meeting_times', 'contextual_icebreaker', 'safety_recommendations'].includes(type)) {
      try {
        const structuredResponse = JSON.parse(aiResponse);
        return new Response(JSON.stringify({ 
          suggestion: structuredResponse,
          type 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        // Fallback to text response if JSON parsing fails
        return new Response(JSON.stringify({ 
          suggestion: aiResponse,
          type 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Sorry, I encountered an error. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});