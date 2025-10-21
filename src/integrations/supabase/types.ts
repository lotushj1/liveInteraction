export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      event_participants: {
        Row: {
          event_id: string
          id: string
          joined_at: string | null
          nickname: string
          user_id: string | null
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string | null
          nickname: string
          user_id?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string | null
          nickname?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          current_mode: Database["public"]["Enums"]["event_mode"]
          current_poll_id: string | null
          current_quiz_id: string | null
          description: string | null
          ended_at: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          host_id: string
          id: string
          is_active: boolean | null
          join_code: string
          qna_enabled: boolean | null
          started_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_mode?: Database["public"]["Enums"]["event_mode"]
          current_poll_id?: string | null
          current_quiz_id?: string | null
          description?: string | null
          ended_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          host_id: string
          id?: string
          is_active?: boolean | null
          join_code: string
          qna_enabled?: boolean | null
          started_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_mode?: Database["public"]["Enums"]["event_mode"]
          current_poll_id?: string | null
          current_quiz_id?: string | null
          description?: string | null
          ended_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          host_id?: string
          id?: string
          is_active?: boolean | null
          join_code?: string
          qna_enabled?: boolean | null
          started_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_current_poll_id_fkey"
            columns: ["current_poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_current_quiz_id_fkey"
            columns: ["current_quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_responses: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          poll_id: string
          response: Json
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          poll_id: string
          response: Json
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          poll_id?: string
          response?: Json
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          closed_at: string | null
          created_at: string
          event_id: string
          id: string
          is_active: boolean
          is_closed: boolean
          max_selections: number | null
          options: Json | null
          poll_type: Database["public"]["Enums"]["poll_type"]
          title: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          is_active?: boolean
          is_closed?: boolean
          max_selections?: number | null
          options?: Json | null
          poll_type: Database["public"]["Enums"]["poll_type"]
          title: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          is_active?: boolean
          is_closed?: boolean
          max_selections?: number | null
          options?: Json | null
          poll_type?: Database["public"]["Enums"]["poll_type"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      question_upvotes: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_upvotes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_upvotes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answered_at: string | null
          content: string
          created_at: string
          event_id: string
          id: string
          is_highlighted: boolean
          participant_id: string | null
          status: Database["public"]["Enums"]["question_status"]
          upvote_count: number
        }
        Insert: {
          answered_at?: string | null
          content: string
          created_at?: string
          event_id: string
          id?: string
          is_highlighted?: boolean
          participant_id?: string | null
          status?: Database["public"]["Enums"]["question_status"]
          upvote_count?: number
        }
        Update: {
          answered_at?: string | null
          content?: string
          created_at?: string
          event_id?: string
          id?: string
          is_highlighted?: boolean
          participant_id?: string | null
          status?: Database["public"]["Enums"]["question_status"]
          upvote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: string
          options: Json
          points: number
          question_order: number
          question_text: string
          quiz_id: string
          time_limit: number
        }
        Insert: {
          created_at?: string
          id?: string
          options: Json
          points?: number
          question_order: number
          question_text: string
          quiz_id: string
          time_limit?: number
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json
          points?: number
          question_order?: number
          question_text?: string
          quiz_id?: string
          time_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          participant_id: string
          points_earned: number
          quiz_question_id: string
          response_time: number
          selected_option: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          participant_id: string
          points_earned?: number
          quiz_question_id: string
          response_time: number
          selected_option: number
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          participant_id?: string
          points_earned?: number
          quiz_question_id?: string
          response_time?: number
          selected_option?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_quiz_question_id_fkey"
            columns: ["quiz_question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          current_question_index: number
          event_id: string
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          created_at?: string
          current_question_index?: number
          event_id: string
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          created_at?: string
          current_question_index?: number
          event_id?: string
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_join_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_event_host: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      is_event_participant: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "host" | "participant"
      event_mode: "lobby" | "quiz" | "qna" | "poll"
      event_type: "qna" | "quiz"
      poll_type: "single_choice" | "multiple_choice" | "word_cloud" | "rating"
      question_status: "pending" | "approved" | "rejected" | "answered"
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
      app_role: ["host", "participant"],
      event_mode: ["lobby", "quiz", "qna", "poll"],
      event_type: ["qna", "quiz"],
      poll_type: ["single_choice", "multiple_choice", "word_cloud", "rating"],
      question_status: ["pending", "approved", "rejected", "answered"],
    },
  },
} as const
