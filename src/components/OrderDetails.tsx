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

  const handleItemStatusUpdate = async (item: OrderItemType, newStatus: OrderStatus) => {
    try {
      console.log('=== ORDER ITEM STATUS UPDATE STARTED ===');
      console.log('Updating order item status:', { itemId: item.id, newStatus });
      console.log('Order details:', { orderNumber: order.order_number, orderId: order.id });
      
      let fulfilledQuantityUpdate = item.fulfilled_quantity;
      if (newStatus === 'Delivered') {
        fulfilledQuantityUpdate = item.quantity;
      } else if (newStatus === 'Created') {
        fulfilledQuantityUpdate = 0;
      }

      console.log('Updating database with:', { 
        status: newStatus, 
        fulfilled_quantity: fulfilledQuantityUpdate 
      });

      const { error } = await supabase
        .from('order_items')
        .update({ 
          status: newStatus,
          fulfilled_quantity: fulfilledQuantityUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Order item status updated successfully in database');

      // Enhanced debugging for activity logging
      console.log('=== ACTIVITY LOGGING DEBUG START ===');
      console.log('logActivity function type:', typeof logActivity);
      console.log('logActivity function exists:', !!logActivity);
      console.log('logActivity function:', logActivity);
      
      if (logActivity) {
        console.log('✅ logActivity function is available');
        
        const activityDescription = `Order item ${item.suborder_id} status changed from "${item.status}" to "${newStatus}"`;
        
        console.log('📝 About to call logActivity with parameters:');
        console.log('  action:', 'Status Updated');
        console.log('  entityType:', 'Order Item');
        console.log('  entityId:', item.suborder_id);
        console.log('  description:', activityDescription);
        
        try {
          console.log('🚀 Executing logActivity function...');
          
          const logResult = await logActivity(
            'Status Updated',
            'Order Item',
            item.suborder_id,
            activityDescription
          );
          
          console.log('✅ logActivity call completed');
          console.log('📊 Activity log result:', logResult);
          console.log('=== ACTIVITY LOGGING DEBUG END ===');
          
          toast({
            title: 'Success',
            description: 'Order item status updated and logged',
          });
          
        } catch (activityError) {
          console.error('❌ Activity logging failed:');
          console.error('Error type:', typeof activityError);
          console.error('Error message:', activityError?.message);
          console.error('Full error:', activityError);
          console.log('=== ACTIVITY LOGGING DEBUG END (WITH ERROR) ===');
          
          toast({
            title: 'Partial Success',
            description: 'Status updated but activity logging failed',
            variant: 'destructive',
          });
        }
      } else {
        console.error('❌ logActivity function is not available');
        console.log('Available from useActivityLog hook:', { logActivity });
        console.log('=== ACTIVITY LOGGING DEBUG END (NO FUNCTION) ===');
        
        toast({
          title: 'Warning',
          description: 'Status updated but logging failed',
          variant: 'destructive',
        });
      }

      await onOrderUpdate();
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      
    } catch (error) {
      console.error('Error updating order item status:', error);
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
