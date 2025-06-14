
export interface ManufacturingOrder {
  id: string;
  order_number: string;
  product_name: string;
  product_type?: string;
  product_config_id?: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  special_instructions?: string;
  created_by?: string;
  merchant_id: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  product_configs?: {
    id: string;
    product_code: string;
    category: string;
    subcategory: string;
    product_config_materials?: Array<{
      id: string;
      raw_material_id: string;
      quantity_required: number;
      unit: string;
      raw_materials: {
        id: string;
        name: string;
        type: string;
        unit: string;
      };
    }>;
  };
}

export interface CreateManufacturingOrderData {
  product_name: string;
  product_type?: string;
  product_config_id?: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  special_instructions?: string;
}

export interface ManufacturingFilters {
  status: string;
  priority: string;
  productName: string;
  dueDateFrom: Date | null;
  dueDateTo: Date | null;
  createdDateRange: string;
  hasSpecialInstructions: boolean;
  overdueOrders: boolean;
}
