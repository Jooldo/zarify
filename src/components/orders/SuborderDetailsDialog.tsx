
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Order, OrderItem } from '@/hooks/useOrders';

interface SuborderDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suborderItem: OrderItem; 
  parentOrder: Order; 
}

const SuborderDetailsDialog = ({ 
  isOpen, 
  onClose, 
  suborderItem, 
  parentOrder
}: SuborderDetailsDialogProps) => {
  const fulfillmentPercentage = suborderItem.quantity > 0 ? (suborderItem.fulfilled_quantity / suborderItem.quantity) * 100 : 0;

  const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center text-xs py-0.5">
      <Label className="text-gray-500 text-xs">{label}:</Label>
      <div className="font-medium text-right text-xs">{value}</div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-3 border-b">
          <DialogTitle className="text-sm">Suborder: {suborderItem.suborder_id}</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto p-3 space-y-2">
          <Card>
            <CardHeader className="pb-1 pt-2">
              <h4 className="font-semibold text-xs text-gray-600">ORDER INFORMATION</h4>
            </CardHeader>
            <CardContent className="space-y-0.5 pb-2">
              <InfoRow label="Order ID" value={parentOrder.order_number} />
              <InfoRow label="Customer" value={parentOrder.customers.name} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-2">
              <h4 className="font-semibold text-xs text-gray-600">PRODUCT INFORMATION</h4>
            </CardHeader>
            <CardContent className="space-y-0.5 pb-2">
              <InfoRow label="Product Code" value={suborderItem.product_configs.product_code} />
              <InfoRow label="Category" value={suborderItem.product_configs.category} />
              <InfoRow label="Subcategory" value={suborderItem.product_configs.subcategory} />
              <InfoRow 
                label="Size/Weight" 
                value={`${suborderItem.product_configs.size_value}" / ${suborderItem.product_configs.weight_range || 'N/A'}`} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-2">
              <h4 className="font-semibold text-xs text-gray-600">QUANTITY & FULFILLMENT</h4>
            </CardHeader>
            <CardContent className="space-y-1 pb-2">
              <InfoRow label="Total Quantity" value={suborderItem.quantity} />
              <InfoRow label="Fulfilled Quantity" value={suborderItem.fulfilled_quantity} />
              <Progress value={fulfillmentPercentage} className="mt-1 h-1.5" />
              <p className="text-xs text-muted-foreground mt-0.5 text-right">
                {suborderItem.fulfilled_quantity} / {suborderItem.quantity} fulfilled ({fulfillmentPercentage.toFixed(0)}%)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1 pt-2">
              <h4 className="font-semibold text-xs text-gray-600">PRICING</h4>
            </CardHeader>
            <CardContent className="space-y-0.5 pb-2">
              <InfoRow label="Unit Price" value={`₹${suborderItem.unit_price.toLocaleString('en-IN')}`} />
              <InfoRow label="Total Price" value={`₹${suborderItem.total_price.toLocaleString('en-IN')}`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-2">
              <h4 className="font-semibold text-xs text-gray-600">STATUS</h4>
            </CardHeader>
            <CardContent className="space-y-1.5 pb-2">
              <InfoRow 
                label="Current Status" 
                value={
                  <Badge variant={suborderItem.status === "Delivered" || suborderItem.status === "Ready" ? "outline" : "default"} className="text-xs">
                    {suborderItem.status}
                  </Badge>
                } 
              />
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="p-3 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuborderDetailsDialog;
