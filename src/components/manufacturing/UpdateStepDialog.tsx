
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useWorkers } from '@/hooks/useWorkers';
import { Tables } from '@/integrations/supabase/types';
import { CalendarDays, User, FileText, Save, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import ReworkDialog from './ReworkDialog';

interface UpdateStepDialogProps {
  step: Tables<'manufacturing_order_step_data'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStepUpdate?: () => void;
  orderSteps?: any[];
  manufacturingSteps?: any[];
}

const UpdateStepDialog: React.FC<UpdateStepDialogProps> = ({
  step,
  open,
  onOpenChange,
  onStepUpdate,
  orderSteps = [],
  manufacturingSteps = []
}) => {
  const { updateStep, isUpdating } = useUpdateManufacturingStep();
  const { workers } = useWorkers();
  const [reworkDialogOpen, setReworkDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    status: '',
    quantity_assigned: '',
    quantity_received: '',
    weight_assigned: '',
    weight_received: '',
    purity: '',
    wastage: '',
    assigned_worker: '',
    due_date: '',
    notes: ''
  });

  // Initialize form data when step changes
  useEffect(() => {
    if (step) {
      setFormData({
        status: step.status || '',
        quantity_assigned: step.quantity_assigned?.toString() || '',
        quantity_received: step.quantity_received?.toString() || '',
        weight_assigned: step.weight_assigned?.toString() || '',
        weight_received: step.weight_received?.toString() || '',
        purity: step.purity?.toString() || '',
        wastage: step.wastage?.toString() || '',
        assigned_worker: step.assigned_worker || '',
        due_date: step.due_date || '',
        notes: step.notes || ''
      });
    }
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step) return;

    const fieldValues: Record<string, any> = {};
    
    // Only include non-empty values
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (key === 'status' || key === 'assigned_worker' || key === 'due_date' || key === 'notes') {
          fieldValues[key] = value;
        } else {
          // Convert numeric fields
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue)) {
            fieldValues[key] = numValue;
          }
        }
      }
    });

    try {
      await updateStep({
        stepId: step.id,
        fieldValues,
        stepName: step.step_name,
        orderNumber: `Order ${step.order_id.slice(-6)}`
      });
      
      onStepUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  const handleReworkCreated = () => {
    onStepUpdate?.();
    setReworkDialogOpen(false);
  };

  if (!step) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-300';
      case 'skipped': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>Update {step.step_name}</span>
                {step.is_rework && (
                  <Badge className="text-xs px-2 py-1 bg-orange-100 text-orange-800 border-orange-300">
                    REWORK
                  </Badge>
                )}
              </div>
              <Badge className={`text-xs px-3 py-1 ${getStatusColor(step.status)}`}>
                {step.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Instance #{step.instance_number} • Created {format(new Date(step.created_at), 'MMM dd, yyyy HH:mm')}
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status and Assignment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_worker" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned Worker
                </Label>
                <Select value={formData.assigned_worker} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_worker: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select worker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quantity and Weight Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity_assigned">Qty Assigned</Label>
                <Input
                  id="quantity_assigned"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.quantity_assigned}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity_assigned: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity_received">Qty Received</Label>
                <Input
                  id="quantity_received"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.quantity_received}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity_received: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight_assigned">Weight Assigned (kg)</Label>
                <Input
                  id="weight_assigned"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight_assigned}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight_assigned: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight_received">Weight Received (kg)</Label>
                <Input
                  id="weight_received"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight_received}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight_received: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Additional Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purity">Purity (%)</Label>
                <Input
                  id="purity"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.purity}
                  onChange={(e) => setFormData(prev => ({ ...prev, purity: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wastage">Wastage (kg)</Label>
                <Input
                  id="wastage"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.wastage}
                  onChange={(e) => setFormData(prev => ({ ...prev, wastage: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes or comments..."
                rows={3}
              />
            </div>

            <DialogFooter className="flex justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReworkDialogOpen(true)}
                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rework
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isUpdating ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Step
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ReworkDialog
        open={reworkDialogOpen}
        onOpenChange={setReworkDialogOpen}
        originStep={step}
        orderId={step.order_id}
        onReworkCreated={handleReworkCreated}
      />
    </>
  );
};

export default UpdateStepDialog;
