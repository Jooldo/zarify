
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, Scale, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRawMaterials } from '@/hooks/useRawMaterials';

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
  const [totalWeight, setTotalWeight] = useState(0);
  const [materials, setMaterials] = useState<{ name: string; allocated_weight: number; unit: string; }[]>([]);
  const { toast } = useToast();
  const { rawMaterials } = useRawMaterials();

  // Calculate total weight based on raw materials required
  useEffect(() => {
    const calculateMaterialsWeight = async () => {
      if (!productConfigId || !open) return;

      try {
        // Fetch product config materials from Supabase
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data: configMaterials, error } = await supabase
          .from('product_config_materials')
          .select(`
            quantity_required,
            unit,
            raw_material:raw_materials (
              name,
              type
            )
          `)
          .eq('product_config_id', productConfigId);

        if (error) throw error;

        if (configMaterials && configMaterials.length > 0) {
          const calculatedMaterials = configMaterials.map(material => ({
            name: material.raw_material?.name || 'Unknown Material',
            allocated_weight: material.quantity_required * quantityRequired,
            unit: material.unit
          }));

          const totalCalculatedWeight = calculatedMaterials.reduce(
            (sum, material) => sum + material.allocated_weight, 
            0
          );

          setMaterials(calculatedMaterials);
          setTotalWeight(totalCalculatedWeight);
        } else {
          // Fallback to default materials if no config found
          const defaultMaterials = [
            { name: 'Silver Wire', allocated_weight: quantityRequired * 0.6, unit: 'kg' },
            { name: 'Base Metal', allocated_weight: quantityRequired * 0.4, unit: 'kg' }
          ];
          setMaterials(defaultMaterials);
          setTotalWeight(quantityRequired);
        }
      } catch (error) {
        console.error('Error calculating materials weight:', error);
        // Fallback to default calculation
        const defaultMaterials = [
          { name: 'Silver Wire', allocated_weight: quantityRequired * 0.6, unit: 'kg' },
          { name: 'Base Metal', allocated_weight: quantityRequired * 0.4, unit: 'kg' }
        ];
        setMaterials(defaultMaterials);
        setTotalWeight(quantityRequired);
      }
    };

    calculateMaterialsWeight();
  }, [productConfigId, quantityRequired, open]);

  const handleSubmit = () => {
    if (!workerName || !deliveryDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    onAssign({
      workerName,
      deliveryDate,
      totalWeight,
      materials
    });

    // Reset form
    setWorkerName('');
    setDeliveryDate('');
    setTotalWeight(0);
    setMaterials([]);
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
                <input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  Total Weight Required
                </Label>
                <div className="p-3 bg-muted/50 rounded text-sm font-medium">
                  {totalWeight.toFixed(2)} kg (calculated from raw materials)
                </div>
              </div>

              {materials.length > 0 && (
                <div>
                  <Label className="flex items-center gap-1 mb-2">
                    <Package className="h-3 w-3" />
                    Material Breakdown
                  </Label>
                  <div className="space-y-1">
                    {materials.map((material, index) => (
                      <div key={index} className="p-2 bg-muted/30 rounded text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{material.name}</span>
                          <span>{material.allocated_weight.toFixed(2)} {material.unit}</span>
                        </div>
                      </div>
                    ))}
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
