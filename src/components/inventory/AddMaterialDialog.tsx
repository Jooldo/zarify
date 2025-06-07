
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { CreateRawMaterialData } from '@/hooks/useRawMaterials';

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

  const materialTypes = ["Chain", "Kunda", "Ghungroo", "Thread", "Beads"];

  // Standardized units with grams as default for weight-based materials
  const availableUnits = [
    { value: "grams", label: "Grams (g)" },
    { value: "pieces", label: "Pieces" },
    { value: "meters", label: "Meters (m)" },
    { value: "rolls", label: "Rolls" },
    { value: "kilograms", label: "Kilograms (kg)" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.unit) {
      return;
    }

    setLoading(true);
    try {
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
              <Label htmlFor="materialType" className="text-sm font-medium">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="h-10 text-sm mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-sm">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="unit" className="text-sm font-medium">Unit *</Label>
            <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
              <SelectTrigger className="h-10 text-sm mt-2">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value} className="text-sm">
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
