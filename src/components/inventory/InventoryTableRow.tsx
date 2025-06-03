
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import { Eye, Edit } from 'lucide-react';
import RawMaterialsDialog from './RawMaterialsDialog';

interface InventoryTableRowProps {
  item: {
    id: number;
    productCode: string;
    category: string;
    subcategory: string;
    size: string;
    currentStock: number;
    threshold: number;
    requiredQuantity: number;
    inManufacturing: number;
    lastProduced: string;
  };
  getStockStatusVariant: (stock: number, threshold: number) => "destructive" | "secondary" | "default";
  getShortfallStyles: (shortfall: number) => string;
  calculateShortfall: (currentStock: number, inManufacturing: number, requiredQuantity: number, threshold: number) => number;
  getShortfallDisplay: (shortfall: number) => string;
  getShortfallTextColor: (shortfall: number) => string;
}

const InventoryTableRow = ({ 
  item, 
  getStockStatusVariant, 
  getShortfallStyles, 
  calculateShortfall,
  getShortfallDisplay,
  getShortfallTextColor
}: InventoryTableRowProps) => {
  const shortfall = calculateShortfall(item.currentStock, item.inManufacturing, item.requiredQuantity, item.threshold);

  return (
    <TableRow className="h-10">
      <TableCell className="px-2 py-1 font-mono text-xs bg-gray-50">{item.productCode}</TableCell>
      <TableCell className="px-2 py-1 text-xs">{item.category}</TableCell>
      <TableCell className="px-2 py-1 text-xs">{item.subcategory}</TableCell>
      <TableCell className="px-2 py-1 text-xs">{item.size}</TableCell>
      <TableCell className="px-2 py-1">
        <Badge variant={getStockStatusVariant(item.currentStock, item.threshold)} className="text-xs px-2 py-1 font-bold">
          {item.currentStock}
        </Badge>
      </TableCell>
      <TableCell className="px-2 py-1 text-xs font-medium">{item.threshold}</TableCell>
      <TableCell className="px-2 py-1 text-xs font-medium">{item.requiredQuantity}</TableCell>
      <TableCell className="px-2 py-1 text-xs font-medium">{item.inManufacturing}</TableCell>
      <TableCell className="px-2 py-1">
        <span className={`text-xs ${getShortfallTextColor(shortfall)}`}>
          {getShortfallDisplay(shortfall)}
        </span>
      </TableCell>
      <TableCell className="px-2 py-1 text-xs">{new Date(item.lastProduced).toLocaleDateString()}</TableCell>
      <TableCell className="px-2 py-1">
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                <Eye className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Raw Materials Required - {item.productCode}</DialogTitle>
              </DialogHeader>
              <RawMaterialsDialog item={item} shortfall={shortfall} />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default InventoryTableRow;
