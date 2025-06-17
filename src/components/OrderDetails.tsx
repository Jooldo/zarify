
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

  // Calculate order status based on order items
  const calculateOrderStatus = (orderItems: OrderItemType[]): OrderStatus => {
    console.log('=== CALCULATING ORDER STATUS ===');
    console.log('Order items received:', orderItems?.length);
    console.log('Items with statuses:', orderItems?.map(i => ({ id: i.id, suborder_id: i.suborder_id, status: i.status })));
    
    if (!orderItems || orderItems.length === 0) {
      console.log('No order items found, returning Created');
      return "Created";
    }
    
    const statuses = orderItems.map(item => item.status);
    console.log('All item statuses:', statuses);
    
    // Count statuses
    const statusCounts = {
      Created: statuses.filter(s => s === "Created").length,
      InProgress: statuses.filter(s => s === "In Progress").length,
      PartiallyFulfilled: statuses.filter(s => s === "Partially Fulfilled").length,
      Ready: statuses.filter(s => s === "Ready").length,
      Delivered: statuses.filter(s => s === "Delivered").length
    };
    
    console.log('Status counts:', statusCounts);
    
    // All items delivered
    if (statusCounts.Delivered === orderItems.length) {
      console.log('All items delivered -> Order status: Delivered');
      return "Delivered";
    }
    
    // All items ready
    if (statusCounts.Ready === orderItems.length) {
      console.log('All items ready -> Order status: Ready');
      return "Ready";
    }
    
    // Any item in progress, partially fulfilled, ready, or delivered
    if (statusCounts.InProgress > 0 || statusCounts.PartiallyFulfilled > 0 || statusCounts.Ready > 0 || statusCounts.Delivered > 0) {
      console.log('Some items in progress/partially fulfilled/ready/delivered -> Order status: In Progress');
      return "In Progress";
    }
    
    // All items created
    console.log('All items still created -> Order status: Created');
    return "Created";
  };

  const handleItemStatusUpdate = async (item: OrderItemType, newStatus: OrderStatus) => {
    try {
      console.log('=== STARTING ITEM STATUS UPDATE ===');
      console.log('Item ID:', item.id);
      console.log('Suborder ID:', item.suborder_id);
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

      console.log('Updating fulfilled quantity from', item.fulfilled_quantity, 'to', fulfilledQuantityUpdate);

      // Update order item status
      console.log('Updating order item in database...');
      const { data: updatedItem, error: itemError } = await supabase
        .from('order_items')
        .update({ 
          status: newStatus,
          fulfilled_quantity: fulfilledQuantityUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
        .select('*')
        .single();

      if (itemError) {
        console.error('Database error updating order item:', itemError);
        throw itemError;
      }

      console.log('Order item updated successfully:', updatedItem);

      // Get fresh order items from database to calculate new order status
      console.log('Fetching fresh order items from database...');
      const { data: freshOrderItems, error: fetchError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (fetchError) {
        console.error('Error fetching fresh order items:', fetchError);
        throw fetchError;
      }

      console.log('Fresh order items fetched:', freshOrderItems?.length);
      console.log('Fresh items statuses:', freshOrderItems?.map(i => ({ id: i.id, status: i.status })));
      
      const newOrderStatus = calculateOrderStatus(freshOrderItems || []);
      console.log('Current order status:', order.status);
      console.log('Calculated new order status:', newOrderStatus);

      // Update order status if it changed
      if (order.status !== newOrderStatus) {
        console.log('Order status needs updating from', order.status, 'to', newOrderStatus);
        
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
          console.error('Database error updating order status:', orderError);
          throw orderError;
        }

        console.log('Order status updated successfully in database:', updatedOrder);
        
        toast({
          title: 'Success',
          description: `Order status updated to ${newOrderStatus}`,
        });
      } else {
        console.log('Order status unchanged, no database update needed');
      }

      // Log activity
      try {
        const description = `Order item ${item.suborder_id} status changed from "${item.status}" to "${newStatus}"`;
        
        await logActivity(
          'Status Updated',
          'Order Item',
          item.suborder_id,
          description
        );
        
        console.log('Activity logged successfully');
        
        toast({
          title: 'Success',
          description: 'Order item status updated successfully',
        });
        
      } catch (activityError) {
        console.error('Activity logging failed:', activityError);
        
        toast({
          title: 'Partial Success',
          description: 'Status updated but activity logging failed',
          variant: 'destructive',
        });
      }

      // Refresh all related data
      console.log('Refreshing data...');
      await onOrderUpdate();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      console.log('Data refresh completed');
      console.log('=== ITEM STATUS UPDATE COMPLETED ===');
      
    } catch (error) {
      console.error('=== ERROR IN ITEM STATUS UPDATE ===');
      console.error('Error details:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order item status',
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
              <div className="font-semibold">{order.customers?.name}</div>
            </div>
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
              <Badge variant="secondary" className="text-xs h-4 px-1">{order.status || 'Created'}</Badge>
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
