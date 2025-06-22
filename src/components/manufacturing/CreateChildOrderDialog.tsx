
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Package2, AlertTriangle } from 'lucide-react';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useToast } from '@/hooks/use-toast';
import { useMerchant } from '@/hooks/useMerchant';
import { supabase } from '@/integrations/supabase/client';

interface CreateChildOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentOrder: ManufacturingOrder | null;
  sourceStepId?: string;
  sourceStepName?: string;
  maxReworkQuantity?: number;
}

const CreateChildOrderDialog: React.FC<CreateChildOrderDialogProps> = ({
  isOpen,
  onClose,
  parentOrder,
  sourceStepId,
  sourceStepName,
  maxReworkQuantity
}) => {
  const { createOrder } = useManufacturingOrders();
  const { merchant } = useMerchant();
  const { toast } = useToast();
  
  const [reworkQuantity, setReworkQuantity] = useState<number>(1);
  const [reworkReason, setReworkReason] = useState<string>('');
  const [priority, setPriority] = useState<string>('medium');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentOrder || !merchant?.id) {
      toast({
        title: 'Error',
        description: 'Missing required information',
        variant: 'destructive',
      });
      return;
    }

    if (maxReworkQuantity && reworkQuantity > maxReworkQuantity) {
      toast({
        title: 'Error',
        description: `Rework quantity cannot exceed ${maxReworkQuantity}`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating rework order with source step ID:', sourceStepId);
      
      // Get the next order number
      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('get_next_manufacturing_order_number');

      if (orderNumberError) {
        console.error('Error getting order number:', orderNumberError);
        throw orderNumberError;
      }

      const reworkOrderNumber = `${orderNumber}-R`;
      
      // Create the rework order with proper rework_source_step_id
      const reworkOrderData = {
        order_number: reworkOrderNumber,
        product_name: parentOrder.product_name,
        product_config_id: parentOrder.product_config_id,
        quantity_required: reworkQuantity,
        priority: priority as 'low' | 'medium' | 'high' | 'urgent',
        status: 'pending' as const,
        parent_order_id: parentOrder.id,
        rework_source_step_id: sourceStepId, // This is the key field we're fixing
        rework_quantity: reworkQuantity,
        rework_reason: reworkReason,
        special_instructions: specialInstructions,
        merchant_id: merchant.id,
        created_by: merchant.id,
        product_type: parentOrder.product_type
      };

      console.log('Rework order data:', reworkOrderData);

      await createOrder(reworkOrderData);

      toast({
        title: 'Success',
        description: `Rework order ${reworkOrderNumber} created successfully`,
      });

      // Reset form
      setReworkQuantity(1);
      setReworkReason('');
      setPriority('medium');
      setSpecialInstructions('');
      
      onClose();
    } catch (error: any) {
      console.error('Error creating rework order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create rework order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!parentOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-orange-500" />
            Create Rework Order
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
              {parentOrder.order_number}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Order Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                Parent Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Product:</span>
                <div className="font-medium">{parentOrder.product_name}</div>
              </div>
              {sourceStepName && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Source Step:</span>
                  <div className="font-medium flex items-center gap-2">
                    {sourceStepName}
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                      Rework Source
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rework Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="reworkQuantity" className="text-sm font-medium">
                Rework Quantity *
                {maxReworkQuantity && (
                  <span className="text-muted-foreground text-xs ml-1">
                    (Max: {maxReworkQuantity})
                  </span>
                )}
              </Label>
              <Input
                id="reworkQuantity"
                type="number"
                min="1"
                max={maxReworkQuantity || undefined}
                value={reworkQuantity}
                onChange={(e) => setReworkQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="reworkReason" className="text-sm font-medium">
                Rework Reason *
              </Label>
              <Textarea
                id="reworkReason"
                value={reworkReason}
                onChange={(e) => setReworkReason(e.target.value)}
                placeholder="Explain why rework is needed..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialInstructions" className="text-sm font-medium">
                Special Instructions
              </Label>
              <Textarea
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special handling instructions..."
                rows={2}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? 'Creating...' : 'Create Rework Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChildOrderDialog;
