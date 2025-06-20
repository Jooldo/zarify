import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryTags, type TagProductInfo } from '@/hooks/useInventoryTags';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { Tag, AlertCircle, CheckCircle, Info, Package2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type OrderStatus } from '@/hooks/useOrders';
import StepIndicator from './StepIndicator';
import ProductPickerDialog from './ProductPickerDialog';
import OrderCard from './OrderCard';
import SubOrderItem from './SubOrderItem';

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
  const [customersWithOrders, setCustomersWithOrders] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  const { processTagOperation, getTagProductConfigByTagId } = useInventoryTags();
  const { fetchCustomersWithActiveOrders } = useCustomerAutocomplete();
  const { toast } = useToast();

  const steps = ['Select Product', 'Choose Customer', 'Select Order', 'Choose Sub-Order'];
  
  const getCurrentStep = () => {
    if (!scannedProductInfo) return 1;
    if (!customerId) return 2;
    if (!selectedOrderId) return 3;
    return 4;
  };

  const handleVerifyTag = async () => {
    if (!tagIdInput.trim()) {
      setTagScanError("Please enter a Tag ID.");
      setScannedProductInfo(null);
      return;
    }
    setIsVerifyingTag(true);
    setTagScanError(null);
    setScannedProductInfo(null);
    resetSelections();

    try {
      const productInfo = await getTagProductConfigByTagId(tagIdInput.trim());
      if (productInfo) {
        setScannedProductInfo(productInfo);
        // Fetch customers with active orders for this product
        await fetchCustomersForProduct(productInfo.product_config_id);
      }
    } catch (error) {
      // Error already handled by hook
      setScannedProductInfo(null);
    } finally {
      setIsVerifyingTag(false);
    }
  };

  const handleProductSelect = async (productConfigId: string, productCode: string) => {
    // Create a mock product info object for manual selection
    const mockProductInfo: TagProductInfo = {
      product_config_id: productConfigId,
      product_code: productCode,
      tag_quantity: 1, // This will be determined by the actual tag when scanned
    };
    
    setScannedProductInfo(mockProductInfo);
    setTagIdInput(''); // Clear tag input since we're selecting manually
    resetSelections();
    await fetchCustomersForProduct(productConfigId);
  };

  const fetchCustomersForProduct = async (productConfigId: string) => {
    setLoadingCustomers(true);
    try {
      const customers = await fetchCustomersWithActiveOrders(productConfigId);
      setCustomersWithOrders(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customers with active orders',
        variant: 'destructive',
      });
    } finally {
      setLoadingCustomers(false);
    }
  };

  const resetSelections = () => {
    setCustomerId('');
    setSelectedOrderId('');
    setSelectedOrderItemId('');
    setOrders([]);
    setFilteredOrders([]);
    setCustomersWithOrders([]);
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
          created_at,
          expected_delivery,
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
      setOrders(mappedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customer orders',
        variant: 'destructive',
      });
      setOrders([]);
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
                    (item.status !== 'Delivered' && item.fulfilled_quantity < item.quantity)
          ),
        }))
        .filter(order => order.order_items.length > 0);
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
        description: 'All fields must be completed to proceed with tag out.',
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

    setLoading(true);
    try {
      await processTagOperation(
        tagIdInput.trim(), 
        'Tag Out',
        customerId,
        selectedOrderId,
        selectedOrderItemId
      );
      
      // Reset form but keep customer selected for potential additional tag-outs
      setTagIdInput('');
      setScannedProductInfo(null); 
      setTagScanError(null);
      setSelectedOrderId('');
      setSelectedOrderItemId('');
      
      if (customerId) await fetchCustomerOrders(customerId);
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
    <div className="space-y-4">
      <StepIndicator currentStep={getCurrentStep()} steps={steps} />
      
      {/* Step 1: Product Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Package2 className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm">Step 1: Select Product</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="tagId" className="text-xs">Scan Tag ID</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                <Input
                  id="tagId"
                  value={tagIdInput}
                  onChange={(e) => {
                    setTagIdInput(e.target.value);
                    setScannedProductInfo(null);
                    setTagScanError(null);
                    resetSelections();
                  }}
                  placeholder="Enter tag ID..."
                  className="pl-7 h-8"
                  disabled={isVerifyingTag}
                />
              </div>
              <Button onClick={handleVerifyTag} disabled={isVerifyingTag || !tagIdInput.trim()} size="sm" className="h-8 text-xs px-3">
                {isVerifyingTag ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
            {tagScanError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{tagScanError}</p>}
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Or Select Manually</Label>
            <ProductPickerDialog onProductSelect={handleProductSelect} />
          </div>
        </div>

        {scannedProductInfo && (
          <div className="p-3 border border-green-200 bg-green-50 rounded text-xs text-green-700">
            <p className="flex items-center gap-1 font-medium"><CheckCircle className="h-4 w-4" />Product Selected: {scannedProductInfo.product_code}</p>
            {tagIdInput && <p>Tag ID: {tagIdInput} (Qty: {scannedProductInfo.tag_quantity})</p>}
          </div>
        )}
      </div>

      {/* Step 2: Customer Selection */}
      {scannedProductInfo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">Step 2: Choose Customer</span>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="customer" className="text-xs">Customers with Active Orders</Label>
            <Select 
              value={customerId} 
              onValueChange={(value) => {
                setCustomerId(value);
                setSelectedOrderId(''); 
                setSelectedOrderItemId('');
              }}
              disabled={loadingCustomers}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder={loadingCustomers ? "Loading customers..." : (customersWithOrders.length === 0 ? `No customers with active orders for ${scannedProductInfo.product_code}` : "Select customer...")} />
              </SelectTrigger>
              <SelectContent>
                {customersWithOrders.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {customer.phone} • {customer.activeOrderCount} active order{customer.activeOrderCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Step 3: Order Selection */}
      {customerId && scannedProductInfo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">Step 3: Select Order ({scannedProductInfo.product_code})</span>
          </div>
          
          {loadingOrders ? (
            <div className="text-sm text-muted-foreground">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">No active orders found for {scannedProductInfo.product_code}</div>
          ) : (
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  productConfigId={scannedProductInfo.product_config_id}
                  onSelect={setSelectedOrderId}
                  isSelected={selectedOrderId === order.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Sub-Order Selection */}
      {selectedOrder && scannedProductInfo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">Step 4: Choose Sub-Order</span>
          </div>
          
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {selectedOrder.order_items.map((item) => (
              <SubOrderItem
                key={item.id}
                item={item}
                onSelect={setSelectedOrderItemId}
                isSelected={selectedOrderItemId === item.id}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Summary and Action */}
      {selectedOrderItem && scannedProductInfo && tagIdInput && (
        <div className="text-xs text-blue-600 p-3 border border-blue-200 bg-blue-50 rounded space-y-1">
          <p className="font-medium">Ready for Tag Out:</p>
          <p>Tag ID: <strong>{tagIdInput}</strong> (Qty: {scannedProductInfo.tag_quantity})</p>
          <p>Product: <strong>{selectedOrderItem.product_configs.product_code}</strong></p>
          <p>Order: {selectedOrder?.order_number}, Item: {selectedOrderItem.suborder_id}</p>
          <p>Pending: {selectedOrderItem.quantity - selectedOrderItem.fulfilled_quantity} units</p>
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
        className="w-full h-10"
      >
        {loading ? 'Processing Tag Out...' : 'Complete Tag Out'}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Select a product by scanning a tag or choosing manually from inventory</p>
        <p>• Only customers with active orders for the selected product will be shown</p>
        <p>• Choose the relevant order and sub-order item to fulfill</p>
        <p>• Items that are fully fulfilled cannot be selected for tag out</p>
      </div>
    </div>
  );
};

export default TagOutForm;
