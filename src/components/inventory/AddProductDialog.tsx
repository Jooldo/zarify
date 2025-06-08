import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProductConfigs } from '@/hooks/useProductConfigs';

interface AddProductDialogProps {
  onProductAdded: () => void;
  isFloating?: boolean;
}

const AddProductDialog = ({ onProductAdded, isFloating = false }: AddProductDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [productConfigId, setProductConfigId] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [threshold, setThreshold] = useState('');
  const [requiredQuantity, setRequiredQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { productConfigs, loading: configsLoading } = useProductConfigs();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Get the selected product config to get the product code
      const selectedConfig = productConfigs.find(config => config.id === productConfigId);
      if (!selectedConfig) throw new Error('Product config not found');

      // Create finished good
      const { error } = await supabase
        .from('finished_goods')
        .insert({
          product_config_id: productConfigId,
          product_code: selectedConfig.product_code,
          current_stock: parseInt(currentStock),
          threshold: parseInt(threshold),
          required_quantity: parseInt(requiredQuantity),
          in_manufacturing: 0,
          merchant_id: merchantId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Finished good added successfully',
      });

      // Reset form
      setProductConfigId('');
      setCurrentStock('');
      setThreshold('');
      setRequiredQuantity('');
      setIsOpen(false);
      onProductAdded();
    } catch (error) {
      console.error('Error adding finished good:', error);
      toast({
        title: 'Error',
        description: 'Failed to add finished good',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfigDisplayText = (config: any) => {
    // Display size_value directly as inches (no conversion needed)
    const sizeInInches = config.size_value?.toFixed(2) || 'N/A';
    const weightRange = config.weight_range || 'No weight range';
    return `${config.product_code} - ${config.subcategory} (${config.category}) | ${sizeInInches}" / ${weightRange}`;
  };

  const TriggerButton = isFloating ? (
    <Button 
      className="rounded-full h-16 px-6 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
    >
      <Plus className="h-5 w-5" />
      <span className="font-medium">Add Product</span>
    </Button>
  ) : (
    <Button className="flex items-center gap-2 h-9 px-4 text-sm">
      <Plus className="h-4 w-4" />
      Add Product
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Add Finished Good</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="productConfig" className="text-sm font-medium">Product Configuration *</Label>
            <Select 
              value={productConfigId} 
              onValueChange={setProductConfigId}
              disabled={configsLoading}
            >
              <SelectTrigger className="h-10 text-sm mt-2">
                <SelectValue placeholder={configsLoading ? "Loading..." : "Select product configuration"} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {productConfigs.map((config) => (
                  <SelectItem key={config.id} value={config.id} className="text-sm py-3">
                    <div className="space-y-1">
                      <div className="font-medium">{config.product_code}</div>
                      <div className="text-xs text-gray-600">
                        {config.subcategory} • {config.category} • {config.size_value?.toFixed(2)}" • {config.weight_range}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Select the product configuration to create finished goods for</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currentStock" className="text-sm font-medium">Current Stock *</Label>
              <Input 
                id="currentStock" 
                type="number" 
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                placeholder="0"
                className="h-10 text-sm mt-2"
                min="0"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="threshold" className="text-sm font-medium">Threshold *</Label>
              <Input 
                id="threshold" 
                type="number" 
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="10"
                className="h-10 text-sm mt-2"
                min="0"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="requiredQuantity" className="text-sm font-medium">Required Quantity *</Label>
              <Input 
                id="requiredQuantity" 
                type="number" 
                value={requiredQuantity}
                onChange={(e) => setRequiredQuantity(e.target.value)}
                placeholder="50"
                className="h-10 text-sm mt-2"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" className="flex-1 h-10 text-sm" disabled={loading || !productConfigId}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-10 text-sm px-6">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
