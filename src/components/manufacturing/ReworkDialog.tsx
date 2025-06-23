
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Package, Scale } from 'lucide-react';

interface ReworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originStep: any;
  orderId: string;
  onReworkCreated?: () => void;
}

const ReworkDialog: React.FC<ReworkDialogProps> = ({
  open,
  onOpenChange,
  originStep,
  orderId,
  onReworkCreated
}) => {
  const [quantity, setQuantity] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createStep } = useCreateManufacturingStep();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || !weight) {
      toast({
        title: 'Error',
        description: 'Please fill in both quantity and weight fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new Jhalai step instance with rework flag
      await createStep({
        manufacturingOrderId: orderId,
        stepName: 'Jhalai', // Always start rework from Jhalai
        fieldValues: {
          quantity_assigned: parseFloat(quantity),
          weight_assigned: parseFloat(weight),
          is_rework: true,
          origin_step_id: originStep.id,
          status: 'pending'
        }
      });

      toast({
        title: 'Success',
        description: `Rework instance created with ${quantity} pieces (${weight}kg)`,
      });

      // Reset form
      setQuantity('');
      setWeight('');
      onOpenChange(false);
      onReworkCreated?.();
    } catch (error) {
      console.error('Error creating rework:', error);
      toast({
        title: 'Error',
        description: 'Failed to create rework instance',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-orange-600" />
            Create Rework Instance
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Creating a rework for {originStep?.step_name} step. This will start a new Jhalai instance.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Quantity (pieces) *
            </Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Weight (Kg) *
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              min="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight in kg"
              required
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Create Rework
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReworkDialog;
