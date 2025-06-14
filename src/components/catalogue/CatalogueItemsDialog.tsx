
import React, { useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCatalogueItems } from '@/hooks/useCatalogueItems';
import { useProductConfigs } from '@/hooks/useProductConfigs';

interface CatalogueItemsDialogProps {
  catalogue: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CatalogueItemsDialog = ({ catalogue, open, onOpenChange }: CatalogueItemsDialogProps) => {
  const { catalogueItems, addItem, removeItem, updateItem, isAdding, isRemoving } = useCatalogueItems(catalogue?.id);
  const { productConfigs } = useProductConfigs();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const availableProducts = productConfigs.filter(product => 
    product.is_active && 
    !catalogueItems.some(item => item.product_config_id === product.id) &&
    (product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddItem = async () => {
    if (!selectedProductId || !catalogue) return;

    try {
      await addItem({
        catalogue_id: catalogue.id,
        product_config_id: selectedProductId,
        custom_price: customPrice ? parseFloat(customPrice) : undefined,
      });
      
      setSelectedProductId('');
      setCustomPrice('');
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (confirm('Remove this item from the catalogue?')) {
      await removeItem(itemId);
    }
  };

  const handleToggleFeatured = async (item: any) => {
    await updateItem(item.id, { is_featured: !item.is_featured });
  };

  if (!catalogue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Items - {catalogue.name}</DialogTitle>
          <DialogDescription>
            Add and manage products in this catalogue.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add New Item Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Add Product to Catalogue</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="search">Search Products</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by product code, category..."
                />
              </div>

              {searchTerm && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                        selectedProductId === product.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <div className="font-medium">{product.product_code}</div>
                      <div className="text-sm text-gray-600">
                        {product.category} • {product.subcategory} • {product.size_value}m
                      </div>
                    </div>
                  ))}
                  {availableProducts.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No products found
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="custom_price">Custom Price (optional)</Label>
                  <Input
                    id="custom_price"
                    type="number"
                    step="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Override default price"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddItem}
                    disabled={!selectedProductId || isAdding}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isAdding ? 'Adding...' : 'Add Item'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Items */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              Current Items ({catalogueItems.length})
            </h3>
            
            {catalogueItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items in this catalogue yet
              </div>
            ) : (
              <div className="space-y-3">
                {catalogueItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              {item.product_configs.product_code}
                            </div>
                            {item.is_featured && (
                              <Badge variant="secondary">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.product_configs.category} • {item.product_configs.subcategory}
                          </div>
                          {item.custom_price && (
                            <div className="text-sm font-medium text-green-600">
                              Custom Price: ₹{item.custom_price}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleFeatured(item)}
                          >
                            <Star className={`h-4 w-4 ${item.is_featured ? 'fill-current' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isRemoving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogueItemsDialog;
