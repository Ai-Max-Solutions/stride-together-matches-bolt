import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!openAIApiKey || !supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

// Check daily usage limit (8 questions per day)
async function checkDailyUsage(userId: string): Promise<{ canUse: boolean; questionsUsed: number }> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('chatbot_usage')
    .select('questions_used')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking usage:', error);
    return { canUse: true, questionsUsed: 0 };
  }

  const questionsUsed = data?.questions_used || 0;
  return { canUse: questionsUsed < 8, questionsUsed };
}

// Update daily usage
async function updateDailyUsage(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('chatbot_usage')
    .upsert({
      user_id: userId,
      date: today,
      questions_used: 1
    }, {
      onConflict: 'user_id,date',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Error updating usage:', error);
  }
}

// Get user profile data for personalization
async function getUserProfile(userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      sports,
      experience_level,
      fitness_goals,
      training_goals,
      availability,
      city,
      region,
      age_range_min,
      age_range_max,
      fitness_details,
      full_name
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
}

// Get potential match compatibility for meetup suggestions
async function getMatchCompatibility(userId: string, question: string) {
  // Check if question is about meeting someone or timing
  const isMeetupQuestion = question.toLowerCase().includes('meet') || 
                          question.toLowerCase().includes('time') ||
                          question.toLowerCase().includes('available') ||
                          question.toLowerCase().includes('schedule') ||
                          question.toLowerCase().includes('partner') ||
                          question.toLowerCase().includes('buddy');

  if (!isMeetupQuestion) return null;

  // Get user's availability and sports
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('availability, sports, city, region')
    .eq('user_id', userId)
    .single();

  if (!userProfile) return null;

  // Find potential matches in same area with overlapping sports
  const { data: potentialMatches } = await supabase
    .from('profiles')
    .select('sports, availability, city, region, full_name')
    .neq('user_id', userId)
    .eq('city', userProfile.city)
    .limit(5);

  return {
    userAvailability: userProfile.availability,
    userSports: userProfile.sports,
    potentialMatches: potentialMatches || []
  };
}

function createPersonalizedPrompt(profile: any, question: string, matchData: any = null) {
  let prompt = `You are Stride AI, a highly intelligent and personalized fitness assistant. You're helping ${profile?.full_name || 'a user'}.

USER PROFILE:
- Sports: ${profile?.sports?.join(', ') || 'Not specified'}
- Experience Level: ${profile?.experience_level || 'Not specified'}
- Fitness Goals: ${profile?.fitness_goals?.join(', ') || 'Not specified'}
- Training Goals: ${profile?.training_goals?.join(', ') || 'Not specified'}
- Location: ${profile?.city || 'Not specified'}${profile?.region ? `, ${profile.region}` : ''}
- Age Range: ${profile?.age_range_min || 18}-${profile?.age_range_max || 65}

`;

  // Add workout-specific intelligence
  if (question.toLowerCase().includes('workout') || question.toLowerCase().includes('exercise') || question.toLowerCase().includes('training')) {
    if (profile?.sports && profile.sports.length > 1) {
      prompt += `WORKOUT INTELLIGENCE: The user practices multiple sports (${profile.sports.join(', ')}). Ask which specific sport they want workout ideas for, then provide highly targeted exercises, training routines, and progressions for that sport based on their ${profile?.experience_level || 'current'} level.\n\n`;
    } else if (profile?.sports && profile.sports.length === 1) {
      prompt += `WORKOUT INTELLIGENCE: Focus exclusively on ${profile.sports[0]} specific workouts. Provide detailed training routines, technique tips, and progression plans tailored to their ${profile?.experience_level || 'current'} level. Include sport-specific warm-ups, main exercises, and recovery.\n\n`;
    } else {
      prompt += `WORKOUT INTELLIGENCE: User hasn't specified sports yet. Ask what sport they're interested in, then provide comprehensive workout plans.\n\n`;
    }
  }

  // Add meetup/timing intelligence
  if (matchData) {
    prompt += `MEETUP INTELLIGENCE:
The user is asking about meeting times or finding workout partners. 

User's Availability: ${JSON.stringify(matchData.userAvailability)}
User's Sports: ${matchData.userSports?.join(', ') || 'None specified'}

COMPATIBILITY ANALYSIS from users in ${profile?.city}:
`;
    
    const compatibleMatches = matchData.potentialMatches.filter((match: any) => {
      const commonSports = profile?.sports?.filter((sport: string) => 
        match.sports?.includes(sport)
      ) || [];
      return commonSports.length > 0;
    });

    if (compatibleMatches.length > 0) {
      compatibleMatches.forEach((match: any, index: number) => {
        const commonSports = profile?.sports?.filter((sport: string) => 
          match.sports?.includes(sport)
        ) || [];
        prompt += `- Match ${index + 1}: Shares ${commonSports.join(', ')}, Availability: ${JSON.stringify(match.availability)}\n`;
      });
      
      prompt += `\nPROVIDE INTELLIGENT SUGGESTIONS: Analyze the availability patterns and suggest specific days/times that work for both the user and potential matches. Be specific about timing and mention the shared sports interests.\n\n`;
    } else {
      prompt += `No compatible matches found in the area yet. Suggest general optimal workout times and encourage the user to be flexible with their schedule to increase matching opportunities.\n\n`;
    }
  }

  prompt += `USER QUESTION: ${question}

INSTRUCTIONS:
- Be highly intelligent and contextual - use ALL the profile information
- If asking about workouts, be sport-specific and experience-level appropriate
- If asking about timing/partners, provide intelligent compatibility insights
- Keep responses conversational but information-rich
- Maximum 200 words
- Always be encouraging and motivational
- Use their name when appropriate`;

  return prompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, sessionId } = await req.json();
    
    // Get user from request headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid user token');
    }

    // Check daily usage limit
    const { canUse, questionsUsed } = await checkDailyUsage(user.id);
    if (!canUse) {
      return new Response(JSON.stringify({ 
        response: `Hi there! You've reached your daily limit of 8 AI questions. You've used ${questionsUsed}/8 questions today. Come back tomorrow for more personalized assistance! 🏃‍♂️`,
        isLimitReached: true,
        questionsUsed,
        questionsRemaining: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile for personalization
    const profile = await getUserProfile(user.id);
    
    // Get match compatibility data if relevant
    const matchData = await getMatchCompatibility(user.id, question);

    // Create highly personalized prompt
    const systemPrompt = createPersonalizedPrompt(profile, question, matchData);

    console.log('Intelligent prompt created for user:', user.id);

    // Call OpenAI with personalized context
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 350,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Update daily usage
    await updateDailyUsage(user.id);

    // Store conversation
    await supabase.from('chatbot_conversations').insert({
      user_id: user.id,
      session_id: sessionId,
      question: question,
      response: aiResponse,
    });

    // Get updated usage count
    const { questionsUsed: newCount } = await checkDailyUsage(user.id);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      questionsRemaining: 8 - newCount,
      questionsUsed: newCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stride-chatbot function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});