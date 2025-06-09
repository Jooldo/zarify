
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Worker {
  id: string;
  name: string;
}

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
}

interface MaterialAllocation {
  raw_material_id: string;
  allocated_weight: number;
  unit: string;
}

interface StepAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionItemId: string;
  stepNumber: number;
  stepName: string;
  onAssignmentComplete: () => void;
}

const StepAssignmentDialog = ({
  open,
  onOpenChange,
  productionItemId,
  stepNumber,
  stepName,
  onAssignmentComplete
}: StepAssignmentDialogProps) => {
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [materialAllocations, setMaterialAllocations] = useState<MaterialAllocation[]>([]);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  const workers: Worker[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' }
  ];

  const rawMaterials: RawMaterial[] = [
    { id: '1', name: 'Silver Wire', unit: 'kg', current_stock: 50 },
    { id: '2', name: 'Gold Plating', unit: 'kg', current_stock: 25 },
    { id: '3', name: 'Copper Base', unit: 'kg', current_stock: 100 }
  ];

  const addMaterialAllocation = () => {
    setMaterialAllocations([...materialAllocations, {
      raw_material_id: '',
      allocated_weight: 0,
      unit: 'kg'
    }]);
  };

  const removeMaterialAllocation = (index: number) => {
    setMaterialAllocations(materialAllocations.filter((_, i) => i !== index));
  };

  const updateMaterialAllocation = (index: number, field: keyof MaterialAllocation, value: any) => {
    const updated = [...materialAllocations];
    updated[index] = { ...updated[index], [field]: value };
    setMaterialAllocations(updated);
  };

  const handleAssign = () => {
    if (!selectedWorker || !deliveryDate || materialAllocations.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields and add at least one material allocation.',
        variant: 'destructive',
      });
      return;
    }

    // Validate material allocations
    const invalidAllocations = materialAllocations.some(
      allocation => !allocation.raw_material_id || allocation.allocated_weight <= 0
    );

    if (invalidAllocations) {
      toast({
        title: 'Invalid Material Allocations',
        description: 'Please ensure all material allocations have valid materials and weights.',
        variant: 'destructive',
      });
      return;
    }

    // Here you would make API calls to create the assignment and material allocations
    console.log('Creating assignment:', {
      productionItemId,
      stepNumber,
      workerId: selectedWorker,
      deliveryDate,
      materialAllocations,
      notes
    });

    toast({
      title: 'Assignment Created',
      description: `Step ${stepNumber} assigned to worker with delivery date ${format(deliveryDate, 'PPP')}`,
    });

    onAssignmentComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Step {stepNumber}: {stepName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Worker Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Assign Worker</Label>
              <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                <SelectTrigger>
                  <SelectValue placeholder="Select worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map(worker => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Material Allocations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">Material Allocations</Label>
              <Button onClick={addMaterialAllocation} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>

            <div className="space-y-3">
              {materialAllocations.map((allocation, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label className="text-sm">Raw Material</Label>
                    <Select
                      value={allocation.raw_material_id}
                      onValueChange={(value) => updateMaterialAllocation(index, 'raw_material_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map(material => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} (Stock: {material.current_stock} {material.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Label className="text-sm">Weight</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={allocation.allocated_weight}
                      onChange={(e) => updateMaterialAllocation(index, 'allocated_weight', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-sm">Unit</Label>
                    <Select
                      value={allocation.unit}
                      onValueChange={(value) => updateMaterialAllocation(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="pieces">pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMaterialAllocation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {materialAllocations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No materials allocated. Click "Add Material" to start.
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional instructions or notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>
              Assign Step
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepAssignmentDialog;
