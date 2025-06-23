
import { supabase } from '@/integrations/supabase/client';
import { CreateManufacturingOrderData, ManufacturingOrder } from '@/hooks/useManufacturingOrders';

export const fetchManufacturingOrders = async (): Promise<ManufacturingOrder[]> => {
  const { data: orders, error } = await supabase
    .from('manufacturing_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return orders || [];
};

export const createManufacturingOrder = async (data: CreateManufacturingOrderData): Promise<ManufacturingOrder> => {
  // Get next order number
  const { data: orderNumber, error: orderNumberError } = await supabase
    .rpc('get_next_manufacturing_order_number');

  if (orderNumberError) throw orderNumberError;

  // Get current merchant ID
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
  return order;
};

export const updateManufacturingOrder = async (orderId: string, updates: Partial<ManufacturingOrder>): Promise<ManufacturingOrder> => {
  const { data, error } = await supabase
    .from('manufacturing_orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteManufacturingOrder = async (orderId: string): Promise<void> => {
  const { error } = await supabase
    .from('manufacturing_orders')
    .delete()
    .eq('id', orderId);

  if (error) throw error;
};
