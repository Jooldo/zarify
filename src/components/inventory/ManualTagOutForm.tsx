import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { useFinishedGoods } from '@/hooks/useFinishedGoods'; // For product list
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { Minus, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type OrderStatus } from '@/hooks/useOrders'; 

interface OrderItem {
  id: string;
  suborder_id: string;
  quantity: number;
  fulfilled_quantity: number; 
  status: OrderStatus; 
  product_config_id: string;
  product_configs: { 
    product_code: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string; 
  total_amount: number;
  order_items: OrderItem[];
}

interface ManualTagOutFormProps {
  onOperationComplete?: () => void;
}

const ManualTagOutForm = ({ onOperationComplete }: ManualTagOutFormProps) => {
  const [productId, setProductId] = useState(''); // This is product_config_id
  const [netWeight, setNetWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [quantityToTagOut, setQuantityToTagOut] = useState('');
  const [customerId, setCustomerId] = useState('');
  
  const [allCustomerOrders, setAllCustomerOrders] = useState<Order[]>([]); // All orders for customer
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]); // Orders filtered by product
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const { manualTagOut } = useInventoryTags();
  const { finishedGoods } = useFinishedGoods(); 
  const { customers } = useCustomerAutocomplete();
  const { toast } = useToast();

  const fetchCustomerOrders = useCallback(async (custId: string) => {
    if (!custId) return;
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
        .eq('customer_id', custId)
        .in('status', ['Created', 'In Progress', 'Partially Fulfilled'])
        .order('created_at', { ascending: false });

      if (error) throw error;
       const mappedData = data?.map(order => ({
        ...order,
        order_items: order.order_items.map((item: any) => ({
          ...item,
          product_configs: item.product_config 
        }))
      })) || [];
      setAllCustomerOrders(mappedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customer orders',
        variant: 'destructive',
      });
      setAllCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [toast]);

  useEffect(() => {
    if (customerId) {
      fetchCustomerOrders(customerId);
    } else {
      setAllCustomerOrders([]);
      setFilteredOrders([]);
    }
  }, [customerId, fetchCustomerOrders]);

  useEffect(() => {
    if (productId && allCustomerOrders.length > 0) {
      const productFiltered = allCustomerOrders
        .map(order => ({
          ...order,
          order_items: order.order_items.filter(
            item => item.product_config_id === productId &&
                    (item.status !== 'Delivered' && item.fulfilled_quantity < item.quantity) // Only show items needing fulfillment
          ),
        }))
        .filter(order => order.order_items.length > 0);
      setFilteredOrders(productFiltered);
      setSelectedOrderId('');
      setSelectedOrderItemId('');
    } else {
      setFilteredOrders([]);
    }
  }, [productId, allCustomerOrders]);
  
  const selectedProductConfigData = finishedGoods.find(fg => fg.product_config_id === productId);

