
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CircleAlert, CircleCheck, TriangleAlert, Edit, Trash2 } from 'lucide-react';

interface FinishedGoodsTableProps {
  products: any[];
  onViewProduct: (product: any) => void;
  onEditProduct?: (product: any) => void;
  onDeleteProduct?: (product: any) => void;
}

const FinishedGoodsTable = ({ products, onViewProduct, onEditProduct, onDeleteProduct }: FinishedGoodsTableProps) => {
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

  const getShortfallStatus = (shortfall: number, threshold: number) => {
    if (shortfall < 0) {
      const shortfallAmount = Math.abs(shortfall);
      if (shortfallAmount <= threshold) {
        return { 
          label: 'Low Critical', 
          variant: 'secondary' as const, 
          icon: TriangleAlert,
          color: 'text-yellow-600'
        };
      }
      return { 
        label: 'Highly Critical', 
        variant: 'destructive' as const, 
        icon: CircleAlert,
        color: 'text-red-600'
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

  return (
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
          {products.map((product) => {
            const shortfall = calculateShortfall(
              product.current_stock, 
              product.in_manufacturing, 
              product.threshold, 
              product.required_quantity
            );
            const shortfallStatus = getShortfallStatus(shortfall, product.threshold);
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
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onViewProduct(product)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {onEditProduct && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onEditProduct(product)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {onDeleteProduct && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:border-red-200"
                        onClick={() => onDeleteProduct(product)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    )}
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
