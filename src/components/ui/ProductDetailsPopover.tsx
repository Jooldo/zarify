
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface ProductConfig {
  id: string;
  category: string;
  subcategory: string;
  size_value: number;
  weight_range: string | null;
  product_code: string;
}

interface ProductDetailsPopoverProps {
  productCode: string;
  children: React.ReactNode;
}

const ProductDetailsPopover = ({ productCode, children }: ProductDetailsPopoverProps) => {
  const [productConfig, setProductConfig] = useState<ProductConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !productConfig && productCode) {
      fetchProductConfig();
    }
  }, [isOpen, productCode]);

  const fetchProductConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_configs')
        .select('id, category, subcategory, size_value, weight_range, product_code')
        .eq('product_code', productCode)
        .single();

      if (error) throw error;
      setProductConfig(data);
    } catch (error) {
      console.error('Error fetching product config:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (sizeValue: number) => {
    return `${sizeValue}"`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 border-blue-200">
              {productCode}
            </Badge>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="text-sm text-gray-500">Loading product details...</div>
            </div>
          ) : productConfig ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-medium text-gray-700">Product Type:</span>
                <div className="text-gray-900 font-medium">{productConfig.subcategory}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Category:</span>
                <div className="text-gray-900">{productConfig.category}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Size:</span>
                <div className="text-gray-900">{formatSize(productConfig.size_value)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Weight:</span>
                <div className="text-gray-900">{productConfig.weight_range || 'N/A'}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-gray-500">Product details not found</div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProductDetailsPopover;
