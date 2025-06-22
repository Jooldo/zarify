
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useWorkers } from '@/hooks/useWorkers';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, User } from 'lucide-react';

interface WorkerAssignment {
  id: string;
  workerId: string;
  workerName: string;
  quantity: number;
  remarks?: string;
}

interface EnhancedStartStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturingOrder: any;
  stepName: string;
}

const EnhancedStartStepDialog: React.FC<EnhancedStartStepDialogProps> = ({
  isOpen,
  onClose,
  manufacturingOrder,
  stepName
}) => {
  const { workers } = useWorkers();
  const { toast } = useToast();
  
  const [assignments, setAssignments] = useState<WorkerAssignment[]>([
    {
      id: '1',
      workerId: '',
      workerName: '',
      quantity: manufacturingOrder.quantity_required,
      remarks: ''
    }
  ]);

  const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.quantity, 0);
  const remainingQuantity = manufacturingOrder.quantity_required - totalAssigned;

  const addWorkerAssignment = () => {
    if (remainingQuantity <= 0) {
      toast({
        title: 'Cannot add more assignments',
        description: 'All quantity has been assigned',
        variant: 'destructive'
      });
      return;
    }

    setAssignments([
      ...assignments,
      {
        id: Date.now().toString(),
        workerId: '',
        workerName: '',
        quantity: Math.min(remainingQuantity, 1),
        remarks: ''
      }
    ]);
  };

  const removeWorkerAssignment = (id: string) => {
    if (assignments.length === 1) return;
    setAssignments(assignments.filter(assignment => assignment.id !== id));
  };

  const updateAssignment = (id: string, field: keyof WorkerAssignment, value: any) => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === id) {
        const updated = { ...assignment, [field]: value };
        
        // If updating worker, also update worker name
        if (field === 'workerId') {
          const worker = workers.find(w => w.id === value);
          updated.workerName = worker?.name || '';
        }
        
        return updated;
      }
      return assignment;
    }));
  };

  const handleSubmit = async () => {
    // Validate assignments
    const invalidAssignments = assignments.filter(a => !a.workerId || a.quantity <= 0);
    if (invalidAssignments.length > 0) {
      toast({
        title: 'Invalid assignments',
        description: 'Please ensure all assignments have a worker and positive quantity',
        variant: 'destructive'
      });
      return;
    }

    if (totalAssigned !== manufacturingOrder.quantity_required) {
      toast({
        title: 'Quantity mismatch',
        description: `Total assigned (${totalAssigned}) must equal required quantity (${manufacturingOrder.quantity_required})`,
        variant: 'destructive'
      });
      return;
    }

    try {
      // Here you would create multiple step instances
      console.log('Creating step instances:', assignments);
      
      // For each assignment, create a new manufacturing order step
      for (const assignment of assignments) {
        // This would call your API to create step instance
        console.log(`Creating ${stepName} instance for worker ${assignment.workerName} with quantity ${assignment.quantity}`);
      }

      toast({
        title: 'Success',
        description: `Started ${assignments.length} ${stepName} instance(s)`,
      });

      onClose();
    } catch (error) {
      console.error('Error starting step:', error);
      toast({
        title: 'Error',
        description: 'Failed to start step instances',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Start {stepName} - {manufacturingOrder.order_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-slate-50 rounded-lg p-4 border">
            <h3 className="font-medium text-slate-700 mb-2">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Product:</span>
                <span className="ml-2 font-medium">{manufacturingOrder.product_name}</span>
              </div>
              <div>
                <span className="text-slate-500">Total Quantity:</span>
                <span className="ml-2 font-medium">{manufacturingOrder.quantity_required}</span>
              </div>
            </div>
          </div>

          {/* Quantity Summary */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm">
              <span className="text-slate-600">Assigned: </span>
              <span className="font-semibold text-blue-700">{totalAssigned}</span>
              <span className="text-slate-600 ml-4">Remaining: </span>
              <span className={`font-semibold ${remainingQuantity === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {remainingQuantity}
              </span>
            </div>
            {remainingQuantity === 0 && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Fully Assigned
              </Badge>
            )}
          </div>

          {/* Worker Assignments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-700">Worker Assignments</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addWorkerAssignment}
                disabled={remainingQuantity <= 0}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Worker
              </Button>
            </div>

            {assignments.map((assignment, index) => (
              <div key={assignment.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-700">Assignment #{index + 1}</span>
                  </div>
                  {assignments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkerAssignment(assignment.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`worker-${assignment.id}`}>Worker *</Label>
                    <Select
                      value={assignment.workerId}
                      onValueChange={(value) => updateAssignment(assignment.id, 'workerId', value)}
                    >
                      <SelectTrigger>
                        <Select value placeholder="Select worker..." />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${assignment.id}`}>Quantity *</Label>
                    <Input
                      id={`quantity-${assignment.id}`}
                      type="number"
                      min="1"
                      max={remainingQuantity + assignment.quantity}
                      value={assignment.quantity}
                      onChange={(e) => updateAssignment(assignment.id, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`remarks-${assignment.id}`}>Remarks</Label>
                  <Textarea
                    id={`remarks-${assignment.id}`}
                    placeholder="Optional remarks for this assignment..."
                    value={assignment.remarks}
                    onChange={(e) => updateAssignment(assignment.id, 'remarks', e.target.value)}
                    className="h-20"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={totalAssigned !== manufacturingOrder.quantity_required}>
              Start {assignments.length} Instance{assignments.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedStartStepDialog;
