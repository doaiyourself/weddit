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
    PostgrestVersion: "14.5"
  }
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
      favorites: {
        Row: {
          created_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          contracted_at: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["inquiry_status"]
          user_id: string
          vendor_id: string
        }
        Insert: {
          contracted_at?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          user_id: string
          vendor_id: string
        }
        Update: {
          contracted_at?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          inquiry_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          inquiry_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          inquiry_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      option_masters: {
        Row: {
          category: Database["public"]["Enums"]["option_category"]
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          category: Database["public"]["Enums"]["option_category"]
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["option_category"]
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          inquiry_id: string
          rating: number
          user_id: string
          vendor_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          inquiry_id: string
          rating: number
          user_id: string
          vendor_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          inquiry_id?: string
          rating?: number
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: true
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          nickname: string | null
          wedding_date: string | null
        }
        Insert: {
          created_at?: string
          id: string
          nickname?: string | null
          wedding_date?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nickname?: string | null
          wedding_date?: string | null
        }
        Relationships: []
      }
      vendor_images: {
        Row: {
          alt: string | null
          id: string
          sort_order: number
          url: string
          vendor_id: string
        }
        Insert: {
          alt?: string | null
          id?: string
          sort_order?: number
          url: string
          vendor_id: string
        }
        Update: {
          alt?: string | null
          id?: string
          sort_order?: number
          url?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_images_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_options: {
        Row: {
          description: string | null
          id: string
          option_master_id: string | null
          price: number
          price_max: number | null
          price_type: Database["public"]["Enums"]["price_type"]
          vendor_id: string
          vendor_name: string
        }
        Insert: {
          description?: string | null
          id?: string
          option_master_id?: string | null
          price: number
          price_max?: number | null
          price_type?: Database["public"]["Enums"]["price_type"]
          vendor_id: string
          vendor_name: string
        }
        Update: {
          description?: string | null
          id?: string
          option_master_id?: string | null
          price?: number
          price_max?: number | null
          price_type?: Database["public"]["Enums"]["price_type"]
          vendor_id?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_options_option_master_id_fkey"
            columns: ["option_master_id"]
            isOneToOne: false
            referencedRelation: "option_masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_options_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_packages: {
        Row: {
          description: string | null
          id: string
          is_representative: boolean
          name: string
          price_max: number
          price_min: number
          pricing_notes: string | null
          vendor_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_representative?: boolean
          name: string
          price_max: number
          price_min: number
          pricing_notes?: string | null
          vendor_id: string
        }
        Update: {
          description?: string | null
          id?: string
          is_representative?: boolean
          name?: string
          price_max?: number
          price_min?: number
          pricing_notes?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_price_tiers: {
        Row: {
          conditions: Json | null
          id: string
          price_max: number
          price_min: number
          tier_name: string
          vendor_id: string
        }
        Insert: {
          conditions?: Json | null
          id?: string
          price_max: number
          price_min: number
          tier_name: string
          vendor_id: string
        }
        Update: {
          conditions?: Json | null
          id?: string
          price_max?: number
          price_min?: number
          tier_name?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_price_tiers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_stats: {
        Row: {
          avg_rating: number
          inquiry_count: number
          review_count: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          avg_rating?: number
          inquiry_count?: number
          review_count?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          avg_rating?: number
          inquiry_count?: number
          review_count?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_stats_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          category: Database["public"]["Enums"]["vendor_category"]
          created_at: string
          description: string | null
          id: string
          instagram: string | null
          name: string
          owner_user_id: string | null
          phone: string | null
          region: string
          slug: string
          status: Database["public"]["Enums"]["vendor_status"]
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          address?: string | null
          category: Database["public"]["Enums"]["vendor_category"]
          created_at?: string
          description?: string | null
          id?: string
          instagram?: string | null
          name: string
          owner_user_id?: string | null
          phone?: string | null
          region: string
          slug: string
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["vendor_category"]
          created_at?: string
          description?: string | null
          id?: string
          instagram?: string | null
          name?: string
          owner_user_id?: string | null
          phone?: string | null
          region?: string
          slug?: string
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_review: {
        Args: {
          p_body?: string
          p_inquiry_id: string
          p_rating: number
          p_vendor_id: string
        }
        Returns: {
          body: string | null
          created_at: string
          id: string
          inquiry_id: string
          rating: number
          user_id: string
          vendor_id: string
        }
        SetofOptions: {
          from: "*"
          to: "reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      inquiry_status: "pending" | "responded" | "contracted" | "closed"
      option_category: "studio" | "dress" | "makeup" | "common"
      price_type: "fixed" | "range" | "negotiable"
      vendor_category: "studio" | "dress" | "makeup"
      vendor_status: "active" | "inactive" | "pending"
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
      inquiry_status: ["pending", "responded", "contracted", "closed"],
      option_category: ["studio", "dress", "makeup", "common"],
      price_type: ["fixed", "range", "negotiable"],
      vendor_category: ["studio", "dress", "makeup"],
      vendor_status: ["active", "inactive", "pending"],
    },
  },
} as const
