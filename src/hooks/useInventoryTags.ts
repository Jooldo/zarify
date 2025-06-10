
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryTag {
  id: string;
  tag_id: string;
  product_id: string;
  quantity: number;
  status: string;
  qr_code_data: string | null;
  created_at: string;
  used_at: string | null;
  used_by: string | null;
  operation_type: string | null;
  merchant_id: string;
  net_weight?: number;
  gross_weight?: number;
  customer_id?: string;
  order_id?: string;
  suborder_id?: string;
}

export const useInventoryTags = () => {
  const [tags, setTags] = useState<InventoryTag[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_tags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching inventory tags:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory tags',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTag = async (productId: string, quantity: number) => {
    try {
      // Get next tag ID
      const { data: tagIdData, error: tagIdError } = await supabase.rpc('get_next_tag_id');
      if (tagIdError) throw tagIdError;

      const tagId = tagIdData;
      const qrCodeData = JSON.stringify({
        tag_id: tagId,
        product_id: productId,
        quantity: quantity,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('inventory_tags')
        .insert({
          tag_id: tagId,
          product_id: productId,
          quantity: quantity,
          qr_code_data: qrCodeData,
          merchant_id: (await supabase.rpc('get_user_merchant_id')).data
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Tag ${tagId} generated successfully`,
      });

      await fetchTags();
      return data;
    } catch (error) {
      console.error('Error generating tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate tag',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const processTagOperation = async (
    tagId: string, 
    operationType: 'Tag In' | 'Tag Out', 
    additionalData?: any
  ) => {
    try {
      // Get tag details
      const { data: tag, error: tagError } = await supabase
        .from('inventory_tags')
        .select('*, finished_goods!inner(product_code, current_stock)')
        .eq('tag_id', tagId)
        .single();

      if (tagError) throw tagError;
      if (!tag) throw new Error('Tag not found');

      // Check if tag has already been used for this operation
      if (tag.status === 'Used' && tag.operation_type === operationType) {
        throw new Error(`Tag has already been used for ${operationType}`);
      }

      const currentStock = tag.finished_goods.current_stock;
      const quantity = tag.quantity;
      
      // Calculate new stock based on operation
      let newStock: number;
      if (operationType === 'Tag In') {
        newStock = currentStock + quantity;
      } else {
        if (currentStock < quantity) {
          throw new Error('Insufficient stock for Tag Out operation');
        }
        newStock = currentStock - quantity;
      }

      // Get user profile for audit log
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User';

      // Update finished goods stock
      const { error: stockError } = await supabase
        .from('finished_goods')
        .update({ current_stock: newStock })
        .eq('id', tag.product_id);

      if (stockError) throw stockError;

      // Prepare tag update data
      const tagUpdateData: any = {
        status: 'Used',
        operation_type: operationType,
        used_at: new Date().toISOString(),
        used_by: (await supabase.auth.getUser()).data.user?.id
      };

      // Add additional data based on operation type
      if (operationType === 'Tag In' && additionalData) {
        tagUpdateData.net_weight = additionalData.netWeight;
        tagUpdateData.gross_weight = additionalData.grossWeight;
        // Update quantity if provided in Tag In
        if (additionalData.quantity) {
          tagUpdateData.quantity = additionalData.quantity;
        }
      } else if (operationType === 'Tag Out' && additionalData) {
        tagUpdateData.customer_id = additionalData.customerId;
        tagUpdateData.order_id = additionalData.orderId;
        tagUpdateData.suborder_id = additionalData.suborderId;
      }

      // Update tag status
      const { error: tagUpdateError } = await supabase
        .from('inventory_tags')
        .update(tagUpdateData)
        .eq('id', tag.id);

      if (tagUpdateError) throw tagUpdateError;

      // Create audit log entry
      const auditData: any = {
        tag_id: tagId,
        product_id: tag.product_id,
        action: operationType,
        quantity: quantity,
        previous_stock: currentStock,
        new_stock: newStock,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        user_name: userName,
        merchant_id: tag.merchant_id
      };

      // Add additional audit data
      if (operationType === 'Tag In' && additionalData) {
        auditData.net_weight = additionalData.netWeight;
        auditData.gross_weight = additionalData.grossWeight;
      } else if (operationType === 'Tag Out' && additionalData) {
        auditData.customer_id = additionalData.customerId;
        auditData.order_id = additionalData.orderId;
        auditData.suborder_id = additionalData.suborderId;
      }

      const { error: auditError } = await supabase
        .from('tag_audit_log')
        .insert(auditData);

      if (auditError) throw auditError;

      let successMessage = `${operationType}: ${operationType === 'Tag In' ? '+' : '-'}${quantity} units of ${tag.finished_goods.product_code}`;
      
      if (operationType === 'Tag In' && additionalData) {
        successMessage += ` (Net: ${additionalData.netWeight}kg, Gross: ${additionalData.grossWeight}kg)`;
      } else if (operationType === 'Tag Out' && additionalData) {
        successMessage += ` → Order assigned`;
      }

      toast({
        title: 'Success',
        description: successMessage,
      });

      await fetchTags();
      return { tag, newStock };
    } catch (error) {
      console.error('Error processing tag operation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process tag operation',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    generateTag,
    processTagOperation,
    refetch: fetchTags
  };
};