  const handleManualTagOut = async () => {
    if (!productId || !quantityToTagOut || !customerId || !selectedOrderId || !selectedOrderItemId) {
      toast({
        title: 'Error',
        description: 'Product, Quantity, Customer, Order, and Item are required.',
        variant: 'destructive',
      });
      return;
    }

    const qty = parseInt(quantityToTagOut);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: 'Error', description: 'Quantity must be a positive number.', variant: 'destructive' });
      return;
    }
    
    const order = filteredOrders.find(o => o.id === selectedOrderId);
    const item = order?.order_items.find(i => i.id === selectedOrderItemId);

    if (!item) {
        toast({ title: 'Error', description: 'Selected order item not found.', variant: 'destructive' });
        return;
    }
    if (item.status === 'Delivered' || item.fulfilled_quantity >= item.quantity) {
      toast({ title: 'Info', description: 'This order item is already fully fulfilled/delivered.', variant: 'default' });
      return;
    }
    const remainingToFulfill = item.quantity - item.fulfilled_quantity;
    if (qty > remainingToFulfill) {
      toast({
        title: 'Error',
        description: `Quantity to tag out (${qty}) exceeds remaining needed (${remainingToFulfill}) for this item.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await manualTagOut(
        productId, // This should be product_config_id, ensure manualTagOut uses this. The `productId` state variable IS product_config_id
        qty,
        customerId,
        selectedOrderId,
        selectedOrderItemId,
        netWeight ? parseFloat(netWeight) : undefined,
        grossWeight ? parseFloat(grossWeight) : undefined
      );
      
      setNetWeight('');
      setGrossWeight('');
      setQuantityToTagOut('');
      
      if (customerId) await fetchCustomerOrders(customerId); 
      
      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      console.error('Error processing manual tag out:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = filteredOrders.find(order => order.id === selectedOrderId);
  const selectedOrderItem = selectedOrder?.order_items.find(item => item.id === selectedOrderItemId);


  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="productCode" className="text-xs">Product Code *</Label>
        <Select 
            value={productId} 
            onValueChange={(value) => {
                setProductId(value);
                setFilteredOrders([]);
                setSelectedOrderId('');
                setSelectedOrderItemId('');
            }}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select product..." />
          </SelectTrigger>
          <SelectContent>
            {finishedGoods.map((fg) => ( 
              <SelectItem key={fg.product_config_id} value={fg.product_config_id}>
                {fg.product_code} - {fg.product_config.subcategory} ({fg.product_config.size_value}")
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedProductConfigData && (
         <div className="p-2 border border-blue-200 bg-blue-50 rounded text-xs text-blue-700">
            Selected Product: <strong>{selectedProductConfigData.product_code}</strong>
        </div>
      )}


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
        <Label htmlFor="customer" className="text-xs">Customer Name *</Label>
        <Select 
            value={customerId} 
            onValueChange={(value) => {
                setCustomerId(value);
                setFilteredOrders([]); 
                setSelectedOrderId(''); 
                setSelectedOrderItemId(''); 
            }}
            disabled={!productId} // Enable only after product is selected
        >
          <SelectTrigger className="h-8" disabled={!productId}>
            <SelectValue placeholder={!productId ? "Select product first..." : "Select customer..."} />
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


      {customerId && productId && (
        <div className="space-y-1">
          <Label htmlFor="order" className="text-xs">Order (for {selectedProductConfigData?.product_code || 'selected product'})</Label>
          <Select 
            value={selectedOrderId} 
            onValueChange={(value) => {
              setSelectedOrderId(value);
              setSelectedOrderItemId(''); 
            }}
            disabled={loadingOrders || filteredOrders.length === 0}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={loadingOrders ? "Loading orders..." : (filteredOrders.length === 0 ? `No active orders for this product` : "Select order...")} />
            </SelectTrigger>
            <SelectContent>
              {filteredOrders.map((order) => (
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

      {selectedOrder && productId && (
        <div className="space-y-1">
          <Label htmlFor="suborder" className="text-xs">Sub-order (Item: {selectedProductConfigData?.product_code || 'selected product'})</Label>
          <Select 
            value={selectedOrderItemId} 
            onValueChange={setSelectedOrderItemId} 
            disabled={selectedOrder.order_items.length === 0}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={selectedOrder.order_items.length === 0 ? `No items of this product in order` : "Select sub-order..."} />
            </SelectTrigger>
            <SelectContent>
              {selectedOrder.order_items.map((item) => {
                const remainingToFulfill = item.quantity - item.fulfilled_quantity;
                return (
                    <SelectItem 
                        key={item.id} 
                        value={item.id} 
                        disabled={item.status === 'Delivered' || remainingToFulfill <= 0}
                    >
                    <div className="flex flex-col text-xs">
                        <div className="flex items-center gap-1">
                        <span>{item.suborder_id}</span>
                        <span className="text-muted-foreground">({item.product_configs.product_code})</span>
                        <Badge variant={item.status === 'Delivered' ? "default" : "secondary"} className="text-xs px-1 h-4">
                            {item.status}
                        </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                        Ordered: {item.quantity}, Fulfilled: {item.fulfilled_quantity} (Need: {remainingToFulfill})
                        </div>
                        {remainingToFulfill <= 0 && <span className="text-green-600 text-xs">Fully fulfilled</span>}
                    </div>
                    </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedOrderItem && (
        <div className="text-xs text-blue-600 p-2 border border-blue-200 bg-blue-50 rounded mt-2 flex flex-col gap-1">
            <p className="font-medium">Selected for Manual Tag Out:</p>
            <p>Product: <strong>{selectedOrderItem.product_configs.product_code}</strong>, Qty: {quantityToTagOut}</p>
            <p>Order: {selectedOrder?.order_number}, Item: {selectedOrderItem.suborder_id}</p>
            <p>Status: {selectedOrderItem.status}, Fulfilled: {selectedOrderItem.fulfilled_quantity} / {selectedOrderItem.quantity}</p>
             {(selectedOrderItem.status === 'Delivered' || selectedOrderItem.fulfilled_quantity >= selectedOrderItem.quantity) && 
              <p className="text-green-600 font-medium flex items-center gap-1"><Info className="h-3 w-3"/>This item is fully fulfilled.</p>
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
        <p>• Select product, then customer to view their active orders for that product.</p>
        <p>• Enter quantity to tag out and choose the specific order item.</p>
        <p>• Items marked 'Delivered' or fully fulfilled cannot be selected.</p>
      </div>
    </div>
  );
};

export default ManualTagOutForm;
