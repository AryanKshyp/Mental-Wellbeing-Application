export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          college_name: string | null;
          year: string | null;
          role: "student" | "senior" | "alumni" | "professor";
          interests: string[] | null;
          stress_level: number | null;
          goals: string[] | null;
          felt_overwhelmed: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          college_name?: string | null;
          year?: string | null;
          role?: "student" | "senior" | "alumni" | "professor";
          interests?: string[] | null;
          stress_level?: number | null;
          goals?: string[] | null;
          felt_overwhelmed?: boolean | null;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      mentors: {
        Row: {
          user_id: string;
          expertise_tags: string[];
          availability_status: "online" | "offline";
          bio_tagline: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          expertise_tags?: string[];
          availability_status?: "online" | "offline";
          bio_tagline?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["mentors"]["Insert"]>;
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["communities"]["Insert"]>;
      };
      community_messages: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          content: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["community_messages"]["Insert"]
        >;
      };
      direct_chats: {
        Row: {
          id: string;
          student_id: string;
          mentor_id: string;
          status: "active" | "closed";
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          mentor_id: string;
          status?: "active" | "closed";
        };
        Update: Partial<Database["public"]["Tables"]["direct_chats"]["Insert"]>;
      };
      direct_messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          content: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["direct_messages"]["Insert"]
        >;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          streak_count: number;
          completed_dates: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          streak_count?: number;
          completed_dates?: string[] | null;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Insert"]>;
      };
      journals: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          audio_url: string | null;
          mood_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          audio_url?: string | null;
          mood_score?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["journals"]["Insert"]>;
      };
    };
  };
}

