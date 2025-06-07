
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface EditOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onOrderUpdate: () => void;
}

const EditOrderDialog = ({ isOpen, onClose, order, onOrderUpdate }: EditOrderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (order && isOpen) {
      setCustomerName(order.customer?.name || '');
      setCustomerPhone(order.customer?.phone || '');
      setExpectedDelivery(order.expected_delivery ? new Date(order.expected_delivery).toISOString().split('T')[0] : '');
      setOrderItems(order.order_items || []);
    }
  }, [order, isOpen]);

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = orderItems.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = Number(updatedItem.quantity) * Number(updatedItem.unit_price);
        }
        return updatedItem;
      }
      return item;
    });
    setOrderItems(updatedItems);
  };

  const calculateTotalAmount = () => {
    return orderItems.reduce((total, item) => total + Number(item.total_price || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update customer information
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          name: customerName,
          phone: customerPhone
        })
        .eq('id', order.customer.id);

      if (customerError) throw customerError;

      // Update order
      const totalAmount = calculateTotalAmount();
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          total_amount: totalAmount,
          expected_delivery: expectedDelivery || null,
          updated_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Update order items
      for (const item of orderItems) {
        const { error: itemError } = await supabase
          .from('order_items')
          .update({
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            status: item.status
          })
          .eq('id', item.id);

        if (itemError) throw itemError;
      }

      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });

      onOrderUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Ready': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order - {order?.order_number}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="customerName" className="text-xs">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-xs">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="expectedDelivery" className="text-xs">Expected Delivery Date</Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={item.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-gray-600">
                      {item.suborder_id} - {item.product_config?.product_code}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unit Price (₹)</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={item.status}
                        onValueChange={(value) => updateOrderItem(index, 'status', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Created">Created</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Ready">Ready</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Total (₹)</Label>
                      <Input
                        value={`₹${(item.total_price || 0).toLocaleString()}`}
                        disabled
                        className="h-8 text-xs bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Total Order Amount:</span>
                  <span>₹{calculateTotalAmount().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} size="sm" className="h-8 text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs" disabled={loading}>
              {loading ? 'Updating...' : 'Update Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
