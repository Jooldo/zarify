
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useProductConfigs } from '@/hooks/useProductConfigs';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface Worker {
  id: string;
  name: string;
}

interface MaterialAllocation {
  raw_material_id: string;
  raw_material_name: string;
  quantity_required: number;
  allocated_weight: number;
  unit: string;
  current_stock: number;
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
  const [quantityToProduce, setQuantityToProduce] = useState('');
  const { toast } = useToast();
  const { productConfigs } = useProductConfigs();
  const { rawMaterials } = useRawMaterials();

  // Mock data - replace with actual API calls
  const workers: Worker[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' }
  ];

  // Fetch required materials for step 1
  useEffect(() => {
    if (stepNumber === 1 && open && productionItemId && quantityToProduce) {
      console.log('Fetching materials for production item:', productionItemId);
      console.log('Available product configs:', productConfigs);
      console.log('Available raw materials:', rawMaterials);
      
      // For now, since we don't have the production item details, 
      // we'll use the first available product config
      // In a real implementation, you would fetch the production item details 
      // and get the correct product_config_id from it
      const productConfig = productConfigs[0];
      
      if (productConfig?.product_config_materials && productConfig.product_config_materials.length > 0) {
        console.log('Product config materials:', productConfig.product_config_materials);
        
        const quantity = parseFloat(quantityToProduce) || 0;
        
        const materials = productConfig.product_config_materials.map(configMaterial => {
          const rawMaterial = rawMaterials.find(rm => rm.id === configMaterial.raw_material_id);
          const totalRequired = configMaterial.quantity_required * quantity;
          
          console.log(`Material ${rawMaterial?.name}: ${configMaterial.quantity_required} x ${quantity} = ${totalRequired}`);
          
          return {
            raw_material_id: configMaterial.raw_material_id,
            raw_material_name: rawMaterial?.name || 'Unknown Material',
            quantity_required: configMaterial.quantity_required,
            allocated_weight: totalRequired,
            unit: configMaterial.unit,
            current_stock: rawMaterial?.current_stock || 0
          };
        });
        
        console.log('Calculated material allocations:', materials);
        setMaterialAllocations(materials);
      } else {
        console.log('No product config materials found');
        setMaterialAllocations([]);
      }
    } else if (stepNumber !== 1) {
      setMaterialAllocations([]);
    }
  }, [stepNumber, open, productionItemId, quantityToProduce, productConfigs, rawMaterials]);

  const updateMaterialAllocation = (index: number, allocated_weight: number) => {
    const updated = [...materialAllocations];
    updated[index] = { ...updated[index], allocated_weight };
    setMaterialAllocations(updated);
  };

  const handleAssign = () => {
    if (!selectedWorker || !deliveryDate || !quantityToProduce) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // For step 1, validate material allocations
    if (stepNumber === 1) {
      const invalidAllocations = materialAllocations.some(
        allocation => allocation.allocated_weight <= 0
      );

      if (invalidAllocations) {
        toast({
          title: 'Invalid Material Allocations',
          description: 'Please ensure all material allocations have valid weights.',
          variant: 'destructive',
        });
        return;
      }

      // Check if there's enough stock
      const insufficientStock = materialAllocations.some(
        allocation => allocation.allocated_weight > allocation.current_stock
      );

      if (insufficientStock) {
        toast({
          title: 'Insufficient Stock',
          description: 'Some materials have insufficient stock for the requested allocation.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Here you would make API calls to create the assignment and material allocations
    console.log('Creating assignment:', {
      productionItemId,
      stepNumber,
      workerId: selectedWorker,
      deliveryDate,
      quantityToProduce: parseInt(quantityToProduce),
      materialAllocations: stepNumber === 1 ? materialAllocations : [],
      notes
    });

    toast({
      title: 'Assignment Created',
      description: `Step ${stepNumber} assigned to worker with delivery date ${format(deliveryDate, 'PPP')}`,
    });

    onAssignmentComplete();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedWorker('');
    setDeliveryDate(undefined);
    setQuantityToProduce('');
    setNotes('');
    setMaterialAllocations([]);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Step {stepNumber}: {stepName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Worker Selection and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Assign Worker *</Label>
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
              <Label>Quantity to Produce *</Label>
              <Input
                type="number"
                value={quantityToProduce}
                onChange={(e) => setQuantityToProduce(e.target.value)}
                placeholder="Enter quantity"
                min="1"
              />
            </div>

            <div>
              <Label>Delivery Date *</Label>
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

          {/* Material Allocations - Only for Step 1 */}
          {stepNumber === 1 && (
            <div>
              <Label className="text-base font-medium">Raw Material Allocations</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Materials required for production (calculated based on quantity)
              </p>

              {materialAllocations.length > 0 ? (
                <div className="space-y-3">
                  {materialAllocations.map((allocation, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 border rounded-lg">
                      <div className="col-span-4">
                        <Label className="text-sm font-medium">{allocation.raw_material_name}</Label>
                        <p className="text-xs text-muted-foreground">
                          Required: {allocation.quantity_required} {allocation.unit} per piece
                        </p>
                      </div>

                      <div className="col-span-3">
                        <Label className="text-sm">Calculated Total</Label>
                        <div className="text-sm font-medium">
                          {allocation.allocated_weight.toFixed(2)} {allocation.unit}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <Label className="text-sm">Available Stock</Label>
                        <div className={cn(
                          "text-sm font-medium",
                          allocation.current_stock < allocation.allocated_weight ? "text-red-600" : "text-green-600"
                        )}>
                          {allocation.current_stock.toFixed(2)} {allocation.unit}
                        </div>
                      </div>

                      <div className="col-span-3">
                        <Label className="text-sm">Assign Weight</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={allocation.allocated_weight}
                          onChange={(e) => updateMaterialAllocation(index, parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className={cn(
                            allocation.allocated_weight > allocation.current_stock && "border-red-500"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  {quantityToProduce ? (
                    productConfigs.length === 0 ? "Loading product configurations..." : 
                    "No raw materials configured for this product"
                  ) : (
                    "Enter quantity to see required materials"
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step Info for Non-Step 1 */}
          {stepNumber !== 1 && (
            <div className="p-4 bg-blue-50 rounded-lg border">
              <Label className="text-base font-medium">Step Information</Label>
              <p className="text-sm text-muted-foreground mt-1">
                This step will use the output from Step {stepNumber - 1} as input material.
                No raw material allocation required.
              </p>
            </div>
          )}

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
