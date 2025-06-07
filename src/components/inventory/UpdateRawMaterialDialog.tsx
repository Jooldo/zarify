
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RawMaterial } from '@/hooks/useRawMaterials';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateRawMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
  onMaterialUpdated: () => void;
}

const UpdateRawMaterialDialog = ({ isOpen, onOpenChange, material, onMaterialUpdated }: UpdateRawMaterialDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    unit: '',
    minimum_stock: 0,
  });
  const { toast } = useToast();

  const materialTypes = ["Chain", "Kunda", "Ghungroo", "Thread", "Beads"];
  const units = ["grams", "pieces", "meters", "rolls", "kg"];

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
            <Label htmlFor="materialType">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="unit">Unit *</Label>
            <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
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

          <Button 
            className="w-full" 
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Material'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRawMaterialDialog;
