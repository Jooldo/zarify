
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, Scan } from 'lucide-react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { useToast } from '@/hooks/use-toast';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { supabase } from '@/integrations/supabase/client';

interface ManufacturingTagInDialogProps {
  order: ManufacturingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagInComplete?: () => void;
}

const ManufacturingTagInDialog = ({ order, open, onOpenChange, onTagInComplete }: ManufacturingTagInDialogProps) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [tagId, setTagId] = useState('');
  const [manufacturedQuantity, setManufacturedQuantity] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { finishedGoods, refetch: refetchFinishedGoods } = useFinishedGoods();
  const { processTagOperation, manualTagIn } = useInventoryTags();
  const { toast } = useToast();

  if (!order) return null;

  const productCode = order.product_configs?.product_code;
  const finishedGood = finishedGoods.find(fg => fg.product_code === productCode);

  const handleScanBasedTagIn = async () => {
    if (!tagId) {
      toast({
        title: 'Error',
        description: 'Tag ID is required.',
        variant: 'destructive',
      });
      return;
    }

    const qty = manufacturedQuantity ? parseInt(manufacturedQuantity) : order.quantity_required;

    setLoading(true);
    try {
      await processTagOperation(tagId, 'Tag In');
      await updateManufacturingOrderStatus(qty);
      handleSuccess();
    } catch (error) {
      console.error('Error processing Tag In:', error);
      toast({
        title: 'Error',
        description: 'Failed to process tag in operation.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualTagIn = async () => {
    if (!finishedGood) {
      toast({
        title: 'Error',
        description: 'Product not found in finished goods.',
        variant: 'destructive',
      });
      return;
    }

    const qty = manufacturedQuantity ? parseInt(manufacturedQuantity) : order.quantity_required;

    if (!qty || qty <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid manufactured quantity.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await manualTagIn(
        finishedGood.id,
        qty,
        netWeight ? parseFloat(netWeight) : undefined,
        grossWeight ? parseFloat(grossWeight) : undefined
      );
      await updateManufacturingOrderStatus(qty);
      handleSuccess();
    } catch (error) {
      console.error('Error processing manual tag in:', error);
      toast({
        title: 'Error',
        description: 'Failed to process manual tag in.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateManufacturingOrderStatus = async (manufacturedQty: number) => {
    try {
      console.log('Updating manufacturing order status to tagged_in for order:', order.id);
      
      const { error } = await supabase
        .from('manufacturing_orders')
        .update({ 
          status: 'tagged_in',
          manufacturing_quantity: manufacturedQty
        })
        .eq('id', order.id);

      if (error) {
        console.error('Error updating manufacturing order status:', error);
        throw error;
      }
      
      console.log('Manufacturing order status updated successfully');
    } catch (error) {
      console.error('Error updating manufacturing order status:', error);
      throw error;
    }
  };

  const handleSuccess = () => {
    const qty = manufacturedQuantity ? parseInt(manufacturedQuantity) : order.quantity_required;
    
    toast({
      title: 'Success',
      description: `Manufacturing order ${order.order_number} has been tagged in successfully with ${qty} units.`,
    });
    
    // Reset form
    setTagId('');
    setManufacturedQuantity('');
    setNetWeight('');
    setGrossWeight('');
    
    // Refresh data and notify parent
    refetchFinishedGoods();
    if (onTagInComplete) {
      onTagInComplete();
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5" />
            Tag In Manufacturing Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Order Details:</div>
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Order Number:</span>
                <span className="text-sm font-mono">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Product Code:</span>
                <span className="text-sm font-mono">{productCode || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Ordered Quantity:</span>
                <span className="text-sm">{order.quantity_required}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturedQuantity" className="text-sm font-medium">Manufactured Quantity</Label>
            <Input
              id="manufacturedQuantity"
              type="number"
              min="1"
              value={manufacturedQuantity}
              onChange={(e) => setManufacturedQuantity(e.target.value)}
              placeholder={order.quantity_required.toString()}
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use ordered quantity ({order.quantity_required})
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center gap-1">
                <Scan className="h-3 w-3" />
                Scan Tag
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-3 mt-4">
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

              <Button 
                onClick={handleManualTagIn} 
                disabled={loading}
                className="w-full h-8 text-xs"
              >
                {loading ? 'Processing...' : 'Manual Tag In'}
              </Button>
            </TabsContent>
            
            <TabsContent value="scan" className="space-y-3 mt-4">
              <div className="space-y-1">
                <Label htmlFor="tagId" className="text-xs">Tag ID</Label>
                <Input
                  id="tagId"
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                  placeholder="Scan or enter Tag ID"
                  className="h-8"
                />
              </div>

              <Button 
                onClick={handleScanBasedTagIn} 
                disabled={loading || !tagId}
                className="w-full h-8 text-xs"
              >
                {loading ? 'Processing...' : 'Process Tag In'}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManufacturingTagInDialog;
