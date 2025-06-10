
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { Minus } from 'lucide-react';
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

interface ManualTagOutFormProps {
  onOperationComplete?: () => void;
}

const ManualTagOutForm = ({ onOperationComplete }: ManualTagOutFormProps) => {
  const [productId, setProductId] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [quantity, setQuantity] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const { manualTagOut } = useInventoryTags();
  const { finishedGoods } = useFinishedGoods();
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

  const handleManualTagOut = async () => {
    if (!productId || !quantity || !customerId || !selectedOrderId || !selectedOrderItemId) {
      toast({
        title: 'Error',
        description: 'All fields are required for manual tag out',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await manualTagOut(
        productId,
        parseInt(quantity),
        customerId,
        selectedOrderId,
        selectedOrderItemId,
        netWeight ? parseFloat(netWeight) : undefined,
        grossWeight ? parseFloat(grossWeight) : undefined
      );
      
      // Reset form
      setProductId('');
      setNetWeight('');
      setGrossWeight('');
      setQuantity('');
      setCustomerId('');
      setSelectedOrderId('');
      setSelectedOrderItemId('');
      setOrders([]);
      
      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      console.error('Error processing manual tag out:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = orders.find(order => order.id === selectedOrderId);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="productCode" className="text-xs">Product Code</Label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select product..." />
          </SelectTrigger>
          <SelectContent>
            {finishedGoods.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.product_code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="netWeight" className="text-xs">Net Weight (kg)</Label>
          <Input
            id="netWeight"
            type="number"
            step="0.01"
            value={netWeight}
            onChange={(e) => setNetWeight(e.target.value)}
            placeholder="0.00"
            className="h-8"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="grossWeight" className="text-xs">Gross Weight (kg)</Label>
          <Input
            id="grossWeight"
            type="number"
            step="0.01"
            value={grossWeight}
            onChange={(e) => setGrossWeight(e.target.value)}
            placeholder="0.00"
            className="h-8"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="quantity" className="text-xs">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity..."
          className="h-8"
        />
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
        onClick={handleManualTagOut} 
        disabled={loading || !productId || !quantity || !customerId || !selectedOrderId || !selectedOrderItemId}
        className="w-full h-8 text-xs"
      >
        {loading ? 'Processing...' : (
          <>
            <Minus className="h-3 w-3 mr-1" />
            Manual Tag Out
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Directly remove stock from inventory without scanning tags</p>
        <p>• Associate with specific customer orders for tracking</p>
      </div>
    </div>
  );
};

export default ManualTagOutForm;
