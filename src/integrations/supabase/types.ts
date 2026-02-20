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
      adaptive_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string
          current_learning_style: string | null
          id: string
          is_applied: boolean | null
          reason: string | null
          recommendation_type: string
          recommended_learning_style: string | null
          student_id: string
          topic_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          current_learning_style?: string | null
          id?: string
          is_applied?: boolean | null
          reason?: string | null
          recommendation_type: string
          recommended_learning_style?: string | null
          student_id: string
          topic_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          current_learning_style?: string | null
          id?: string
          is_applied?: boolean | null
          reason?: string | null
          recommendation_type?: string
          recommended_learning_style?: string | null
          student_id?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adaptive_recommendations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string | null
          created_at: string | null
          exam_url: string | null
          id: string
          title: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          exam_url?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          exam_url?: string | null
          id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          teks_standard: string | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          teks_standard?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          teks_standard?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_topics: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: string | null
          estimated_duration: number | null
          id: string
          module_id: string
          order_index: number
          teks_standard: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          module_id: string
          order_index: number
          teks_standard?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          module_id?: string
          order_index?: number
          teks_standard?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          instructor_id: string
          instructors: string | null
          is_active: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          instructor_id: string
          instructors?: string | null
          is_active?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          instructor_id?: string
          instructors?: string | null
          is_active?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          progress: number | null
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          student_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      group_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          enrolled_by: string
          group_id: string
          id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          enrolled_by: string
          group_id: string
          id?: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          enrolled_by?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_enrollments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "student_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_memberships: {
        Row: {
          added_at: string
          added_by: string
          group_id: string
          id: string
          student_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          group_id: string
          id?: string
          student_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          group_id?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "student_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          course: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          course?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          course?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      learning_materials: {
        Row: {
          content_data: Json | null
          content_url: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          is_required: boolean | null
          learning_style: string
          material_type: string
          order_index: number
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          content_data?: Json | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          learning_style: string
          material_type: string
          order_index: number
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          content_data?: Json | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          learning_style?: string
          material_type?: string
          order_index?: number
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_materials_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_styles: {
        Row: {
          confidence_score: number | null
          created_at: string
          detected_at: string | null
          id: string
          primary_style: string
          secondary_style: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          detected_at?: string | null
          id?: string
          primary_style?: string
          secondary_style?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          detected_at?: string | null
          id?: string
          primary_style?: string
          secondary_style?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      mastery_requirements: {
        Row: {
          created_at: string
          id: string
          is_required: boolean | null
          requirement_type: string
          threshold_value: number
          topic_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          requirement_type: string
          threshold_value: number
          topic_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          requirement_type?: string
          threshold_value?: number
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_requirements_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      post_assignment: {
        Row: {
          correct_option: string
          created_at: string | null
          id: string
          options: Json
          question: string
          topic_id: string | null
        }
        Insert: {
          correct_option: string
          created_at?: string | null
          id?: string
          options: Json
          question: string
          topic_id?: string | null
        }
        Update: {
          correct_option?: string
          created_at?: string | null
          id?: string
          options?: Json
          question?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_assignment_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_assignment: {
        Row: {
          correct_option: string
          created_at: string | null
          id: string
          options: Json
          question: string
          topic_id: string | null
        }
        Insert: {
          correct_option: string
          created_at?: string | null
          id?: string
          options: Json
          question: string
          topic_id?: string | null
        }
        Update: {
          correct_option?: string
          created_at?: string | null
          id?: string
          options?: Json
          question?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_assignment_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          assignment_type: string | null
          correct_answer: string
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          media_url: string | null
          module_id: string | null
          options: Json | null
          points: number | null
          question_text: string
          question_type: string
          quiz_id: string
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_type?: string | null
          correct_answer: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          media_url?: string | null
          module_id?: string | null
          options?: Json | null
          points?: number | null
          question_text: string
          question_type: string
          quiz_id: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string | null
          correct_answer?: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          media_url?: string | null
          module_id?: string | null
          options?: Json | null
          points?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          cheat_flags: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          is_flagged: boolean | null
          proctoring_data: Json | null
          quiz_id: string
          score: number | null
          started_at: string | null
          status: string | null
          student_id: string
          total_points: number | null
          user_agent: string | null
        }
        Insert: {
          answers?: Json | null
          cheat_flags?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_flagged?: boolean | null
          proctoring_data?: Json | null
          quiz_id: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          student_id: string
          total_points?: number | null
          user_agent?: string | null
        }
        Update: {
          answers?: Json | null
          cheat_flags?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_flagged?: boolean | null
          proctoring_data?: Json | null
          quiz_id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          student_id?: string
          total_points?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quizzes: {
        Row: {
          anti_cheat_enabled: boolean | null
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_attempts: number | null
          passing_score: number | null
          proctored: boolean | null
          quiz_type: string | null
          randomize_questions: boolean | null
          seb_config_url: string | null
          seb_required: boolean | null
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          anti_cheat_enabled?: boolean | null
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          passing_score?: number | null
          proctored?: boolean | null
          quiz_type?: string | null
          randomize_questions?: boolean | null
          seb_config_url?: string | null
          seb_required?: boolean | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          anti_cheat_enabled?: boolean | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          passing_score?: number | null
          proctored?: boolean | null
          quiz_type?: string | null
          randomize_questions?: boolean | null
          seb_config_url?: string | null
          seb_required?: boolean | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      seb_configurations: {
        Row: {
          config_data: Json
          config_name: string
          created_at: string
          created_by: string
          id: string
          quiz_id: string
          updated_at: string
        }
        Insert: {
          config_data?: Json
          config_name: string
          created_at?: string
          created_by: string
          id?: string
          quiz_id: string
          updated_at?: string
        }
        Update: {
          config_data?: Json
          config_name?: string
          created_at?: string
          created_by?: string
          id?: string
          quiz_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seb_configurations_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: true
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      student: {
        Row: {
          course_id: string | null
          email: string | null
          id: string
          mentor_name: string | null
          phone: string | null
          student_id: string | null
          student_name: string | null
        }
        Insert: {
          course_id?: string | null
          email?: string | null
          id?: string
          mentor_name?: string | null
          phone?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Update: {
          course_id?: string | null
          email?: string | null
          id?: string
          mentor_name?: string | null
          phone?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_groups: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          instructors: string | null
          name: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          instructors?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          instructors?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_groups_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          attempts: number | null
          completion_data: Json | null
          course_id: string
          created_at: string
          id: string
          is_completed: boolean | null
          mastery_level: string | null
          material_id: string | null
          module_id: string | null
          progress_type: string
          score: number | null
          student_id: string
          time_spent_minutes: number | null
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          attempts?: number | null
          completion_data?: Json | null
          course_id: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          mastery_level?: string | null
          material_id?: string | null
          module_id?: string | null
          progress_type: string
          score?: number | null
          student_id: string
          time_spent_minutes?: number | null
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          attempts?: number | null
          completion_data?: Json | null
          course_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          mastery_level?: string | null
          material_id?: string | null
          module_id?: string | null
          progress_type?: string
          score?: number | null
          student_id?: string
          time_spent_minutes?: number | null
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "learning_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      url: {
        Row: {
          created_at: string | null
          id: string
          module_id: string | null
          topic_id: string | null
          url: string
          url_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id?: string | null
          topic_id?: string | null
          url: string
          url_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string | null
          topic_id?: string | null
          url?: string
          url_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "url_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "url_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "course_topics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
