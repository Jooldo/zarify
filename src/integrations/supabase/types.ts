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
      catalogue_categories: {
        Row: {
          catalogue_id: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
        }
        Insert: {
          catalogue_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
        }
        Update: {
          catalogue_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_categories_catalogue_id_fkey"
            columns: ["catalogue_id"]
            isOneToOne: false
            referencedRelation: "catalogues"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogue_item_categories: {
        Row: {
          catalogue_category_id: string
          catalogue_item_id: string
          created_at: string
          id: string
        }
        Insert: {
          catalogue_category_id: string
          catalogue_item_id: string
          created_at?: string
          id?: string
        }
        Update: {
          catalogue_category_id?: string
          catalogue_item_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_item_categories_catalogue_category_id_fkey"
            columns: ["catalogue_category_id"]
            isOneToOne: false
            referencedRelation: "catalogue_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogue_item_categories_catalogue_item_id_fkey"
            columns: ["catalogue_item_id"]
            isOneToOne: false
            referencedRelation: "catalogue_items"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogue_items: {
        Row: {
          catalogue_id: string
          created_at: string
          custom_description: string | null
          custom_price: number | null
          display_order: number
          id: string
          is_featured: boolean
          product_config_id: string
        }
        Insert: {
          catalogue_id: string
          created_at?: string
          custom_description?: string | null
          custom_price?: number | null
          display_order?: number
          id?: string
          is_featured?: boolean
          product_config_id: string
        }
        Update: {
          catalogue_id?: string
          created_at?: string
          custom_description?: string | null
          custom_price?: number | null
          display_order?: number
          id?: string
          is_featured?: boolean
          product_config_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_items_catalogue_id_fkey"
            columns: ["catalogue_id"]
            isOneToOne: false
            referencedRelation: "catalogues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_catalogue_items_catalogue"
            columns: ["catalogue_id"]
            isOneToOne: false
            referencedRelation: "catalogues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_catalogue_items_product_config"
            columns: ["product_config_id"]
            isOneToOne: false
            referencedRelation: "product_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogue_orders: {
        Row: {
          catalogue_id: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_id: string | null
          order_items: Json
          processed_at: string | null
          status: string
          total_amount: number
        }
        Insert: {
          catalogue_id: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          order_items: Json
          processed_at?: string | null
          status?: string
          total_amount?: number
        }
        Update: {
          catalogue_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          order_items?: Json
          processed_at?: string | null
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_orders_catalogue_id_fkey"
            columns: ["catalogue_id"]
            isOneToOne: false
            referencedRelation: "catalogues"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogues: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          merchant_id: string
          name: string
          public_url_slug: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          merchant_id: string
          name: string
          public_url_slug: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          merchant_id?: string
          name?: string
          public_url_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
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
          customer_id: string | null
          gross_weight: number | null
          id: string
          merchant_id: string
          net_weight: number | null
          operation_type: string | null
          order_id: string | null
          order_item_id: string | null
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
          customer_id?: string | null
          gross_weight?: number | null
          id?: string
          merchant_id: string
          net_weight?: number | null
          operation_type?: string | null
          order_id?: string | null
          order_item_id?: string | null
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
          customer_id?: string | null
          gross_weight?: number | null
          id?: string
          merchant_id?: string
          net_weight?: number | null
          operation_type?: string | null
          order_id?: string | null
          order_item_id?: string | null
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
            foreignKeyName: "inventory_tags_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_tags_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_tags_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "finished_goods"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          id: string
          invoice_id: string
          merchant_id: string
          order_item_id: string
          product_config_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_id: string
          merchant_id: string
          order_item_id: string
          product_config_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_id?: string
          merchant_id?: string
          order_item_id?: string
          product_config_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_config_id_fkey"
            columns: ["product_config_id"]
            isOneToOne: false
            referencedRelation: "product_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_id: string
          discount_amount: number
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          merchant_id: string
          notes: string | null
          order_id: string
          status: string
          subtotal: number
          tax_amount: number
          tax_percentage: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          merchant_id: string
          notes?: string | null
          order_id: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_percentage?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          merchant_id?: string
          notes?: string | null
          order_id?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_percentage?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturing_order_step_data: {
        Row: {
          assigned_worker: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          instance_id: string | null
          instance_number: number
          is_rework: boolean
          merchant_id: string
          notes: string | null
          order_id: string
          origin_step_id: string | null
          parent_instance_id: string | null
          purity: number | null
          quantity_assigned: number | null
          quantity_received: number | null
          started_at: string | null
          status: string
          step_name: string
          updated_at: string
          wastage: number | null
          weight_assigned: number | null
          weight_received: number | null
        }
        Insert: {
          assigned_worker?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          instance_id?: string | null
          instance_number?: number
          is_rework?: boolean
          merchant_id: string
          notes?: string | null
          order_id: string
          origin_step_id?: string | null
          parent_instance_id?: string | null
          purity?: number | null
          quantity_assigned?: number | null
          quantity_received?: number | null
          started_at?: string | null
          status?: string
          step_name: string
          updated_at?: string
          wastage?: number | null
          weight_assigned?: number | null
          weight_received?: number | null
        }
        Update: {
          assigned_worker?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          instance_id?: string | null
          instance_number?: number
          is_rework?: boolean
          merchant_id?: string
          notes?: string | null
          order_id?: string
          origin_step_id?: string | null
          parent_instance_id?: string | null
          purity?: number | null
          quantity_assigned?: number | null
          quantity_received?: number | null
          started_at?: string | null
          status?: string
          step_name?: string
          updated_at?: string
          wastage?: number | null
          weight_assigned?: number | null
          weight_received?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturing_order_step_data_assigned_worker_fkey"
            columns: ["assigned_worker"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_order_step_data_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_order_step_data_merchant_id_step_name_fkey"
            columns: ["merchant_id", "step_name"]
            isOneToOne: false
            referencedRelation: "merchant_step_config"
            referencedColumns: ["merchant_id", "step_name"]
          },
          {
            foreignKeyName: "manufacturing_order_step_data_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_order_step_data_origin_step_id_fkey"
            columns: ["origin_step_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_order_step_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_order_step_data_parent_instance_id_fkey"
            columns: ["parent_instance_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_order_step_data"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturing_orders: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          merchant_id: string
          order_number: string
          priority: string
          product_name: string
          quantity_required: number
          special_instructions: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          merchant_id: string
          order_number: string
          priority?: string
          product_name: string
          quantity_required: number
          special_instructions?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          merchant_id?: string
          order_number?: string
          priority?: string
          product_name?: string
          quantity_required?: number
          special_instructions?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manufacturing_orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturing_rework_movements: {
        Row: {
          batch_reference: string | null
          created_at: string
          created_by: string | null
          id: string
          merchant_id: string
          movement_timestamp: string
          quantity_moved: number
          remarks: string | null
          source_step_id: string
          target_step_id: string
          weight_moved: number
        }
        Insert: {
          batch_reference?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          merchant_id: string
          movement_timestamp?: string
          quantity_moved?: number
          remarks?: string | null
          source_step_id: string
          target_step_id: string
          weight_moved?: number
        }
        Update: {
          batch_reference?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          merchant_id?: string
          movement_timestamp?: string
          quantity_moved?: number
          remarks?: string | null
          source_step_id?: string
          target_step_id?: string
          weight_moved?: number
        }
        Relationships: [
          {
            foreignKeyName: "manufacturing_rework_movements_source_step_id_fkey"
            columns: ["source_step_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_order_step_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_rework_movements_target_step_id_fkey"
            columns: ["target_step_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_order_step_data"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturing_step_assignments: {
        Row: {
          assigned_by: string | null
          assigned_to_worker: string | null
          assignment_timestamp: string
          batch_reference: string | null
          created_at: string
          due_date: string | null
          id: string
          merchant_id: string
          quantity_assigned: number | null
          remarks: string | null
          step_data_id: string
          weight_assigned: number | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to_worker?: string | null
          assignment_timestamp?: string
          batch_reference?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          merchant_id: string
          quantity_assigned?: number | null
          remarks?: string | null
          step_data_id: string
          weight_assigned?: number | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to_worker?: string | null
          assignment_timestamp?: string
          batch_reference?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          merchant_id?: string
          quantity_assigned?: number | null
          remarks?: string | null
          step_data_id?: string
          weight_assigned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturing_step_assignments_assigned_to_worker_fkey"
            columns: ["assigned_to_worker"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_step_assignments_step_data_id_fkey"
            columns: ["step_data_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_order_step_data"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturing_step_receipts: {
        Row: {
          batch_reference: string | null
          created_at: string
          due_date: string | null
          id: string
          merchant_id: string
          quantity_received: number | null
          receipt_timestamp: string
          received_by: string | null
          received_from_worker: string | null
          remarks: string | null
          step_data_id: string
          weight_received: number | null
        }
        Insert: {
          batch_reference?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          merchant_id: string
          quantity_received?: number | null
          receipt_timestamp?: string
          received_by?: string | null
          received_from_worker?: string | null
          remarks?: string | null
          step_data_id: string
          weight_received?: number | null
        }
        Update: {
          batch_reference?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          merchant_id?: string
          quantity_received?: number | null
          receipt_timestamp?: string
          received_by?: string | null
          received_from_worker?: string | null
          remarks?: string | null
          step_data_id?: string
          weight_received?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturing_step_receipts_received_from_worker_fkey"
            columns: ["received_from_worker"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_step_receipts_step_data_id_fkey"
            columns: ["step_data_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_order_step_data"
            referencedColumns: ["id"]
          },
        ]
      }
      master_field_list: {
        Row: {
          created_at: string
          data_type: string
          description: string | null
          field_key: string
          id: string
          is_active: boolean
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_type: string
          description?: string | null
          field_key: string
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_type?: string
          description?: string | null
          field_key?: string
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          merchant_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          merchant_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          merchant_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_types_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_step_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          merchant_id: string
          step_name: string
          step_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          merchant_id: string
          step_name: string
          step_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          merchant_id?: string
          step_name?: string
          step_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_step_config_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_step_field_config: {
        Row: {
          created_at: string
          field_key: string
          id: string
          is_visible: boolean
          merchant_id: string
          step_name: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_key: string
          id?: string
          is_visible?: boolean
          merchant_id: string
          step_name: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_key?: string
          id?: string
          is_visible?: boolean
          merchant_id?: string
          step_name?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_step_field_config_field_key_fkey"
            columns: ["field_key"]
            isOneToOne: false
            referencedRelation: "master_field_list"
            referencedColumns: ["field_key"]
          },
          {
            foreignKeyName: "merchant_step_field_config_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_step_field_config_merchant_id_step_name_fkey"
            columns: ["merchant_id", "step_name"]
            isOneToOne: false
            referencedRelation: "merchant_step_config"
            referencedColumns: ["merchant_id", "step_name"]
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
          fulfilled_quantity: number
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
          fulfilled_quantity?: number
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
          fulfilled_quantity?: number
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
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          merchant_id: string
          product_code: string
          size_value: number
          subcategory: string
          threshold: number | null
          updated_at: string | null
          weight_range: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          merchant_id: string
          product_code: string
          size_value: number
          subcategory: string
          threshold?: number | null
          updated_at?: string | null
          weight_range?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          merchant_id?: string
          product_code?: string
          size_value?: number
          subcategory?: string
          threshold?: number | null
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
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          merchant_id: string
          permissions: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          merchant_id: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          merchant_id?: string
          permissions?: Json | null
          role?: string | null
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
          in_manufacturing: number | null
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
          in_manufacturing?: number | null
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
          in_manufacturing?: number | null
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
      role_permissions: {
        Row: {
          action: string
          created_at: string
          id: string
          is_allowed: boolean
          module: string
          role: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          is_allowed?: boolean
          module: string
          role: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          is_allowed?: boolean
          module?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
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
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          merchant_id: string
          role: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          merchant_id: string
          role: string
          status?: string
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          merchant_id?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          is_active: boolean
          merchant_id: string
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          merchant_id: string
          permissions?: Json | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          merchant_id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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
      check_user_has_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_catalogue_slug: {
        Args: { catalogue_name: string; merchant_id_param: string }
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_manufacturing_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_step_instance_number: {
        Args: { p_order_id: string; p_step_name: string }
        Returns: number
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
      get_user_roles: {
        Args: { _user_id?: string }
        Returns: {
          role: string
          permissions: Json
          is_active: boolean
          assigned_at: string
        }[]
      }
      has_permission: {
        Args: { _user_id: string; _module: string; _action: string }
        Returns: boolean
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
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
      update_step_aggregates: {
        Args: { step_data_id_param: string }
        Returns: undefined
      }
      validate_invitation_token: {
        Args: { token_param: string }
        Returns: {
          invitation_id: string
          email: string
          role: string
          merchant_id: string
          invited_by: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      order_status:
        | "Created"
        | "In Progress"
        | "Ready"
        | "Delivered"
        | "Partially Fulfilled"
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
      order_status: [
        "Created",
        "In Progress",
        "Ready",
        "Delivered",
        "Partially Fulfilled",
      ],
      procurement_status: ["None", "Pending", "Approved", "Received"],
      user_role: ["admin", "worker"],
      worker_status: ["Active", "On Leave"],
    },
  },
} as const
