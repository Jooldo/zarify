import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type OrderStatus } from '@/hooks/useOrders'; // For OrderItem status typing

interface OrderItem {
  id: string;
  suborder_id: string;
  quantity: number;
  fulfilled_quantity: number; // Added
  status: OrderStatus; // Added
  product_config_id: string;
  product_configs: { // Corrected: product_config, not product_configs
    product_code: string;
  };
}
interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  order_items: OrderItem[]; // Use updated OrderItem type
}

interface TagOutFormProps {
  onOperationComplete?: () => void;
}

const TagOutForm = ({ onOperationComplete }: TagOutFormProps) => {
  const [tagId, setTagId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const { processTagOperation } = useInventoryTags();
  const { customers } = useCustomerAutocomplete();
  const { toast } = useToast();

  const fetchCustomerOrders = async (customerId: string) => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          order_items (
            id,
            suborder_id,
            quantity,
            fulfilled_quantity, 
            status,             
            product_config_id,
            product_config:product_configs ( 
              product_code
            )
          )
        `)
        .eq('customer_id', customerId)
        .in('status', ['Created', 'In Progress', 'Partially Fulfilled']) // Also allow partially fulfilled orders
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Assuming data structure matches: order_items.product_config.product_code
      // Need to map product_configs to product_config if Supabase returns it as an array
      const mappedData = data?.map(order => ({
        ...order,
        order_items: order.order_items.map((item: any) => ({
          ...item,
          product_configs: item.product_config // Ensure this matches the type, Supabase might return product_config directly
        }))
      })) || [];
      setOrders(mappedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customer orders',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerOrders(customerId);
      setSelectedOrderId('');
      setSelectedOrderItemId('');
    } else {
      setOrders([]);
    }
  }, [customerId]);

  const handleTagOut = async () => {
    if (!tagId.trim() || !customerId || !selectedOrderId || !selectedOrderItemId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Basic validation against already delivered items
    const order = orders.find(o => o.id === selectedOrderId);
    const item = order?.order_items.find(i => i.id === selectedOrderItemId);
    if (item && item.status === 'Delivered') {
        toast({ title: 'Info', description: 'This order item is already marked as Delivered.', variant: 'default' });
        return;
    }
    if (item && item.fulfilled_quantity >= item.quantity) {
      toast({ title: 'Info', description: 'This order item is already fully fulfilled.', variant: 'default' });
      return;
    }


    setLoading(true);
    try {
      await processTagOperation(
        tagId.trim(), 
        'Tag Out',
        customerId,
        selectedOrderId,
        selectedOrderItemId
      );
      
      setTagId('');
      // Keep customer, order, and item selected for potential further tag-outs on the same item,
      // or reset them if preferred. For now, let's reset tagId only.
      // Re-fetch orders to update displayed fulfilled quantity:
      if (customerId) fetchCustomerOrders(customerId);


      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      // Error toast is handled by useInventoryTags
      console.error('Error processing tag out:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = orders.find(order => order.id === selectedOrderId);
  const selectedOrderItem = selectedOrder?.order_items.find(item => item.id === selectedOrderItemId);


  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="tagId" className="text-xs">Tag ID or Scan QR Code</Label>
        <div className="relative">
          <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
          <Input
            id="tagId"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            placeholder="Enter tag ID or scan QR..."
            className="pl-7 h-8"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="customer" className="text-xs">Customer Name</Label>
        <Select value={customerId} onValueChange={(value) => {
          setCustomerId(value);
          setSelectedOrderId(''); // Reset order when customer changes
          setSelectedOrderItemId(''); // Reset item when customer changes
        }}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select customer..." />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {customerId && (
        <div className="space-y-1">
          <Label htmlFor="order" className="text-xs">Order</Label>
          <Select 
            value={selectedOrderId} 
            onValueChange={(value) => {
              setSelectedOrderId(value);
              setSelectedOrderItemId(''); // Reset item when order changes
            }}
            disabled={loadingOrders || orders.length === 0}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={loadingOrders ? "Loading orders..." : (orders.length === 0 ? "No active orders" : "Select order...")} />
            </SelectTrigger>
            <SelectContent>
              {orders.map((order) => (
                <SelectItem key={order.id} value={order.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{order.order_number}</span>
                    <Badge variant="outline" className="text-xs">{order.status}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedOrder && (
        <div className="space-y-1">
          <Label htmlFor="suborder" className="text-xs">Sub-order</Label>
          <Select value={selectedOrderItemId} onValueChange={setSelectedOrderItemId} disabled={selectedOrder.order_items.length === 0}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder={selectedOrder.order_items.length === 0 ? "No items in order" : "Select sub-order..."} />
            </SelectTrigger>
            <SelectContent>
              {selectedOrder.order_items.map((item) => (
                <SelectItem key={item.id} value={item.id} disabled={item.status === 'Delivered' || item.fulfilled_quantity >= item.quantity}>
                  <div className="flex flex-col text-xs">
                    <div className="flex items-center gap-2">
                      <span>{item.suborder_id}</span>
                      <span className="text-muted-foreground">
                        {item.product_configs.product_code}
                      </span>
                       <Badge variant={item.status === 'Delivered' ? "default" : "secondary"} className="text-xs px-1 h-4">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Ordered: {item.quantity}, Fulfilled: {item.fulfilled_quantity}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {selectedOrderItem && (
        <div className="text-xs text-blue-600 p-2 border border-blue-200 bg-blue-50 rounded">
            Selected: {selectedOrderItem.suborder_id} ({selectedOrderItem.product_configs.product_code})
            <br />
            Status: {selectedOrderItem.status}, Fulfilled: {selectedOrderItem.fulfilled_quantity} / {selectedOrderItem.quantity}
            {(selectedOrderItem.status === 'Delivered' || selectedOrderItem.fulfilled_quantity >= selectedOrderItem.quantity) && 
              <p className="text-green-600 font-medium">This item is fully fulfilled.</p>
            }
        </div>
      )}


      <Button 
        onClick={handleTagOut} 
        disabled={loading || !tagId.trim() || !customerId || !selectedOrderId || !selectedOrderItemId || (selectedOrderItem?.status === 'Delivered') || (selectedOrderItem && selectedOrderItem.fulfilled_quantity >= selectedOrderItem.quantity) }
        className="w-full h-8 text-xs"
      >
        {loading ? 'Processing...' : 'Tag Out'}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Select customer to view their active orders and sub-orders (Created, In Progress, or Partially Fulfilled)</p>
        <p>• Choose the relevant order for which the product is being tagged out</p>
        <p>• Items marked 'Delivered' or fully fulfilled cannot be selected for further tag-out.</p>
      </div>
    </div>
  );
};

export default TagOutForm;
