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

interface OrderDetailsProps {
  order: any;
  onOrderUpdate: () => void;
  onFinishedGoodsUpdate?: () => void;
}

type OrderStatus = 'Created' | 'In Progress' | 'Ready' | 'Delivered';

const OrderDetails = ({ order, onOrderUpdate, onFinishedGoodsUpdate }: OrderDetailsProps) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Created');
  const { toast } = useToast();
  const { logActivity } = useActivityLog();

  const updateOrderItemStatus = async (itemId: string, newStatus: OrderStatus) => {
    try {
      console.log('Updating order item status:', { itemId, newStatus });
      
      // Find the order item to get details for logging
      const orderItem = order.order_items.find(item => item.id === itemId);
      console.log('Order item before update:', orderItem);
      
      const { error } = await supabase
        .from('order_items')
        .update({ status: newStatus })
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

      // Refresh both orders and finished goods data with a small delay
      console.log('Refreshing data after status update...');
      await onOrderUpdate();
      
      if (onFinishedGoodsUpdate) {
        // Add a small delay to ensure the trigger has processed
        setTimeout(async () => {
          console.log('Refreshing finished goods data...');
          await onFinishedGoodsUpdate();
        }, 500);
      }
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
    <div className="space-y-4">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Order Number</Label>
              <div className="font-bold">{order.order_number}</div>
            </div>
            <div>
              <Label>Customer Name</Label>
              <div className="font-bold">{order.customer.name}</div>
            </div>
            <div>
              <Label>Order Date</Label>
              <div>{new Date(order.created_date).toLocaleDateString()}</div>
            </div>
            <div>
              <Label>Total Amount</Label>
              <div className="font-bold">₹{order.total_amount.toLocaleString()}</div>
            </div>
            <div>
              <Label>Expected Delivery</Label>
              <div>{new Date(order.expected_delivery).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suborder ID</TableHead>
                <TableHead>Product Code</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.suborder_id}</TableCell>
                  <TableCell>{item.product_config.product_code}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.unit_price.toLocaleString()}</TableCell>
                  <TableCell>₹{item.total_price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select onValueChange={(value) => updateOrderItemStatus(item.id, value as OrderStatus)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={item.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Created">Created</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Ready">Ready</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
