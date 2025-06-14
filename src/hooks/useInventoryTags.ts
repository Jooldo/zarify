import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { type OrderStatus } from '@/hooks/useOrders'; // Import OrderStatus type

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
  net_weight: number | null;
  gross_weight: number | null;
  customer_id: string | null;
  order_id: string | null;
  order_item_id: string | null;
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

  const generateTag = async (
    productId: string, 
    quantity: number, 
    netWeight?: number, 
    grossWeight?: number
  ) => {
    try {
      // Get next tag ID
      const { data: tagIdData, error: tagIdError } = await supabase.rpc('get_next_tag_id');
      if (tagIdError) throw tagIdError;

      const tagId = tagIdData;
      const qrCodeData = JSON.stringify({
        tag_id: tagId,
        product_id: productId,
        quantity: quantity,
        net_weight: netWeight,
        gross_weight: grossWeight,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('inventory_tags')
        .insert({
          tag_id: tagId,
          product_id: productId,
          quantity: quantity,
          net_weight: netWeight,
          gross_weight: grossWeight,
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

  const manualTagIn = async (
    productId: string,
    quantity: number,
    netWeight?: number,
    grossWeight?: number
  ) => {
    try {
      // Get product details and current stock
      const { data: product, error: productError } = await supabase
        .from('finished_goods')
        .select('*, product_configs!inner(product_code)')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (!product) throw new Error('Product not found');

      const currentStock = product.current_stock;
      const newStock = currentStock + quantity;

      // Get user profile for audit log
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User';

      // Generate manual tag ID
      const manualTagId = `MAN-IN-${Date.now()}`;

      // Update finished goods stock
      const { error: stockError } = await supabase
        .from('finished_goods')
        .update({ 
          current_stock: newStock,
          updated_at: new Date().toISOString() 
        })
        .eq('id', productId);

      if (stockError) throw stockError;

      // Create manual tag record
      const { error: tagError } = await supabase
        .from('inventory_tags')
        .insert({
          tag_id: manualTagId,
          product_id: productId,
          quantity: quantity,
          net_weight: netWeight,
          gross_weight: grossWeight,
          status: 'Manual Tag In',
          operation_type: 'Manual Tag In',
          used_at: new Date().toISOString(),
          used_by: (await supabase.auth.getUser()).data.user?.id,
          merchant_id: (await supabase.rpc('get_user_merchant_id')).data
        });

      if (tagError) throw tagError;

      // Create audit log entry
      const { error: auditError } = await supabase
        .from('tag_audit_log')
        .insert({
          tag_id: manualTagId,
          product_id: productId,
          action: 'Manual Tag In',
          quantity: quantity,
          previous_stock: currentStock,
          new_stock: newStock,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          user_name: userName,
          merchant_id: (await supabase.rpc('get_user_merchant_id')).data
        });

      if (auditError) throw auditError;

      toast({
        title: 'Success',
        description: `Manual Tag In: +${quantity} units of ${product.product_configs.product_code}`,
      });

      await fetchTags();
      return { product, newStock };
    } catch (error) {
      console.error('Error processing manual tag in:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process manual tag in',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const manualTagOut = async (
    productId: string,
    quantity: number,
    customerId: string,
    orderId: string,
    orderItemId: string,
    netWeight?: number,
    grossWeight?: number
  ) => {
    try {
      // Get product details and current stock
      const { data: product, error: productError } = await supabase
        .from('finished_goods')
        .select('*, product_configs!inner(product_code)')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (!product) throw new Error('Product not found');

      const currentStock = product.current_stock;
      
      if (currentStock < quantity) {
        throw new Error('Insufficient stock for manual tag out operation');
      }

      const newStock = currentStock - quantity;

      // Get user profile for audit log
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User';

      // Generate manual tag ID
      const manualTagId = `MAN-OUT-${Date.now()}`;

      // Update finished goods stock
      const { error: stockError } = await supabase
        .from('finished_goods')
        .update({ 
          current_stock: newStock,
          updated_at: new Date().toISOString() 
        })
        .eq('id', productId);

      if (stockError) throw stockError;

      // Create manual tag record
      const { error: tagError } = await supabase
        .from('inventory_tags')
        .insert({
          tag_id: manualTagId,
          product_id: productId,
          quantity: quantity,
          net_weight: netWeight,
          gross_weight: grossWeight,
          status: 'Manual Tag Out',
          operation_type: 'Manual Tag Out',
          customer_id: customerId,
          order_id: orderId,
          order_item_id: orderItemId,
          used_at: new Date().toISOString(),
          used_by: (await supabase.auth.getUser()).data.user?.id,
          merchant_id: (await supabase.rpc('get_user_merchant_id')).data
        });

      if (tagError) throw tagError;

      // Create audit log entry
      const { error: auditError } = await supabase
        .from('tag_audit_log')
        .insert({
          tag_id: manualTagId,
          product_id: productId,
          action: 'Manual Tag Out',
          quantity: quantity,
          previous_stock: currentStock,
          new_stock: newStock,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          user_name: userName,
          merchant_id: (await supabase.rpc('get_user_merchant_id')).data
        });

      if (auditError) throw auditError;

      // NEW: Update order item fulfilled quantity and status
      if (orderItemId) {
        const { data: orderItem, error: orderItemError } = await supabase
          .from('order_items')
          .select('id, quantity, fulfilled_quantity, status')
          .eq('id', orderItemId)
          .single();

        if (orderItemError) throw new Error(`Error fetching order item: ${orderItemError.message}`);
        if (!orderItem) throw new Error('Order item not found.');

        if ((orderItem.fulfilled_quantity + quantity) > orderItem.quantity) {
          throw new Error('Tagging out this quantity would exceed the ordered amount for this item.');
        }

        const newFulfilledQuantity = orderItem.fulfilled_quantity + quantity;
        let newOrderItemStatus: OrderStatus = orderItem.status as OrderStatus;

        if (newFulfilledQuantity >= orderItem.quantity) {
          newOrderItemStatus = 'Delivered';
        } else if (newFulfilledQuantity > 0) {
          newOrderItemStatus = 'Partially Fulfilled';
        }
        // If newFulfilledQuantity is 0, status doesn't change by tag-out logic (as quantity is > 0)
        // or remains as is if it was e.g. 'Created' and fulfillment is still 0.

        const dbStatus = newOrderItemStatus === 'Progress' ? 'In Progress' : newOrderItemStatus;

        const { error: updateError } = await supabase
          .from('order_items')
          .update({
            fulfilled_quantity: newFulfilledQuantity,
            status: dbStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderItemId);

        if (updateError) throw new Error(`Error updating order item: ${updateError.message}`);
        
        toast({
          title: 'Order Item Updated',
          description: `Order item ${orderItem.id.substring(0,6)} marked as ${newOrderItemStatus}, fulfilled ${newFulfilledQuantity}/${orderItem.quantity}.`,
        });
      }

      toast({
        title: 'Success',
        description: `Manual Tag Out: -${quantity} units of ${product.product_configs.product_code}. Order item updated.`,
      });

      await fetchTags(); // Refetch tags, order refetch will be handled by caller via onOperationComplete
      return { product, newStock };
    } catch (error) {
      console.error('Error processing manual tag out:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process manual tag out',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const processTagOperation = async (
    tagId: string, 
    operationType: 'Tag In' | 'Tag Out',
    customerId?: string,
    orderId?: string,
    orderItemId?: string
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

      // Update tag status with customer and order information for tag out
      const updateData: any = {
        status: 'Used',
        operation_type: operationType,
        used_at: new Date().toISOString(),
        used_by: (await supabase.auth.getUser()).data.user?.id
      };

      if (operationType === 'Tag Out' && customerId && orderId && orderItemId) {
        updateData.customer_id = customerId;
        updateData.order_id = orderId;
        updateData.order_item_id = orderItemId;
      }

      const { error: tagUpdateError } = await supabase
        .from('inventory_tags')
        .update(updateData)
        .eq('id', tag.id);

      if (tagUpdateError) throw tagUpdateError;

      // Create audit log entry
      const { error: auditError } = await supabase
        .from('tag_audit_log')
        .insert({
          tag_id: tagId,
          product_id: tag.product_id,
          action: operationType,
          quantity: quantity,
          previous_stock: currentStock,
          new_stock: newStock,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          user_name: userName,
          merchant_id: tag.merchant_id
        });

      if (auditError) throw auditError;

      // NEW: Update order item fulfilled quantity and status if 'Tag Out' and orderItemId is provided
      if (operationType === 'Tag Out' && orderItemId) {
        const { data: orderItem, error: orderItemError } = await supabase
          .from('order_items')
          .select('id, quantity, fulfilled_quantity, status')
          .eq('id', orderItemId)
          .single();

        if (orderItemError) throw new Error(`Error fetching order item: ${orderItemError.message}`);
        if (!orderItem) throw new Error('Order item not found.');
        
        const tagQuantity = tag.quantity; // Quantity from the tag

        if ((orderItem.fulfilled_quantity + tagQuantity) > orderItem.quantity) {
          // This case needs careful consideration: Tag has more items than needed.
          // For now, we'll throw an error. A more advanced system might partially use the tag
          // or allow splitting, but that's beyond current scope.
          throw new Error('Tag quantity exceeds remaining needed for this order item. Operation aborted.');
        }

        const newFulfilledQuantity = orderItem.fulfilled_quantity + tagQuantity;
        let newOrderItemStatus: OrderStatus = orderItem.status as OrderStatus;

        if (newFulfilledQuantity >= orderItem.quantity) {
          newOrderItemStatus = 'Delivered';
        } else if (newFulfilledQuantity > 0) {
          newOrderItemStatus = 'Partially Fulfilled';
        }

        const dbStatus = newOrderItemStatus === 'Progress' ? 'In Progress' : newOrderItemStatus;

        const { error: updateError } = await supabase
          .from('order_items')
          .update({
            fulfilled_quantity: newFulfilledQuantity,
            status: dbStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderItemId);

        if (updateError) throw new Error(`Error updating order item: ${updateError.message}`);

        toast({
          title: 'Order Item Updated',
          description: `Order item ${orderItem.id.substring(0,6)} marked as ${newOrderItemStatus}, fulfilled ${newFulfilledQuantity}/${orderItem.quantity}.`,
        });
      }

      toast({
        title: 'Success',
        description: `${operationType}: ${operationType === 'Tag In' ? '+' : '-'}${tag.quantity} units of ${tag.finished_goods.product_code}. ${operationType === 'Tag Out' && orderItemId ? "Order item updated." : ""}`,
      });

      await fetchTags(); // Refetch tags, order refetch will be handled by caller
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
    manualTagIn,
    manualTagOut,
    refetch: fetchTags
  };
};
