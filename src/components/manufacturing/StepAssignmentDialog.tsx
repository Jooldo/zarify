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
  productionItem?: {
    product_code: string;
    category: string;
    subcategory: string;
    size: string;
    quantity_required: number;
  };
  onAssignmentComplete: () => void;
}

const StepAssignmentDialog = ({
  open,
  onOpenChange,
  productionItemId,
  stepNumber,
  stepName,
  productionItem,
  onAssignmentComplete
}: StepAssignmentDialogProps) => {
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [materialAllocations, setMaterialAllocations] = useState<MaterialAllocation[]>([]);
  const [notes, setNotes] = useState('');
  const [quantityToProduce, setQuantityToProduce] = useState('');
  const { toast } = useToast();
  const { productConfigs, loading: configsLoading } = useProductConfigs();
  const { rawMaterials, loading: materialsLoading } = useRawMaterials();

  // Mock data - replace with actual API calls
  const workers: Worker[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' }
  ];

  // Find the correct product configuration for this production item - only by product_code
  const getProductConfig = () => {
    if (!productionItem || !productConfigs.length) {
      console.log('DEBUG: No production item or configs available:', {
        hasProductionItem: !!productionItem,
        productConfigsLength: productConfigs.length,
        configsLoading,
        productionItem
      });
      return null;
    }
    
    console.log('DEBUG: Searching for product config by product_code only:', {
      targetProductCode: productionItem.product_code,
      availableConfigs: productConfigs.map(c => ({
        id: c.id,
        product_code: c.product_code,
        category: c.category,
        subcategory: c.subcategory,
        size_value: c.size_value,
        hasProductConfigMaterials: !!c.product_config_materials,
        materialsCount: c.product_config_materials?.length || 0
      }))
    });
    
    // Only match by product_code
    const config = productConfigs.find(config => config.product_code === productionItem.product_code);
    
    if (config) {
      console.log('DEBUG: Found config by product_code:', {
        configId: config.id,
        productCode: config.product_code,
        hasProductConfigMaterials: !!config.product_config_materials,
        materialsCount: config.product_config_materials?.length || 0,
        materials: config.product_config_materials
      });
    } else {
      console.log('DEBUG: No matching config found for product_code:', productionItem.product_code);
      console.log('DEBUG: Available product codes:', productConfigs.map(c => c.product_code));
    }
    
    return config;
  };

  // Fetch required materials for step 1
  useEffect(() => {
    console.log('DEBUG: useEffect triggered for materials:', {
      stepNumber,
      open,
      hasProductionItem: !!productionItem,
      configsLoading,
      materialsLoading,
      productConfigsLength: productConfigs.length,
      rawMaterialsLength: rawMaterials.length
    });

    if (stepNumber === 1 && open && productionItem && !configsLoading && !materialsLoading) {
      const productConfig = getProductConfig();
      
      console.log('DEBUG: Product config result:', {
        found: !!productConfig,
        config: productConfig,
        hasMaterials: !!productConfig?.product_config_materials,
        materialsCount: productConfig?.product_config_materials?.length || 0
      });
      
      if (productConfig?.product_config_materials) {
        console.log('DEBUG: Processing product config materials:', {
          materials: productConfig.product_config_materials,
          rawMaterialsCount: rawMaterials.length
        });
        
        const materials = productConfig.product_config_materials.map(configMaterial => {
          const rawMaterial = rawMaterials.find(rm => rm.id === configMaterial.raw_material_id);
          console.log('DEBUG: Mapping material:', {
            configMaterialId: configMaterial.raw_material_id,
            foundRawMaterial: !!rawMaterial,
            rawMaterialName: rawMaterial?.name,
            quantityRequired: configMaterial.quantity_required
          });
          
          return {
            raw_material_id: configMaterial.raw_material_id,
            raw_material_name: rawMaterial?.name || 'Unknown Material',
            quantity_required: configMaterial.quantity_required,
            allocated_weight: 0,
            unit: configMaterial.unit,
            current_stock: rawMaterial?.current_stock || 0
          };
        });
        
        console.log('DEBUG: Final mapped materials:', materials);
        setMaterialAllocations(materials);
      } else {
        console.log('DEBUG: No product config or materials found for product_code:', productionItem.product_code);
        setMaterialAllocations([]);
      }
    } else if (stepNumber !== 1) {
      setMaterialAllocations([]);
    }
  }, [stepNumber, open, productionItem, productConfigs, rawMaterials, configsLoading, materialsLoading]);

  // Update allocated weights when quantity changes
  useEffect(() => {
    const quantity = parseInt(quantityToProduce) || 0;
    if (quantity > 0 && materialAllocations.length > 0) {
      const updatedAllocations = materialAllocations.map(allocation => ({
        ...allocation,
        allocated_weight: allocation.quantity_required * quantity
      }));
      console.log('Updated allocations based on quantity:', {
        quantity,
        updatedAllocations
      });
      setMaterialAllocations(updatedAllocations);
    }
  }, [quantityToProduce]);

  // Initialize quantity from production item
  useEffect(() => {
    if (open && productionItem && !quantityToProduce) {
      setQuantityToProduce(productionItem.quantity_required.toString());
    }
  }, [open, productionItem]);

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

  const productConfig = getProductConfig();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Step {stepNumber}: {stepName}</DialogTitle>
          {productionItem && (
            <p className="text-sm text-muted-foreground">
              Product: {productionItem.product_code} | {productionItem.category} - {productionItem.subcategory} | {productionItem.size}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-gray-100 rounded text-xs">
              <div className="font-bold mb-2">Debug Info:</div>
              <div>Configs Loading: {configsLoading.toString()}</div>
              <div>Materials Loading: {materialsLoading.toString()}</div>
              <div>Product Configs Count: {productConfigs.length}</div>
              <div>Raw Materials Count: {rawMaterials.length}</div>
              <div>Product Config Found: {(!!productConfig).toString()}</div>
              <div>Material Allocations Count: {materialAllocations.length}</div>
            </div>
          )}

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
                Materials required for production (automatically calculated based on quantity)
              </p>

              {configsLoading || materialsLoading ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Loading product configuration and materials...
                </div>
              ) : !productConfig ? (
                <div className="text-center py-8 text-red-600 border-2 border-dashed border-red-200 rounded-lg">
                  <div className="font-medium">No product configuration found for this item.</div>
                  <div className="text-sm mt-1">Product Code: {productionItem?.product_code}</div>
                  <div className="text-xs mt-2 text-muted-foreground">
                    Please check the product setup in Configuration → Product Configuration
                  </div>
                </div>
              ) : materialAllocations.length > 0 ? (
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
                        <Label className="text-sm">Calculated Weight</Label>
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
                  {quantityToProduce ? "No raw materials configured for this product" : "Enter quantity to see required materials"}
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
