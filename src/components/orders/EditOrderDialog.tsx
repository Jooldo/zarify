
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
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import OrderItemForm from './OrderItemForm';

interface EditOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onOrderUpdate: () => void;
}

interface OrderFormItem {
  productCode: string;
  quantity: number;
  price: string;
}

const EditOrderDialog = ({ isOpen, onClose, order, onOrderUpdate }: EditOrderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [newItems, setNewItems] = useState<OrderFormItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (order && isOpen) {
      setCustomerName(order.customer?.name || '');
      setCustomerPhone(order.customer?.phone || '');
      setExpectedDelivery(order.expected_delivery ? new Date(order.expected_delivery).toISOString().split('T')[0] : '');
      setOrderItems(order.order_items || []);
      setNewItems([]);
    }
  }, [order, isOpen]);

  const addNewItem = () => {
    setNewItems([...newItems, {
      productCode: '',
      quantity: 1,
      price: ''
    }]);
  };

  const removeNewItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const updateNewItem = (index: number, field: string, value: any) => {
    const updatedItems = newItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setNewItems(updatedItems);
  };

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

  const deleteOrderItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setOrderItems(orderItems.filter(item => item.id !== itemId));
      toast({
        title: 'Success',
        description: 'Suborder deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting order item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete suborder',
        variant: 'destructive',
      });
    }
  };

  const deleteEntireOrder = async () => {
    try {
      setLoading(true);
      
      // Delete order items first
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order.id);

      if (itemsError) throw itemsError;

      // Delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (orderError) throw orderError;

      toast({
        title: 'Success',
        description: 'Order deleted successfully',
      });

      onOrderUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    const existingTotal = orderItems.reduce((total, item) => total + Number(item.total_price || 0), 0);
    const newTotal = newItems.reduce((total, item) => {
      const price = item.price === '' ? 0 : Number(item.price);
      return total + (price * item.quantity);
    }, 0);
    return existingTotal + newTotal;
  };

  const generateSuborderId = (itemIndex: number) => {
    const existingCount = orderItems.length;
    const newIndex = existingCount + itemIndex + 1;
    const orderNum = order.order_number.replace('OD', '');
    return `S-OD${orderNum}-${String(newIndex).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting order update for order:', order.id);
      console.log('Customer ID:', order.customer?.id);

      // Update customer information - ensure we have a valid customer ID
      if (order.customer?.id) {
        const { error: customerError } = await supabase
          .from('customers')
          .update({
            name: customerName,
            phone: customerPhone
          })
          .eq('id', order.customer.id);

        if (customerError) {
          console.error('Customer update error:', customerError);
          throw customerError;
        }
      }

      // Add new order items
      if (newItems.length > 0) {
        const validNewItems = newItems.filter(item => item.productCode && item.quantity > 0);
        
        for (let i = 0; i < validNewItems.length; i++) {
          const item = validNewItems[i];
          const unitPrice = item.price === '' ? 0 : Number(item.price);
          const totalPrice = unitPrice * item.quantity;
          
          // Find product config
          const { data: productConfig, error: configError } = await supabase
            .from('product_configs')
            .select('id')
            .eq('product_code', item.productCode)
            .single();

          if (configError) {
            console.error('Product config error:', configError);
            throw configError;
          }

          const suborderId = generateSuborderId(i);

          const { error: itemError } = await supabase
            .from('order_items')
            .insert({
              order_id: order.id,
              product_config_id: productConfig.id,
              quantity: item.quantity,
              unit_price: unitPrice,
              total_price: totalPrice,
              suborder_id: suborderId,
              merchant_id: order.merchant_id,
              status: 'Created'
            });

          if (itemError) {
            console.error('Order item insert error:', itemError);
            throw itemError;
          }
        }
      }

      // Update existing order items - ensure all required fields are present
      for (const item of orderItems) {
        if (!item.id) {
          console.warn('Skipping item without ID:', item);
          continue;
        }

        const updateData = {
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          total_price: Number(item.total_price) || 0,
          status: item.status || 'Created'
        };

        console.log('Updating order item:', item.id, updateData);

        const { error: itemError } = await supabase
          .from('order_items')
          .update(updateData)
          .eq('id', item.id);

        if (itemError) {
          console.error('Order item update error:', itemError);
          throw itemError;
        }
      }

      // Update order - properly handle optional expected_delivery
      const totalAmount = calculateTotalAmount();
      const orderUpdateData: any = {
        total_amount: totalAmount,
        updated_date: new Date().toISOString().split('T')[0]
      };

      // Only add expected_delivery if it has a value
      if (expectedDelivery) {
        orderUpdateData.expected_delivery = expectedDelivery;
      }

      console.log('Updating order:', order.id, orderUpdateData);

      const { error: orderError } = await supabase
        .from('orders')
        .update(orderUpdateData)
        .eq('id', order.id);

      if (orderError) {
        console.error('Order update error:', orderError);
        throw orderError;
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm">Edit Order - {order?.order_number}</DialogTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-6 text-xs">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Delete Order
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this entire order? This action cannot be undone and will remove all suborders.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteEntireOrder} className="bg-red-600 hover:bg-red-700">
                    Delete Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="customerName" className="text-xs">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-7 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-xs">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expectedDelivery" className="text-xs">Expected Delivery Date</Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Existing Order Items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Existing Suborders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={item.id} className="p-2 border border-gray-200 rounded bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-gray-600">
                      {item.suborder_id} - {item.product_config?.product_code}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="h-5 w-5 p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Suborder</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this suborder? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteOrderItem(item.id)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className="h-6 text-xs"
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
                        className="h-6 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={item.status}
                        onValueChange={(value) => updateOrderItem(index, 'status', value)}
                      >
                        <SelectTrigger className="h-6 text-xs">
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
                        className="h-6 text-xs bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* New Order Items */}
          {newItems.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">New Suborders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {newItems.map((item, index) => (
                  <OrderItemForm
                    key={index}
                    item={item}
                    index={index}
                    suborderId={generateSuborderId(index)}
                    updateItem={updateNewItem}
                    removeItem={removeNewItem}
                    canRemove={true}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Add New Item Button */}
          <div className="flex justify-center">
            <Button type="button" onClick={addNewItem} variant="outline" size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add New Suborder
            </Button>
          </div>

          {/* Total Amount */}
          <div className="border-t pt-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Total Order Amount:</span>
              <span>₹{calculateTotalAmount().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-between pt-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm" className="h-7 text-xs">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Delete Order
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this entire order? This action cannot be undone and will remove all suborders.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteEntireOrder} className="bg-red-600 hover:bg-red-700">
                    Delete Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} size="sm" className="h-7 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 text-xs" disabled={loading}>
                {loading ? 'Updating...' : 'Update Order'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
