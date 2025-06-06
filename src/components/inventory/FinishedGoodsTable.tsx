
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Eye, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import type { FinishedGood } from '@/hooks/useFinishedGoods';
import { formatIndianNumberSmart, formatSmartDecimal } from '@/lib/utils';

interface FinishedGoodsTableProps {
  products: FinishedGood[];
  onViewProduct: (product: FinishedGood) => void;
  onEditProduct: (product: FinishedGood) => void;
}

const FinishedGoodsTable = ({ products, onViewProduct, onEditProduct }: FinishedGoodsTableProps) => {
  const getStockStatusVariant = (stock: number, threshold: number) => {
    if (stock <= threshold) return "destructive" as const;
    if (stock <= threshold * 1.5) return "secondary" as const;
    return "default" as const;
  };

  const calculateShortfall = (currentStock: number, inManufacturing: number, requiredQuantity: number, threshold: number) => {
    const totalAvailable = currentStock + inManufacturing;
    const needed = Math.max(requiredQuantity, threshold);
    return needed - totalAvailable;
  };

  const getInventoryStatus = (currentStock: number, inManufacturing: number, requiredQuantity: number, threshold: number) => {
    const shortfall = calculateShortfall(currentStock, inManufacturing, requiredQuantity, threshold);
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (currentStock <= threshold) {
      return { status: 'Low', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const getShortfallTooltip = () => {
    return "Shortfall = (Required + Threshold) - (Current Stock + In Manufacturing). Negative values indicate shortfall, positive values indicate surplus.";
  };

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="py-1 px-2 text-xs font-medium">Product Code</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Category</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Subcategory</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Size (inches)</TableHead>
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
              product.required_quantity,
              product.threshold
            );

            const statusInfo = getInventoryStatus(
              product.current_stock,
              product.in_manufacturing,
              product.required_quantity,
              product.threshold
            );

            const StatusIcon = statusInfo.icon;

            return (
              <TableRow key={product.id} className="h-10">
                <TableCell className="px-2 py-1 font-mono text-xs bg-gray-50">
                  {product.product_code}
                </TableCell>
                <TableCell className="px-2 py-1 text-xs">
                  {product.product_config.category}
                </TableCell>
                <TableCell className="px-2 py-1 text-xs">
                  {product.product_config.subcategory}
                </TableCell>
                <TableCell className="px-2 py-1 text-xs">
                  {formatSmartDecimal(product.product_config.size_value)}"
                </TableCell>
                <TableCell className="px-2 py-1">
                  <Badge variant={getStockStatusVariant(product.current_stock, product.threshold)} className="text-xs px-2 py-1 font-bold">
                    {formatIndianNumberSmart(product.current_stock)}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-1 text-xs font-medium">
                  {formatIndianNumberSmart(product.threshold)}
                </TableCell>
                <TableCell className="px-2 py-1 text-xs font-medium">
                  {formatIndianNumberSmart(product.required_quantity)}
                </TableCell>
                <TableCell className="px-2 py-1 text-xs font-medium">
                  {formatIndianNumberSmart(product.in_manufacturing)}
                </TableCell>
                <TableCell className="px-2 py-1">
                  <div 
                    className="cursor-help"
                    title={getShortfallTooltip()}
                  >
                    <span className={`text-xs font-medium ${shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {shortfall > 0 ? `-${formatIndianNumberSmart(shortfall)}` : `+${formatIndianNumberSmart(Math.abs(shortfall))}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-2 py-1">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
                    <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                    <span className={`text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-2 py-1 text-xs">
                  {product.last_produced ? new Date(product.last_produced).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell className="px-2 py-1">
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
