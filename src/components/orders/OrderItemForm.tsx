
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductConfig {
  id: string;
  category: string;
  subcategory: string;
  size_value: number;
  weight_range: string | null;
  product_code: string;
  is_active: boolean;
}

interface OrderItemFormProps {
  item: {
    productCode: string;
    quantity: number;
    price: number;
  };
  index: number;
  items: any[];
  updateItem: (index: number, field: string, value: any) => void;
  removeItem: (index: number) => void;
  generateSuborderId: (orderIndex: number, itemIndex: number) => string;
}

const OrderItemForm = ({ item, index, items, updateItem, removeItem, generateSuborderId }: OrderItemFormProps) => {
  const [productConfigs, setProductConfigs] = useState<ProductConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductConfigs();
  }, []);

  const fetchProductConfigs = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('product_configs')
        .select('id, category, subcategory, size_value, weight_range, product_code, is_active')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('product_code');

      if (error) throw error;
      setProductConfigs(data || []);
    } catch (error) {
      console.error('Error fetching product configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedConfig = productConfigs.find(config => config.product_code === item.productCode);

  const getConfigDisplayInfo = (config: ProductConfig) => {
    const sizeInInches = config.size_value ? (config.size_value * 39.3701).toFixed(2) : 'N/A';
    return {
      category: config.category,
      subcategory: config.subcategory,
      size: `${sizeInInches}"`,
      weightRange: config.weight_range || 'N/A'
    };
  };

  return (
    <div className="border rounded p-2 space-y-2 bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Item {index + 1}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs h-4 px-1">
            {generateSuborderId(1, index)}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeItem(index)}
            disabled={items.length === 1}
            className="h-6 w-6 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Product Code *</Label>
          <Select 
            value={item.productCode} 
            onValueChange={(value) => updateItem(index, 'productCode', value)}
            disabled={loading}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={loading ? "Loading..." : "Select product"} />
            </SelectTrigger>
            <SelectContent>
              {productConfigs.map((config) => (
                <SelectItem key={config.id} value={config.product_code} className="text-xs">
                  {config.product_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Quantity *</Label>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
            min="1"
            className="h-8 text-xs"
            required
          />
        </div>

        <div>
          <Label className="text-xs">Price per Unit *</Label>
          <Input
            type="number"
            value={item.price}
            onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
            min="0"
            className="h-8 text-xs"
            placeholder="₹0"
            required
          />
        </div>
      </div>

      {selectedConfig && (
        <div className="grid grid-cols-4 gap-2 p-2 bg-white rounded border text-xs">
          <div>
            <span className="font-medium">Category:</span> {getConfigDisplayInfo(selectedConfig).category}
          </div>
          <div>
            <span className="font-medium">Type:</span> {getConfigDisplayInfo(selectedConfig).subcategory}
          </div>
          <div>
            <span className="font-medium">Size:</span> {getConfigDisplayInfo(selectedConfig).size}
          </div>
          <div>
            <span className="font-medium">Weight:</span> {getConfigDisplayInfo(selectedConfig).weightRange}
          </div>
        </div>
      )}

      <div className="text-right">
        <span className="text-xs font-medium">
          Subtotal: ₹{(item.price * item.quantity).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default OrderItemForm;
