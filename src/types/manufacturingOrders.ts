
export interface CreateManufacturingOrderData {
  product_name: string;
  product_config_id: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  special_instructions?: string;
}

export interface ManufacturingOrder {
  id: string;
  order_number: string;
  product_name: string;
  product_config_id: string;
  quantity_required: number;
  priority: string;
  status: string;
  due_date?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  merchant_id: string;
  product_type?: string;
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
