export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          end_time: string | null
          id: string
          instructor: string | null
          room_location: string | null
          schedule_days: string[] | null
          section_number: string
          semester: string
          start_time: string | null
          updated_at: string
          year: number
        }
        Insert: {
          course_id: string
          created_at?: string
          end_time?: string | null
          id?: string
          instructor?: string | null
          room_location?: string | null
          schedule_days?: string[] | null
          section_number: string
          semester: string
          start_time?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          course_id?: string
          created_at?: string
          end_time?: string | null
          id?: string
          instructor?: string | null
          room_location?: string | null
          schedule_days?: string[] | null
          section_number?: string
          semester?: string
          start_time?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credits: number
          department: string | null
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credits?: number
          department?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credits?: number
          department?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          amenities: string[] | null
          building: string | null
          created_at: string
          description: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          id: string
          is_active: boolean
          name: string
          room_number: string | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          building?: string | null
          created_at?: string
          description?: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          id?: string
          is_active?: boolean
          name: string
          room_number?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          building?: string | null
          created_at?: string
          description?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          id?: string
          is_active?: boolean
          name?: string
          room_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      facility_bookings: {
        Row: {
          booking_date: string
          created_at: string
          end_time: string
          facility_id: string
          id: string
          purpose: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          end_time: string
          facility_id: string
          id?: string
          purpose?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          end_time?: string
          facility_id?: string
          id?: string
          purpose?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          parts: Json
          role: Database["public"]["Enums"]["message_role"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          parts?: Json
          role: Database["public"]["Enums"]["message_role"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          parts?: Json
          role?: Database["public"]["Enums"]["message_role"]
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
      profiles: {
        Row: {
          age_range: Database["public"]["Enums"]["age_range"] | null
          ai_tool_frequency:
            | Database["public"]["Enums"]["ai_tool_frequency"]
            | null
          created_at: string
          criteria_migration_notice_dismissed_at: string | null
          email: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_identity"] | null
          id: string
          migrated_from_simple_tasks_at: string | null
          programming_experience:
            | Database["public"]["Enums"]["programming_experience"]
            | null
          role: Database["public"]["Enums"]["user_role"]
          student_id: string | null
          study_protocol_version: Database["public"]["Enums"]["study_protocol_version"]
          technical_proficiency:
            | Database["public"]["Enums"]["technical_proficiency"]
            | null
          updated_at: string
        }
        Insert: {
          age_range?: Database["public"]["Enums"]["age_range"] | null
          ai_tool_frequency?:
            | Database["public"]["Enums"]["ai_tool_frequency"]
            | null
          created_at?: string
          criteria_migration_notice_dismissed_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          id: string
          migrated_from_simple_tasks_at?: string | null
          programming_experience?:
            | Database["public"]["Enums"]["programming_experience"]
            | null
          role?: Database["public"]["Enums"]["user_role"]
          student_id?: string | null
          study_protocol_version?: Database["public"]["Enums"]["study_protocol_version"]
          technical_proficiency?:
            | Database["public"]["Enums"]["technical_proficiency"]
            | null
          updated_at?: string
        }
        Update: {
          age_range?: Database["public"]["Enums"]["age_range"] | null
          ai_tool_frequency?:
            | Database["public"]["Enums"]["ai_tool_frequency"]
            | null
          created_at?: string
          criteria_migration_notice_dismissed_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          id?: string
          migrated_from_simple_tasks_at?: string | null
          programming_experience?:
            | Database["public"]["Enums"]["programming_experience"]
            | null
          role?: Database["public"]["Enums"]["user_role"]
          student_id?: string | null
          study_protocol_version?: Database["public"]["Enums"]["study_protocol_version"]
          technical_proficiency?:
            | Database["public"]["Enums"]["technical_proficiency"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      student_registrations: {
        Row: {
          created_at: string
          dropped_at: string | null
          id: string
          registered_at: string
          section_id: string
          status: Database["public"]["Enums"]["registration_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dropped_at?: string | null
          id?: string
          registered_at?: string
          section_id: string
          status?: Database["public"]["Enums"]["registration_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dropped_at?: string | null
          id?: string
          registered_at?: string
          section_id?: string
          status?: Database["public"]["Enums"]["registration_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_registrations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignment_sets: {
        Row: {
          created_at: string
          id: string
          set_label: string
          targets: Json
        }
        Insert: {
          created_at?: string
          id?: string
          set_label: string
          targets?: Json
        }
        Update: {
          created_at?: string
          id?: string
          set_label?: string
          targets?: Json
        }
        Relationships: []
      }
      task_definitions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          success_criteria: string | null
          system_type: Database["public"]["Enums"]["system_type"]
          task_code: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          success_criteria?: string | null
          system_type: Database["public"]["Enums"]["system_type"]
          task_code: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          success_criteria?: string | null
          system_type?: Database["public"]["Enums"]["system_type"]
          task_code?: string
          title?: string
        }
        Relationships: []
      }
      task_events: {
        Row: {
          created_at: string
          event_name: string
          event_type: Database["public"]["Enums"]["task_event_type"]
          id: string
          metadata: Json
          session_id: string
        }
        Insert: {
          created_at?: string
          event_name: string
          event_type: Database["public"]["Enums"]["task_event_type"]
          id?: string
          metadata?: Json
          session_id: string
        }
        Update: {
          created_at?: string
          event_name?: string
          event_type?: Database["public"]["Enums"]["task_event_type"]
          id?: string
          metadata?: Json
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "task_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      task_interview_questions: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          order_index: number
          question_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index: number
          question_text: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          question_text?: string
        }
        Relationships: []
      }
      task_interview_responses: {
        Row: {
          created_at: string
          id: string
          protocol_version: Database["public"]["Enums"]["study_protocol_version"]
          question_id: string
          response_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          protocol_version?: Database["public"]["Enums"]["study_protocol_version"]
          question_id: string
          response_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          protocol_version?: Database["public"]["Enums"]["study_protocol_version"]
          question_id?: string
          response_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_interview_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "task_interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_interview_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          protocol_version: Database["public"]["Enums"]["study_protocol_version"]
          session_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_progress_status"]
          success_payload: Json
          task_definition_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          protocol_version?: Database["public"]["Enums"]["study_protocol_version"]
          session_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_progress_status"]
          success_payload?: Json
          task_definition_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          protocol_version?: Database["public"]["Enums"]["study_protocol_version"]
          session_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_progress_status"]
          success_payload?: Json
          task_definition_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "task_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_progress_task_definition_id_fkey"
            columns: ["task_definition_id"]
            isOneToOne: false
            referencedRelation: "task_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      task_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_session_status"]
          system_type: Database["public"]["Enums"]["system_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_session_status"]
          system_type: Database["public"]["Enums"]["system_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_session_status"]
          system_type?: Database["public"]["Enums"]["system_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_survey_questions: {
        Row: {
          construct: Database["public"]["Enums"]["survey_construct"] | null
          created_at: string
          id: string
          max_value: number | null
          min_value: number | null
          order_index: number
          question_text: string
          scale_type: Database["public"]["Enums"]["survey_scale_type"]
          survey_id: string
        }
        Insert: {
          construct?: Database["public"]["Enums"]["survey_construct"] | null
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          order_index: number
          question_text: string
          scale_type: Database["public"]["Enums"]["survey_scale_type"]
          survey_id: string
        }
        Update: {
          construct?: Database["public"]["Enums"]["survey_construct"] | null
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          order_index?: number
          question_text?: string
          scale_type?: Database["public"]["Enums"]["survey_scale_type"]
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "task_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      task_survey_responses: {
        Row: {
          created_at: string
          id: string
          protocol_version: Database["public"]["Enums"]["study_protocol_version"]
          question_id: string
          response_text: string | null
          response_value: number | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          protocol_version?: Database["public"]["Enums"]["study_protocol_version"]
          question_id: string
          response_text?: string | null
          response_value?: number | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          protocol_version?: Database["public"]["Enums"]["study_protocol_version"]
          question_id?: string
          response_text?: string | null
          response_value?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "task_survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_survey_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "task_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      task_surveys: {
        Row: {
          created_at: string
          id: string
          survey_name: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          survey_name: string
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          survey_name?: string
          version?: string
        }
        Relationships: []
      }
      task_user_assignments: {
        Row: {
          assignment_set_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          assignment_set_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          assignment_set_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_user_assignments_assignment_set_id_fkey"
            columns: ["assignment_set_id"]
            isOneToOne: false
            referencedRelation: "task_assignment_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_user_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      changepassword: {
        Args: {
          current_id: string
          current_plain_password: string
          new_plain_password: string
        }
        Returns: string
      }
      get_never_logged_in_count: { Args: never; Returns: number }
      get_total_auth_users_count: { Args: never; Returns: number }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      age_range:
        | "under_18"
        | "18_24"
        | "25_34"
        | "35_44"
        | "45_54"
        | "55_plus"
        | "prefer_not_say"
      ai_tool_frequency: "daily" | "weekly" | "monthly" | "rarely" | "never"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      facility_type:
        | "study_room"
        | "lab"
        | "meeting_room"
        | "lecture_hall"
        | "computer_lab"
        | "library_space"
        | "other"
      gender_identity: "female" | "male" | "prefer_not_say"
      message_role: "user" | "assistant" | "system"
      programming_experience:
        | "none"
        | "under_1_year"
        | "one_to_two_years"
        | "three_plus_years"
      registration_status: "active" | "dropped" | "completed" | "waitlisted"
      study_protocol_version: "v1_simple" | "v2_criteria"
      survey_construct:
        | "Usability"
        | "Workload"
        | "Autonomy"
        | "Competence"
        | "Performance Satisfaction"
        | "System Satisfaction"
      survey_scale_type: "likert_5" | "likert_7" | "numeric_0_100" | "free_text"
      system_type: "chat_agent" | "traditional"
      task_event_type: "step" | "turn" | "survey" | "interview" | "system"
      task_progress_status: "not_started" | "in_progress" | "completed"
      task_session_status: "not_started" | "in_progress" | "completed"
      technical_proficiency: "none" | "limited" | "moderate" | "advanced"
      user_role: "student" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      age_range: [
        "under_18",
        "18_24",
        "25_34",
        "35_44",
        "45_54",
        "55_plus",
        "prefer_not_say",
      ],
      ai_tool_frequency: ["daily", "weekly", "monthly", "rarely", "never"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      facility_type: [
        "study_room",
        "lab",
        "meeting_room",
        "lecture_hall",
        "computer_lab",
        "library_space",
        "other",
      ],
      gender_identity: ["female", "male", "prefer_not_say"],
      message_role: ["user", "assistant", "system"],
      programming_experience: [
        "none",
        "under_1_year",
        "one_to_two_years",
        "three_plus_years",
      ],
      registration_status: ["active", "dropped", "completed", "waitlisted"],
      study_protocol_version: ["v1_simple", "v2_criteria"],
      survey_construct: [
        "Usability",
        "Workload",
        "Autonomy",
        "Competence",
        "Performance Satisfaction",
        "System Satisfaction",
      ],
      survey_scale_type: ["likert_5", "likert_7", "numeric_0_100", "free_text"],
      system_type: ["chat_agent", "traditional"],
      task_event_type: ["step", "turn", "survey", "interview", "system"],
      task_progress_status: ["not_started", "in_progress", "completed"],
      task_session_status: ["not_started", "in_progress", "completed"],
      technical_proficiency: ["none", "limited", "moderate", "advanced"],
      user_role: ["student", "admin"],
    },
  },
} as const

