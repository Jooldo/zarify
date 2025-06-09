
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useProductConfigs } from '@/hooks/useProductConfigs';

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
  material_name?: string;
  required_quantity?: number;
  current_stock?: number;
}

interface StepAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionItemId: string;
  stepNumber: number;
  stepName: string;
  productCode: string;
  quantityRequired: number;
  onAssignmentComplete: () => void;
}

const StepAssignmentDialog = ({
  open,
  onOpenChange,
  productionItemId,
  stepNumber,
  stepName,
  productCode,
  quantityRequired,
  onAssignmentComplete
}: StepAssignmentDialogProps) => {
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [materialAllocations, setMaterialAllocations] = useState<MaterialAllocation[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { productConfigs } = useProductConfigs();

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

  // Auto-fetch materials for Step 1
  useEffect(() => {
    if (open && stepNumber === 1 && productCode) {
      setLoading(true);
      console.log('Fetching materials for product code:', productCode);
      
      // Find the product configuration
      const productConfig = productConfigs.find(config => config.product_code === productCode);
      
      if (productConfig && productConfig.product_config_materials) {
        console.log('Found product config:', productConfig);
        
        const autoMaterials: MaterialAllocation[] = productConfig.product_config_materials.map(material => {
          const totalRequired = material.quantity_required * quantityRequired;
          const rawMaterial = rawMaterials.find(rm => rm.id === material.raw_material_id);
          
          return {
            raw_material_id: material.raw_material_id,
            allocated_weight: totalRequired,
            unit: material.unit,
            material_name: material.raw_material?.name || rawMaterial?.name || 'Unknown Material',
            required_quantity: totalRequired,
            current_stock: rawMaterial?.current_stock || 0
          };
        });
        
        console.log('Auto-populated materials:', autoMaterials);
        setMaterialAllocations(autoMaterials);
      } else {
        console.warn('No product configuration found for:', productCode);
        toast({
          title: 'Configuration Not Found',
          description: `No raw material configuration found for product ${productCode}`,
          variant: 'destructive',
        });
      }
      setLoading(false);
    } else if (open && stepNumber !== 1) {
      // For other steps, start with empty materials (manual selection)
      setMaterialAllocations([]);
    }
  }, [open, stepNumber, productCode, quantityRequired, productConfigs, toast]);

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

    // Check for stock shortages
    const stockShortages = materialAllocations.filter(
      allocation => allocation.current_stock && allocation.allocated_weight > allocation.current_stock
    );

    if (stockShortages.length > 0) {
      const shortageDetails = stockShortages.map(s => 
        `${s.material_name}: need ${s.allocated_weight}${s.unit}, have ${s.current_stock}${s.unit}`
      ).join(', ');
      
      toast({
        title: 'Stock Shortage Warning',
        description: `Insufficient stock for: ${shortageDetails}`,
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

  const resetDialog = () => {
    setSelectedWorker('');
    setDeliveryDate(undefined);
    setMaterialAllocations([]);
    setNotes('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetDialog();
    }
    onOpenChange(newOpen);
  };

  const isStep1 = stepNumber === 1;
  const totalMaterialsRequired = materialAllocations.reduce((sum, allocation) => sum + allocation.allocated_weight, 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Step {stepNumber}: {stepName}</DialogTitle>
          {isStep1 && (
            <div className="text-sm text-muted-foreground">
              Product: {productCode} • Quantity: {quantityRequired} units
            </div>
          )}
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
              <Label className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Material Allocations
                {isStep1 && (
                  <span className="text-sm text-muted-foreground font-normal">
                    (Auto-populated from product configuration)
                  </span>
                )}
              </Label>
              {!isStep1 && (
                <Button onClick={addMaterialAllocation} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              )}
            </div>

            {/* Summary for Step 1 */}
            {isStep1 && materialAllocations.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="text-sm font-medium text-blue-900 mb-1">Material Summary</div>
                <div className="text-sm text-blue-700">
                  Total materials: {materialAllocations.length} • 
                  Total weight: {totalMaterialsRequired.toFixed(2)}kg
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading materials configuration...
              </div>
            ) : (
              <div className="space-y-3">
                {materialAllocations.map((allocation, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label className="text-sm">Raw Material</Label>
                      {isStep1 ? (
                        <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                          <span className="text-sm">
                            {allocation.material_name}
                            {allocation.current_stock !== undefined && (
                              <span className="text-muted-foreground ml-2">
                                (Stock: {allocation.current_stock} {allocation.unit})
                              </span>
                            )}
                          </span>
                        </div>
                      ) : (
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
                      )}
                    </div>

                    <div className="col-span-3">
                      <Label className="text-sm">
                        {isStep1 ? 'Required Weight' : 'Weight'}
                        {isStep1 && allocation.required_quantity && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (Calculated)
                          </span>
                        )}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={allocation.allocated_weight}
                        onChange={(e) => updateMaterialAllocation(index, 'allocated_weight', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={
                          allocation.current_stock && allocation.allocated_weight > allocation.current_stock
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }
                      />
                      {allocation.current_stock && allocation.allocated_weight > allocation.current_stock && (
                        <div className="text-xs text-red-600 mt-1">
                          Exceeds stock by {(allocation.allocated_weight - allocation.current_stock).toFixed(2)}{allocation.unit}
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label className="text-sm">Unit</Label>
                      {isStep1 ? (
                        <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                          <span className="text-sm">{allocation.unit}</span>
                        </div>
                      ) : (
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
                      )}
                    </div>

                    <div className="col-span-2">
                      {!isStep1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterialAllocation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {materialAllocations.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    {isStep1 
                      ? "No materials found for this product configuration." 
                      : "No materials allocated. Click 'Add Material' to start."
                    }
                  </div>
                )}
              </div>
            )}
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
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={loading}>
              Assign Step
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepAssignmentDialog;
