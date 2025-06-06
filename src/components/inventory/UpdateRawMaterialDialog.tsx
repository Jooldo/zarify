
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

interface Supplier {
  id: string;
  company_name: string;
}

const UpdateRawMaterialDialog = ({ isOpen, onOpenChange, material, onMaterialUpdated }: UpdateRawMaterialDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    unit: '',
    minimum_stock: 0,
    cost_per_unit: 0,
    supplier_id: '',
  });
  const { toast } = useToast();

  const materialTypes = ["Chain", "Kunda", "Ghungroo", "Thread", "Beads"];
  const units = ["pieces", "meters", "rolls", "kg"];

  useEffect(() => {
    if (material && isOpen) {
      setFormData({
        name: material.name || '',
        type: material.type || '',
        unit: material.unit || '',
        minimum_stock: material.minimum_stock || 0,
        cost_per_unit: material.cost_per_unit || 0,
        supplier_id: material.supplier_id || 'no-supplier',
      });
      fetchSuppliers();
    }
  }, [material, isOpen]);

  const fetchSuppliers = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('suppliers')
        .select('id, company_name')
        .eq('merchant_id', merchantId)
        .order('company_name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
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
      const { error } = await supabase
        .from('raw_materials')
        .update({
          name: formData.name,
          type: formData.type,
          unit: formData.unit,
          minimum_stock: formData.minimum_stock,
          cost_per_unit: formData.cost_per_unit || null,
          supplier_id: formData.supplier_id === 'no-supplier' ? null : formData.supplier_id,
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

          <div>
            <Label htmlFor="costPerUnit">Cost Per Unit</Label>
            <Input 
              id="costPerUnit" 
              type="number" 
              step="0.01"
              value={formData.cost_per_unit}
              onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Select value={formData.supplier_id} onValueChange={(value) => handleInputChange('supplier_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-supplier">No supplier</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
