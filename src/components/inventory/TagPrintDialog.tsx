
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { Printer, Package } from 'lucide-react';

interface TagPrintDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTagGenerated?: () => void;
}

const TagPrintDialog = ({ isOpen, onOpenChange, onTagGenerated }: TagPrintDialogProps) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { finishedGoods } = useFinishedGoods();
  const { generateTag } = useInventoryTags();

  const handleGenerateTag = async () => {
    if (!selectedProductId || quantity <= 0) return;

    setLoading(true);
    try {
      await generateTag(selectedProductId, quantity);
      setSelectedProductId('');
      setQuantity(1);
      onOpenChange(false);
      if (onTagGenerated) onTagGenerated();
    } catch (error) {
      console.error('Error generating tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = finishedGoods.find(p => p.id === selectedProductId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Generate Inventory Tag
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product">Select Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product..." />
              </SelectTrigger>
              <SelectContent>
                {finishedGoods
                  .filter(product => product.product_config?.is_active !== false)
                  .map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-mono text-sm">{product.product_code}</span>
                        <span className="text-muted-foreground">
                          ({product.product_config?.category} - {product.product_config?.subcategory})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Product:</span> {selectedProduct.product_code}</div>
                <div><span className="font-medium">Current Stock:</span> {selectedProduct.current_stock}</div>
                <div><span className="font-medium">Category:</span> {selectedProduct.product_config?.category}</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity per Tag</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              placeholder="Enter quantity..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateTag} 
              disabled={!selectedProductId || quantity <= 0 || loading}
              className="flex-1"
            >
              {loading ? 'Generating...' : 'Generate Tag'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TagPrintDialog;
