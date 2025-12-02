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
      course_sections: {
        Row: {
          capacity: number
          course_id: string
          created_at: string
          end_time: string | null
          enrolled_count: number
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
          capacity?: number
          course_id: string
          created_at?: string
          end_time?: string | null
          enrolled_count?: number
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
          capacity?: number
          course_id?: string
          created_at?: string
          end_time?: string | null
          enrolled_count?: number
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
          capacity: number | null
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
          capacity?: number | null
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
          capacity?: number | null
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
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          student_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          student_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      facility_type:
        | "study_room"
        | "lab"
        | "meeting_room"
        | "lecture_hall"
        | "computer_lab"
        | "library_space"
        | "other"
      registration_status: "active" | "dropped" | "completed" | "waitlisted"
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
      registration_status: ["active", "dropped", "completed", "waitlisted"],
      user_role: ["student", "admin"],
    },
  },
} as const

