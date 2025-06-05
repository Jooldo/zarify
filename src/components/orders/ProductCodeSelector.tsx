
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
  const [visibleCount, setVisibleCount] = useState(15);

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
    setVisibleCount(15);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 15, filteredConfigs.length));
  };

  const formatSize = (sizeValue: number) => {
    const sizeInInches = (sizeValue * 39.3701).toFixed(1);
    return `${sizeInInches}"`;
  };

  return (
    <div className="relative">
      <Label className="text-xs font-medium">Product Code *</Label>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="w-full h-8 text-xs justify-between font-normal mt-1"
      >
        <span className="truncate text-left">
          {loading ? "Loading..." : (value || "Select product")}
        </span>
        {isOpen ? <ChevronUp className="h-3 w-3 flex-shrink-0" /> : <ChevronDown className="h-3 w-3 flex-shrink-0" />}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden shadow-lg border bg-white">
          <CardContent className="p-2 bg-white">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(15);
                }}
                placeholder="Search by code, category, or type..."
                className="h-7 text-xs pl-7 bg-white"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {visibleConfigs.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500">
                  {loading ? 'Loading products...' : 'No products found'}
                </div>
              ) : (
                <>
                  {visibleConfigs.map((config) => (
                    <div
                      key={config.id}
                      onClick={() => handleSelect(config.product_code)}
                      className="p-2 hover:bg-gray-50 cursor-pointer border border-gray-100 rounded-md mb-2 transition-colors bg-white"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <Badge variant="outline" className="text-xs h-5 px-1 font-mono font-semibold bg-blue-50 text-blue-700 border-blue-200">
                          {config.product_code}
                        </Badge>
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-700">
                            {formatSize(config.size_value)}
                          </div>
                          {config.weight_range && (
                            <div className="text-xs text-gray-500">
                              {config.weight_range}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500 text-xs">Category:</span>
                          <div className="font-medium text-gray-800 truncate">
                            {config.category}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Type:</span>
                          <div className="font-medium text-gray-800 truncate">
                            {config.subcategory}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {visibleCount < filteredConfigs.length && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={loadMore}
                      className="w-full h-7 text-xs mt-1 bg-white hover:bg-gray-50"
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
        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium text-gray-700">Category:</span>
              <div className="text-gray-900">{selectedConfig.category}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <div className="text-gray-900">{selectedConfig.subcategory}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Size:</span>
              <div className="text-gray-900">{formatSize(selectedConfig.size_value)}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Weight:</span>
              <div className="text-gray-900">{selectedConfig.weight_range || 'N/A'}</div>
            </div>
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
