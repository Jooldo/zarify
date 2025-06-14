
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useOrders, Order, OrderItem, OrderStatus } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Suborder Details: {suborderItem.suborder_id}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Order Information</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Label>Order ID:</Label>
              <span>{parentOrder.order_number}</span>
              <Label>Customer:</Label>
              <span>{parentOrder.customer.name}</span>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium text-sm mb-2">Product Information</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Label>Product Code:</Label>
              <span>{suborderItem.product_config.product_code}</span>
              <Label>Category:</Label>
              <span>{suborderItem.product_config.category}</span>
              <Label>Subcategory:</Label>
              <span>{suborderItem.product_config.subcategory}</span>
              <Label>Size:</Label>
              <span>{suborderItem.product_config.size_value}" / {suborderItem.product_config.weight_range || 'N/A'}</span>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium text-sm mb-2">Quantity & Fulfillment</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm items-center">
              <Label>Total Quantity:</Label>
              <span>{suborderItem.quantity}</span>
              <Label htmlFor="fulfilledQuantity">Fulfilled Quantity:</Label>
              <Input 
                id="fulfilledQuantity" 
                type="number" 
                value={fulfilledQuantity} 
                onChange={handleFulfilledQuantityChange} 
                max={suborderItem.quantity}
                min={0}
                className="h-8"
              />
            </div>
            <Progress value={fulfillmentPercentage} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">{fulfilledQuantity} / {suborderItem.quantity} fulfilled ({fulfillmentPercentage.toFixed(0)}%)</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium text-sm mb-2">Pricing</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Label>Unit Price:</Label>
              <span>₹{suborderItem.unit_price.toLocaleString('en-IN')}</span>
              <Label>Total Price:</Label>
              <span>₹{suborderItem.total_price.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium text-sm mb-2">Status Management</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm items-center">
              <Label>Current Status:</Label>
              <Badge variant={currentStatus === "Delivered" ? "outline" : "default"}>{currentStatus}</Badge>
              <Label htmlFor="status">Update Status:</Label>
              <Select value={currentStatus} onValueChange={(value) => handleStatusChange(value as OrderStatus)}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {(['Created', 'Progress', 'Ready', 'Delivered'] as OrderStatus[]).map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuborderDetailsDialog;

