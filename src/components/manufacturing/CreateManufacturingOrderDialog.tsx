import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useProductConfigs } from '@/hooks/useProductConfigs';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import RawMaterialStockDisplay from './RawMaterialStockDisplay';

interface CreateManufacturingOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateManufacturingOrderDialog: React.FC<CreateManufacturingOrderDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [productConfigId, setProductConfigId] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [quantityRequired, setQuantityRequired] = useState<number>(1);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [stockValidation, setStockValidation] = useState<{isValid: boolean, insufficientMaterials: string[]}>({isValid: true, insufficientMaterials: []});

  const { productConfigs, loading: configsLoading } = useProductConfigs();
  const { createOrder, isCreating } = useManufacturingOrders();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setProductConfigId('');
      setProductName('');
      setQuantityRequired(1);
      setPriority('medium');
      setDueDate(undefined);
      setSpecialInstructions('');
    }
  }, [open]);

  const handleProductConfigChange = (configId: string) => {
    setProductConfigId(configId);
    const config = productConfigs.find(c => c.id === configId);
    if (config) {
      setProductName(`${config.category}-${config.subcategory}-${config.size_value}${config.weight_range ? `-${config.weight_range}` : ''}`);
    }
  };

  const validateStockAvailability = async (configId: string, quantity: number) => {
    if (!configId || quantity <= 0) {
      setStockValidation({isValid: true, insufficientMaterials: []});
      return;
    }

    try {
      // Check if we have enough raw materials for this quantity
      const { data: materialRequirements, error } = await supabase
        .from('product_config_materials')
        .select(`
          quantity_required,
          raw_materials(
            id,
            name,
            current_stock,
            unit
          )
        `)
        .eq('product_config_id', configId);

      if (error) throw error;

      const insufficientMaterials: string[] = [];
      
      materialRequirements?.forEach(requirement => {
        const requiredQuantity = requirement.quantity_required * quantity;
        const availableStock = requirement.raw_materials?.current_stock || 0;
        
        if (availableStock < requiredQuantity) {
          insufficientMaterials.push(
            `${requirement.raw_materials?.name}: need ${requiredQuantity} ${requirement.raw_materials?.unit}, have ${availableStock} ${requirement.raw_materials?.unit}`
          );
        }
      });

      setStockValidation({
        isValid: insufficientMaterials.length === 0,
        insufficientMaterials
      });
    } catch (error) {
      console.error('Error validating stock:', error);
      setStockValidation({isValid: false, insufficientMaterials: ['Error checking stock availability']});
    }
  };

  // Validate stock when product config or quantity changes
  useEffect(() => {
    if (productConfigId && quantityRequired > 0) {
      validateStockAvailability(productConfigId, quantityRequired);
    }
  }, [productConfigId, quantityRequired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productConfigId || !productName || quantityRequired <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    if (!stockValidation.isValid) {
      toast({
        title: 'Insufficient Stock',
        description: 'Cannot create manufacturing order due to insufficient raw material stock.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createOrder({
        product_name: productName,
        product_config_id: productConfigId,
        quantity_required: quantityRequired,
        priority,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        special_instructions: specialInstructions || undefined,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating manufacturing order:', error);
    }
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Create Manufacturing Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-config">Product Configuration *</Label>
              <Select value={productConfigId} onValueChange={handleProductConfigChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product configuration" />
                </SelectTrigger>
                <SelectContent>
                  {productConfigs.map((config) => (
                    <SelectItem key={config.id} value={config.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{config.product_code}</span>
                        <span className="text-xs text-muted-foreground">
                          {config.category}-{config.subcategory}-{config.size_value}
                          {config.weight_range && `-${config.weight_range}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Required *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantityRequired}
                onChange={(e) => setQuantityRequired(parseInt(e.target.value) || 1)}
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {/* Stock Validation Alert */}
          {!stockValidation.isValid && productConfigId && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Insufficient Stock</span>
              </div>
              <div className="space-y-1">
                {stockValidation.insufficientMaterials.map((material, index) => (
                  <div key={index} className="text-sm text-red-700">
                    • {material}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor('low')}`}>
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor('medium')}`}>
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor('high')}`}>
                      High
                    </span>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor('urgent')}`}>
                      Urgent
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Enter any special instructions for this manufacturing order..."
              rows={3}
            />
          </div>

          {/* Raw Material Stock Display */}
          {productConfigId && quantityRequired > 0 && (
            <RawMaterialStockDisplay 
              productConfigId={productConfigId}
              quantityRequired={quantityRequired}
            />
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !productConfigId || quantityRequired <= 0 || !stockValidation.isValid}
            >
              {isCreating ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateManufacturingOrderDialog;
