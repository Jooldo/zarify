
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ProductConfigDetails from './config/ProductConfigDetails';
import RawMaterialsSection from './config/RawMaterialsSection';

const CreateProductConfigForm = ({ onClose, initialData = null, isUpdate = false }) => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [size, setSize] = useState('');
  const [rawMaterials, setRawMaterials] = useState([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    name: '',
    quantity: '',
    unit: ''
  });

  useEffect(() => {
    if (isUpdate && initialData) {
      setCategory(initialData.category || '');
      setSubcategory(initialData.subcategory || '');
      setSize(initialData.size || '');
      setRawMaterials(initialData.rawMaterials || []);
    }
  }, [isUpdate, initialData]);

  const generateProductCode = () => {
    if (!category || !subcategory || !size) return '';
    
    const catCode = category.substring(0, 3).toUpperCase();
    const subCode = subcategory.split(' ')[0].substring(0, 3).toUpperCase();
    const sizeCode = size.split(' ')[0].substring(0, 2).toUpperCase();
    
    return `${catCode}-${subCode}-${sizeCode}`;
  };

  const addRawMaterial = () => {
    if (currentMaterial.name && currentMaterial.quantity && currentMaterial.unit) {
      setRawMaterials([...rawMaterials, {
        ...currentMaterial,
        quantity: parseFloat(currentMaterial.quantity)
      }]);
      setCurrentMaterial({ name: '', quantity: '', unit: '' });
    }
  };

  const removeRawMaterial = (index) => {
    setRawMaterials(rawMaterials.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const configData = {
      category,
      subcategory,
      size,
      productCode: generateProductCode(),
      rawMaterials,
      isActive: true
    };
    
    console.log(isUpdate ? 'Updating product config:' : 'Creating product config:', configData);
    onClose();
  };

  const handleDelete = () => {
    if (isUpdate && initialData) {
      console.log('Deleting product config:', initialData.id);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProductConfigDetails
        category={category}
        setCategory={setCategory}
        subcategory={subcategory}
        setSubcategory={setSubcategory}
        size={size}
        setSize={setSize}
        generateProductCode={generateProductCode}
      />

      <RawMaterialsSection
        rawMaterials={rawMaterials}
        setRawMaterials={setRawMaterials}
        currentMaterial={currentMaterial}
        setCurrentMaterial={setCurrentMaterial}
        addRawMaterial={addRawMaterial}
        removeRawMaterial={removeRawMaterial}
      />

      <div className="flex gap-4 justify-between">
        <div>
          {isUpdate && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Configuration
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isUpdate ? 'Update Configuration' : 'Create Configuration'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreateProductConfigForm;
