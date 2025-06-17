
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCheck, Truck, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useQueryClient } from '@tanstack/react-query';
import { OrderStatus, OrderItem as OrderItemType } from '@/hooks/useOrders';
import { Progress } from "@/components/ui/progress";

interface OrderDetailsProps {
  order: any;
  onOrderUpdate: () => void;
}

const OrderDetails = ({ order, onOrderUpdate }: OrderDetailsProps) => {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const queryClient = useQueryClient();

  console.log('OrderDetails - Full order data:', order);
  console.log('OrderDetails - Customer data:', order.customers);

  const calculateOverallOrderStatus = (orderItems: OrderItemType[]): OrderStatus => {
    const statuses = orderItems.map(item => item.status);
    console.log('Calculating overall status from item statuses:', statuses);
    
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    if (statuses.every(s => s === "Ready")) return "Ready";
    if (statuses.some(s => s === "In Progress" || s === "Partially Fulfilled")) return "In Progress";
    if (statuses.every(s => s === "Created")) return "Created";
    if (statuses.some(s => s !== "Created")) return "In Progress";
    
    return "Created";
  };

  const handleItemStatusUpdate = async (item: OrderItemType, newStatus: OrderStatus) => {
    try {
      console.log('=== Starting order item status update ===');
      console.log('Item ID:', item.id);
      console.log('Old status:', item.status);
      console.log('New status:', newStatus);
      console.log('Order ID:', order.id);
      console.log('Order number:', order.order_number);
      
      let fulfilledQuantityUpdate = item.fulfilled_quantity;
      if (newStatus === 'Delivered') {
        fulfilledQuantityUpdate = item.quantity;
      } else if (newStatus === 'Created') {
        fulfilledQuantityUpdate = 0;
      }

      console.log('Fulfilled quantity update:', fulfilledQuantityUpdate);

      // Step 1: Update the order item status
      console.log('Step 1: Updating order item in database...');
      const { error: itemError } = await supabase
        .from('order_items')
        .update({ 
          status: newStatus,
          fulfilled_quantity: fulfilledQuantityUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (itemError) {
        console.error('❌ Order item update failed:', itemError);
        throw new Error(`Failed to update order item: ${itemError.message}`);
      }

      console.log('✅ Order item updated successfully');

      // Step 2: Fetch fresh order items to calculate overall status
      console.log('Step 2: Fetching fresh order items...');
      const { data: freshOrderItems, error: fetchError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (fetchError) {
        console.error('❌ Failed to fetch fresh order items:', fetchError);
        throw new Error(`Failed to fetch order items: ${fetchError.message}`);
      }

      console.log('✅ Fresh order items fetched:', freshOrderItems?.length, 'items');

      // Update the specific item in the fresh data
      const updatedOrderItems = freshOrderItems.map(freshItem => 
        freshItem.id === item.id 
          ? { ...freshItem, status: newStatus, fulfilled_quantity: fulfilledQuantityUpdate }
          : freshItem
      );

      // Step 3: Calculate new overall order status
      console.log('Step 3: Calculating new overall order status...');
      const newOrderStatus = calculateOverallOrderStatus(updatedOrderItems);
      console.log('✅ Calculated new order status:', newOrderStatus);

      // Step 4: Update the overall order status in the database
      console.log('Step 4: Updating overall order status in database...');
      const { data: updatedOrder, error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: newOrderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)
        .select('*')
        .single();

      if (orderError) {
        console.error('❌ Order status update failed:', orderError);
        throw new Error(`Failed to update order status: ${orderError.message}`);
      }

      console.log('✅ Order status updated successfully:', updatedOrder);

      // Step 5: Log activities
      console.log('Step 5: Logging activities...');
      try {
        const itemDescription = `Order item ${item.suborder_id} status changed from "${item.status}" to "${newStatus}"`;
        
        console.log('Logging item status change...');
        await logActivity(
          'Status Updated',
          'Order Item',
          item.suborder_id,
          itemDescription
        );
        console.log('✅ Item activity logged');

        const orderDescription = `Order ${order.order_number} status updated to "${newOrderStatus}" based on item status changes`;
        
        console.log('Logging order status change...');
        await logActivity(
          'Status Updated',
          'Order',
          order.order_number,
          orderDescription
        );
        console.log('✅ Order activity logged');
        
        toast({
          title: 'Success',
          description: `Order item and overall order status updated successfully`,
        });
        
      } catch (activityError) {
        console.error('❌ Activity logging failed:', activityError);
        
        toast({
          title: 'Partial Success',
          description: 'Status updated but activity logging failed',
          variant: 'destructive',
        });
      }

      // Step 6: Refresh data
      console.log('Step 6: Refreshing data...');
      await onOrderUpdate();
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      console.log('✅ Data refreshed');
      
      console.log('=== Order item status update completed successfully ===');
      
    } catch (error) {
      console.error('❌ Error updating order item status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order item status',
        variant: 'destructive',
      });
    }
  };

  
  return (
    <div className="space-y-2 max-w-full">
      {/* Order Summary - Compact vertical layout */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Order Number:</Label>
              <div className="font-semibold">{order.order_number}</div>
            </div>
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Customer:</Label>
              <div className="font-semibold">
                {order.customers?.name || 'Customer data not available'}
              </div>
            </div>
            {order.customers?.phone && (
              <div className="flex justify-between">
                <Label className="text-xs text-gray-500">Phone:</Label>
                <div>{order.customers.phone}</div>
              </div>
            )}
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Total Amount:</Label>
              <div className="font-semibold">₹{order.total_amount.toLocaleString()}</div>
            </div>
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Order Date:</Label>
              <div>{new Date(order.created_at).toLocaleDateString()}</div>
            </div>
            {order.expected_delivery && (
              <div className="flex justify-between">
                <Label className="text-xs text-gray-500">Expected Delivery:</Label>
                <div>{new Date(order.expected_delivery).toLocaleDateString()}</div>
              </div>
            )}
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Order Status:</Label>
              <Badge variant="secondary" className="text-xs">
                {order.status || 'Created'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items - Compact table with smaller font sizes */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1.5">
            {order.order_items.map((item: OrderItemType) => {
              const sizeValue = item.product_configs?.size_value || 'N/A';
              const weightRange = item.product_configs?.weight_range || 'N/A';
              const sizeWeight = `${sizeValue}" / ${weightRange}`;
              const fulfillmentProgress = item.quantity > 0 ? (item.fulfilled_quantity / item.quantity) * 100 : 0;
              
              return (
                <div key={item.id} className="p-2 border border-gray-200 rounded bg-gray-50 space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium text-blue-600">{item.suborder_id}</div>
                    <Badge variant="secondary" className="text-xs h-4 px-1">{item.status}</Badge>
                  </div>
                  
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Product Code:</span>
                      <span className="font-medium">{item.product_configs?.product_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span>{item.product_configs?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span>{item.product_configs?.subcategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size & Weight:</span>
                      <span>{sizeWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-gray-500">Fulfilled:</span>
                      <span className="font-medium">{item.fulfilled_quantity} / {item.quantity}</span>
                    </div>
                    {item.quantity > 0 && (item.fulfilled_quantity > 0 || item.status === 'Partially Fulfilled' || item.status === 'Delivered') && (
                       <Progress value={fulfillmentProgress} className="h-1.5 w-full mt-0.5" />
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Unit Price:</span>
                      <span>₹{item.unit_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sub Amount:</span>
                      <span className="font-medium">₹{item.total_price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="pt-1 border-t border-gray-300">
                    <Select 
                      value={item.status}
                      onValueChange={(value) => handleItemStatusUpdate(item, value as OrderStatus)}
                    >
                      <SelectTrigger className="w-full h-6 text-xs">
                        <SelectValue placeholder={`Update status (${item.status})`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Created">Created</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Partially Fulfilled">Partially Fulfilled</SelectItem>
                        <SelectItem value="Ready">Ready</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
