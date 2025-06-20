
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Search, Check, ChevronsUpDown, AlertTriangle } from 'lucide-react';
import ProductConfigDetails from './config/ProductConfigDetails';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useProductConfigs } from '@/hooks/useProductConfigs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface CreateProductConfigFormProps {
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
  initialData?: any;
  isUpdate?: boolean;
}

const CreateProductConfigForm = ({ onClose, onSubmit, initialData, isUpdate = false }: CreateProductConfigFormProps) => {
  const [product, setProduct] = useState('');
  const [category, setCategory] = useState('');
  const [sizeValue, setSizeValue] = useState('');
  const [weightInGrams, setWeightInGrams] = useState('');
  const [threshold, setThreshold] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productCodeExists, setProductCodeExists] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([
    { material: '', quantity: 0, unit: 'grams' }
  ]);
  const [openMaterialSelectors, setOpenMaterialSelectors] = useState<boolean[]>([false]);

  const { rawMaterials: availableRawMaterials, loading: rawMaterialsLoading } = useRawMaterials();
  const { checkProductCodeExists } = useProductConfigs();

  // Categories list
  const categories = [
    'Khusboo',
    'Agra Fancy',
    'Salem',
    'Bombay Fancy',
    'Karap'
  ];

  useEffect(() => {
    if (initialData && isUpdate) {
      setProduct(initialData.subcategory || '');
      setCategory(initialData.category || '');
      setSizeValue(initialData.sizeValue || '');
      setWeightInGrams(initialData.weightInGrams || '');
      setThreshold(initialData.threshold || '');
      setImagePreview(initialData.image_url || null);
      setIsActive(initialData.isActive ?? true);
      setRawMaterials(initialData.rawMaterials || [{ material: '', quantity: 0, unit: 'grams' }]);
      setOpenMaterialSelectors(new Array(initialData.rawMaterials?.length || 1).fill(false));
    }
  }, [initialData, isUpdate]);

  const generateProductCode = () => {
    if (!category || !product || !sizeValue) return '';
    
    const categoryCode = category.slice(0, 3).toUpperCase();
    const productCode = product.replace(/\s+/g, '').toUpperCase(); // Use entire subcategory name
    const sizeCode = sizeValue ? `${sizeValue}IN` : ''; // Add size in inches
    const weightCode = weightInGrams ? weightInGrams + 'G' : '';
    
    return `${categoryCode}-${productCode}${sizeCode ? '-' + sizeCode : ''}${weightCode ? '-' + weightCode : ''}`;
  };

  // Check for duplicate product code whenever the generated code changes
  useEffect(() => {
    const checkDuplicate = async () => {
      const productCode = generateProductCode();
      if (productCode && !isUpdate) {
        const exists = await checkProductCodeExists(productCode);
        setProductCodeExists(exists);
      }
    };

    checkDuplicate();
  }, [category, product, weightInGrams, checkProductCodeExists, isUpdate, sizeValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addMaterial = () => {
    setRawMaterials([...rawMaterials, { material: '', quantity: 0, unit: 'grams' }]);
    setOpenMaterialSelectors([...openMaterialSelectors, false]);
  };

  const removeMaterial = (index: number) => {
    if (rawMaterials.length > 1) {
      const newMaterials = [...rawMaterials];
      newMaterials.splice(index, 1);
      setRawMaterials(newMaterials);
      
      const newOpenStates = [...openMaterialSelectors];
      newOpenStates.splice(index, 1);
      setOpenMaterialSelectors(newOpenStates);
    }
  };

  const updateMaterial = (index: number, field: 'material' | 'quantity' | 'unit', value: any) => {
    const updatedMaterials = rawMaterials.map((material, i) => {
      if (i === index) {
        if (field === 'material') {
          const selectedMaterial = availableRawMaterials.find(m => m.id === value);
          return { 
            ...material, 
            [field]: value,
            unit: selectedMaterial?.unit || material.unit
          };
        }
        return { ...material, [field]: value };
      }
      return material;
    });
    setRawMaterials(updatedMaterials);
  };

  const toggleMaterialSelector = (index: number, open: boolean) => {
    const newOpenStates = [...openMaterialSelectors];
    newOpenStates[index] = open;
    setOpenMaterialSelectors(newOpenStates);
  };

  const getSelectedMaterialInfo = (materialId: string) => {
    return availableRawMaterials.find(m => m.id === materialId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !category || !sizeValue || !weightInGrams) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate product code
    if (productCodeExists && !isUpdate) {
      alert('This product code already exists. Please modify the product type, category, or weight to generate a unique code.');
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
      let finalImageUrl = isUpdate ? initialData.image_url : null;

      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: isUpdate,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('product_images')
          .getPublicUrl(uploadData.path);
        
        finalImageUrl = urlData.publicUrl;
      }


      const productConfigData = {
        category,
        subcategory: product,
        size_value: parseFloat(sizeValue),
        weight_range: `${weightInGrams}g`,
        is_active: isActive,
        product_code: productCode,
        threshold: threshold ? parseInt(threshold) : undefined,
        image_url: finalImageUrl,
        rawMaterials: rawMaterials.filter(material => material.material && material.quantity > 0)
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
            {/* Product Type - First field */}
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

            <div>
              <Label htmlFor="imageUpload" className="text-sm font-medium">Product Image</Label>
              <div className="mt-2 flex items-center gap-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="Product preview" className="h-20 w-20 object-cover rounded-md border" />
                ) : (
                  <div className="h-20 w-20 bg-gray-100 rounded-md border flex items-center justify-center text-gray-400">
                    <Search className="h-8 w-8" />
                  </div>
                )}
                <div className="flex-grow">
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a PNG, JPG, or GIF file.</p>
                </div>
              </div>
            </div>

            {/* Product Code Warning */}
            {productCodeExists && !isUpdate && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Product code "{generateProductCode()}" already exists
                  </span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  Please modify the product type, category, or weight to generate a unique code.
                </p>
              </div>
            )}

            <ProductConfigDetails 
              category={category}
              subcategory={product}
              sizeValue={sizeValue}
              weightInGrams={weightInGrams}
              isActive={isActive}
              generateProductCode={generateProductCode}
              setIsActive={setIsActive}
            />
          </CardContent>
        </Card>

        {/* Raw Materials Configuration */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Raw Materials Configuration</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Configure Required Materials</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Add the raw materials needed to produce this product
                </p>
              </div>

              {/* Raw Materials List */}
              <div className="space-y-4">
                {rawMaterials.map((material, index) => {
                  const selectedMaterial = getSelectedMaterialInfo(material.material);
                  
                  return (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Raw Material #{index + 1}</Label>
                        {rawMaterials.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMaterial(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* First Line: Raw Material Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Raw Material *</Label>
                        <Popover 
                          open={openMaterialSelectors[index]} 
                          onOpenChange={(open) => toggleMaterialSelector(index, open)}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openMaterialSelectors[index]}
                              className="w-full justify-between h-10 text-left font-normal"
                              disabled={rawMaterialsLoading}
                            >
                              {material.material ? (
                                <span className="truncate">
                                  {(() => {
                                    const selectedMat = availableRawMaterials.find(m => m.id === material.material);
                                    return selectedMat ? `${selectedMat.name} (${selectedMat.type})` : "Select material...";
                                  })()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  {rawMaterialsLoading ? "Loading..." : "Select material..."}
                                </span>
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search materials..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>No material found.</CommandEmpty>
                                <CommandGroup>
                                  <ScrollArea className="h-48">
                                    {availableRawMaterials.map((rawMat) => (
                                      <CommandItem
                                        key={rawMat.id}
                                        value={`${rawMat.name} (${rawMat.type})`}
                                        onSelect={() => {
                                          updateMaterial(index, 'material', rawMat.id);
                                          toggleMaterialSelector(index, false);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            material.material === rawMat.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <span className="truncate">{rawMat.name} ({rawMat.type})</span>
                                      </CommandItem>
                                    ))}
                                  </ScrollArea>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Second Line: Quantity and Unit */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Quantity *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={material.quantity}
                            onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="h-10"
                            min="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Unit</Label>
                          <Input
                            value={selectedMaterial?.unit || material.unit}
                            className="h-10 bg-gray-100"
                            readOnly
                            placeholder="Auto"
                          />
                        </div>
                      </div>

                      {/* Material Details */}
                      {selectedMaterial && (
                        <div className="p-3 bg-white rounded border text-xs space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Type:</span>
                            <Badge variant="secondary" className="text-xs h-5 px-2">
                              {selectedMaterial.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Available Stock:</span>
                            <span className="text-green-600 font-medium">
                              {selectedMaterial.current_stock} {selectedMaterial.unit}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add More Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMaterial}
                    className="h-10 px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Raw Material
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
            disabled={isSubmitting || (productCodeExists && !isUpdate)}
          >
            {isSubmitting ? 'Saving...' : (isUpdate ? 'Update' : 'Create')} Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductConfigForm;
