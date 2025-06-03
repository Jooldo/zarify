
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

const CreateProductConfigForm = ({ onClose }) => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [size, setSize] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [rawMaterials, setRawMaterials] = useState([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    name: '',
    quantity: '',
    unit: ''
  });

  const categories = {
    "Traditional": ["Meena Work", "Kundan Work", "Temple Style", "Oxidized"],
    "Modern": ["Silver Chain", "Gold Plated", "Beaded", "Charm Style"],
    "Bridal": ["Heavy Traditional", "Designer", "Kundan Heavy", "Polki Work"]
  };

  const sizes = [
    { label: "Small (0.20m)", value: "Small (0.20m)" },
    { label: "Medium (0.25m)", value: "Medium (0.25m)" },
    { label: "Large (0.30m)", value: "Large (0.30m)" },
    { label: "Extra Large (0.35m)", value: "Extra Large (0.35m)" },
    { label: "XXL (0.40m)", value: "XXL (0.40m)" }
  ];

  const materialUnits = ["pieces", "meters", "kg", "grams", "rolls", "liters"];

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
      basePrice: parseFloat(basePrice),
      materialCost: parseFloat(materialCost),
      laborCost: parseFloat(laborCost),
      rawMaterials,
      isActive: true
    };
    
    console.log('Creating product config:', configData);
    // Here you would typically make an API call to create the config
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Configuration Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value) => {
              setCategory(value);
              setSubcategory('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(categories).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subcategory">Subcategory *</Label>
            <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {category && categories[category].map((subcat) => (
                  <SelectItem key={subcat} value={subcat}>
                    {subcat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="size">Size *</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((sizeOption) => (
                  <SelectItem key={sizeOption.value} value={sizeOption.value}>
                    {sizeOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="productCode">Product Code</Label>
            <Input
              id="productCode"
              value={generateProductCode()}
              readOnly
              className="bg-gray-50"
              placeholder="Auto-generated"
            />
          </div>

          <div>
            <Label htmlFor="basePrice">Base Price (₹) *</Label>
            <Input
              id="basePrice"
              type="number"
              min="0"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="materialCost">Material Cost (₹) *</Label>
            <Input
              id="materialCost"
              type="number"
              min="0"
              step="0.01"
              value={materialCost}
              onChange={(e) => setMaterialCost(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="laborCost">Labor Cost (₹) *</Label>
            <Input
              id="laborCost"
              type="number"
              min="0"
              step="0.01"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Raw Materials Section */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Materials Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Material */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <Label htmlFor="materialName">Material Name</Label>
              <Input
                id="materialName"
                value={currentMaterial.name}
                onChange={(e) => setCurrentMaterial({...currentMaterial, name: e.target.value})}
                placeholder="e.g., Silver Chain"
              />
            </div>
            <div>
              <Label htmlFor="materialQuantity">Quantity per Unit</Label>
              <Input
                id="materialQuantity"
                type="number"
                min="0"
                step="0.01"
                value={currentMaterial.quantity}
                onChange={(e) => setCurrentMaterial({...currentMaterial, quantity: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="materialUnit">Unit</Label>
              <Select value={currentMaterial.unit} onValueChange={(value) => setCurrentMaterial({...currentMaterial, unit: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {materialUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={addRawMaterial} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </div>

          {/* Materials List */}
          {rawMaterials.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Name</TableHead>
                    <TableHead>Quantity per Unit</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawMaterials.map((material, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>{material.quantity}</TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRawMaterial(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Configuration
        </Button>
      </div>
    </form>
  );
};

export default CreateProductConfigForm;
