
export interface CreateManufacturingOrderData {
  product_name: string;
  product_config_id?: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  special_instructions?: string;
  parent_order_id?: string; // For rework orders
  rework_source_step_id?: string; // Step from which rework was initiated
  rework_quantity?: number; // Quantity for rework
  assigned_to_step?: number; // Step to which rework is assigned
  rework_reason?: string; // Reason for rework
}

export interface ManufacturingOrder {
  id: string;
  order_number: string;
  product_name: string;
  product_config_id?: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | 'tagged_in';
  due_date?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  merchant_id: string;
  product_type?: string;
  parent_order_id?: string; // For child orders
  rework_from_step?: number; // Step from which rework was initiated
  assigned_to_step?: number; // Step to which rework is assigned
  product_configs?: {
    product_code: string;
    category: string;
    subcategory: string;
    size_value: number;
    weight_range?: string;
    product_config_materials?: Array<{
      id: string;
      quantity_required: number;
      unit: string;
      raw_material_id: string;
      raw_materials?: {
        id: string;
        name: string;
        current_stock: number;
        unit: string;
      };
    }>;
  };
}
