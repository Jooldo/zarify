export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          merchant_id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          merchant_id: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          merchant_id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      finished_goods: {
        Row: {
          created_at: string | null
          current_stock: number | null
          id: string
          in_manufacturing: number | null
          last_produced: string | null
          merchant_id: string
          product_code: string
          product_config_id: string
          required_quantity: number | null
          tag_enabled: boolean | null
          threshold: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stock?: number | null
          id?: string
          in_manufacturing?: number | null
          last_produced?: string | null
          merchant_id: string
          product_code: string
          product_config_id: string
          required_quantity?: number | null
          tag_enabled?: boolean | null
          threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stock?: number | null
          id?: string
          in_manufacturing?: number | null
          last_produced?: string | null
          merchant_id?: string
          product_code?: string
          product_config_id?: string
          required_quantity?: number | null
          tag_enabled?: boolean | null
          threshold?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finished_goods_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finished_goods_product_config_id_fkey"
            columns: ["product_config_id"]
            isOneToOne: false
            referencedRelation: "product_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_tags: {
        Row: {
          created_at: string
          id: string
          merchant_id: string
          operation_type: string | null
          product_id: string
          qr_code_data: string | null
          quantity: number
          status: string
          tag_id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_id: string
          operation_type?: string | null
          product_id: string
          qr_code_data?: string | null
          quantity: number
          status?: string
          tag_id: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          merchant_id?: string
          operation_type?: string | null
          product_id?: string
          qr_code_data?: string | null
          quantity?: number
          status?: string
          tag_id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "finished_goods"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          merchant_id: string
          order_id: string
          product_config_id: string
          quantity: number
          status: Database["public"]["Enums"]["order_status"] | null
          suborder_id: string
          total_price: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          merchant_id: string
          order_id: string
          product_config_id: string
          quantity: number
          status?: Database["public"]["Enums"]["order_status"] | null
          suborder_id: string
          total_price: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          merchant_id?: string
          order_id?: string
          product_config_id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"] | null
          suborder_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_config_id_fkey"
            columns: ["product_config_id"]
            isOneToOne: false
            referencedRelation: "product_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          created_date: string | null
          customer_id: string
          expected_delivery: string | null
          id: string
          merchant_id: string
          order_number: string
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string | null
          updated_date: string | null
        }
        Insert: {
          created_at?: string | null
          created_date?: string | null
          customer_id: string
          expected_delivery?: string | null
          id?: string
          merchant_id: string
          order_number: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string | null
          updated_date?: string | null
        }
        Update: {
          created_at?: string | null
          created_date?: string | null
          customer_id?: string
          expected_delivery?: string | null
          id?: string
          merchant_id?: string
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string | null
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_requests: {
        Row: {
          created_at: string | null
          date_requested: string | null
          eta: string | null
          first_name: string | null
          id: string
          last_name: string | null
          merchant_id: string
          notes: string | null
          quantity_requested: number
          raw_material_id: string
          request_number: string
          status: Database["public"]["Enums"]["procurement_status"] | null
          supplier_id: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_requested?: string | null
          eta?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          merchant_id: string
          notes?: string | null
          quantity_requested: number
          raw_material_id: string
          request_number: string
          status?: Database["public"]["Enums"]["procurement_status"] | null
          supplier_id?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_requested?: string | null
          eta?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          merchant_id?: string
          notes?: string | null
          quantity_requested?: number
          raw_material_id?: string
          request_number?: string
          status?: Database["public"]["Enums"]["procurement_status"] | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procurement_requests_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requests_raw_material_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_config_materials: {
        Row: {
          created_at: string | null
          id: string
          merchant_id: string
          product_config_id: string
          quantity_required: number
          raw_material_id: string
          unit: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          merchant_id: string
          product_config_id: string
          quantity_required: number
          raw_material_id: string
          unit: string
        }
        Update: {
          created_at?: string | null
          id?: string
          merchant_id?: string
          product_config_id?: string
          quantity_required?: number
          raw_material_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_config_materials_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_config_materials_product_config_id_fkey"
            columns: ["product_config_id"]
            isOneToOne: false
            referencedRelation: "product_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_config_materials_raw_material_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      product_configs: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          merchant_id: string
          product_code: string
          size_value: number
          subcategory: string
          updated_at: string | null
          weight_range: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          merchant_id: string
          product_code: string
          size_value: number
          subcategory: string
          updated_at?: string | null
          weight_range?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          merchant_id?: string
          product_code?: string
          size_value?: number
          subcategory?: string
          updated_at?: string | null
          weight_range?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_configs_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          merchant_id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          merchant_id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          merchant_id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_materials: {
        Row: {
          cost_per_unit: number | null
          created_at: string | null
          current_stock: number | null
          id: string
          in_procurement: number | null
          last_updated: string | null
          merchant_id: string
          minimum_stock: number | null
          name: string
          request_status:
            | Database["public"]["Enums"]["procurement_status"]
            | null
          required: number | null
          supplier_id: string | null
          type: string
          unit: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string | null
          current_stock?: number | null
          id?: string
          in_procurement?: number | null
          last_updated?: string | null
          merchant_id: string
          minimum_stock?: number | null
          name: string
          request_status?:
            | Database["public"]["Enums"]["procurement_status"]
            | null
          required?: number | null
          supplier_id?: string | null
          type: string
          unit: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string | null
          current_stock?: number | null
          id?: string
          in_procurement?: number | null
          last_updated?: string | null
          merchant_id?: string
          minimum_stock?: number | null
          name?: string
          request_status?:
            | Database["public"]["Enums"]["procurement_status"]
            | null
          required?: number | null
          supplier_id?: string | null
          type?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_materials_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raw_materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          company_name: string
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          materials_supplied: string[] | null
          merchant_id: string
          payment_terms: string | null
          phone: string | null
          updated_at: string | null
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          materials_supplied?: string[] | null
          merchant_id: string
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          materials_supplied?: string[] | null
          merchant_id?: string
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_audit_log: {
        Row: {
          action: string
          id: string
          merchant_id: string
          new_stock: number | null
          previous_stock: number | null
          product_id: string
          quantity: number
          tag_id: string
          timestamp: string
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          id?: string
          merchant_id: string
          new_stock?: number | null
          previous_stock?: number | null
          product_id: string
          quantity: number
          tag_id: string
          timestamp?: string
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          id?: string
          merchant_id?: string
          new_stock?: number | null
          previous_stock?: number | null
          product_id?: string
          quantity?: number
          tag_id?: string
          timestamp?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_audit_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "finished_goods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          action: string
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string
          id: string
          merchant_id: string
          timestamp: string
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type: string
          id?: string
          merchant_id: string
          timestamp?: string
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          merchant_id?: string
          timestamp?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      whatsapp_notifications: {
        Row: {
          created_at: string | null
          delivery_status: string | null
          error_message: string | null
          id: string
          merchant_id: string
          message_content: string
          procurement_request_id: string
          sent_at: string | null
          status: string
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          merchant_id: string
          message_content: string
          procurement_request_id: string
          sent_at?: string | null
          status?: string
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          merchant_id?: string
          message_content?: string
          procurement_request_id?: string
          sent_at?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_notifications_procurement_request_id_fkey"
            columns: ["procurement_request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_notifications_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          contact_number: string | null
          created_at: string | null
          id: string
          joined_date: string | null
          merchant_id: string
          name: string
          notes: string | null
          role: string | null
          status: Database["public"]["Enums"]["worker_status"] | null
          updated_at: string | null
        }
        Insert: {
          contact_number?: string | null
          created_at?: string | null
          id?: string
          joined_date?: string | null
          merchant_id: string
          name: string
          notes?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["worker_status"] | null
          updated_at?: string | null
        }
        Update: {
          contact_number?: string | null
          created_at?: string | null
          id?: string
          joined_date?: string | null
          merchant_id?: string
          name?: string
          notes?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["worker_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_suborder_id: {
        Args: { order_number: string; item_index: number }
        Returns: string
      }
      get_next_tag_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_merchant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_action: string
          p_entity_type: string
          p_entity_id?: string
          p_description?: string
        }
        Returns: string
      }
    }
    Enums: {
      order_status: "Created" | "In Progress" | "Ready" | "Delivered"
      procurement_status: "None" | "Pending" | "Approved" | "Received"
      user_role: "admin" | "worker"
      worker_status: "Active" | "On Leave"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: ["Created", "In Progress", "Ready", "Delivered"],
      procurement_status: ["None", "Pending", "Approved", "Received"],
      user_role: ["admin", "worker"],
      worker_status: ["Active", "On Leave"],
    },
  },
} as const
