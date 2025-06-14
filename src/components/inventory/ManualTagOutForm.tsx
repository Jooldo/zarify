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

interface ManualTagOutFormProps {
  onOperationComplete?: () => void;
}

const ManualTagOutForm = ({ onOperationComplete }: ManualTagOutFormProps) => {
  const [productId, setProductId] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [quantityToTagOut, setQuantityToTagOut] = useState(''); // Renamed for clarity
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
       const mappedData = data?.map(order => ({
        ...order,
        order_items: order.order_items.map((item: any) => ({
          ...item,
          product_configs: item.product_config 
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
      setSelectedOrderId(''); // Reset order when customer changes
      setSelectedOrderItemId(''); // Reset item when customer changes
    } else {
      setOrders([]);
    }
  }, [customerId]);
  
  const selectedOrder = orders.find(order => order.id === selectedOrderId);
  const selectedOrderItem = selectedOrder?.order_items.find(item => item.id === selectedOrderItemId);

  const handleManualTagOut = async () => {
    if (!productId || !quantityToTagOut || !customerId || !selectedOrderId || !selectedOrderItemId) {
      toast({
        title: 'Error',
        description: 'All fields except weights are required for manual tag out',
        variant: 'destructive',
      });
      return;
    }

    const qty = parseInt(quantityToTagOut);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: 'Error', description: 'Quantity must be a positive number.', variant: 'destructive' });
      return;
    }
    
    if (selectedOrderItem) {
      if (selectedOrderItem.status === 'Delivered' || selectedOrderItem.fulfilled_quantity >= selectedOrderItem.quantity) {
        toast({ title: 'Info', description: 'This order item is already fully fulfilled/delivered.', variant: 'default' });
        return;
      }
      const remainingToFulfill = selectedOrderItem.quantity - selectedOrderItem.fulfilled_quantity;
      if (qty > remainingToFulfill) {
        toast({
          title: 'Error',
          description: `Quantity to tag out (${qty}) exceeds remaining needed (${remainingToFulfill}) for this item.`,
          variant: 'destructive',
        });
        return;
      }
    } else {
        toast({ title: 'Error', description: 'Selected order item not found.', variant: 'destructive' });
        return;
    }


    setLoading(true);
    try {
      await manualTagOut(
        productId,
        qty,
        customerId,
        selectedOrderId,
        selectedOrderItemId,
        netWeight ? parseFloat(netWeight) : undefined,
        grossWeight ? parseFloat(grossWeight) : undefined
      );
      
      setProductId('');
      setNetWeight('');
      setGrossWeight('');
      setQuantityToTagOut('');
      // Keep customer, order, item selected for potentially more tag outs
      // or reset based on preference. For now, only clearing input fields.
      // Re-fetch orders to update displayed fulfilled quantity:
      if (customerId) fetchCustomerOrders(customerId);
      
      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      // Error toast handled by useInventoryTags
      console.error('Error processing manual tag out:', error);
    } finally {
      setLoading(false);
    }
  };


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
        <Label htmlFor="quantityToTagOut" className="text-xs">Quantity to Tag Out *</Label>
        <Input
          id="quantityToTagOut"
          type="number"
          value={quantityToTagOut}
          onChange={(e) => setQuantityToTagOut(e.target.value)}
          placeholder="Enter quantity..."
          className="h-8"
          min="1"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="customer" className="text-xs">Customer Name</Label>
        <Select value={customerId} onValueChange={(value) => {
          setCustomerId(value);
          setSelectedOrderId(''); 
          setSelectedOrderItemId(''); 
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
              setSelectedOrderItemId(''); 
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
        <div className="text-xs text-blue-600 p-2 border border-blue-200 bg-blue-50 rounded mt-2">
            Selected: {selectedOrderItem.suborder_id} ({selectedOrderItem.product_configs.product_code})
            <br />
            Status: {selectedOrderItem.status}, Fulfilled: {selectedOrderItem.fulfilled_quantity} / {selectedOrderItem.quantity}
             {(selectedOrderItem.status === 'Delivered' || selectedOrderItem.fulfilled_quantity >= selectedOrderItem.quantity) && 
              <p className="text-green-600 font-medium">This item is fully fulfilled.</p>
            }
        </div>
      )}

      <Button 
        onClick={handleManualTagOut} 
        disabled={
            loading || 
            !productId || 
            !quantityToTagOut || 
            !customerId || 
            !selectedOrderId || 
            !selectedOrderItemId || 
            (selectedOrderItem?.status === 'Delivered') ||
            (selectedOrderItem && selectedOrderItem.fulfilled_quantity >= selectedOrderItem.quantity)
        }
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
        <p>• Associate with specific customer orders for tracking fulfillment</p>
        <p>• Items marked 'Delivered' or fully fulfilled cannot be selected.</p>
      </div>
    </div>
  );
};

export default ManualTagOutForm;
