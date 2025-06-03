
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductConfigDetails from './config/ProductConfigDetails';
import RawMaterialsSection from './config/RawMaterialsSection';

interface CreateProductConfigFormProps {
  onClose: () => void;
  initialData?: any;
  isUpdate?: boolean;
}

const CreateProductConfigForm = ({ onClose, initialData, isUpdate = false }: CreateProductConfigFormProps) => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [size, setSize] = useState('');
  const [sizeValue, setSizeValue] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [rawMaterials, setRawMaterials] = useState([
    { material: '', quantity: 0, unit: 'grams' }
  ]);

  // Populate form with initial data if updating
  useEffect(() => {
    if (initialData && isUpdate) {
      setCategory(initialData.category || '');
      setSubcategory(initialData.subcategory || '');
      
      // Extract size from the size string (e.g., "Small (0.20m)" -> "Small")
      const sizeMatch = initialData.size?.match(/^(\w+)/);
      setSize(sizeMatch ? sizeMatch[1] : '');
      
      // Extract size value from the size string (e.g., "Small (0.20m)" -> "0.20")
      const sizeValueMatch = initialData.size?.match(/\(([0-9.]+)m\)/);
      setSizeValue(sizeValueMatch ? sizeValueMatch[1] : '');
      
      setIsActive(initialData.isActive ?? true);
      setRawMaterials(initialData.rawMaterials || [{ material: '', quantity: 0, unit: 'grams' }]);
    }
  }, [initialData, isUpdate]);

  const generateProductCode = () => {
    if (!category || !subcategory || !size) return '';
    
    const categoryCode = category.slice(0, 3).toUpperCase();
    const subcategoryCode = subcategory.replace(/\s+/g, '').slice(0, 3).toUpperCase();
    const sizeCode = size.slice(0, 2).toUpperCase();
    
    return `${categoryCode}-${subcategoryCode}-${sizeCode}`;
  };

  const addRawMaterial = () => {
    setRawMaterials([...rawMaterials, { material: '', quantity: 0, unit: 'grams' }]);
  };

  const removeRawMaterial = (index) => {
    if (rawMaterials.length > 1) {
      const newMaterials = [...rawMaterials];
      newMaterials.splice(index, 1);
      setRawMaterials(newMaterials);
    }
  };

  const updateRawMaterial = (index, field, value) => {
    const updatedMaterials = rawMaterials.map((material, i) => {
      if (i === index) {
        return { ...material, [field]: value };
      }
      return material;
    });
    setRawMaterials(updatedMaterials);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const productCode = generateProductCode();

    const productConfigData = {
      category,
      subcategory,
      size,
      sizeValue,
      isActive,
      productCode,
      rawMaterials
    };

    console.log(isUpdate ? 'Updating product config:' : 'Creating product config:', productConfigData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">{isUpdate ? 'Update' : 'Create'} Product Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="category" className="text-xs">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Traditional" className="text-xs">Traditional</SelectItem>
                  <SelectItem value="Modern" className="text-xs">Modern</SelectItem>
                  <SelectItem value="Bridal" className="text-xs">Bridal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subcategory" className="text-xs">Subcategory *</Label>
              <Input
                id="subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Meena Work"
                className="h-7 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="size" className="text-xs">Size *</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Small" className="text-xs">Small</SelectItem>
                  <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
                  <SelectItem value="Large" className="text-xs">Large</SelectItem>
                  <SelectItem value="Extra Large" className="text-xs">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sizeValue" className="text-xs">Size Value (m) *</Label>
              <Input
                id="sizeValue"
                value={sizeValue}
                onChange={(e) => setSizeValue(e.target.value)}
                placeholder="0.25"
                className="h-7 text-xs"
                required
              />
            </div>
          </div>

          <ProductConfigDetails 
            category={category}
            subcategory={subcategory}
            size={size}
            sizeValue={sizeValue}
            isActive={isActive}
            generateProductCode={generateProductCode}
            setIsActive={setIsActive}
          />
        </CardContent>
      </Card>

      <RawMaterialsSection 
        rawMaterials={rawMaterials}
        addRawMaterial={addRawMaterial}
        removeRawMaterial={removeRawMaterial}
        updateRawMaterial={updateRawMaterial}
      />

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="outline" onClick={onClose} size="sm" className="h-7 text-xs px-2">
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-7 text-xs px-2">
          {isUpdate ? 'Update' : 'Create'} Configuration
        </Button>
      </div>
    </form>
  );
};

export default CreateProductConfigForm;
