
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  product_configs?: {
    product_code: string;
    category: string;
    subcategory: string;
    size_value: number;
    weight_range?: string;
  };
}

export const useManufacturingOrders = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createOrder = async (data: CreateManufacturingOrderData) => {
    try {
      setIsCreating(true);
      console.log('🏭 Creating manufacturing order:', data);

      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        throw merchantError;
      }

      console.log('🏪 Merchant ID:', merchantId);

      // Check raw material stock before creating order
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

      const { data: order, error } = await supabase
        .from('manufacturing_orders')
        .insert({
          product_name: data.product_name,
          product_config_id: data.product_config_id,
          quantity_required: data.quantity_required,
          priority: data.priority,
          due_date: data.due_date,
          special_instructions: data.special_instructions,
          merchant_id: merchantId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating manufacturing order:', error);
        throw error;
      }

      console.log('✅ Manufacturing order created:', order);

      // Check stock levels after creation to verify deduction
      console.log('🔍 Checking stock levels after order creation...');
      const { data: updatedMaterials, error: updatedError } = await supabase
        .from('raw_materials')
        .select('id, name, current_stock, in_manufacturing')
        .in('id', materialRequirements?.map(req => req.raw_materials?.id).filter(Boolean) || []);

      if (updatedError) {
        console.error('Error fetching updated materials:', updatedError);
      } else {
        console.log('📊 Updated material stock levels:', updatedMaterials);
      }

      toast({
        title: 'Success',
        description: 'Manufacturing order created successfully',
      });

      return order;
    } catch (error: any) {
      console.error('Error in createOrder:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create manufacturing order',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createOrder,
    isCreating,
  };
};
