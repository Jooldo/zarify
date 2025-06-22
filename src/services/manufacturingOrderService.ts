
import { supabase } from '@/integrations/supabase/client';
import { CreateManufacturingOrderData, ManufacturingOrder } from '@/types/manufacturingOrders';

export const fetchManufacturingOrders = async (): Promise<ManufacturingOrder[]> => {
  const { data: merchantId, error: merchantError } = await supabase
    .rpc('get_user_merchant_id');

  if (merchantError) throw merchantError;

  const { data: orders, error } = await supabase
    .from('manufacturing_orders')
    .select(`
      *,
      product_configs(
        product_code,
        category,
        subcategory,
        size_value,
        weight_range,
        product_config_materials(
          id,
          quantity_required,
          unit,
          raw_material_id,
          raw_materials(
            id,
            name,
            current_stock,
            unit
          )
        )
      )
    `)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return orders || [];
};

export const createManufacturingOrder = async (data: CreateManufacturingOrderData) => {
  console.log('🏭 Creating manufacturing order:', data);

  const { data: merchantId, error: merchantError } = await supabase
    .rpc('get_user_merchant_id');

  if (merchantError) {
    console.error('Error getting merchant ID:', merchantError);
    throw merchantError;
  }

  console.log('🏪 Merchant ID:', merchantId);

  // Check raw material stock before creating order (only for non-rework orders)
  if (!data.parent_order_id && data.product_config_id) {
    console.log('🔍 Checking raw material requirements...');
    const { data: materialRequirements, error: materialError } = await supabase
      .from('product_config_materials')
      .select(`
        quantity_required,
        raw_materials(
          id,
          name,
          current_stock,
          unit
        )
      `)
      .eq('product_config_id', data.product_config_id);

    if (materialError) {
      console.error('Error fetching material requirements:', materialError);
      throw materialError;
    }

    console.log('📦 Material requirements:', materialRequirements);

    // Log current stock levels before creation
    if (materialRequirements) {
      materialRequirements.forEach(req => {
        const requiredQty = req.quantity_required * data.quantity_required;
        console.log(`📊 Material: ${req.raw_materials?.name}, Required: ${requiredQty}, Available: ${req.raw_materials?.current_stock}`);
      });
    }
  }

  // Use database function to generate unique order number
  try {
    let orderNumber: string;
    
    if (data.parent_order_id) {
      // For rework orders, get parent order number first
      const { data: parentOrder, error: parentError } = await supabase
        .from('manufacturing_orders')
        .select('order_number')
        .eq('id', data.parent_order_id)
        .single();
      
      if (parentError) {
        console.error('Error getting parent order:', parentError);
        throw parentError;
      }
      
      console.log('🔄 Parent order number:', parentOrder.order_number);
      
      // Use database function to generate rework order number
      const { data: reworkOrderNumber, error: reworkError } = await supabase
        .rpc('get_next_rework_order_number', { base_order_number: parentOrder.order_number });
      
      if (reworkError) {
        console.error('Error generating rework order number:', reworkError);
        throw reworkError;
      }
      
      orderNumber = reworkOrderNumber;
      console.log('📝 Generated rework order number:', orderNumber);
    } else {
      // Use database function to generate regular order number
      const { data: regularOrderNumber, error: regularError } = await supabase
        .rpc('get_next_manufacturing_order_number');
      
      if (regularError) {
        console.error('Error generating regular order number:', regularError);
        throw regularError;
      }
      
      orderNumber = regularOrderNumber;
      console.log('📝 Generated regular order number:', orderNumber);
    }

    console.log('🚀 Attempting to create order with number:', orderNumber);

    // Create the order
    const { data: order, error } = await supabase
      .from('manufacturing_orders')
      .insert({
        order_number: orderNumber,
        product_name: data.product_name,
        product_config_id: data.product_config_id,
        quantity_required: data.quantity_required,
        priority: data.priority,
        due_date: data.due_date,
        special_instructions: data.special_instructions,
        merchant_id: merchantId,
        parent_order_id: data.parent_order_id,
        rework_source_step_id: data.rework_source_step_id,
        rework_quantity: data.rework_quantity,
        assigned_to_step: data.assigned_to_step,
        rework_reason: data.rework_reason,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating manufacturing order:', error);
      throw error;
    }

    console.log('✅ Manufacturing order created successfully:', order);

    // Check stock levels after creation to verify deduction (only for non-rework orders)
    if (!data.parent_order_id && data.product_config_id) {
      console.log('🔍 Checking stock levels after order creation...');
      const { data: materialRequirements } = await supabase
        .from('product_config_materials')
        .select('raw_material_id')
        .eq('product_config_id', data.product_config_id);

      if (materialRequirements && materialRequirements.length > 0) {
        const { data: updatedMaterials, error: updatedError } = await supabase
          .from('raw_materials')
          .select('id, name, current_stock, in_manufacturing')
          .in('id', materialRequirements.map(req => req.raw_material_id));

        if (updatedError) {
          console.error('Error fetching updated materials:', updatedError);
        } else {
          console.log('📊 Updated material stock levels:', updatedMaterials);
        }
      }
    }

    return order;

  } catch (error: any) {
    console.error('❌ Error creating manufacturing order:', error);
    throw error;
  }
};

export const updateManufacturingOrder = async (orderId: string, updates: Partial<ManufacturingOrder>) => {
  const { error } = await supabase
    .from('manufacturing_orders')
    .update(updates)
    .eq('id', orderId);

  if (error) throw error;
};

export const deleteManufacturingOrder = async (orderId: string) => {
  const { error } = await supabase
    .from('manufacturing_orders')
    .delete()
    .eq('id', orderId);

  if (error) throw error;
};
