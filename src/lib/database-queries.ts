// Optimized database query utilities for better performance

import { supabase } from '@/integrations/supabase/client';

// Define minimal field sets for different use cases
export const PROFILE_FIELDS = {
  // For profile cards in browse view
  browse: 'id,user_id,full_name,bio,profile_picture_url,sports,experience_level,city,region,created_at',
  
  // For user's own profile
  own: '*',
  
  // For chat/messaging contexts
  minimal: 'id,user_id,full_name,profile_picture_url',
  
  // For matching algorithm
  matching: 'id,user_id,full_name,sports,experience_level,city,region,age_range_min,age_range_max,gender_preference,pace_metrics,fitness_goals',
  
  // For search results
  search: 'id,user_id,full_name,profile_picture_url,sports,experience_level,city,region'
} as const;

export type ProfileFieldSet = keyof typeof PROFILE_FIELDS;

// Optimized profile queries
export const profileQueries = {
  // Get current user's profile
  async getCurrentProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_FIELDS.own)
      .eq('user_id', userId)
      .maybeSingle();
    
    return { data, error };
  },

  // Get profiles for browse page with pagination and field limiting
  async getBrowseProfiles(options: {
    currentUserId: string;
    limit?: number;
    offset?: number;
    sports?: string[];
    city?: string;
    experience?: string;
  }) {
    const { currentUserId, limit = 10, offset = 0, sports, city, experience } = options;
    
    let query = supabase
      .from('profiles')
      .select(PROFILE_FIELDS.browse, { count: 'exact' })
      .neq('user_id', currentUserId)
      .eq('location_visible', true)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (sports && sports.length > 0) {
      query = query.overlaps('sports', sports);
    }
    
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    
    if (experience) {
      query = query.eq('experience_level', experience);
    }

    const { data, error, count } = await query;
    
    return { data, error, count };
  },

  // Get minimal profile data for chat
  async getMinimalProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_FIELDS.minimal)
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  },

  // Search profiles with optimized fields
  async searchProfiles(searchTerm: string, currentUserId: string, limit = 10) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_FIELDS.search)
      .neq('user_id', currentUserId)
      .eq('location_visible', true)
      .or(`full_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,sports.cs.{${searchTerm}}`)
      .limit(limit);
    
    return { data, error };
  }
};

// Optimized conversation queries
export const conversationQueries = {
  // Get conversations with minimal message data
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        updated_at,
        user1_id,
        user2_id,
        last_message_content,
        last_message_at,
        user1_profile:user1_id(${PROFILE_FIELDS.minimal}),
        user2_profile:user2_id(${PROFILE_FIELDS.minimal})
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    return { data, error };
  },

  // Get messages with pagination
  async getMessages(conversationId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('messages')
      .select('id,content,sender_id,created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error };
  }
};

// Batch query utilities
export const batchQueries = {
  // Get multiple profiles by IDs efficiently
  async getProfilesByIds(userIds: string[], fieldSet: ProfileFieldSet = 'minimal') {
    if (userIds.length === 0) return { data: [], error: null };
    
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_FIELDS[fieldSet])
      .in('user_id', userIds);

    return { data, error };
  }
};

// Memoization utility for repeated queries
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function memoizeQuery<T>(
  key: string, 
  queryFn: () => Promise<T>, 
  ttlMs = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  const cached = queryCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return Promise.resolve(cached.data);
  }
  
  return queryFn().then(data => {
    queryCache.set(key, { data, timestamp: now, ttl: ttlMs });
    return data;
  });
}

// Clear cache utility
export function clearQueryCache(pattern?: string) {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of queryCache.keys()) {
      if (regex.test(key)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
}