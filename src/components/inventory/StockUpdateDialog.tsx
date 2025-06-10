
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, Minus, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import type { FinishedGood } from '@/hooks/useFinishedGoods';

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

interface StockUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: FinishedGood | null;
  onProductUpdated: () => void;
}

const StockUpdateDialog = ({ isOpen, onOpenChange, product, onProductUpdated }: StockUpdateDialogProps) => {
  const [actionType, setActionType] = useState<'tag-in' | 'tag-out' | ''>('');
  const [quantity, setQuantity] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { customers } = useCustomerAutocomplete();
  const { manualTagIn, manualTagOut } = useInventoryTags();

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
    if (customerId && actionType === 'tag-out') {
      fetchCustomerOrders(customerId);
      setSelectedOrderId('');
      setSelectedOrderItemId('');
    } else {
      setOrders([]);
    }
  }, [customerId, actionType]);

  const handleActionSelect = (action: 'tag-in' | 'tag-out') => {
    setActionType(action);
    setQuantity('');
    setNetWeight('');
    setGrossWeight('');
    setCustomerId('');
    setSelectedOrderId('');
    setSelectedOrderItemId('');
  };

  const handleQuantitySubmit = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Please enter a valid quantity greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (actionType === 'tag-out' && (!customerId || !selectedOrderId || !selectedOrderItemId)) {
      toast({
        title: 'Missing Information',
        description: 'Please select customer, order, and sub-order for tag out operation',
        variant: 'destructive',
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    if (!product || !actionType || !quantity) return;

    setLoading(true);
    try {
      const quantityNum = parseInt(quantity);
      const netWeightNum = netWeight ? parseFloat(netWeight) : undefined;
      const grossWeightNum = grossWeight ? parseFloat(grossWeight) : undefined;

      if (actionType === 'tag-in') {
        await manualTagIn(
          product.id, 
          quantityNum, 
          netWeightNum, 
          grossWeightNum
        );
      } else {
        await manualTagOut(
          product.id,
          quantityNum,
          customerId,
          selectedOrderId,
          selectedOrderItemId,
          netWeightNum,
          grossWeightNum
        );
      }

      onProductUpdated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error processing manual tag operation:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActionType('');
    setQuantity('');
    setNetWeight('');
    setGrossWeight('');
    setCustomerId('');
    setSelectedOrderId('');
    setSelectedOrderItemId('');
    setOrders([]);
    setShowConfirmation(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  if (!product) return null;

  const selectedOrder = orders.find(order => order.id === selectedOrderId);

  if (showConfirmation) {
    const quantityNum = parseInt(quantity);
    const newStock = actionType === 'tag-in' 
      ? product.current_stock + quantityNum
      : product.current_stock - quantityNum;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Confirm Manual {actionType === 'tag-in' ? 'Tag In' : 'Tag Out'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p><strong>Product:</strong> {product.product_code}</p>
              <p><strong>Action:</strong> Manual {actionType === 'tag-in' ? 'Tag In' : 'Tag Out'}</p>
              <p><strong>Quantity:</strong> {quantity}</p>
              {netWeight && <p><strong>Net Weight:</strong> {netWeight} kg</p>}
              {grossWeight && <p><strong>Gross Weight:</strong> {grossWeight} kg</p>}
              {actionType === 'tag-out' && customerId && (
                <>
                  <p><strong>Customer:</strong> {customers.find(c => c.id === customerId)?.name}</p>
                  {selectedOrder && <p><strong>Order:</strong> {selectedOrder.order_number}</p>}
                </>
              )}
              <p><strong>Current Stock:</strong> {product.current_stock}</p>
              <p><strong>New Stock:</strong> {newStock}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleConfirmUpdate}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Manual Tag Operation - {product.product_code}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Context Card */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Product Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-medium">{product.product_config.category}</p>
              </div>
              <div>
                <span className="text-gray-600">Subcategory:</span>
                <p className="font-medium">{product.product_config.subcategory}</p>
              </div>
              <div>
                <span className="text-gray-600">Size:</span>
                <p className="font-medium">{product.product_config.size_value}" inches</p>
              </div>
              <div>
                <span className="text-gray-600">Weight Range:</span>
                <p className="font-medium">{product.product_config.weight_range || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Current Stock Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Stock Status</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Current Stock</p>
                <p className="text-lg font-bold text-blue-600">{product.current_stock}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Threshold</p>
                <p className="text-lg font-bold text-gray-700">{product.threshold}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">In Manufacturing</p>
                <p className="text-lg font-bold text-green-600">{product.in_manufacturing}</p>
              </div>
            </div>
          </div>

          {!actionType && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Choose Action:</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2 border-green-200 hover:bg-green-50"
                  onClick={() => handleActionSelect('tag-in')}
                >
                  <Plus className="h-6 w-6 text-green-600" />
                  <span className="font-medium">Manual Tag In</span>
                  <span className="text-xs text-gray-500">Add Stock</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2 border-red-200 hover:bg-red-50"
                  onClick={() => handleActionSelect('tag-out')}
                >
                  <Minus className="h-6 w-6 text-red-600" />
                  <span className="font-medium">Manual Tag Out</span>
                  <span className="text-xs text-gray-500">Remove Stock</span>
                </Button>
              </div>
            </div>
          )}

          {actionType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {actionType === 'tag-in' ? (
                  <Plus className="h-5 w-5 text-green-600" />
                ) : (
                  <Minus className="h-5 w-5 text-red-600" />
                )}
                <Label className="text-base font-medium">
                  Manual {actionType === 'tag-in' ? 'Tag In' : 'Tag Out'} Details:
                </Label>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="quantity" className="text-sm">Quantity *</Label>
                  <Input 
                    id="quantity"
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    min="1"
                    className="text-lg text-center font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="netWeight" className="text-sm">Net Weight (kg)</Label>
                    <Input
                      id="netWeight"
                      type="number"
                      step="0.01"
                      value={netWeight}
                      onChange={(e) => setNetWeight(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grossWeight" className="text-sm">Gross Weight (kg)</Label>
                    <Input
                      id="grossWeight"
                      type="number"
                      step="0.01"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {actionType === 'tag-out' && (
                  <>
                    <div>
                      <Label htmlFor="customer" className="text-sm">Customer *</Label>
                      <Select value={customerId} onValueChange={setCustomerId}>
                        <SelectTrigger>
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
                      <div>
                        <Label htmlFor="order" className="text-sm">Order *</Label>
                        <Select 
                          value={selectedOrderId} 
                          onValueChange={setSelectedOrderId}
                          disabled={loadingOrders}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingOrders ? "Loading orders..." : "Select order..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {orders.map((order) => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.order_number} - {order.status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedOrder && (
                      <div>
                        <Label htmlFor="suborder" className="text-sm">Sub-order *</Label>
                        <Select value={selectedOrderItemId} onValueChange={setSelectedOrderItemId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sub-order..." />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedOrder.order_items.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.suborder_id} - {item.product_configs.product_code} (Qty: {item.quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setActionType('')}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleQuantitySubmit}
                  disabled={!quantity || parseInt(quantity) <= 0 || (actionType === 'tag-out' && (!customerId || !selectedOrderId || !selectedOrderItemId))}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockUpdateDialog;
