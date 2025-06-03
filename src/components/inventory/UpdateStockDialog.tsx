
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UpdateStockDialogProps {
  item: {
    currentStock: number;
    threshold: number;
    requiredQuantity: number;
    inManufacturing: number;
  };
}

const UpdateStockDialog = ({ item }: UpdateStockDialogProps) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <Label className="text-xs">Current Stock: {item.currentStock} pieces</Label>
        </div>
        <div>
          <Label className="text-xs">Threshold: {item.threshold} pieces</Label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="newStock" className="text-xs">New Stock Quantity</Label>
          <Input id="newStock" type="number" placeholder={item.currentStock.toString()} className="h-8 text-xs" />
        </div>
        <div>
          <Label htmlFor="newThreshold" className="text-xs">New Threshold</Label>
          <Input id="newThreshold" type="number" placeholder={item.threshold.toString()} className="h-8 text-xs" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="requiredQty" className="text-xs">Required Quantity</Label>
          <Input id="requiredQty" type="number" placeholder={item.requiredQuantity.toString()} className="h-8 text-xs" />
        </div>
        <div>
          <Label htmlFor="inManufacturing" className="text-xs">In Manufacturing</Label>
          <Input id="inManufacturing" type="number" placeholder={item.inManufacturing.toString()} className="h-8 text-xs" />
        </div>
      </div>
      <div>
        <Label htmlFor="updateReason" className="text-xs">Reason for Update</Label>
        <Select>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="production" className="text-xs">New Production</SelectItem>
            <SelectItem value="sale" className="text-xs">Sold/Dispatched</SelectItem>
            <SelectItem value="damage" className="text-xs">Damaged/Defective</SelectItem>
            <SelectItem value="correction" className="text-xs">Stock Correction</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full h-8 text-xs">Update Stock</Button>
    </div>
  );
};

export default UpdateStockDialog;
