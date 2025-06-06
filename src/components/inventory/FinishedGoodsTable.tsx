
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Eye } from 'lucide-react';
import type { FinishedGood } from '@/hooks/useFinishedGoods';

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
                  {product.product_config.size_value}"
                </TableCell>
                <TableCell className="px-2 py-1">
                  <Badge variant={getStockStatusVariant(product.current_stock, product.threshold)} className="text-xs px-2 py-1 font-bold">
                    {product.current_stock}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-1 text-xs font-medium">
                  {product.threshold}
                </TableCell>
                <TableCell className="px-2 py-1 text-xs font-medium">
                  {product.required_quantity}
                </TableCell>
                <TableCell className="px-2 py-1 text-xs font-medium">
                  {product.in_manufacturing}
                </TableCell>
                <TableCell className="px-2 py-1">
                  <span className={`text-xs ${shortfall > 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                    {shortfall > 0 ? `Need ${shortfall}` : 'Sufficient'}
                  </span>
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
