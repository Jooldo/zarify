
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
}

const AddProductDialog = ({ onProductAdded }: AddProductDialogProps) => {
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
    const sizeInInches = config.size_value ? (config.size_value * 39.3701).toFixed(2) : 'N/A';
    const weightRange = config.weight_range || 'No weight range';
    return `${config.product_code} - ${config.category} ${config.subcategory} (${sizeInInches}" / ${weightRange})`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 h-8 px-3 text-xs">
          <Plus className="h-3 w-3" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Finished Good</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productConfig">Product Configuration *</Label>
            <Select 
              value={productConfigId} 
              onValueChange={setProductConfigId}
              disabled={configsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={configsLoading ? "Loading..." : "Select product configuration"} />
              </SelectTrigger>
              <SelectContent>
                {productConfigs.map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    {getConfigDisplayText(config)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="currentStock">Current Stock *</Label>
            <Input 
              id="currentStock" 
              type="number" 
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              placeholder="Enter current stock"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="threshold">Threshold *</Label>
            <Input 
              id="threshold" 
              type="number" 
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Enter minimum threshold"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="requiredQuantity">Required Quantity *</Label>
            <Input 
              id="requiredQuantity" 
              type="number" 
              value={requiredQuantity}
              onChange={(e) => setRequiredQuantity(e.target.value)}
              placeholder="Enter required quantity"
              min="0"
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading || !productConfigId}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
