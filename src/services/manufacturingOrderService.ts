
import { supabase } from '@/integrations/supabase/client';

export interface ManufacturingOrder {
  id: string;
  order_number: string;
  merchant_id: string;
  product_name: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  due_date?: string;
  special_instructions?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface CreateManufacturingOrderData {
  product_name: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  special_instructions?: string;
}

export const fetchManufacturingOrders = async (): Promise<ManufacturingOrder[]> => {
  const { data: orders, error } = await supabase
    .from('manufacturing_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform data with proper type casting
  return (orders || []).map(order => ({
    ...order,
    priority: order.priority as ManufacturingOrder['priority'],
    status: order.status as ManufacturingOrder['status']
  }));
};

export const createManufacturingOrder = async (data: CreateManufacturingOrderData): Promise<ManufacturingOrder> => {
  const { data: orderNumber, error: orderNumberError } = await supabase
    .rpc('get_next_manufacturing_order_number');

  if (orderNumberError) throw orderNumberError;

  const { data: merchantId, error: merchantError } = await supabase
    .rpc('get_user_merchant_id');

  if (merchantError) throw merchantError;

  const { data: order, error } = await supabase
    .from('manufacturing_orders')
    .insert({
      order_number: orderNumber,
      merchant_id: merchantId,
      product_name: data.product_name,
      quantity_required: data.quantity_required,
      priority: data.priority,
      due_date: data.due_date,
      special_instructions: data.special_instructions,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...order,
    priority: order.priority as ManufacturingOrder['priority'],
    status: order.status as ManufacturingOrder['status']
  };
};

export const updateManufacturingOrder = async (orderId: string, updates: Partial<ManufacturingOrder>): Promise<ManufacturingOrder> => {
  const { data, error } = await supabase
    .from('manufacturing_orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    priority: data.priority as ManufacturingOrder['priority'],
    status: data.status as ManufacturingOrder['status']
  };
};

export const deleteManufacturingOrder = async (orderId: string): Promise<void> => {
  const { error } = await supabase
    .from('manufacturing_orders')
    .delete()
    .eq('id', orderId);

  if (error) throw error;
};
