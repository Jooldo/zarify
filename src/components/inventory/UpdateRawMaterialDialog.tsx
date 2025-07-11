import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RawMaterial } from '@/hooks/useRawMaterials';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface UpdateRawMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
  onMaterialUpdated: () => void;
}

const UpdateRawMaterialDialog = ({ isOpen, onOpenChange, material, onMaterialUpdated }: UpdateRawMaterialDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    unit: '',
    minimum_stock: 0,
  });
  const { toast } = useToast();

  // Consistent units with AddMaterialDialog
  const availableUnits = [
    { value: "grams", label: "Grams (g)" },
    { value: "pieces", label: "Pieces" },
    { value: "meters", label: "Meters (m)" },
    { value: "rolls", label: "Rolls" },
    { value: "kg", label: "Kilograms (kg)" }
  ];

  useEffect(() => {
    if (material && isOpen) {
      setFormData({
        name: material.name || '',
        type: material.type || '',
        unit: material.unit || '',
        minimum_stock: material.minimum_stock || 0,
      });
    }
  }, [material, isOpen]);

  const checkForDuplicate = async (name: string, type: string) => {
    if (!material) return false;
    
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('raw_materials')
        .select('id')
        .eq('merchant_id', merchantId)
        .eq('name', name.trim())
        .eq('type', type.trim())
        .neq('id', material.id) // Exclude current material
        .limit(1);

      if (error) throw error;

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking for duplicate:', error);
      return false;
    }
  };

  const handleUpdate = async () => {
    if (!material || !formData.name || !formData.type || !formData.unit) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Check for duplicate only if name or type changed
      if (formData.name !== material.name || formData.type !== material.type) {
        const isDuplicate = await checkForDuplicate(formData.name, formData.type);
        if (isDuplicate) {
          toast({
            title: 'Error',
            description: 'A raw material with this name and type already exists',
            variant: 'destructive',
          });
          return;
        }
      }

      const { error } = await supabase
        .from('raw_materials')
        .update({
          name: formData.name,
          type: formData.type,
          unit: formData.unit,
          minimum_stock: formData.minimum_stock,
          last_updated: new Date().toISOString()
        })
        .eq('id', material.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Raw material updated successfully',
      });

      onMaterialUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating raw material:', error);
      toast({
        title: 'Error',
        description: 'Failed to update raw material',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!material) return;

    setDeleteLoading(true);
    try {
      // First check if this material is used in any product configurations
      const { data: usageCheck, error: checkError } = await supabase
        .from('product_config_materials')
        .select('id')
        .eq('raw_material_id', material.id)
        .limit(1);

      if (checkError) throw checkError;

      if (usageCheck && usageCheck.length > 0) {
        toast({
          title: 'Cannot Delete',
          description: 'This raw material is used in product configurations and cannot be deleted',
          variant: 'destructive',
        });
        return;
      }

      // Check if there are any procurement requests for this material
      const { data: procurementCheck, error: procurementError } = await supabase
        .from('procurement_requests')
        .select('id')
        .eq('raw_material_id', material.id)
        .limit(1);

      if (procurementError) throw procurementError;

      if (procurementCheck && procurementCheck.length > 0) {
        toast({
          title: 'Cannot Delete',
          description: 'This raw material has procurement requests and cannot be deleted',
          variant: 'destructive',
        });
        return;
      }

      // Delete the raw material
      const { error } = await supabase
        .from('raw_materials')
        .delete()
        .eq('id', material.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Raw material deleted successfully',
      });

      onMaterialUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting raw material:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete raw material',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!material) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Raw Material</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="materialName">Material Name *</Label>
            <Input 
              id="materialName" 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter material name"
            />
          </div>
          
          <div>
            <Label htmlFor="materialType">Material Type *</Label>
            <Input 
              id="materialType" 
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              placeholder="Enter material type"
            />
          </div>

          <div>
            <Label htmlFor="unit">Unit *</Label>
            <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
              <SelectTrigger className="w-full h-10 text-sm mt-2">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="minimumStock">Minimum Stock</Label>
            <Input 
              id="minimumStock" 
              type="number" 
              value={formData.minimum_stock}
              onChange={(e) => handleInputChange('minimum_stock', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Material'}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={deleteLoading}
                  className="px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Raw Material</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{material.name}"? This action cannot be undone. 
                    The material will only be deleted if it's not used in any product configurations or procurement requests.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRawMaterialDialog;
