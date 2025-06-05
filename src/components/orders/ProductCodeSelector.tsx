
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
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

interface ProductCodeSelectorProps {
  value: string;
  onChange: (productCode: string) => void;
  disabled?: boolean;
}

const ProductCodeSelector = ({ value, onChange, disabled = false }: ProductCodeSelectorProps) => {
  const [productConfigs, setProductConfigs] = useState<ProductConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);

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

  const filteredConfigs = useMemo(() => {
    if (!searchTerm) return productConfigs;
    
    const search = searchTerm.toLowerCase();
    return productConfigs.filter(config => 
      config.product_code.toLowerCase().includes(search) ||
      config.category.toLowerCase().includes(search) ||
      config.subcategory.toLowerCase().includes(search)
    );
  }, [productConfigs, searchTerm]);

  const visibleConfigs = useMemo(() => 
    filteredConfigs.slice(0, visibleCount), 
    [filteredConfigs, visibleCount]
  );

  const selectedConfig = productConfigs.find(config => config.product_code === value);

  const handleSelect = (productCode: string) => {
    onChange(productCode);
    setIsOpen(false);
    setSearchTerm('');
    setVisibleCount(50);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 50, filteredConfigs.length));
  };

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
    <div className="relative">
      <Label className="text-xs">Product Code *</Label>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="w-full h-8 text-xs justify-between"
      >
        <span className="truncate">
          {loading ? "Loading..." : (value || "Select product")}
        </span>
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden shadow-lg border">
          <CardContent className="p-2">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(50);
                }}
                placeholder="Search products..."
                className="h-7 text-xs pl-7"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {visibleConfigs.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500">
                  {loading ? 'Loading...' : 'No products found'}
                </div>
              ) : (
                <>
                  {visibleConfigs.map((config) => {
                    const displayInfo = getConfigDisplayInfo(config);
                    return (
                      <div
                        key={config.id}
                        onClick={() => handleSelect(config.product_code)}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs h-4 px-1">
                            {config.product_code}
                          </Badge>
                          <span className="text-xs text-gray-600">{displayInfo.category}</span>
                        </div>
                        <div className="text-xs text-gray-500 grid grid-cols-3 gap-1">
                          <span>{displayInfo.subcategory}</span>
                          <span>{displayInfo.size}</span>
                          <span>{displayInfo.weightRange}</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {visibleCount < filteredConfigs.length && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={loadMore}
                      className="w-full h-8 text-xs mt-2"
                    >
                      Load More ({filteredConfigs.length - visibleCount} remaining)
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedConfig && (
        <div className="grid grid-cols-4 gap-2 p-2 bg-white rounded border text-xs mt-1">
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

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductCodeSelector;
