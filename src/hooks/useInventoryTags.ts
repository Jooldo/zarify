
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInventoryLogging } from '@/hooks/useInventoryLogging';

export interface InventoryTag {
  id: string;
  product_id: string;
  quantity: number;
  net_weight?: number;
  gross_weight?: number;
  created_at: string;
  updated_at: string;
}

export interface TagProductInfo {
  product_config_id: string;
  product_code: string;
  tag_quantity: number;
}

export const useInventoryTags = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logTagOperation } = useInventoryLogging();

  const processTagOperation = async (tagId: string, operation: 'Tag In' | 'Tag Out', customerId?: string, orderId?: string, orderItemId?: string) => {
    try {
      setLoading(true);

      // Fetch tag data
      const { data: tagData, error: tagError } = await supabase
        .from('inventory_tags')
        .select('*')
        .eq('tag_id', tagId)
        .single();

      if (tagError) {
        console.error('Error fetching tag:', tagError);
        throw tagError;
      }

      if (!tagData) {
        throw new Error('Tag not found');
      }

      // Update tag status
      const { error: updateError } = await supabase
        .from('inventory_tags')
        .update({ 
          status: operation === 'Tag In' ? 'active' : 'inactive',
          customer_id: customerId,
          order_id: orderId,
          order_item_id: orderItemId
        })
        .eq('tag_id', tagId);

      if (updateError) {
        console.error('Error updating tag status:', updateError);
        throw updateError;
      }

      // Update finished goods stock
      if (tagData && tagData.product_id) {
        // Get product code for logging
        const { data: finishedGood } = await supabase
          .from('finished_goods')
          .select('product_code')
          .eq('id', tagData.product_id)
          .single();

        if (finishedGood?.product_code) {
          await logTagOperation(operation, tagId, finishedGood.product_code, tagData.quantity);
        }
      }

      toast({
        title: 'Success',
        description: `Tag ${tagId} ${operation.toLowerCase()} operation successful!`,
      });
    } catch (error) {
      console.error('Error processing tag operation:', error);
      toast({
        title: 'Error',
        description: 'Failed to process tag operation.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTagProductConfigByTagId = async (tagId: string): Promise<TagProductInfo | null> => {
    try {
      const { data: tagData, error: tagError } = await supabase
        .from('inventory_tags')
        .select(`
          quantity,
          finished_goods!inner(
            product_config_id,
            product_code
          )
        `)
        .eq('tag_id', tagId)
        .single();

      if (tagError) {
        console.error('Error fetching tag product info:', tagError);
        toast({
          title: 'Error',
          description: 'Tag not found or invalid.',
          variant: 'destructive',
        });
        return null;
      }

      if (!tagData) {
        toast({
          title: 'Error',
          description: 'Tag not found.',
          variant: 'destructive',
        });
        return null;
      }

      return {
        product_config_id: tagData.finished_goods.product_config_id,
        product_code: tagData.finished_goods.product_code,
        tag_quantity: tagData.quantity
      };
    } catch (error) {
      console.error('Error getting tag product config:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify tag.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const manualTagIn = async (productId: string, quantity: number, netWeight?: number, grossWeight?: number) => {
    try {
      setLoading(true);

      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError || !merchantId) {
        throw new Error('Could not get merchant ID');
      }

      // Get next tag ID
      const { data: tagId, error: tagIdError } = await supabase
        .rpc('get_next_tag_id');

      if (tagIdError || !tagId) {
        throw new Error('Could not generate tag ID');
      }

      // Insert new tag
      const { data: newTag, error: tagError } = await supabase
        .from('inventory_tags')
        .insert({
          tag_id: tagId,
          merchant_id: merchantId,
          product_id: productId,
          quantity: quantity,
          net_weight: netWeight,
          gross_weight: grossWeight,
          status: 'active',
        })
        .select('*')
        .single();

      if (tagError) {
        console.error('Error creating tag:', tagError);
        throw tagError;
      }

      // Get product code for logging
      const { data: finishedGood } = await supabase
        .from('finished_goods')
        .select('product_code')
        .eq('id', productId)
        .single();

      if (finishedGood?.product_code) {
        await logTagOperation('Tag In', 'MANUAL', finishedGood.product_code, quantity);
      }

      toast({
        title: 'Success',
        description: `Manually tagged in ${quantity} units with tag ID ${newTag.tag_id}!`,
      });
    } catch (error) {
      console.error('Error during manual tag in:', error);
      toast({
        title: 'Error',
        description: 'Failed to manually tag in inventory.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const manualTagOut = async (productId: string, quantity: number, customerId?: string, orderId?: string) => {
    try {
      setLoading(true);

      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError || !merchantId) {
        throw new Error('Could not get merchant ID');
      }

      // Get next tag ID
      const { data: tagId, error: tagIdError } = await supabase
        .rpc('get_next_tag_id');

      if (tagIdError || !tagId) {
        throw new Error('Could not generate tag ID');
      }

      // Create a new tag for the tag out
      const { data: newTag, error: tagError } = await supabase
        .from('inventory_tags')
        .insert({
          tag_id: tagId,
          merchant_id: merchantId,
          product_id: productId,
          quantity: -quantity, // Use negative quantity for tag out
          status: 'inactive',
          customer_id: customerId,
          order_id: orderId,
        })
        .select('*')
        .single();

      if (tagError) {
        console.error('Error creating tag:', tagError);
        throw tagError;
      }

      // Get product code for logging
      const { data: finishedGood } = await supabase
        .from('finished_goods')
        .select('product_code')
        .eq('id', productId)
        .single();

      if (finishedGood?.product_code) {
        await logTagOperation('Tag Out', 'MANUAL', finishedGood.product_code, quantity);
      }

      toast({
        title: 'Success',
        description: `Manually tagged out ${quantity} units!`,
      });
    } catch (error) {
      console.error('Error during manual tag out:', error);
      toast({
        title: 'Error',
        description: 'Failed to manually tag out inventory.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    processTagOperation,
    getTagProductConfigByTagId,
    manualTagIn,
    manualTagOut,
  };
};
