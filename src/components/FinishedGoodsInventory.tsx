
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, AlertCircle, Eye, CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import AddProductDialog from '@/components/inventory/AddProductDialog';
import ViewFinishedGoodDialog from '@/components/inventory/ViewFinishedGoodDialog';

const FinishedGoodsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { finishedGoods, loading, refetch } = useFinishedGoods();

  console.log('FinishedGoodsInventory rendered with:', finishedGoods.length, 'products');

  const filteredProducts = finishedGoods.filter(product =>
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_config?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_config?.subcategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateShortfall = (currentStock: number, inManufacturing: number, threshold: number, requiredQuantity: number) => {
    return (currentStock + inManufacturing) - (threshold + requiredQuantity);
  };

  const getShortfallVariant = (shortfall: number) => {
    if (shortfall < 0) return 'destructive' as const;
    if (shortfall === 0) return 'secondary' as const;
    return 'default' as const;
  };

  const getShortfallLabel = (shortfall: number) => {
    if (shortfall < 0) return `${Math.abs(shortfall)} Short`;
    if (shortfall === 0) return 'Exact';
    return `${shortfall} Surplus`;
  };

  const getShortfallBasedStatus = (shortfall: number, threshold: number) => {
    if (shortfall > 0) {
      return { 
        label: 'Critical', 
        variant: 'destructive' as const, 
        icon: CircleAlert,
        color: 'text-red-600'
      };
    }
    
    if (shortfall >= 0 && shortfall < threshold) {
      return { 
        label: 'Low', 
        variant: 'secondary' as const, 
        icon: TriangleAlert,
        color: 'text-yellow-600'
      };
    }
    
    return { 
      label: 'Good', 
      variant: 'default' as const, 
      icon: CircleCheck,
      color: 'text-green-600'
    };
  };

  const getDisplaySize = (product: any) => {
    const sizeInInches = product.product_config?.size_value 
      ? (product.product_config.size_value * 39.3701).toFixed(2) 
      : 'N/A';
    const weightRange = product.product_config?.weight_range || 'N/A';
    return `${sizeInInches}" / ${weightRange}`;
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered for finished goods');
    await refetch();
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-8"
          >
            Refresh
          </Button>
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
              <TableHead className="py-1 px-2 text-xs font-medium">Shortfall</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Last Produced</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const shortfall = calculateShortfall(
                product.current_stock, 
                product.in_manufacturing, 
                product.threshold, 
                product.required_quantity
              );
              const shortfallStatus = getShortfallBasedStatus(Math.abs(shortfall), product.threshold);
              const Icon = shortfallStatus.icon;
              
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
                    <Badge variant={getShortfallVariant(shortfall)} className="text-xs px-1 py-0">
                      {getShortfallLabel(shortfall)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <Badge variant={shortfallStatus.variant} className="text-xs px-1 py-0 flex items-center gap-1 w-fit">
                      <Icon className="h-2 w-2" />
                      {shortfallStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs">
                    {product.last_produced ? new Date(product.last_produced).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleViewProduct(product)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
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

      <ViewFinishedGoodDialog
        product={selectedProduct}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
      />
    </div>
  );
};

export default FinishedGoodsInventory;
