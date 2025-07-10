export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          points: number
          title: string
          type: Database["public"]["Enums"]["achievement_type"]
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          points?: number
          title: string
          type: Database["public"]["Enums"]["achievement_type"]
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          points?: number
          title?: string
          type?: Database["public"]["Enums"]["achievement_type"]
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          description: string
          ends_at: string
          id: string
          points_reward: number
          starts_at: string
          status: Database["public"]["Enums"]["challenge_status"]
          target_count: number
          title: string
          type: Database["public"]["Enums"]["challenge_type"]
        }
        Insert: {
          created_at?: string
          description: string
          ends_at: string
          id?: string
          points_reward?: number
          starts_at: string
          status?: Database["public"]["Enums"]["challenge_status"]
          target_count: number
          title: string
          type: Database["public"]["Enums"]["challenge_type"]
        }
        Update: {
          created_at?: string
          description?: string
          ends_at?: string
          id?: string
          points_reward?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          target_count?: number
          title?: string
          type?: Database["public"]["Enums"]["challenge_type"]
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          created_at: string
          id: string
          question: string
          response: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question: string
          response: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question?: string
          response?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chatbot_feedback: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_helpful: boolean
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_helpful: boolean
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_helpful?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_usage: {
        Row: {
          created_at: string
          date: string
          id: string
          questions_used: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          questions_used?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          questions_used?: number
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_1_id: string
          participant_2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_1_id: string
          participant_2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          feedback_type: string
          id: string
          message: string
          page_context: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_type?: string
          id?: string
          message: string
          page_context?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_type?: string
          id?: string
          message?: string
          page_context?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flash_run_participants: {
        Row: {
          flash_run_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          flash_run_id: string
          id?: string
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          flash_run_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flash_run_participants_flash_run_id_fkey"
            columns: ["flash_run_id"]
            isOneToOne: false
            referencedRelation: "flash_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_runs: {
        Row: {
          average_speed: string | null
          created_at: string
          creator_id: string
          distance: string
          expires_at: string
          id: string
          max_participants: number
          meeting_coordinates: Json | null
          meeting_spot: string
          pace: string
          route_type: string | null
          sport_type: string
          start_time: string
          status: string
          title: string
        }
        Insert: {
          average_speed?: string | null
          created_at?: string
          creator_id: string
          distance: string
          expires_at: string
          id?: string
          max_participants?: number
          meeting_coordinates?: Json | null
          meeting_spot: string
          pace: string
          route_type?: string | null
          sport_type?: string
          start_time?: string
          status?: string
          title: string
        }
        Update: {
          average_speed?: string | null
          created_at?: string
          creator_id?: string
          distance?: string
          expires_at?: string
          id?: string
          max_participants?: number
          meeting_coordinates?: Json | null
          meeting_spot?: string
          pace?: string
          route_type?: string | null
          sport_type?: string
          start_time?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      meetup_requests: {
        Row: {
          activity_type: string
          conversation_id: string
          created_at: string
          id: string
          location: string
          notes: string | null
          proposed_date: string
          requester_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          activity_type: string
          conversation_id: string
          created_at?: string
          id?: string
          location: string
          notes?: string | null
          proposed_date: string
          requester_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          activity_type?: string
          conversation_id?: string
          created_at?: string
          id?: string
          location?: string
          notes?: string | null
          proposed_date?: string
          requester_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetup_requests_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      page_analytics: {
        Row: {
          id: string
          page_path: string
          session_id: string | null
          user_id: string | null
          visited_at: string
        }
        Insert: {
          id?: string
          page_path: string
          session_id?: string | null
          user_id?: string | null
          visited_at?: string
        }
        Update: {
          id?: string
          page_path?: string
          session_id?: string | null
          user_id?: string | null
          visited_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          availability: Json | null
          bio: string | null
          city: string | null
          created_at: string
          email: string | null
          experience_level: string | null
          fitness_details: Json | null
          fitness_goals: string[] | null
          full_name: string | null
          gender_preference: string | null
          id: string
          last_active_at: string | null
          location_visible: boolean | null
          pace_metrics: Json | null
          profile_picture_url: string | null
          region: string | null
          sports: string[] | null
          total_points: number | null
          training_goals: string[] | null
          trust_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          availability?: Json | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          fitness_details?: Json | null
          fitness_goals?: string[] | null
          full_name?: string | null
          gender_preference?: string | null
          id?: string
          last_active_at?: string | null
          location_visible?: boolean | null
          pace_metrics?: Json | null
          profile_picture_url?: string | null
          region?: string | null
          sports?: string[] | null
          total_points?: number | null
          training_goals?: string[] | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          availability?: Json | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          fitness_details?: Json | null
          fitness_goals?: string[] | null
          full_name?: string | null
          gender_preference?: string | null
          id?: string
          last_active_at?: string | null
          location_visible?: boolean | null
          pace_metrics?: Json | null
          profile_picture_url?: string | null
          region?: string | null
          sports?: string[] | null
          total_points?: number | null
          training_goals?: string[] | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          action_taken: string | null
          details: string | null
          id: string
          reason: string
          reported_at: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          details?: string | null
          id?: string
          reason: string
          reported_at?: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          details?: string | null
          id?: string
          reason?: string
          reported_at?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_count: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_count?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_count?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_old_flash_runs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_or_create_conversation: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
    }
    Enums: {
      achievement_type:
        | "first_connection"
        | "social_butterfly"
        | "marathon_matcher"
        | "early_bird"
        | "consistent_connector"
        | "meetup_master"
        | "goal_achiever"
        | "community_builder"
      challenge_status: "active" | "completed" | "expired"
      challenge_type: "weekly" | "monthly" | "seasonal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_type: [
        "first_connection",
        "social_butterfly",
        "marathon_matcher",
        "early_bird",
        "consistent_connector",
        "meetup_master",
        "goal_achiever",
        "community_builder",
      ],
      challenge_status: ["active", "completed", "expired"],
      challenge_type: ["weekly", "monthly", "seasonal"],
    },
  },
} as const
