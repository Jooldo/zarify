
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Package } from 'lucide-react';

interface ProductPickerDialogProps {
  onProductSelect: (productId: string, productCode: string) => void;
  trigger?: React.ReactNode;
}

const ProductPickerDialog = ({ onProductSelect, trigger }: ProductPickerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const { finishedGoods, loading } = useFinishedGoods();

  const filteredProducts = finishedGoods.filter(product =>
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.current_stock > 0 // Only show products with stock
  );

  const handleSelect = () => {
    const selectedProduct = finishedGoods.find(p => p.id === selectedProductId);
    if (selectedProduct) {
      onProductSelect(selectedProduct.product_config_id, selectedProduct.product_code);
      setOpen(false);
      setSelectedProductId('');
      setSearchTerm('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Package className="h-4 w-4 mr-2" />
            Select Product Manually
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Product for Tag Out</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Products</Label>
            <Input
              id="search"
              placeholder="Search by product code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product">Available Products</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product..." />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading products...</SelectItem>
                ) : filteredProducts.length === 0 ? (
                  <SelectItem value="none" disabled>
                    {searchTerm ? 'No products found' : 'No products with stock available'}
                  </SelectItem>
                ) : (
                  filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.product_code}</span>
                        <span className="text-sm text-muted-foreground">
                          Stock: {product.current_stock} | Category: {product.product_config.category}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSelect} 
            disabled={!selectedProductId || selectedProductId === 'loading' || selectedProductId === 'none'}
            className="w-full"
          >
            Select Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPickerDialog;
