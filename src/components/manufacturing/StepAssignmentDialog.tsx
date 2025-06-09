import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useProductConfigs } from '@/hooks/useProductConfigs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  assigned_weight: number;
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
            assigned_weight: totalRequired,
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
      assigned_weight: 0,
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
      allocation => !allocation.raw_material_id || allocation.allocated_weight <= 0 || allocation.assigned_weight <= 0
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
      allocation => allocation.current_stock && allocation.assigned_weight > allocation.current_stock
    );

    if (stockShortages.length > 0) {
      const shortageDetails = stockShortages.map(s => 
        `${s.material_name}: need ${s.assigned_weight}${s.unit}, have ${s.current_stock}${s.unit}`
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
  const totalAssignedWeight = materialAllocations.reduce((sum, allocation) => sum + allocation.assigned_weight, 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
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
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="text-sm font-medium text-blue-900">Material Summary</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                  <div>Total materials: {materialAllocations.length}</div>
                  <div>Required weight: {totalMaterialsRequired.toFixed(2)}kg</div>
                  <div>Assigned weight: {totalAssignedWeight.toFixed(2)}kg</div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading materials configuration...
              </div>
            ) : (
              <div className="space-y-4">
                {materialAllocations.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Raw Material</TableHead>
                          <TableHead>Required Weight</TableHead>
                          <TableHead>Assigned Weight</TableHead>
                          <TableHead>Stock Available</TableHead>
                          {!isStep1 && <TableHead>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materialAllocations.map((allocation, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {isStep1 ? (
                                <div className="font-medium">
                                  {allocation.material_name}
                                </div>
                              ) : (
                                <Select
                                  value={allocation.raw_material_id}
                                  onValueChange={(value) => updateMaterialAllocation(index, 'raw_material_id', value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {rawMaterials.map(material => (
                                      <SelectItem key={material.id} value={material.id}>
                                        {material.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={allocation.allocated_weight || ''}
                                  onChange={(e) => updateMaterialAllocation(index, 'allocated_weight', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  readOnly={isStep1}
                                  className={cn("w-20", isStep1 && 'bg-muted')}
                                />
                                <span className="text-sm text-muted-foreground">{allocation.unit}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={allocation.assigned_weight || ''}
                                  onChange={(e) => updateMaterialAllocation(index, 'assigned_weight', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  className={cn(
                                    "w-20",
                                    allocation.current_stock && allocation.assigned_weight > allocation.current_stock
                                      ? 'border-red-500 focus:border-red-500'
                                      : ''
                                  )}
                                />
                                <span className="text-sm text-muted-foreground">{allocation.unit}</span>
                              </div>
                              {allocation.current_stock && allocation.assigned_weight > allocation.current_stock && (
                                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Exceeds by {(allocation.assigned_weight - allocation.current_stock).toFixed(2)}{allocation.unit}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="text-sm">
                                  {allocation.current_stock !== undefined ? allocation.current_stock : '-'}
                                </span>
                                <span className="text-sm text-muted-foreground">{allocation.unit}</span>
                              </div>
                            </TableCell>
                            {!isStep1 && (
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMaterialAllocation(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
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
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional instructions or notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
