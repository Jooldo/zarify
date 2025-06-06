
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
        <Button className="flex items-center gap-2 h-8 px-3 text-xs">
          <Plus className="h-3 w-3" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Raw Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="materialName">Material Name *</Label>
            <Input 
              id="materialName" 
              placeholder="Enter material name" 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
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
            <Label htmlFor="minStock">Minimum Stock</Label>
            <Input 
              id="minStock" 
              type="number" 
              placeholder="0" 
              value={formData.minimum_stock}
              onChange={(e) => handleInputChange('minimum_stock', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="unit">Unit *</Label>
            <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pieces">Pieces</SelectItem>
                <SelectItem value="meters">Meters</SelectItem>
                <SelectItem value="rolls">Rolls</SelectItem>
                <SelectItem value="kg">Kilograms</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="costPerUnit">Cost Per Unit</Label>
            <Input 
              id="costPerUnit" 
              type="number" 
              placeholder="0.00" 
              step="0.01"
              value={formData.cost_per_unit || ''}
              onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || undefined)}
              min="0"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialDialog;
