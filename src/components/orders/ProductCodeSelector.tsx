
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
  const [visibleCount, setVisibleCount] = useState(20);

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
    setVisibleCount(20);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 20, filteredConfigs.length));
  };

  const formatSize = (sizeValue: number) => {
    const sizeInInches = (sizeValue * 39.3701).toFixed(1);
    return `${sizeInInches}"`;
  };

  return (
    <div className="relative">
      <Label className="text-xs">Product Code *</Label>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="w-full h-8 text-xs justify-between font-normal"
      >
        <span className="truncate text-left">
          {loading ? "Loading..." : (value || "Select product")}
        </span>
        {isOpen ? <ChevronUp className="h-3 w-3 flex-shrink-0" /> : <ChevronDown className="h-3 w-3 flex-shrink-0" />}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 overflow-hidden shadow-lg border">
          <CardContent className="p-2">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(20);
                }}
                placeholder="Search by code, category..."
                className="h-7 text-xs pl-7"
                autoFocus
              />
            </div>

            <div className="max-h-52 overflow-y-auto">
              {visibleConfigs.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500">
                  {loading ? 'Loading...' : 'No products found'}
                </div>
              ) : (
                <>
                  {visibleConfigs.map((config) => (
                    <div
                      key={config.id}
                      onClick={() => handleSelect(config.product_code)}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs h-4 px-1 font-mono">
                          {config.product_code}
                        </Badge>
                        <span className="text-xs text-gray-600 truncate ml-2">
                          {config.category}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between items-center">
                        <span className="truncate flex-1">{config.subcategory}</span>
                        <div className="flex gap-2 text-xs">
                          <span>{formatSize(config.size_value)}</span>
                          {config.weight_range && (
                            <span className="text-gray-400">{config.weight_range}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
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
        <div className="mt-1 p-2 bg-blue-50 rounded border text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="truncate">
              <span className="font-medium">Category:</span> {selectedConfig.category}
            </div>
            <div className="truncate">
              <span className="font-medium">Type:</span> {selectedConfig.subcategory}
            </div>
            <div>
              <span className="font-medium">Size:</span> {formatSize(selectedConfig.size_value)}
            </div>
            <div className="truncate">
              <span className="font-medium">Weight:</span> {selectedConfig.weight_range || 'N/A'}
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
