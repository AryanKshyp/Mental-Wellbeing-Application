export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string
          user_id: string
          content: string
          role: 'user' | 'assistant'
          created_at: string
          mood_rating?: number | null
          mood_notes?: string | null
          chat_mode: 'common' | 'reflection'
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          role: 'user' | 'assistant'
          created_at?: string
          mood_rating?: number | null
          mood_notes?: string | null
          chat_mode?: 'common' | 'reflection'
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          role?: 'user' | 'assistant'
          created_at?: string
          mood_rating?: number | null
          mood_notes?: string | null
          chat_mode?: 'common' | 'reflection'
        }
      }
      
      user_stats: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          last_login: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          last_login?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          last_login?: string
          created_at?: string
          updated_at?: string
        }
      }
      
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          time: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          time?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          time?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      
      mood_checkins: {
        Row: {
          id: string
          user_id: string
          mood: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'senior' | 'alumni' | 'professor'
          created_at: string
          updated_at: string
          phone?: string
          college_name?: string
          year?: number
          interests?: string[]
          stress_level?: number
          goals?: string
          felt_overwhelmed?: boolean
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'senior' | 'alumni' | 'professor'
          created_at?: string
          updated_at?: string
          phone?: string
          college_name?: string
          year?: number
          interests?: string[]
          stress_level?: number
          goals?: string
          felt_overwhelmed?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'senior' | 'alumni' | 'professor'
          created_at?: string
          updated_at?: string
          phone?: string
          college_name?: string
          year?: number
          interests?: string[]
          stress_level?: number
          goals?: string
          felt_overwhelmed?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'senior' | 'alumni' | 'professor'
      chat_status: 'active' | 'closed'
      availability_status: 'online' | 'offline'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}