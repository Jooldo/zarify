
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

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  order_items: {
    id: string;
    suborder_id: string;
    quantity: number;
    product_config_id: string;
    product_configs: {
      product_code: string;
    };
  }[];
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
            product_config_id,
            product_configs (
              product_code
            )
          )
        `)
        .eq('customer_id', customerId)
        .in('status', ['Created', 'In Progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

    setLoading(true);
    try {
      await processTagOperation(
        tagId.trim(), 
        'Tag Out',
        customerId,
        selectedOrderId,
        selectedOrderItemId
      );
      
      // Reset form
      setTagId('');
      setCustomerId('');
      setSelectedOrderId('');
      setSelectedOrderItemId('');
      setOrders([]);
      
      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      console.error('Error processing tag out:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = orders.find(order => order.id === selectedOrderId);

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
        <Select value={customerId} onValueChange={setCustomerId}>
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
            onValueChange={setSelectedOrderId}
            disabled={loadingOrders}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={loadingOrders ? "Loading orders..." : "Select order..."} />
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
          <Select value={selectedOrderItemId} onValueChange={setSelectedOrderItemId}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select sub-order..." />
            </SelectTrigger>
            <SelectContent>
              {selectedOrder.order_items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{item.suborder_id}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.product_configs.product_code} (Qty: {item.quantity})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button 
        onClick={handleTagOut} 
        disabled={loading || !tagId.trim() || !customerId || !selectedOrderId || !selectedOrderItemId}
        className="w-full h-8 text-xs"
      >
        {loading ? 'Processing...' : 'Tag Out'}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Select customer to view their active orders and sub-orders</p>
        <p>• Choose the relevant order for which the product is being tagged out</p>
      </div>
    </div>
  );
};

export default TagOutForm;
