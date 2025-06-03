
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductConfigDetailsProps {
  category: string;
  setCategory: (category: string) => void;
  subcategory: string;
  setSubcategory: (subcategory: string) => void;
  size: string;
  setSize: (size: string) => void;
  generateProductCode: () => string;
}

const ProductConfigDetails = ({
  category,
  setCategory,
  subcategory,
  setSubcategory,
  size,
  setSize,
  generateProductCode
}: ProductConfigDetailsProps) => {
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

  return (
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
      </CardContent>
    </Card>
  );
};

export default ProductConfigDetails;
