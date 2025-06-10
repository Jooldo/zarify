
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import { useOrders } from '@/hooks/useOrders';
import { Scan, ArrowUp, ArrowDown, Tag, User, Package } from 'lucide-react';

interface TagScanInterfaceProps {
  onOperationComplete?: () => void;
}

const TagScanInterface = ({ onOperationComplete }: TagScanInterfaceProps) => {
  const [tagId, setTagId] = useState('');
  const [operationType, setOperationType] = useState<'Tag In' | 'Tag Out'>('Tag In');
  const [loading, setLoading] = useState(false);
  
  // Tag In specific fields
  const [netWeight, setNetWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [quantity, setQuantity] = useState('');
  
  // Tag Out specific fields
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedSuborderId, setSelectedSuborderId] = useState('');
  
  const { processTagOperation } = useInventoryTags();
  const { customers } = useCustomerAutocomplete();
  const { orders } = useOrders();

  // Filter orders for selected customer
  const customerOrders = orders.filter(order => 
    selectedCustomerId && order.customer_id === selectedCustomerId
  );

  // Get suborders for selected order
  const availableSuborders = customerOrders.find(order => order.id === selectedOrderId)?.order_items || [];

  const handleScanTag = async () => {
    if (!tagId.trim()) return;

    // Validation for Tag In
    if (operationType === 'Tag In') {
      if (!netWeight || !grossWeight || !quantity) {
        alert('Please fill in all weight and quantity fields for Tag In operation');
        return;
      }
    }

    // Validation for Tag Out
    if (operationType === 'Tag Out') {
      if (!selectedCustomerId || !selectedOrderId || !selectedSuborderId) {
        alert('Please select customer, order, and sub-order for Tag Out operation');
        return;
      }
    }

    setLoading(true);
    try {
      const additionalData = operationType === 'Tag In' ? {
        netWeight: parseFloat(netWeight),
        grossWeight: parseFloat(grossWeight),
        quantity: parseInt(quantity)
      } : {
        customerId: selectedCustomerId,
        orderId: selectedOrderId,
        suborderId: selectedSuborderId
      };

      await processTagOperation(tagId.trim(), operationType, additionalData);
      
      // Reset form
      setTagId('');
      setNetWeight('');
      setGrossWeight('');
      setQuantity('');
      setSelectedCustomerId('');
      setSelectedOrderId('');
      setSelectedSuborderId('');
      
      if (onOperationComplete) onOperationComplete();
    } catch (error) {
      console.error('Error processing tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScanTag();
    }
  };

  const handleOperationTypeChange = (newType: 'Tag In' | 'Tag Out') => {
    setOperationType(newType);
    // Reset form fields when switching operation type
    setTagId('');
    setNetWeight('');
    setGrossWeight('');
    setQuantity('');
    setSelectedCustomerId('');
    setSelectedOrderId('');
    setSelectedSuborderId('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Tag Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={operationType === 'Tag In' ? 'default' : 'outline'}
            onClick={() => handleOperationTypeChange('Tag In')}
            className="flex-1"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Tag In
          </Button>
          <Button
            variant={operationType === 'Tag Out' ? 'default' : 'outline'}
            onClick={() => handleOperationTypeChange('Tag Out')}
            className="flex-1"
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Tag Out
          </Button>
        </div>

        <div className="text-center p-3 rounded-lg bg-muted">
          <Badge variant={operationType === 'Tag In' ? 'default' : 'destructive'}>
            {operationType} Mode
          </Badge>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagId">Tag ID or Scan QR Code</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="tagId"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter tag ID or scan QR..."
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Tag In specific fields */}
        {operationType === 'Tag In' && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700">Product Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="netWeight" className="text-xs">Net Weight (kg)</Label>
                <Input
                  id="netWeight"
                  type="number"
                  step="0.01"
                  value={netWeight}
                  onChange={(e) => setNetWeight(e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-sm"
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
                  className="h-8 text-sm"
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
                placeholder="Enter quantity"
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}

        {/* Tag Out specific fields */}
        {operationType === 'Tag Out' && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              Order Assignment
            </h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Customer</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select customer" />
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

              {selectedCustomerId && (
                <div className="space-y-1">
                  <Label className="text-xs">Order</Label>
                  <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.order_number} - ₹{order.total_amount}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedOrderId && (
                <div className="space-y-1">
                  <Label className="text-xs">Sub-order</Label>
                  <Select value={selectedSuborderId} onValueChange={setSelectedSuborderId}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select sub-order" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSuborders.map((suborder) => (
                        <SelectItem key={suborder.id} value={suborder.id}>
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3" />
                            <span>{suborder.suborder_id}</span>
                            <span className="text-xs text-gray-500">
                              - {suborder.product_config?.product_code}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleScanTag} 
          disabled={!tagId.trim() || loading}
          className="w-full"
        >
          {loading ? 'Processing...' : `${operationType} - Scan Tag`}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>• <strong>Tag In:</strong> Captures weight & quantity data</div>
          <div>• <strong>Tag Out:</strong> Links to customer orders</div>
          <div>• Enter tag ID manually or scan QR code</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TagScanInterface;
