
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCheck, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useQueryClient } from '@tanstack/react-query';

interface OrderDetailsProps {
  order: any;
  onOrderUpdate: () => void;
}

type OrderStatus = 'Created' | 'Progress' | 'Ready' | 'Delivered';

const OrderDetails = ({ order, onOrderUpdate }: OrderDetailsProps) => {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const queryClient = useQueryClient();

  const updateOrderItemStatus = async (itemId: string, newStatus: OrderStatus) => {
    try {
      console.log('Updating order item status:', { itemId, newStatus });
      
      // Find the order item to get details for logging
      const orderItem = order.order_items.find(item => item.id === itemId);
      console.log('Order item before update:', orderItem);
      
      // Convert Progress to "In Progress" for database storage
      const dbStatus = newStatus === 'Progress' ? 'In Progress' : newStatus;
      
      const { error } = await supabase
        .from('order_items')
        .update({ 
          status: dbStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      console.log('Order item status updated successfully');

      if (orderItem) {
        await logActivity(
          'updated',
          'order',
          order.order_number,
          `changed status of suborder ${orderItem.suborder_id} from "${orderItem.status}" to "${newStatus}"`
        );
      }

      toast({
        title: 'Success',
        description: 'Order item status updated successfully',
      });

      // Always refresh orders data and invalidate related queries
      console.log('Refreshing orders data...');
      await onOrderUpdate();
      
      // Invalidate queries to trigger refetch of finished goods and raw materials
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
              <div className="font-semibold">{order.customer.name}</div>
            </div>
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Total Amount:</Label>
              <div className="font-semibold">₹{order.total_amount.toLocaleString()}</div>
            </div>
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Order Date:</Label>
              <div>{new Date(order.created_date).toLocaleDateString()}</div>
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
            {order.order_items.map((item: any) => {
              // Display size exactly as entered in product config without any conversion
              const sizeValue = item.product_config.size_value || 'N/A';
              const weightRange = item.product_config.weight_range || 'N/A';
              const sizeWeight = `${sizeValue}" / ${weightRange}`;
              
              return (
                <div key={item.id} className="p-2 border border-gray-200 rounded bg-gray-50 space-y-1">
                  {/* Header row with suborder ID and status */}
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium text-blue-600">{item.suborder_id}</div>
                    <Badge variant="secondary" className="text-xs h-4 px-1">{item.status}</Badge>
                  </div>
                  
                  {/* Product details in compact rows */}
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Product Code:</span>
                      <span className="font-medium">{item.product_config.product_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span>{item.product_config.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span>{item.product_config.subcategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size & Weight:</span>
                      <span>{sizeWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Unit Price:</span>
                      <span>₹{item.unit_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sub Amount:</span>
                      <span className="font-medium">₹{item.total_price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Status update selector */}
                  <div className="pt-1 border-t border-gray-300">
                    <Select onValueChange={(value) => updateOrderItemStatus(item.id, value as OrderStatus)}>
                      <SelectTrigger className="w-full h-6 text-xs">
                        <SelectValue placeholder={`Update status (${item.status})`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Created">Created</SelectItem>
                        <SelectItem value="Progress">Progress</SelectItem>
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
