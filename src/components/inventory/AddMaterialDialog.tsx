
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { CreateRawMaterialData } from '@/hooks/useRawMaterials';
import MaterialTypeSelector from './MaterialTypeSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddMaterialDialogProps {
  onAddMaterial: (data: CreateRawMaterialData) => Promise<void>;
}

const AddMaterialDialog = ({ onAddMaterial }: AddMaterialDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRawMaterialData>({
    name: '',
    type: '',
    current_stock: 0,
    minimum_stock: 0,
    unit: '',
    cost_per_unit: undefined,
  });
  const { toast } = useToast();

  // Standardized units with consistent naming
  const availableUnits = [
    { value: "grams", label: "Grams (g)" },
    { value: "pieces", label: "Pieces" },
    { value: "meters", label: "Meters (m)" },
    { value: "rolls", label: "Rolls" },
    { value: "kg", label: "Kilograms (kg)" }
  ];

  const checkForDuplicate = async (name: string, type: string) => {
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
        .limit(1);

      if (error) throw error;

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking for duplicate:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.unit) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Check for duplicate
      const isDuplicate = await checkForDuplicate(formData.name, formData.type);
      if (isDuplicate) {
        toast({
          title: 'Error',
          description: 'A raw material with this name and type already exists',
          variant: 'destructive',
        });
        return;
      }

      await onAddMaterial(formData);
      setFormData({
        name: '',
        type: '',
        current_stock: 0,
        minimum_stock: 0,
        unit: '',
        cost_per_unit: undefined,
      });
      setOpen(false);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateRawMaterialData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 h-9 px-4 text-sm">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Add New Raw Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="materialName" className="text-sm font-medium">Material Name *</Label>
              <Input 
                id="materialName" 
                placeholder="Enter material name" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="h-10 text-sm mt-2"
                required
              />
            </div>
            
            <div>
              <MaterialTypeSelector
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
                placeholder="Select or add material type"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="unit" className="text-sm font-medium">Unit *</Label>
            <select
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className="w-full h-10 px-3 mt-2 text-sm border border-gray-300 rounded-md"
              required
            >
              <option value="">Select unit</option>
              {availableUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Use grams for weight-based materials</p>
          </div>

          <div>
            <Label htmlFor="minStock" className="text-sm font-medium">Minimum Stock Threshold</Label>
            <Input 
              id="minStock" 
              type="number" 
              placeholder="0" 
              value={formData.minimum_stock}
              onChange={(e) => handleInputChange('minimum_stock', parseInt(e.target.value) || 0)}
              className="h-10 text-sm mt-2"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Alert threshold when stock runs low</p>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" className="flex-1 h-10 text-sm" disabled={loading}>
              {loading ? 'Adding...' : 'Add Material'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-10 text-sm px-6">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialDialog;
