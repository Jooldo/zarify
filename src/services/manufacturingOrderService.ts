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

  // Implement manual retry with unique order number generation
  let maxAttempts = 10;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    attempt++;
    console.log(`🔄 Attempt ${attempt} to create manufacturing order`);
    
    try {
      let orderNumber: string;
      
      // Generate order number with timestamp suffix to ensure uniqueness
      if (data.parent_order_id) {
        // This is a rework order - get the parent order number first
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
        
        // Generate unique rework order number with timestamp
        const baseOrderNumber = parentOrder.order_number;
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        
        // Get the highest existing rework number for this base order
        const { data: existingReworkOrders, error: reworkOrdersError } = await supabase
          .from('manufacturing_orders')
          .select('order_number')
          .eq('merchant_id', merchantId)
          .like('order_number', `${baseOrderNumber}-R%`)
          .order('order_number', { ascending: false })
          .limit(1);

        if (reworkOrdersError) {
          console.error('Error getting existing rework orders:', reworkOrdersError);
          throw reworkOrdersError;
        }

        let nextReworkNum = 1;
        if (existingReworkOrders && existingReworkOrders.length > 0) {
          const lastReworkOrder = existingReworkOrders[0].order_number;
          const match = lastReworkOrder.match(new RegExp(`^${baseOrderNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-R(\\d+)$`));
          if (match) {
            nextReworkNum = parseInt(match[1]) + 1;
          }
        }
        
        orderNumber = `${baseOrderNumber}-R${nextReworkNum}`;
        console.log('📝 Generated rework order number:', orderNumber);
      } else {
        // Regular order - generate with timestamp and random suffix for uniqueness
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        
        // Get the highest existing order number
        const { data: existingOrders, error: ordersError } = await supabase
          .from('manufacturing_orders')
          .select('order_number')
          .eq('merchant_id', merchantId)
          .like('order_number', 'MO%')
          .not('order_number', 'like', '%-%') // Exclude rework orders
          .order('order_number', { ascending: false })
          .limit(1);

        if (ordersError) {
          console.error('Error getting existing orders:', ordersError);
          throw ordersError;
        }

        let nextNum = 1;
        if (existingOrders && existingOrders.length > 0) {
          const lastOrder = existingOrders[0].order_number;
          const match = lastOrder.match(/^MO(\d+)$/);
          if (match) {
            nextNum = parseInt(match[1]) + 1;
          }
        }
        
        orderNumber = 'MO' + String(nextNum).padStart(6, '0');
        console.log('📝 Generated regular order number:', orderNumber);
      }

      // Double-check for uniqueness before inserting
      const { data: duplicateCheck, error: duplicateError } = await supabase
        .from('manufacturing_orders')
        .select('id')
        .eq('order_number', orderNumber)
        .eq('merchant_id', merchantId)
        .maybeSingle();

      if (duplicateError) {
        console.error('Error checking for duplicates:', duplicateError);
        throw duplicateError;
      }

      if (duplicateCheck) {
        console.warn(`⚠️ Order number ${orderNumber} already exists, retrying with new number...`);
        
        if (attempt >= maxAttempts) {
          throw new Error(`Failed to generate unique order number after ${maxAttempts} attempts`);
        }
        
        // Wait before retrying with exponential backoff
        const waitTime = Math.pow(2, attempt) * 100 + Math.random() * 200;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      console.log('🚀 Attempting to create order with unique number:', orderNumber);

      // Try to insert the order
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
        // Check if it's a duplicate key constraint violation
        if (error.code === '23505' && error.message.includes('manufacturing_orders_order_number_merchant_key')) {
          console.warn(`⚠️ Duplicate key constraint violation on attempt ${attempt}, retrying...`);
          
          if (attempt >= maxAttempts) {
            console.error('❌ Max attempts reached, throwing error');
            throw new Error(`Failed to create manufacturing order after ${maxAttempts} attempts due to order number conflicts`);
          }
          
          // Wait a bit before retrying with exponential backoff
          const waitTime = Math.pow(2, attempt) * 150 + Math.random() * 300;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else {
          // Different error, throw immediately
          console.error('Error creating manufacturing order:', error);
          throw error;
        }
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
      console.error(`❌ Error on attempt ${attempt}:`, error);
      
      // If it's a constraint violation and we haven't exhausted attempts, continue
      if (error.code === '23505' && error.message.includes('manufacturing_orders_order_number_merchant_key')) {
        if (attempt >= maxAttempts) {
          throw new Error(`Failed to create manufacturing order after ${maxAttempts} attempts due to order number conflicts`);
        }
        
        const waitTime = Math.pow(2, attempt) * 150 + Math.random() * 300;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // For any other error, throw immediately
      throw error;
    }
  }

  throw new Error(`Failed to create manufacturing order after ${maxAttempts} attempts`);
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
