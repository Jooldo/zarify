import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryTags, type TagProductInfo } from '@/hooks/useInventoryTags';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { Tag, AlertCircle, CheckCircle, Info } from 'lucide-react';
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

interface TagOutFormProps {
  onOperationComplete?: () => void;
}

const TagOutForm = ({ onOperationComplete }: TagOutFormProps) => {
  const [tagIdInput, setTagIdInput] = useState('');
  const [scannedProductInfo, setScannedProductInfo] = useState<TagProductInfo | null>(null);
  const [tagScanError, setTagScanError] = useState<string | null>(null);
  const [isVerifyingTag, setIsVerifyingTag] = useState(false);
  
  const [customerId, setCustomerId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]); // All orders for customer
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]); // Orders filtered by product
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const { processTagOperation, getTagProductConfigByTagId } = useInventoryTags();
  const { customers } = useCustomerAutocomplete();
  const { toast } = useToast();

  const handleVerifyTag = async () => {
    if (!tagIdInput.trim()) {
      setTagScanError("Please enter a Tag ID.");
      setScannedProductInfo(null);
      return;
    }
    setIsVerifyingTag(true);
    setTagScanError(null);
    setScannedProductInfo(null);
    setFilteredOrders([]); // Clear previously filtered orders
    setSelectedOrderId('');
    setSelectedOrderItemId('');

    try {
      const productInfo = await getTagProductConfigByTagId(tagIdInput.trim());
      if (productInfo) {
        setScannedProductInfo(productInfo);
        // Customer dropdown will be enabled, and then orders will be fetched
      } else {
        // Error toast is handled by getTagProductConfigByTagId, or specific error can be set
        // setTagScanError(`Tag ID ${tagIdInput.trim()} not found or product info missing.`);
      }
    } catch (error) {
      // Error already toasted by hook
      // setTagScanError(error.message || "Failed to verify tag.");
      setScannedProductInfo(null);
    } finally {
      setIsVerifyingTag(false);
    }
  };
  
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
      setOrders(mappedData); // Store all customer orders
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customer orders',
        variant: 'destructive',
      });
      setOrders([]); // Reset on error
    } finally {
      setLoadingOrders(false);
    }
  }, [toast]);

  useEffect(() => {
    if (customerId) {
      fetchCustomerOrders(customerId);
    } else {
      setOrders([]);
      setFilteredOrders([]);
    }
  }, [customerId, fetchCustomerOrders]);

  useEffect(() => {
    if (scannedProductInfo && orders.length > 0) {
      const productFiltered = orders
        .map(order => ({
          ...order,
          order_items: order.order_items.filter(
            item => item.product_config_id === scannedProductInfo.product_config_id &&
                    (item.status !== 'Delivered' && item.fulfilled_quantity < item.quantity) // Only show items needing fulfillment
          ),
        }))
        .filter(order => order.order_items.length > 0); // Only include orders that have such items
      setFilteredOrders(productFiltered);
      setSelectedOrderId('');
      setSelectedOrderItemId('');
    } else {
      setFilteredOrders([]);
    }
  }, [scannedProductInfo, orders]);


  const handleTagOut = async () => {
    if (!tagIdInput.trim() || !scannedProductInfo || !customerId || !selectedOrderId || !selectedOrderItemId) {
      toast({
        title: 'Error',
        description: 'Tag ID, Product, Customer, Order, and Item must be selected.',
        variant: 'destructive',
      });
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
    if (scannedProductInfo.tag_quantity > (item.quantity - item.fulfilled_quantity)) {
      toast({
        title: 'Warning',
        description: `Tag quantity (${scannedProductInfo.tag_quantity}) is more than remaining needed for this item (${item.quantity - item.fulfilled_quantity}). Only the needed amount will be considered fulfilled.`,
        variant: 'default', // Or 'warning' if you have one
      });
      // Note: The backend processTagOperation will still use the full tag_quantity to update stock,
      // but will cap the fulfilled_quantity update on the order_item. This behavior is in useInventoryTags.
    }


    setLoading(true);
    try {
      await processTagOperation(
        tagIdInput.trim(), 
        'Tag Out',
        customerId,
        selectedOrderId,
        selectedOrderItemId
      );
      
      // Reset tag ID and scanned product, but keep customer, order, item for potential further tag-outs
      // on the same item with a *different tag*.
      setTagIdInput('');
      setScannedProductInfo(null); 
      setTagScanError(null);
      // Re-fetch orders for this customer to update displayed fulfilled quantity:
      if (customerId) await fetchCustomerOrders(customerId); // await to ensure data is fresh before UI potentially rerenders selections
      
      // After refetching, the useEffect that filters orders will run again.
      // We might need to re-select the order/item if we want to keep them selected,
      // but often it's better to clear them to force re-selection if data changed significantly.
      // For now, let's clear them to reflect the list might have changed.
      setSelectedOrderId('');
      setSelectedOrderItemId('');


      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      console.error('Error processing tag out:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = filteredOrders.find(order => order.id === selectedOrderId);
  const selectedOrderItem = selectedOrder?.order_items.find(item => item.id === selectedOrderItemId);


  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="tagId" className="text-xs">Tag ID</Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <Input
              id="tagId"
              value={tagIdInput}
              onChange={(e) => {
                setTagIdInput(e.target.value);
                setScannedProductInfo(null); // Clear product info if tag id changes
                setTagScanError(null);
                setFilteredOrders([]);
                setSelectedOrderId('');
                setSelectedOrderItemId('');
              }}
              placeholder="Enter tag ID & verify..."
              className="pl-7 h-8"
              disabled={isVerifyingTag}
            />
          </div>
          <Button onClick={handleVerifyTag} disabled={isVerifyingTag || !tagIdInput.trim()} size="sm" className="h-8 text-xs px-3">
            {isVerifyingTag ? 'Verifying...' : 'Verify Tag'}
          </Button>
        </div>
        {tagScanError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{tagScanError}</p>}
      </div>

      {scannedProductInfo && (
        <div className="p-2 border border-green-200 bg-green-50 rounded text-xs text-green-700">
          <p className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Product Identified: <strong>{scannedProductInfo.product_code}</strong></p>
          <p>Tag Quantity: {scannedProductInfo.tag_quantity}</p>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="customer" className="text-xs">Customer Name</Label>
        <Select 
          value={customerId} 
          onValueChange={(value) => {
            setCustomerId(value);
            setFilteredOrders([]); // Orders will be fetched and filtered by useEffect
            setSelectedOrderId(''); 
            setSelectedOrderItemId('');
          }}
          disabled={!scannedProductInfo || isVerifyingTag} // Enable only after product is identified
        >
          <SelectTrigger className="h-8" disabled={!scannedProductInfo || isVerifyingTag}>
            <SelectValue placeholder={!scannedProductInfo ? "Verify tag first..." : "Select customer..."} />
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

      {customerId && scannedProductInfo && (
        <div className="space-y-1">
          <Label htmlFor="order" className="text-xs">Order (for {scannedProductInfo.product_code})</Label>
          <Select 
            value={selectedOrderId} 
            onValueChange={(value) => {
              setSelectedOrderId(value);
              setSelectedOrderItemId('');
            }}
            disabled={loadingOrders || filteredOrders.length === 0}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={loadingOrders ? "Loading orders..." : (filteredOrders.length === 0 ? `No active orders for ${scannedProductInfo.product_code}` : "Select order...")} />
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

      {selectedOrder && scannedProductInfo && (
        <div className="space-y-1">
          <Label htmlFor="suborder" className="text-xs">Sub-order (Item: {scannedProductInfo.product_code})</Label>
          <Select 
            value={selectedOrderItemId} 
            onValueChange={setSelectedOrderItemId} 
            disabled={selectedOrder.order_items.length === 0}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={selectedOrder.order_items.length === 0 ? `No items of ${scannedProductInfo.product_code} in this order` : "Select sub-order..."} />
            </SelectTrigger>
            <SelectContent>
              {selectedOrder.order_items.map((item) => {
                const remainingToFulfill = item.quantity - item.fulfilled_quantity;
                return (
                  <SelectItem 
                    key={item.id} 
                    value={item.id} 
                    // disabled logic is already handled by filtering in useEffect, but good to keep as safety
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
      
      {selectedOrderItem && scannedProductInfo && (
        <div className="text-xs text-blue-600 p-2 border border-blue-200 bg-blue-50 rounded flex flex-col gap-1">
            <p className="font-medium">Selected for Tag Out:</p>
            <p>Tag ID: <strong>{tagIdInput}</strong> (Qty: {scannedProductInfo.tag_quantity})</p>
            <p>Product: <strong>{selectedOrderItem.product_configs.product_code}</strong></p>
            <p>Order: {selectedOrder?.order_number}, Item: {selectedOrderItem.suborder_id}</p>
            <p>Status: {selectedOrderItem.status}, Fulfilled: {selectedOrderItem.fulfilled_quantity} / {selectedOrderItem.quantity}</p>
            {(selectedOrderItem.status === 'Delivered' || selectedOrderItem.fulfilled_quantity >= selectedOrderItem.quantity) && 
              <p className="text-green-600 font-medium flex items-center gap-1"><Info className="h-3 w-3" />This item is fully fulfilled.</p>
            }
        </div>
      )}

      <Button 
        onClick={handleTagOut} 
        disabled={
          loading || 
          !tagIdInput.trim() || 
          !scannedProductInfo ||
          !customerId || 
          !selectedOrderId || 
          !selectedOrderItemId || 
          (selectedOrderItem?.status === 'Delivered') || 
          (selectedOrderItem && selectedOrderItem.fulfilled_quantity >= selectedOrderItem.quantity)
        }
        className="w-full h-8 text-xs"
      >
        {loading ? 'Processing...' : 'Tag Out'}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Enter Tag ID and click "Verify Tag" to identify the product.</p>
        <p>• Select customer to view their active orders for the identified product.</p>
        <p>• Choose the relevant order and sub-order item.</p>
        <p>• Items already 'Delivered' or fully fulfilled cannot be selected.</p>
      </div>
    </div>
  );
};

export default TagOutForm;
