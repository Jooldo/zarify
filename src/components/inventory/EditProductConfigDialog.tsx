
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface ProductConfig {
  id: string;
  category: string;
  subcategory: string;
  size_value: number;
  weight_range: string | null;
  product_code: string;
  is_active: boolean;
}

interface RawMaterialRequirement {
  id: string;
  raw_material_id: string;
  quantity_required: number;
  unit: string;
}

interface EditProductConfigDialogProps {
  config: ProductConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (configId: string) => Promise<void>;
}

const EditProductConfigDialog = ({ config, isOpen, onClose, onUpdate, onDelete }: EditProductConfigDialogProps) => {
  const [isActive, setIsActive] = useState(true);
  const [rawMaterials, setRawMaterials] = useState<Array<{
    id?: string;
    material: string;
    quantity: number;
    unit: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();
  const { rawMaterials: availableRawMaterials, loading: rawMaterialsLoading } = useRawMaterials();

  useEffect(() => {
    if (config && isOpen) {
      setIsActive(config.is_active);
      fetchConfigMaterials();
    }
  }, [config, isOpen]);

  const fetchConfigMaterials = async () => {
    if (!config) return;

    try {
      const { data, error } = await supabase
        .from('product_config_materials')
        .select('id, raw_material_id, quantity_required, unit')
        .eq('product_config_id', config.id);

      if (error) throw error;

      const materialsData = data?.map(item => ({
        id: item.id,
        material: item.raw_material_id,
        quantity: item.quantity_required,
        unit: item.unit
      })) || [];

      setRawMaterials(materialsData.length > 0 ? materialsData : [{ material: '', quantity: 0, unit: 'grams' }]);
    } catch (error) {
      console.error('Error fetching config materials:', error);
    }
  };

  const generateProductCode = () => {
    if (!config) return '';
    
    const categoryCode = config.category.slice(0, 3).toUpperCase();
    const subcategoryCode = config.subcategory.replace(/\s+/g, '').slice(0, 3).toUpperCase();
    const weightCode = config.weight_range ? config.weight_range.split('-')[0] + 'G' : '';
    
    return `${categoryCode}-${subcategoryCode}${weightCode ? '-' + weightCode : ''}`;
  };

  const addRawMaterial = () => {
    setRawMaterials([...rawMaterials, { material: '', quantity: 0, unit: 'grams' }]);
  };

  const removeRawMaterial = (index: number) => {
    if (rawMaterials.length > 1) {
      const newMaterials = [...rawMaterials];
      newMaterials.splice(index, 1);
      setRawMaterials(newMaterials);
    }
  };

  const updateRawMaterial = (index: number, field: string, value: any) => {
    const updatedMaterials = rawMaterials.map((material, i) => {
      if (i === index) {
        if (field === 'material') {
          const selectedMaterial = availableRawMaterials.find(m => m.id === value);
          return { 
            ...material, 
            [field]: value,
            unit: selectedMaterial?.unit || material.unit
          };
        }
        return { ...material, [field]: value };
      }
      return material;
    });
    setRawMaterials(updatedMaterials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setLoading(true);
    try {
      // Update product config (only is_active can be changed)
      const { error: configError } = await supabase
        .from('product_configs')
        .update({ is_active: isActive })
        .eq('id', config.id);

      if (configError) throw configError;

      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Delete existing materials
      const { error: deleteError } = await supabase
        .from('product_config_materials')
        .delete()
        .eq('product_config_id', config.id);

      if (deleteError) throw deleteError;

      // Insert new materials
      const validMaterials = rawMaterials.filter(material => material.material && material.quantity > 0);
      if (validMaterials.length > 0) {
        const materialEntries = validMaterials.map(material => ({
          product_config_id: config.id,
          raw_material_id: material.material,
          quantity_required: material.quantity,
          unit: material.unit,
          merchant_id: merchantId
        }));

        const { error: materialsError } = await supabase
          .from('product_config_materials')
          .insert(materialEntries);

        if (materialsError) throw materialsError;
      }

      toast({
        title: 'Success',
        description: 'Product configuration updated successfully',
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating product config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!config) return;

    setDeleteLoading(true);
    try {
      await onDelete(config.id);
      toast({
        title: 'Success',
        description: 'Product configuration deleted successfully',
      });
      onClose();
    } catch (error) {
      console.error('Error deleting product config:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product configuration',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!config) return null;

  const sizeInInches = config.size_value ? (config.size_value * 39.3701).toFixed(2) : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Edit Product Configuration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Product Code Display */}
          <div className="p-2 bg-blue-50 rounded text-xs">
            <Label className="text-xs font-medium">Product Code:</Label>
            <div className="text-sm font-bold text-blue-700">{generateProductCode()}</div>
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Category (Read Only)</Label>
              <Input
                value={config.category}
                className="h-7 text-xs bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <Label className="text-xs">Subcategory (Read Only)</Label>
              <Input
                value={config.subcategory}
                className="h-7 text-xs bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Size (inches) (Read Only)</Label>
              <Input
                value={sizeInInches}
                className="h-7 text-xs bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <Label className="text-xs">Weight Range (Read Only)</Label>
              <Input
                value={config.weight_range || 'N/A'}
                className="h-7 text-xs bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="scale-75"
            />
            <Label className="text-xs">Active</Label>
            <Badge variant={isActive ? "default" : "secondary"} className="text-xs h-4 px-1">
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Raw Materials Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Raw Materials Required</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRawMaterial}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {rawMaterials.map((material, index) => {
              const selectedMaterial = availableRawMaterials.find(m => m.id === material.material);
              
              return (
                <div key={index} className="grid grid-cols-12 gap-1 items-end">
                  <div className="col-span-5">
                    <Label className="text-xs">Raw Material</Label>
                    <Select 
                      value={material.material} 
                      onValueChange={(value) => updateRawMaterial(index, 'material', value)}
                      disabled={rawMaterialsLoading}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder={rawMaterialsLoading ? "Loading..." : "Select material"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRawMaterials.map((rawMat) => (
                          <SelectItem key={rawMat.id} value={rawMat.id} className="text-xs">
                            {rawMat.name} ({rawMat.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-3">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={material.quantity}
                      onChange={(e) => updateRawMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="h-7 text-xs"
                      min="0"
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      value={selectedMaterial?.unit || material.unit}
                      className="h-7 text-xs bg-gray-50"
                      readOnly
                      placeholder="Unit"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    {rawMaterials.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRawMaterial(index)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 h-7 text-xs" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="h-7 w-7 p-0" 
                  disabled={deleteLoading}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product Configuration</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this product configuration? This action cannot be undone and will also delete all associated raw material requirements.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="button" variant="outline" onClick={onClose} className="h-7 text-xs">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductConfigDialog;
