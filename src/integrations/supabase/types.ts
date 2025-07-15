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
      access_requests: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
        }
        Relationships: []
      }
      crm_interactions: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          property_id: string | null
          scheduled_call_date: string | null
          status: Database["public"]["Enums"]["crm_status"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          scheduled_call_date?: string | null
          status?: Database["public"]["Enums"]["crm_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          scheduled_call_date?: string | null
          status?: Database["public"]["Enums"]["crm_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "Propiedades"
            referencedColumns: ["propertyId"]
          },
        ]
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_super_user: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_super_user?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_super_user?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      property_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "Propiedades"
            referencedColumns: ["propertyId"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string
          image_url: string
          property_id: string
        }
        Insert: {
          created_at?: string
          image_url: string
          property_id: string
        }
        Update: {
          created_at?: string
          image_url?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "Propiedades"
            referencedColumns: ["propertyId"]
          },
        ]
      }
      Propiedades: {
        Row: {
          address_city: string | null
          address_countyFipsCode: number | null
          address_formattedStreet: string | null
          address_houseNumber: number | null
          address_latitude: number | null
          address_longitude: number | null
          address_street: string | null
          address_streetNoUnit: string | null
          address_zip: number | null
          address_zipPlus4: number | null
          building_effectiveYearBuilt: number | null
          building_roofCover: string | null
          building_roofType: string | null
          building_totalBuildingAreaSquareFeet: number | null
          building_yearBuilt: number | null
          combined_score: number | null
          count_gusts: number | null
          email_1: string | null
          email_2: string | null
          email_3: string | null
          email_4: string | null
          email_6: string | null
          email_7: string | null
          email_8: string | null
          email_9: string | null
          general_propertyTypeDetail: string | null
          "Google Maps": string | null
          max_gust: number | null
          mean_gust: number | null
          owner_fullName: string | null
          owner_lengthOfResidenceYears: string | null
          owner_match_age: number | null
          phone_1: string | null
          phone_2: string | null
          phone_3: string | null
          phone_4: string | null
          phone_5: string | null
          phone_6: string | null
          phone_7: string | null
          phone_8: string | null
          phone_9: string | null
          propertyId: string
          sale_priorSale_price: string | null
          score_base: number | null
          station_used: string | null
          Station1_ID: string | null
          Station2_ID: string | null
          structural_score: number | null
          top_gust_1: number | null
          top_gust_1_date: string | null
          top_gust_2: number | null
          top_gust_2_date: string | null
          top_gust_3: number | null
          top_gust_3_date: string | null
          top_gust_4: number | null
          top_gust_4_date: string | null
          top_gust_5: number | null
          top_gust_5_date: string | null
          valuation_estimatedValue: number | null
          wind_score: number | null
        }
        Insert: {
          address_city?: string | null
          address_countyFipsCode?: number | null
          address_formattedStreet?: string | null
          address_houseNumber?: number | null
          address_latitude?: number | null
          address_longitude?: number | null
          address_street?: string | null
          address_streetNoUnit?: string | null
          address_zip?: number | null
          address_zipPlus4?: number | null
          building_effectiveYearBuilt?: number | null
          building_roofCover?: string | null
          building_roofType?: string | null
          building_totalBuildingAreaSquareFeet?: number | null
          building_yearBuilt?: number | null
          combined_score?: number | null
          count_gusts?: number | null
          email_1?: string | null
          email_2?: string | null
          email_3?: string | null
          email_4?: string | null
          email_6?: string | null
          email_7?: string | null
          email_8?: string | null
          email_9?: string | null
          general_propertyTypeDetail?: string | null
          "Google Maps"?: string | null
          max_gust?: number | null
          mean_gust?: number | null
          owner_fullName?: string | null
          owner_lengthOfResidenceYears?: string | null
          owner_match_age?: number | null
          phone_1?: string | null
          phone_2?: string | null
          phone_3?: string | null
          phone_4?: string | null
          phone_5?: string | null
          phone_6?: string | null
          phone_7?: string | null
          phone_8?: string | null
          phone_9?: string | null
          propertyId: string
          sale_priorSale_price?: string | null
          score_base?: number | null
          station_used?: string | null
          Station1_ID?: string | null
          Station2_ID?: string | null
          structural_score?: number | null
          top_gust_1?: number | null
          top_gust_1_date?: string | null
          top_gust_2?: number | null
          top_gust_2_date?: string | null
          top_gust_3?: number | null
          top_gust_3_date?: string | null
          top_gust_4?: number | null
          top_gust_4_date?: string | null
          top_gust_5?: number | null
          top_gust_5_date?: string | null
          valuation_estimatedValue?: number | null
          wind_score?: number | null
        }
        Update: {
          address_city?: string | null
          address_countyFipsCode?: number | null
          address_formattedStreet?: string | null
          address_houseNumber?: number | null
          address_latitude?: number | null
          address_longitude?: number | null
          address_street?: string | null
          address_streetNoUnit?: string | null
          address_zip?: number | null
          address_zipPlus4?: number | null
          building_effectiveYearBuilt?: number | null
          building_roofCover?: string | null
          building_roofType?: string | null
          building_totalBuildingAreaSquareFeet?: number | null
          building_yearBuilt?: number | null
          combined_score?: number | null
          count_gusts?: number | null
          email_1?: string | null
          email_2?: string | null
          email_3?: string | null
          email_4?: string | null
          email_6?: string | null
          email_7?: string | null
          email_8?: string | null
          email_9?: string | null
          general_propertyTypeDetail?: string | null
          "Google Maps"?: string | null
          max_gust?: number | null
          mean_gust?: number | null
          owner_fullName?: string | null
          owner_lengthOfResidenceYears?: string | null
          owner_match_age?: number | null
          phone_1?: string | null
          phone_2?: string | null
          phone_3?: string | null
          phone_4?: string | null
          phone_5?: string | null
          phone_6?: string | null
          phone_7?: string | null
          phone_8?: string | null
          phone_9?: string | null
          propertyId?: string
          sale_priorSale_price?: string | null
          score_base?: number | null
          station_used?: string | null
          Station1_ID?: string | null
          Station2_ID?: string | null
          structural_score?: number | null
          top_gust_1?: number | null
          top_gust_1_date?: string | null
          top_gust_2?: number | null
          top_gust_2_date?: string | null
          top_gust_3?: number | null
          top_gust_3_date?: string | null
          top_gust_4?: number | null
          top_gust_4_date?: string | null
          top_gust_5?: number | null
          top_gust_5_date?: string | null
          valuation_estimatedValue?: number | null
          wind_score?: number | null
        }
        Relationships: []
      }
      whatsapp_chat: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_super_user: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      crm_status:
        | "contacted"
        | "interested"
        | "not_interested"
        | "scheduled_call"
        | "pending_followup"
        | "closed_won"
        | "closed_lost"
      user_role: "normal" | "super"
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
      crm_status: [
        "contacted",
        "interested",
        "not_interested",
        "scheduled_call",
        "pending_followup",
        "closed_won",
        "closed_lost",
      ],
      user_role: ["normal", "super"],
    },
  },
} as const
