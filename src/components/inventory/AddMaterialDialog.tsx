
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { CreateRawMaterialData, useRawMaterials } from '@/hooks/useRawMaterials';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddMaterialDialogProps {
  onAddMaterial?: (data: CreateRawMaterialData) => Promise<void>;
  isFloating?: boolean;
}

const AddMaterialDialog = ({ onAddMaterial, isFloating = false }: AddMaterialDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [formData, setFormData] = useState<CreateRawMaterialData>({
    name: '',
    type: '',
    current_stock: 0,
    minimum_stock: 0,
    unit: '',
  });
  const { toast } = useToast();
  const { addRawMaterial } = useRawMaterials();

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
    setDuplicateError('');
    
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
      const isDuplicate = await checkForDuplicate(formData.name, formData.type);
      if (isDuplicate) {
        setDuplicateError('A raw material with this name and type already exists');
        setLoading(false);
        return;
      }

      console.log('Submitting material data:', formData);
      
      // Use the provided callback or the hook's method
      if (onAddMaterial) {
        await onAddMaterial(formData);
      } else {
        await addRawMaterial(formData);
      }
      
      setFormData({
        name: '',
        type: '',
        current_stock: 0,
        minimum_stock: 0,
        unit: '',
      });
      setDuplicateError('');
      setOpen(false);
      toast({
        title: 'Success',
        description: 'Raw material added successfully',
      });
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: 'Error',
        description: 'Failed to add raw material',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateRawMaterialData, value: string | number) => {
    console.log('Field change:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'name' || field === 'type') {
      setDuplicateError('');
    }
  };

  const TriggerButton = isFloating ? (
    <Button 
      className="rounded-full h-16 px-6 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
    >
      <Plus className="h-5 w-5" />
      <span className="font-medium">Add Material</span>
    </Button>
  ) : (
    <Button className="flex items-center gap-2 h-9 px-4 text-sm">
      <Plus className="h-4 w-4" />
      Add Material
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
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
              {duplicateError && (
                <p className="text-xs text-red-600 mt-1">{duplicateError}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="materialType" className="text-sm font-medium">Material Type *</Label>
              <Input 
                id="materialType" 
                placeholder="Enter material type" 
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="h-10 text-sm mt-2"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="unit" className="text-sm font-medium">Unit *</Label>
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
