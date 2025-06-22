
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { ManufacturingOrder } from '@/types/manufacturingOrders';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface CreateReworkOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalOrder: ManufacturingOrder;
  sourceStepId?: string;
}

const CreateReworkOrderDialog = ({ 
  isOpen, 
  onClose, 
  originalOrder,
  sourceStepId 
}: CreateReworkOrderDialogProps) => {
  const { toast } = useToast();
  const { createOrder, isCreating } = useManufacturingOrders();
  const { manufacturingSteps } = useManufacturingSteps();
  
  const [formData, setFormData] = useState({
    rework_quantity: originalOrder.quantity_required,
    rework_reason: '',
    rework_source_step_id: sourceStepId || '',
    priority: originalOrder.priority as 'low' | 'medium' | 'high' | 'urgent',
    special_instructions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rework_reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for the rework',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.rework_source_step_id) {
      toast({
        title: 'Error',
        description: 'Please select the source step that requires rework',
        variant: 'destructive',
      });
      return;
    }

    if (formData.rework_quantity <= 0 || formData.rework_quantity > originalOrder.quantity_required) {
      toast({
        title: 'Error',
        description: `Rework quantity must be between 1 and ${originalOrder.quantity_required}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await createOrder({
        product_name: originalOrder.product_name,
        product_config_id: originalOrder.product_config_id,
        quantity_required: formData.rework_quantity,
        priority: formData.priority,
        parent_order_id: originalOrder.id,
        rework_reason: formData.rework_reason,
        rework_source_step_id: formData.rework_source_step_id,
        rework_quantity: formData.rework_quantity,
        special_instructions: formData.special_instructions || undefined
      });

      toast({
        title: 'Success',
        description: 'Rework order created successfully',
      });

      onClose();
    } catch (error) {
      console.error('Error creating rework order:', error);
    }
  };

  const sourceStep = manufacturingSteps.find(step => step.id === formData.rework_source_step_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-600" />
            Create Rework Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Original Order: {originalOrder.order_number}</span>
            </div>
            <p className="text-sm text-amber-700">
              Product: {originalOrder.product_name} | Original Qty: {originalOrder.quantity_required}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rework_source_step_id">Source Step (Rework From)</Label>
            <Select
              value={formData.rework_source_step_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, rework_source_step_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the step that requires rework" />
              </SelectTrigger>
              <SelectContent>
                {manufacturingSteps
                  .filter(step => step.is_active)
                  .sort((a, b) => a.step_order - b.step_order)
                  .map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      Step {step.step_order}: {step.step_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rework_quantity">Rework Quantity</Label>
            <Input
              id="rework_quantity"
              type="number"
              min="1"
              max={originalOrder.quantity_required}
              value={formData.rework_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, rework_quantity: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rework_reason">Rework Reason</Label>
            <Textarea
              id="rework_reason"
              placeholder="Describe why this rework is needed..."
              value={formData.rework_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, rework_reason: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
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

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Additional Instructions (Optional)</Label>
            <Textarea
              id="special_instructions"
              placeholder="Any special instructions for the rework..."
              value={formData.special_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isCreating ? 'Creating...' : 'Create Rework Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReworkOrderDialog;
