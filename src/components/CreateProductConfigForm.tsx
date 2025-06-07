
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
  const [product, setProduct] = useState(''); // Renamed from subcategory
  const [category, setCategory] = useState('');
  const [sizeValue, setSizeValue] = useState('');
  const [weightInGrams, setWeightInGrams] = useState('');
  const [threshold, setThreshold] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([
    { material: '', quantity: 0, unit: 'grams' } // Default to grams
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
      setProduct(initialData.subcategory || ''); // Map subcategory to product
      setCategory(initialData.category || '');
      setSizeValue(initialData.sizeValue || '');
      setWeightInGrams(initialData.weightInGrams || '');
      setThreshold(initialData.threshold || '');
      setIsActive(initialData.isActive ?? true);
      setRawMaterials(initialData.rawMaterials || [{ material: '', quantity: 0, unit: 'grams' }]);
    }
  }, [initialData, isUpdate]);

  const generateProductCode = () => {
    if (!category || !product) return '';
    
    const categoryCode = category.slice(0, 3).toUpperCase();
    const productCode = product.replace(/\s+/g, '').slice(0, 3).toUpperCase(); // Use product instead of subcategory
    const weightCode = weightInGrams ? weightInGrams + 'G' : '';
    
    return `${categoryCode}-${productCode}${weightCode ? '-' + weightCode : ''}`;
  };

  const addRawMaterial = () => {
    console.log('Adding new raw material');
    setRawMaterials([...rawMaterials, { material: '', quantity: 0, unit: 'grams' }]); // Default to grams
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
    
    if (!product || !category || !sizeValue || !weightInGrams) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate weight format (should be a positive number)
    const weight = parseFloat(weightInGrams);
    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid weight in grams');
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
        subcategory: product, // Map product back to subcategory for backend compatibility
        sizeValue,
        weightInGrams,
        threshold: threshold ? parseInt(threshold) : 0,
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
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{isUpdate ? 'Update' : 'Create'} Product Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {/* Product (formerly Subcategory) - First field */}
            <div>
              <Label htmlFor="product" className="text-sm font-medium">Product Type *</Label>
              <Input
                id="product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Meena Work"
                className="h-10 text-sm mt-2"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Specify the exact product type or style</p>
            </div>

            {/* Category - Second field */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 text-sm mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-sm">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="sizeValue" className="text-sm font-medium">Size Value (inches) *</Label>
                <Input
                  id="sizeValue"
                  value={sizeValue}
                  onChange={(e) => setSizeValue(e.target.value)}
                  placeholder="10"
                  className="h-10 text-sm mt-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter size in inches</p>
              </div>
              
              <div>
                <Label htmlFor="weightInGrams" className="text-sm font-medium">Weight (grams) *</Label>
                <Input
                  id="weightInGrams"
                  type="number"
                  step="0.1"
                  min="0"
                  value={weightInGrams}
                  onChange={(e) => setWeightInGrams(e.target.value)}
                  placeholder="35.5"
                  className="h-10 text-sm mt-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter weight in grams only</p>
              </div>
            </div>

            <div>
              <Label htmlFor="threshold" className="text-sm font-medium">Stock Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="10"
                className="h-10 text-sm mt-2"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum stock level before alert</p>
            </div>

            <ProductConfigDetails 
              category={category}
              subcategory={product} // Pass product as subcategory for compatibility
              sizeValue={sizeValue}
              weightInGrams={weightInGrams}
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

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            size="sm" 
            className="h-10 text-sm px-6"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            size="sm" 
            className="h-10 text-sm px-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isUpdate ? 'Update' : 'Create')} Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductConfigForm;
