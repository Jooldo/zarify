
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
import { useQueryClient } from '@tanstack/react-query';
import { OrderStatus, OrderItem as OrderItemType } from '@/hooks/useOrders';
import { Progress } from "@/components/ui/progress";

interface OrderDetailsProps {
  order: any;
  onOrderUpdate: () => void;
}

const OrderDetails = ({ order, onOrderUpdate }: OrderDetailsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('OrderDetails - Full order object:', order);
  console.log('OrderDetails - Order items:', order.order_items);

  const calculateOverallOrderStatus = (orderItems: OrderItemType[]): OrderStatus => {
    const statuses = orderItems.map(item => item.status);
    console.log('calculateOverallOrderStatus - Item statuses:', statuses);
    
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    if (statuses.every(s => s === "Ready")) return "Ready";
    if (statuses.some(s => s === "In Progress" || s === "Partially Fulfilled")) return "In Progress";
    if (statuses.every(s => s === "Created")) return "Created";
    if (statuses.some(s => s !== "Created")) return "In Progress";
    
    return "Created";
  };

  const handleItemStatusUpdate = async (item: OrderItemType, newStatus: OrderStatus) => {
    console.log('handleItemStatusUpdate - Starting update:', { 
      itemId: item.id, 
      oldStatus: item.status, 
      newStatus,
      orderId: order.id,
      orderNumber: order.order_number
    });

    try {
      let fulfilledQuantityUpdate = item.fulfilled_quantity;
      if (newStatus === 'Delivered') {
        fulfilledQuantityUpdate = item.quantity;
      } else if (newStatus === 'Created') {
        fulfilledQuantityUpdate = 0;
      }

      console.log('handleItemStatusUpdate - Updating item with:', {
        status: newStatus,
        fulfilled_quantity: fulfilledQuantityUpdate
      });

      // Update the order item status and fulfilled quantity
      const { error: itemError } = await supabase
        .from('order_items')
        .update({ 
          status: newStatus,
          fulfilled_quantity: fulfilledQuantityUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (itemError) {
        console.error('handleItemStatusUpdate - Item update error:', itemError);
        throw itemError;
      }

      console.log('handleItemStatusUpdate - Item updated successfully');

      // Fetch all order items to calculate new overall status
      const { data: allOrderItems, error: fetchError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (fetchError) {
        console.error('handleItemStatusUpdate - Fetch error:', fetchError);
        throw fetchError;
      }

      console.log('handleItemStatusUpdate - All order items fetched:', allOrderItems);

      // Update the specific item in the fetched data
      const updatedOrderItems = allOrderItems.map(orderItem => 
        orderItem.id === item.id 
          ? { ...orderItem, status: newStatus, fulfilled_quantity: fulfilledQuantityUpdate }
          : orderItem
      );

      // Calculate new overall order status
      const newOrderStatus = calculateOverallOrderStatus(updatedOrderItems);
      const oldOrderStatus = order.status || 'Created';

      console.log('handleItemStatusUpdate - Status calculation:', {
        oldOrderStatus,
        newOrderStatus,
        shouldUpdate: oldOrderStatus !== newOrderStatus
      });

      // Update the overall order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: newOrderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (orderError) {
        console.error('handleItemStatusUpdate - Order update error:', orderError);
        throw orderError;
      }

      console.log('handleItemStatusUpdate - Order status updated successfully');

      // Log order item status update
      console.log('handleItemStatusUpdate - Logging item status update...');
      const { error: itemLogError } = await supabase.rpc('log_user_activity', {
        p_action: 'Item Status Updated',
        p_entity_type: 'Order Item',
        p_entity_id: order.id,
        p_description: `Order ${order.order_number} item ${item.product_configs?.product_code || 'Unknown'} status changed from ${item.status} to ${newStatus}`
      });

      if (itemLogError) {
        console.error('handleItemStatusUpdate - Item log error:', itemLogError);
      } else {
        console.log('handleItemStatusUpdate - Item activity logged successfully');
      }

      // Log order status update if it changed
      if (oldOrderStatus !== newOrderStatus) {
        console.log('handleItemStatusUpdate - Logging order status update...');
        const { error: orderLogError } = await supabase.rpc('log_user_activity', {
          p_action: 'Status Updated',
          p_entity_type: 'Order',
          p_entity_id: order.id,
          p_description: `Order ${order.order_number} status changed from ${oldOrderStatus} to ${newOrderStatus}`
        });

        if (orderLogError) {
          console.error('handleItemStatusUpdate - Order log error:', orderLogError);
        } else {
          console.log('handleItemStatusUpdate - Order activity logged successfully');
        }
      }
      
      toast({
        title: 'Success',
        description: `Item status updated to ${newStatus}`,
      });

      console.log('handleItemStatusUpdate - Refreshing data...');
      // Refresh data
      await onOrderUpdate();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
    } catch (error) {
      console.error('handleItemStatusUpdate - Full error:', error);
      toast({
        title: 'Error',
        description: `Failed to update status: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Get customer data with proper fallbacks
  const getCustomerData = () => {
    console.log('getCustomerData - Order structure check:', {
      hasCustomers: !!order.customers,
      hasCustomer: !!order.customer,
      hasCustomerName: !!order.customer_name,
      customersData: order.customers,
      customerData: order.customer,
      customerName: order.customer_name,
      customerPhone: order.customer_phone
    });

    let customerName = 'Unknown Customer';
    let customerPhone = '';
    
    // Try different possible customer data structures
    if (order.customers && order.customers.name) {
      customerName = order.customers.name;
      customerPhone = order.customers.phone || '';
      console.log('getCustomerData - Using order.customers');
    } else if (order.customer && order.customer.name) {
      customerName = order.customer.name;
      customerPhone = order.customer.phone || '';
      console.log('getCustomerData - Using order.customer');
    } else if (order.customer_name) {
      customerName = order.customer_name;
      customerPhone = order.customer_phone || '';
      console.log('getCustomerData - Using order.customer_name');
    } else {
      console.log('getCustomerData - No customer data found, using fallback');
    }
    
    const result = {
      name: customerName,
      phone: customerPhone
    };

    console.log('getCustomerData - Final result:', result);
    return result;
  };

  const customerData = getCustomerData();
  
  return (
    <div className="space-y-2 max-w-full">
      {/* Order Summary */}
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
              <div className="font-semibold">{customerData.name}</div>
            </div>
            {customerData.phone && (
              <div className="flex justify-between">
                <Label className="text-xs text-gray-500">Phone:</Label>
                <div>{customerData.phone}</div>
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

      {/* Order Items */}
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
