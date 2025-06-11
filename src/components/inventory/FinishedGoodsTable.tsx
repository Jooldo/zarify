
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinishedGoodsTableProps {
  products: any[];
  onViewProduct: (product: any) => void;
  onEditProduct: (product: any) => void;
  sortConfig?: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

const FinishedGoodsTable = ({ 
  products, 
  onViewProduct, 
  onEditProduct,
  sortConfig,
  onSortChange 
}: FinishedGoodsTableProps) => {
  const handleSort = (field: string) => {
    if (!onSortChange) return;
    
    const direction = sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(field, direction);
  };

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return null;
    return sortConfig.direction === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getStockStatus = (currentStock: number, threshold: number, orderedQty: number) => {
    if (currentStock <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (currentStock < orderedQty) return { label: 'Insufficient', variant: 'secondary' as const };
    if (threshold > 0 && currentStock <= threshold) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const getShortfall = (currentStock: number, orderedQty: number) => {
    const shortfall = orderedQty - currentStock;
    return shortfall > 0 ? shortfall : 0;
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { field, direction } = sortConfig;
    let aValue, bValue;

    switch (field) {
      case 'ordered_qty':
        aValue = a.required_quantity || 0;
        bValue = b.required_quantity || 0;
        break;
      case 'current_stock':
        aValue = a.current_stock || 0;
        bValue = b.current_stock || 0;
        break;
      case 'in_manufacturing':
        aValue = a.in_manufacturing || 0;
        bValue = b.in_manufacturing || 0;
        break;
      case 'shortfall':
        aValue = getShortfall(a.current_stock || 0, a.required_quantity || 0);
        bValue = getShortfall(b.current_stock || 0, b.required_quantity || 0);
        break;
      default:
        return 0;
    }

    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="py-1 px-2 text-xs font-medium">Product Code & Type</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Category</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Size & Weight</TableHead>
            <TableHead 
              className={cn(
                "py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-50 select-none",
                sortConfig?.field === 'ordered_qty' && "bg-blue-50"
              )}
              onClick={() => handleSort('ordered_qty')}
            >
              <div className="flex items-center gap-1">
                Ordered Qty
                {getSortIcon('ordered_qty')}
              </div>
            </TableHead>
            <TableHead 
              className={cn(
                "py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-50 select-none",
                sortConfig?.field === 'current_stock' && "bg-blue-50"
              )}
              onClick={() => handleSort('current_stock')}
            >
              <div className="flex items-center gap-1">
                Current Stock
                {getSortIcon('current_stock')}
              </div>
            </TableHead>
            <TableHead 
              className={cn(
                "py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-50 select-none",
                sortConfig?.field === 'in_manufacturing' && "bg-blue-50"
              )}
              onClick={() => handleSort('in_manufacturing')}
            >
              <div className="flex items-center gap-1">
                In Manufacturing
                {getSortIcon('in_manufacturing')}
              </div>
            </TableHead>
            <TableHead 
              className={cn(
                "py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-50 select-none",
                sortConfig?.field === 'shortfall' && "bg-blue-50"
              )}
              onClick={() => handleSort('shortfall')}
            >
              <div className="flex items-center gap-1">
                Shortfall
                {getSortIcon('shortfall')}
              </div>
            </TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Threshold</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Tag Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => {
            const orderedQty = product.required_quantity || 0;
            const currentStock = product.current_stock || 0;
            const threshold = product.threshold || 0;
            const inManufacturing = product.in_manufacturing || 0;
            const shortfall = getShortfall(currentStock, orderedQty);
            const stockStatus = getStockStatus(currentStock, threshold, orderedQty);
            const sizeValue = product.product_config?.size_value?.toFixed(2) || 'N/A';
            const weightRange = product.product_config?.weight_range || 'N/A';

            return (
              <TableRow key={product.id} className="h-10 hover:bg-gray-50">
                <TableCell className="py-1 px-2 text-xs font-mono">
                  <div className="flex flex-col">
                    <span className="font-medium text-blue-600">{product.product_code}</span>
                    <span className="text-gray-500 text-xs">{product.product_config?.category}</span>
                  </div>
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">{product.product_config?.subcategory || 'N/A'}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{sizeValue}" / {weightRange}</TableCell>
                <TableCell className="py-1 px-2 text-xs font-bold text-purple-600">{orderedQty}</TableCell>
                <TableCell className="py-1 px-2 text-xs font-bold text-blue-600">{currentStock}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{inManufacturing}</TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {shortfall > 0 ? (
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {shortfall}
                    </span>
                  ) : (
                    <span className="text-green-600">0</span>
                  )}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">{threshold}</TableCell>
                <TableCell className="py-1 px-2">
                  <Badge variant={stockStatus.variant} className="text-xs px-1 py-0">
                    {stockStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2">
                  <Badge variant={product.tag_enabled ? "default" : "secondary"} className="text-xs px-1 py-0">
                    {product.tag_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2">
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onViewProduct(product)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onEditProduct(product)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default FinishedGoodsTable;
