import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { ManufacturingOrder } from '@/types/manufacturing';

interface StepProgressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  step: any;
  order: ManufacturingOrder;
  onStepUpdated: () => void;
}

const StepProgressDialog: React.FC<StepProgressDialogProps> = ({
  isOpen,
  onOpenChange,
  step,
  order,
  onStepUpdated,
}) => {
  const [notes, setNotes] = useState(step?.notes || '');
  const [isCompleted, setIsCompleted] = useState(step?.status === 'completed');
  const [actualTime, setActualTime] = useState(step?.actual_time || 0);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (step) {
      setNotes(step.notes || '');
      setIsCompleted(step.status === 'completed');
      setActualTime(step.actual_time || 0);
    }
  }, [step]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const status = isCompleted ? 'completed' : 'in_progress';
      const updates = {
        notes: notes,
        status: status,
        actual_time: actualTime,
      };

      const { error } = await supabase
        .from('manufacturing_order_steps')
        .update(updates)
        .eq('id', step.id);

      if (error) {
        console.error('Error updating step:', error);
        toast({
          title: 'Error',
          description: 'Failed to update step. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Step updated successfully.',
        });
        onStepUpdated();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Unexpected error updating step:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Step Progress</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stepName" className="text-right">
              Step Name
            </Label>
            <Input
              type="text"
              id="stepName"
              value={step?.step_name}
              readOnly
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="estimatedTime" className="text-right">
              Estimated Time
            </Label>
            <Input
              type="text"
              id="estimatedTime"
              value={step?.estimated_time}
              readOnly
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="actualTime" className="text-right">
              Actual Time
            </Label>
            <Input
              type="number"
              id="actualTime"
              value={actualTime}
              onChange={(e) => setActualTime(Number(e.target.value))}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right mt-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right"></div>
            <div className="col-span-3 flex items-center">
              <Checkbox
                id="isCompleted"
                checked={isCompleted}
                onCheckedChange={(checked) => setIsCompleted(checked || false)}
              />
              <Label htmlFor="isCompleted" className="ml-2">
                Completed
              </Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="ml-2" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepProgressDialog;
