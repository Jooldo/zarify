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
  onSubmit?: (data: any) => Promise<void>;
  initialData?: any;
  isUpdate?: boolean;
}

const CreateProductConfigForm = ({ onClose, onSubmit, initialData, isUpdate = false }: CreateProductConfigFormProps) => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [sizeValue, setSizeValue] = useState('');
  const [weightRange, setWeightRange] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([
    { material: '', quantity: 0, unit: '' }
  ]);

  // Categories list
  const categories = [
    'Khusboo',
    'Agra Fancy',
    'Salem',
    'Bombay Fancy',
    'Karap'
  ];

  // Populate form with initial data if updating
  useEffect(() => {
    if (initialData && isUpdate) {
      setCategory(initialData.category || '');
      setSubcategory(initialData.subcategory || '');
      setSizeValue(initialData.sizeValue || '');
      setWeightRange(initialData.weightRange || '');
      setIsActive(initialData.isActive ?? true);
      setRawMaterials(initialData.rawMaterials || [{ material: '', quantity: 0, unit: '' }]);
    }
  }, [initialData, isUpdate]);

  const generateProductCode = () => {
    if (!category || !subcategory) return '';
    
    const categoryCode = category.slice(0, 3).toUpperCase();
    const subcategoryCode = subcategory.replace(/\s+/g, '').slice(0, 3).toUpperCase();
    const weightCode = weightRange ? weightRange.split('-')[0] + 'G' : '';
    
    return `${categoryCode}-${subcategoryCode}${weightCode ? '-' + weightCode : ''}`;
  };

  const addRawMaterial = () => {
    console.log('Adding new raw material');
    setRawMaterials([...rawMaterials, { material: '', quantity: 0, unit: '' }]);
  };

  const removeRawMaterial = (index: number) => {
    if (rawMaterials.length > 1) {
      console.log('Removing raw material at index:', index);
      const newMaterials = [...rawMaterials];
      newMaterials.splice(index, 1);
      setRawMaterials(newMaterials);
    }
  };

  const updateRawMaterial = (index: number, field: string, value: any) => {
    console.log('Updating raw material:', { index, field, value });
    const updatedMaterials = rawMaterials.map((material, i) => {
      if (i === index) {
        const updated = { ...material, [field]: value };
        console.log('Updated material:', updated);
        return updated;
      }
      return material;
    });
    console.log('New raw materials array:', updatedMaterials);
    setRawMaterials(updatedMaterials);
  };

  const updateRawMaterialBatch = (index: number, updates: { material?: string; unit?: string; quantity?: number }) => {
    console.log('Batch updating raw material:', { index, updates });
    const updatedMaterials = rawMaterials.map((material, i) => {
      if (i === index) {
        const updated = { ...material, ...updates };
        console.log('Batch updated material:', updated);
        return updated;
      }
      return material;
    });
    console.log('New raw materials array after batch update:', updatedMaterials);
    setRawMaterials(updatedMaterials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !subcategory || !sizeValue || !weightRange) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate weight range format
    const weightRegex = /^\d+(\.\d+)?-\d+(\.\d+)?\s*(gms?|g)$/i;
    if (!weightRegex.test(weightRange.trim())) {
      alert('Please enter weight range in format: 35-45 gms');
      return;
    }

    // Validate that all raw materials have been selected
    const invalidMaterials = rawMaterials.filter(material => !material.material || material.quantity <= 0);
    if (invalidMaterials.length > 0) {
      alert('Please select materials and enter valid quantities for all raw materials');
      return;
    }

    setIsSubmitting(true);

    try {
      const productCode = generateProductCode();

      const productConfigData = {
        category,
        subcategory,
        sizeValue,
        weightRange,
        isActive,
        productCode,
        rawMaterials
      };

      if (onSubmit) {
        await onSubmit(productConfigData);
      } else {
        console.log(isUpdate ? 'Updating product config:' : 'Creating product config:', productConfigData);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save product configuration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">{isUpdate ? 'Update' : 'Create'} Product Configuration</CardHeader>
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
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
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
              <Label htmlFor="sizeValue" className="text-xs">Size Value (inches) *</Label>
              <Input
                id="sizeValue"
                value={sizeValue}
                onChange={(e) => setSizeValue(e.target.value)}
                placeholder="10"
                className="h-7 text-xs"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="weightRange" className="text-xs">Weight Range *</Label>
              <Input
                id="weightRange"
                value={weightRange}
                onChange={(e) => setWeightRange(e.target.value)}
                placeholder="35-45 gms"
                className="h-7 text-xs"
                required
              />
            </div>
          </div>

          <ProductConfigDetails 
            category={category}
            subcategory={subcategory}
            sizeValue={sizeValue}
            weightRange={weightRange}
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
        updateRawMaterialBatch={updateRawMaterialBatch}
      />

      <div className="flex gap-2 justify-end pt-1">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          size="sm" 
          className="h-7 text-xs px-2"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          size="sm" 
          className="h-7 text-xs px-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (isUpdate ? 'Update' : 'Create')} Configuration
        </Button>
      </div>
    </form>
  );
};

export default CreateProductConfigForm;
