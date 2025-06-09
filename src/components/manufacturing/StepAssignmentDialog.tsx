
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StepAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (assignmentData: {
    workerName: string;
    deliveryDate: string;
    totalWeight: number;
    materials: { name: string; allocated_weight: number; unit: string; }[];
  }) => void;
  stepNumber: number;
  stepName: string;
}

const StepAssignmentDialog = ({
  open,
  onOpenChange,
  onAssign,
  stepNumber,
  stepName
}: StepAssignmentDialogProps) => {
  const [workerName, setWorkerName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!workerName || !deliveryDate || !totalWeight) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const materials = [
      { name: 'Silver Wire', allocated_weight: parseFloat(totalWeight) * 0.6, unit: 'kg' },
      { name: 'Base Metal', allocated_weight: parseFloat(totalWeight) * 0.4, unit: 'kg' }
    ];

    onAssign({
      workerName,
      deliveryDate,
      totalWeight: parseFloat(totalWeight),
      materials
    });

    // Reset form
    setWorkerName('');
    setDeliveryDate('');
    setTotalWeight('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Assign Step {stepNumber}: {stepName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="worker-name">Worker Name *</Label>
                <Select value={workerName} onValueChange={setWorkerName}>
                  <SelectTrigger id="worker-name">
                    <SelectValue placeholder="Select a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Doe">John Doe</SelectItem>
                    <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                    <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                    <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="delivery-date" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expected Delivery Date *
                </Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="total-weight" className="flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  Total Weight (kg) *
                </Label>
                <Input
                  id="total-weight"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(e.target.value)}
                />
              </div>

              {totalWeight && (
                <div className="p-3 bg-muted/50 rounded text-sm">
                  <div className="font-medium mb-2">Material Distribution:</div>
                  <div className="space-y-1">
                    <div>• Silver Wire: {(parseFloat(totalWeight) * 0.6).toFixed(1)} kg</div>
                    <div>• Base Metal: {(parseFloat(totalWeight) * 0.4).toFixed(1)} kg</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Assign Step
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepAssignmentDialog;
