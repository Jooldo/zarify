import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { ManufacturingOrder } from '@/types/manufacturing';

interface StartStepDialogProps {
  step: any;
  order: ManufacturingOrder;
  onStepStarted: () => void;
}

const StartStepDialog: React.FC<StartStepDialogProps> = ({ step, order, onStepStarted }) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { mutate: startStep, isLoading: isStarting } = useMutation(
    async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .update({ status: 'in_progress', notes: notes })
        .eq('id', step.id);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['manufacturing-steps'] });
        queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
        toast({
          title: "Step Started",
          description: "The manufacturing step has been marked as in progress.",
        })
        setOpen(false);
        onStepStarted();
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Failed to Start Step",
          description: error.message,
        })
      },
    }
  );

  const handleStartStep = () => {
    startStep();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Start Step
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start Manufacturing Step</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Step Name
            </Label>
            <Input id="name" value={step.step_name} className="col-span-3" disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              Order Number
            </Label>
            <Input id="order" value={order.order_number} className="col-span-3" disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <Button onClick={handleStartStep} disabled={isStarting}>
          {isStarting ? "Starting..." : "Start Step"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default StartStepDialog;
