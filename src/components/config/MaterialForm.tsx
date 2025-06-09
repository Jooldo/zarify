
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import MaterialTypeSelector from '@/components/inventory/MaterialTypeSelector';

interface MaterialFormData {
  name: string;
  type: string;
  unit: string;
  minimum_stock: string;
}

interface MaterialFormProps {
  formData: MaterialFormData;
  onFormDataChange: (data: MaterialFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

const MaterialForm = ({ 
  formData, 
  onFormDataChange, 
  onSubmit, 
  isSubmitting, 
  isEditing 
}: MaterialFormProps) => {
  const handleInputChange = (field: keyof MaterialFormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Material Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter material name"
            required
          />
        </div>
        <div className="space-y-2">
          <MaterialTypeSelector
            value={formData.type}
            onValueChange={(value) => handleInputChange('type', value)}
            placeholder="Select or create material type"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grams">Grams (g)</SelectItem>
              <SelectItem value="pieces">Pieces</SelectItem>
              <SelectItem value="meters">Meters (m)</SelectItem>
              <SelectItem value="rolls">Rolls</SelectItem>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimum_stock">Minimum Stock Level</Label>
          <Input
            id="minimum_stock"
            type="number"
            value={formData.minimum_stock}
            onChange={(e) => handleInputChange('minimum_stock', e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Material' : 'Add Material'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default MaterialForm;
