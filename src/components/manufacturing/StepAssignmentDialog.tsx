
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, Scale, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface MaterialAllocation {
  id: string;
  name: string;
  required_quantity: number;
  allocated_weight: number;
  unit: string;
  available_stock: number;
  minimum_stock: number;
}

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
  productConfigId?: string;
  quantityRequired?: number;
}

const StepAssignmentDialog = ({
  open,
  onOpenChange,
  onAssign,
  stepNumber,
  stepName,
  productConfigId,
  quantityRequired = 1
}: StepAssignmentDialogProps) => {
  const [workerName, setWorkerName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [materialAllocations, setMaterialAllocations] = useState<MaterialAllocation[]>([]);
  const { toast } = useToast();
  const { rawMaterials, loading: rawMaterialsLoading } = useRawMaterials();

  // Load material requirements and current stock
  useEffect(() => {
    const loadMaterialRequirements = async () => {
      if (!productConfigId || !open) return;

      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data: configMaterials, error } = await supabase
          .from('product_config_materials')
          .select(`
            quantity_required,
            unit,
            raw_material:raw_materials (
              id,
              name,
              type,
              current_stock,
              minimum_stock
            )
          `)
          .eq('product_config_id', productConfigId);

        if (error) throw error;

        if (configMaterials && configMaterials.length > 0) {
          const allocations: MaterialAllocation[] = configMaterials.map(material => {
            const rawMaterial = material.raw_material;
            const requiredQty = material.quantity_required * quantityRequired;
            
            return {
              id: rawMaterial?.id || '',
              name: rawMaterial?.name || 'Unknown Material',
              required_quantity: requiredQty,
              allocated_weight: requiredQty, // Default to required quantity
              unit: material.unit,
              available_stock: rawMaterial?.current_stock || 0,
              minimum_stock: rawMaterial?.minimum_stock || 0
            };
          });

          setMaterialAllocations(allocations);
        } else {
          // Fallback to default materials
          const defaultAllocations: MaterialAllocation[] = [
            {
              id: 'default-1',
              name: 'Silver Wire',
              required_quantity: quantityRequired * 0.6,
              allocated_weight: quantityRequired * 0.6,
              unit: 'kg',
              available_stock: 50,
              minimum_stock: 10
            },
            {
              id: 'default-2',
              name: 'Base Metal',
              required_quantity: quantityRequired * 0.4,
              allocated_weight: quantityRequired * 0.4,
              unit: 'kg',
              available_stock: 30,
              minimum_stock: 5
            }
          ];
          setMaterialAllocations(defaultAllocations);
        }
      } catch (error) {
        console.error('Error loading material requirements:', error);
        toast({
          title: 'Error',
          description: 'Failed to load material requirements',
          variant: 'destructive',
        });
      }
    };

    loadMaterialRequirements();
  }, [productConfigId, quantityRequired, open]);

  const updateMaterialAllocation = (materialId: string, newWeight: number) => {
    setMaterialAllocations(prev => 
      prev.map(material => 
        material.id === materialId 
          ? { ...material, allocated_weight: newWeight }
          : material
      )
    );
  };

  const getTotalWeight = () => {
    return materialAllocations.reduce((sum, material) => sum + material.allocated_weight, 0);
  };

  const getStockStatus = (material: MaterialAllocation) => {
    if (material.allocated_weight > material.available_stock) {
      return { status: 'insufficient', color: 'text-red-600', icon: AlertTriangle };
    }
    if (material.available_stock - material.allocated_weight < material.minimum_stock) {
      return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    }
    return { status: 'sufficient', color: 'text-green-600', icon: CheckCircle };
  };

  const canAssign = () => {
    return workerName && 
           deliveryDate && 
           materialAllocations.every(material => material.allocated_weight <= material.available_stock);
  };

  const handleSubmit = () => {
    if (!canAssign()) {
      toast({
        title: 'Assignment Error',
        description: 'Please fill in all required fields and ensure sufficient stock allocation.',
        variant: 'destructive',
      });
      return;
    }

    const materialsData = materialAllocations.map(material => ({
      name: material.name,
      allocated_weight: material.allocated_weight,
      unit: material.unit
    }));

    onAssign({
      workerName,
      deliveryDate,
      totalWeight: getTotalWeight(),
      materials: materialsData
    });

    // Reset form
    setWorkerName('');
    setDeliveryDate('');
    setMaterialAllocations([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Assign Step {stepNumber}: {stepName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Assignment Details */}
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
            </CardContent>
          </Card>

          {/* Material Allocation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Raw Material Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rawMaterialsLoading ? (
                <div className="text-sm text-muted-foreground">Loading material requirements...</div>
              ) : materialAllocations.length > 0 ? (
                <div className="space-y-4">
                  {materialAllocations.map((material) => {
                    const stockStatus = getStockStatus(material);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <div key={material.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{material.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Required: {material.required_quantity.toFixed(2)} {material.unit}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${stockStatus.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {stockStatus.status === 'insufficient' && 'Insufficient Stock'}
                            {stockStatus.status === 'warning' && 'Low Stock After Allocation'}
                            {stockStatus.status === 'sufficient' && 'Sufficient Stock'}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Available Stock:</span>
                            <span className="ml-1 font-medium">{material.available_stock} {material.unit}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Minimum Stock:</span>
                            <span className="ml-1 font-medium">{material.minimum_stock} {material.unit}</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`allocation-${material.id}`} className="text-xs">
                            Allocate Weight ({material.unit}) *
                          </Label>
                          <Input
                            id={`allocation-${material.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            max={material.available_stock}
                            value={material.allocated_weight}
                            onChange={(e) => updateMaterialAllocation(material.id, parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>

                        {material.allocated_weight > material.available_stock && (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            ⚠️ Allocation exceeds available stock by {(material.allocated_weight - material.available_stock).toFixed(2)} {material.unit}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        Total Weight Allocated
                      </Label>
                      <span className="font-medium">
                        {getTotalWeight().toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No material requirements found for this product configuration.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canAssign()}>
              Assign Step
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepAssignmentDialog;
