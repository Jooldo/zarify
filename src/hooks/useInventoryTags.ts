
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
      console.log('🏷️ processTagOperation - Starting:', { tagId, operation, customerId, orderId, orderItemId });

      // Fetch tag data
      const { data: tagData, error: tagError } = await supabase
        .from('inventory_tags')
        .select('*')
        .eq('tag_id', tagId)
        .single();

      if (tagError) {
        console.error('❌ processTagOperation - Error fetching tag:', tagError);
        throw tagError;
      }

      if (!tagData) {
        console.error('❌ processTagOperation - Tag not found:', tagId);
        throw new Error('Tag not found');
      }

      console.log('✅ processTagOperation - Tag data fetched:', tagData);

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
        console.error('❌ processTagOperation - Error updating tag status:', updateError);
        throw updateError;
      }

      console.log('✅ processTagOperation - Tag status updated successfully');

      // Update finished goods stock
      if (tagData && tagData.product_id) {
        // Get product code for logging
        const { data: finishedGood } = await supabase
          .from('finished_goods')
          .select('product_code')
          .eq('id', tagData.product_id)
          .single();

        if (finishedGood?.product_code) {
          console.log('📝 processTagOperation - Logging tag operation:', { operation, tagId, productCode: finishedGood.product_code, quantity: tagData.quantity });
          await logTagOperation(operation, tagId, finishedGood.product_code, tagData.quantity);
        }
      }

      toast({
        title: 'Success',
        description: `Tag ${tagId} ${operation.toLowerCase()} operation successful!`,
      });
    } catch (error) {
      console.error('❌ processTagOperation - Full error:', error);
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
      console.log('🔍 getTagProductConfigByTagId - Starting for tagId:', tagId);
      
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
        console.error('❌ getTagProductConfigByTagId - Error fetching tag product info:', tagError);
        toast({
          title: 'Error',
          description: 'Tag not found or invalid.',
          variant: 'destructive',
        });
        return null;
      }

      if (!tagData) {
        console.error('❌ getTagProductConfigByTagId - No tag data found for:', tagId);
        toast({
          title: 'Error',
          description: 'Tag not found.',
          variant: 'destructive',
        });
        return null;
      }

      console.log('✅ getTagProductConfigByTagId - Success:', tagData);
      return {
        product_config_id: tagData.finished_goods.product_config_id,
        product_code: tagData.finished_goods.product_code,
        tag_quantity: tagData.quantity
      };
    } catch (error) {
      console.error('❌ getTagProductConfigByTagId - Error:', error);
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
      console.log('🏷️ manualTagIn - Starting:', { productId, quantity, netWeight, grossWeight });

      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError || !merchantId) {
        console.error('❌ manualTagIn - Could not get merchant ID:', merchantError);
        throw new Error('Could not get merchant ID');
      }

      console.log('✅ manualTagIn - Merchant ID obtained:', merchantId);

      // Get next tag ID
      const { data: tagId, error: tagIdError } = await supabase
        .rpc('get_next_tag_id');

      if (tagIdError || !tagId) {
        console.error('❌ manualTagIn - Could not generate tag ID:', tagIdError);
        throw new Error('Could not generate tag ID');
      }

      console.log('✅ manualTagIn - Tag ID generated:', tagId);

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
        console.error('❌ manualTagIn - Error creating tag:', tagError);
        throw tagError;
      }

      console.log('✅ manualTagIn - Tag created successfully:', newTag);

      // Get product code for logging
      const { data: finishedGood } = await supabase
        .from('finished_goods')
        .select('product_code')
        .eq('id', productId)
        .single();

      if (finishedGood?.product_code) {
        console.log('📝 manualTagIn - Logging operation for product:', finishedGood.product_code);
        await logTagOperation('Tag In', 'MANUAL', finishedGood.product_code, quantity);
      }

      toast({
        title: 'Success',
        description: `Manually tagged in ${quantity} units with tag ID ${newTag.tag_id}!`,
      });
    } catch (error) {
      console.error('❌ manualTagIn - Error during manual tag in:', error);
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

  const manualTagOut = async (productId: string, quantity: number, customerId?: string, orderId?: string, orderItemId?: string, netWeight?: number, grossWeight?: number) => {
    try {
      setLoading(true);
      console.log('🏷️ manualTagOut - Starting:', { productId, quantity, customerId, orderId, orderItemId, netWeight, grossWeight });

      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError || !merchantId) {
        console.error('❌ manualTagOut - Could not get merchant ID:', merchantError);
        throw new Error('Could not get merchant ID');
      }

      console.log('✅ manualTagOut - Merchant ID obtained:', merchantId);

      // Get next tag ID
      const { data: tagId, error: tagIdError } = await supabase
        .rpc('get_next_tag_id');

      if (tagIdError || !tagId) {
        console.error('❌ manualTagOut - Could not generate tag ID:', tagIdError);
        throw new Error('Could not generate tag ID');
      }

      console.log('✅ manualTagOut - Tag ID generated:', tagId);

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
          order_item_id: orderItemId,
          net_weight: netWeight,
          gross_weight: grossWeight,
        })
        .select('*')
        .single();

      if (tagError) {
        console.error('❌ manualTagOut - Error creating tag:', tagError);
        throw tagError;
      }

      console.log('✅ manualTagOut - Tag created successfully:', newTag);

      // Get product code for logging
      const { data: finishedGood } = await supabase
        .from('finished_goods')
        .select('product_code')
        .eq('id', productId)
        .single();

      if (finishedGood?.product_code) {
        console.log('📝 manualTagOut - Logging operation for product:', finishedGood.product_code);
        await logTagOperation('Tag Out', 'MANUAL', finishedGood.product_code, quantity);
      }

      toast({
        title: 'Success',
        description: `Manually tagged out ${quantity} units!`,
      });
    } catch (error) {
      console.error('❌ manualTagOut - Error during manual tag out:', error);
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

  const generateTag = async (productId: string, quantity: number, netWeight?: number, grossWeight?: number) => {
    try {
      setLoading(true);
      console.log('🏷️ generateTag - Starting:', { productId, quantity, netWeight, grossWeight });

      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError || !merchantId) {
        console.error('❌ generateTag - Could not get merchant ID:', merchantError);
        throw new Error('Could not get merchant ID');
      }

      console.log('✅ generateTag - Merchant ID obtained:', merchantId);

      // Try to get next tag ID with retry logic for duplicates
      let attempts = 0;
      const maxAttempts = 5;
      let newTag = null;

      while (attempts < maxAttempts && !newTag) {
        attempts++;
        console.log(`🔄 generateTag - Attempt ${attempts} to generate unique tag ID`);

        // Get next tag ID
        const { data: tagId, error: tagIdError } = await supabase
          .rpc('get_next_tag_id');

        if (tagIdError || !tagId) {
          console.error('❌ generateTag - Could not generate tag ID:', tagIdError);
          throw new Error('Could not generate tag ID');
        }

        console.log('✅ generateTag - Tag ID generated:', tagId);

        // Check if tag already exists
        const { data: existingTag } = await supabase
          .from('inventory_tags')
          .select('tag_id')
          .eq('tag_id', tagId)
          .single();

        if (existingTag) {
          console.log('⚠️ generateTag - Tag already exists:', tagId, 'trying again...');
          continue;
        }

        // Try to insert new tag with 'active' status (since it's being generated for immediate use)
        const { data: insertedTag, error: tagError } = await supabase
          .from('inventory_tags')
          .insert({
            tag_id: tagId,
            merchant_id: merchantId,
            product_id: productId,
            quantity: quantity,
            net_weight: netWeight,
            gross_weight: grossWeight,
            status: 'active', // Changed from 'Printed' to 'active' since this is inventory being added
          })
          .select('*')
          .single();

        if (tagError) {
          if (tagError.code === '23505') {
            console.log('⚠️ generateTag - Duplicate key error, retrying with new tag ID...');
            continue;
          } else {
            console.error('❌ generateTag - Error creating tag:', tagError);
            throw tagError;
          }
        }

        newTag = insertedTag;
        console.log('✅ generateTag - Tag created successfully:', newTag);
      }

      if (!newTag) {
        throw new Error(`Failed to generate unique tag after ${maxAttempts} attempts`);
      }

      // Get product code for logging
      const { data: finishedGood } = await supabase
        .from('finished_goods')
        .select('product_code')
        .eq('id', productId)
        .single();

      if (finishedGood?.product_code) {
        console.log('📝 generateTag - Logging tag generation for product:', finishedGood.product_code);
        await logTagOperation('Tag In', newTag.tag_id, finishedGood.product_code, quantity);
      }

      toast({
        title: 'Success',
        description: `Tag ${newTag.tag_id} generated and added to inventory successfully!`,
      });

      return newTag;
    } catch (error) {
      console.error('❌ generateTag - Error generating tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate tag.',
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
    generateTag,
  };
};
