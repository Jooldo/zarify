
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Added Card components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useOrders, Order, OrderItem, OrderStatus } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
// Separator might not be needed if using Card structure effectively
// import { Separator } from '@/components/ui/separator';

interface SuborderDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suborderItem: OrderItem; // The specific suborder item
  parentOrder: Order; // The parent order for context like customer name
  onSuborderUpdate: () => void;
}

const SuborderDetailsDialog = ({ 
  isOpen, 
  onClose, 
  suborderItem, 
  parentOrder,
  onSuborderUpdate
}: SuborderDetailsDialogProps) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(suborderItem.status);
  const [fulfilledQuantity, setFulfilledQuantity] = useState<number>(suborderItem.fulfilled_quantity || 0);
  const { updateOrderItemDetails } = useOrders();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCurrentStatus(suborderItem.status);
      setFulfilledQuantity(suborderItem.fulfilled_quantity || 0);
    }
  }, [isOpen, suborderItem]);

  const handleStatusChange = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
  };

  const handleFulfilledQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFulfilledQuantity(isNaN(value) ? 0 : Math.max(0, Math.min(value, suborderItem.quantity)));
  };

  const handleSaveChanges = async () => {
    try {
      const updates: { status?: OrderStatus; fulfilled_quantity?: number } = {};
      if (currentStatus !== suborderItem.status) {
        updates.status = currentStatus;
      }
      if (fulfilledQuantity !== suborderItem.fulfilled_quantity) {
        updates.fulfilled_quantity = fulfilledQuantity;
      }

      if (Object.keys(updates).length > 0) {
        await updateOrderItemDetails(suborderItem.id, updates);
        toast({ title: 'Success', description: 'Suborder details updated.' });
        onSuborderUpdate();
      }
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update suborder details.', variant: 'destructive' });
    }
  };
  
  const fulfillmentPercentage = suborderItem.quantity > 0 ? (fulfilledQuantity / suborderItem.quantity) * 100 : 0;

  const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center text-xs py-1">
      <Label className="text-gray-500">{label}:</Label>
      <div className="font-medium text-right">{value}</div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0"> {/* Adjusted padding for Card */}
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-base">Suborder: {suborderItem.suborder_id}</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-3"> {/* Scrollable content area */}
          <Card>
            <CardHeader className="pb-2 pt-3">
              <h4 className="font-semibold text-xs text-gray-600">ORDER INFORMATION</h4>
            </CardHeader>
            <CardContent className="space-y-0.5 pb-3">
              <InfoRow label="Order ID" value={parentOrder.order_number} />
              <InfoRow label="Customer" value={parentOrder.customer.name} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-3">
              <h4 className="font-semibold text-xs text-gray-600">PRODUCT INFORMATION</h4>
            </CardHeader>
            <CardContent className="space-y-0.5 pb-3">
              <InfoRow label="Product Code" value={suborderItem.product_config.product_code} />
              <InfoRow label="Category" value={suborderItem.product_config.category} />
              <InfoRow label="Subcategory" value={suborderItem.product_config.subcategory} />
              <InfoRow 
                label="Size/Weight" 
                value={`${suborderItem.product_config.size_value}" / ${suborderItem.product_config.weight_range || 'N/A'}`} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-3">
              <h4 className="font-semibold text-xs text-gray-600">QUANTITY & FULFILLMENT</h4>
            </CardHeader>
            <CardContent className="space-y-1 pb-3">
              <InfoRow label="Total Quantity" value={suborderItem.quantity} />
              <div className="flex justify-between items-center text-xs py-1">
                <Label htmlFor="fulfilledQuantity" className="text-gray-500">Fulfilled Quantity:</Label>
                <Input 
                  id="fulfilledQuantity" 
                  type="number" 
                  value={fulfilledQuantity} 
                  onChange={handleFulfilledQuantityChange} 
                  max={suborderItem.quantity}
                  min={0}
                  className="h-7 w-20 text-xs p-1" /* Compact input */
                />
              </div>
              <Progress value={fulfillmentPercentage} className="mt-1 h-1.5" />
              <p className="text-xs text-muted-foreground mt-0.5 text-right">
                {fulfilledQuantity} / {suborderItem.quantity} fulfilled ({fulfillmentPercentage.toFixed(0)}%)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 pt-3">
              <h4 className="font-semibold text-xs text-gray-600">PRICING</h4>
            </CardHeader>
            <CardContent className="space-y-0.5 pb-3">
              <InfoRow label="Unit Price" value={`₹${suborderItem.unit_price.toLocaleString('en-IN')}`} />
              <InfoRow label="Total Price" value={`₹${suborderItem.total_price.toLocaleString('en-IN')}`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-3">
              <h4 className="font-semibold text-xs text-gray-600">STATUS MANAGEMENT</h4>
            </CardHeader>
            <CardContent className="space-y-1.5 pb-3">
              <div className="flex justify-between items-center text-xs py-1">
                <Label className="text-gray-500">Current Status:</Label>
                <Badge variant={currentStatus === "Delivered" || currentStatus === "Ready" ? "outline" : "default"} className="text-xs">
                  {currentStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <Label htmlFor="status" className="text-gray-500">Update Status:</Label>
                <Select value={currentStatus} onValueChange={(value) => handleStatusChange(value as OrderStatus)}>
                  <SelectTrigger className="h-7 w-40 text-xs"> {/* Compact select */}
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(['Created', 'Progress', 'Partially Fulfilled', 'Ready', 'Delivered'] as OrderStatus[]).map(status => (
                      <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="p-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges} size="sm">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuborderDetailsDialog;
