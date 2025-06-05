
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, AlertCircle } from 'lucide-react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import AddProductDialog from '@/components/inventory/AddProductDialog';

const FinishedGoodsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { finishedGoods, loading, refetch } = useFinishedGoods();

  const filteredProducts = finishedGoods.filter(product =>
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_config?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_config?.subcategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (currentStock: number, threshold: number) => {
    if (currentStock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (currentStock <= threshold) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const getDisplaySize = (product: any) => {
    const sizeInInches = product.product_config?.size_value 
      ? (product.product_config.size_value * 39.3701).toFixed(2) 
      : 'N/A';
    const weightRange = product.product_config?.weight_range || 'N/A';
    return `${sizeInInches}" / ${weightRange}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Finished Goods Inventory
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="text-lg">Loading finished goods...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Finished Goods Inventory
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          <AddProductDialog onProductAdded={refetch} />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Product Code</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Category</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Subcategory</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Size & Weight</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Current Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Threshold</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Required</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">In Manufacturing</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Last Produced</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const status = getStockStatus(product.current_stock, product.threshold);
              return (
                <TableRow key={product.id} className="h-10">
                  <TableCell className="py-1 px-2 text-xs font-mono bg-gray-50">{product.product_code}</TableCell>
                  <TableCell className="py-1 px-2 text-xs font-medium">{product.product_config?.category || 'N/A'}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{product.product_config?.subcategory || 'N/A'}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{getDisplaySize(product)}</TableCell>
                  <TableCell className="py-1 px-2 text-xs font-medium">{product.current_stock}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{product.threshold}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{product.required_quantity}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{product.in_manufacturing}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">
                    <Badge variant={status.variant} className="text-xs px-1 py-0">
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs">
                    {product.last_produced ? new Date(product.last_produced).toLocaleDateString() : 'Never'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {finishedGoods.length === 0 ? 'No finished goods found. Add some products to get started.' : 'No products found matching your search.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FinishedGoodsInventory;
