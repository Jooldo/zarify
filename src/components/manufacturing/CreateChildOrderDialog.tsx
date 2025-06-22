
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';

interface CreateChildOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentOrder: any;
  currentStep: any;
  onSuccess: () => void;
}

const CreateChildOrderDialog: React.FC<CreateChildOrderDialogProps> = ({
  isOpen,
  onClose,
  parentOrder,
  currentStep,
  onSuccess
}) => {
  const { toast } = useToast();
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [isCreating, setIsCreating] = useState(false);
  const [reworkQuantity, setReworkQuantity] = useState<number>(1);
  const [reworkReason, setReworkReason] = useState('');
  const [assignedToStep, setAssignedToStep] = useState<number>(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentOrder || !currentStep) {
      toast({
        title: 'Error',
        description: 'Missing parent order or current step information',
        variant: 'destructive',
      });
      return;
    }

    if (reworkQuantity <= 0 || reworkQuantity > parentOrder.quantity_required) {
      toast({
        title: 'Error',
        description: `Rework quantity must be between 1 and ${parentOrder.quantity_required}`,
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Get the current order step ID for this parent order and current step
      const currentOrderStep = orderSteps.find(step => 
        step.manufacturing_order_id === parentOrder.id && 
        step.manufacturing_step_id === currentStep.id
      );

      if (!currentOrderStep) {
        throw new Error('Could not find current order step');
      }

      // Create rework order with proper rework_source_step_id
      const { data: childOrder, error } = await supabase
        .from('manufacturing_orders')
        .insert({
          order_number: `${parentOrder.order_number}-R`,
          product_name: parentOrder.product_name,
          product_config_id: parentOrder.product_config_id,
          quantity_required: reworkQuantity,
          priority: parentOrder.priority,
          status: 'pending',
          special_instructions: `Rework from ${parentOrder.order_number} - Step ${currentStep.step_name} - ${reworkReason}`,
          merchant_id: parentOrder.merchant_id,
          parent_order_id: parentOrder.id,
          rework_source_step_id: currentOrderStep.id, // This is the key field we were missing!
          rework_quantity: reworkQuantity,
          rework_reason: reworkReason,
          assigned_to_step: assignedToStep
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating rework order:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: `Rework order ${childOrder.order_number} created successfully`,
      });

      onSuccess();
      onClose();
      
      // Reset form
      setReworkQuantity(1);
      setReworkReason('');
      setAssigngedToStep(1);

    } catch (error: any) {
      console.error('Error creating rework order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create rework order',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const activeSteps = manufacturingSteps
    .filter(step => step.is_active)
    .sort((a, b) => a.step_order - b.step_order);

  if (!parentOrder || !currentStep) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Rework Order</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Parent Order</Label>
            <Input value={parentOrder.order_number} disabled />
          </div>
          
          <div className="space-y-2">
            <Label>Current Step</Label>
            <Input value={currentStep.step_name} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rework-quantity">
              Rework Quantity (Max: {parentOrder.quantity_required})
            </Label>
            <Input
              id="rework-quantity"
              type="number"
              min={1}
              max={parentOrder.quantity_required}
              value={reworkQuantity}
              onChange={(e) => setReworkQuantity(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned-step">Assign to Step</Label>
            <Select 
              value={assignedToStep.toString()} 
              onValueChange={(value) => setAssignedToStep(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select step" />
              </SelectTrigger>
              <SelectContent>
                {activeSteps.map((step) => (
                  <SelectItem key={step.id} value={step.step_order.toString()}>
                    {step.step_order}. {step.step_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rework-reason">Rework Reason</Label>
            <Textarea
              id="rework-reason"
              value={reworkReason}
              onChange={(e) => setReworkReason(e.target.value)}
              placeholder="Describe the reason for rework..."
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Rework Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChildOrderDialog;
