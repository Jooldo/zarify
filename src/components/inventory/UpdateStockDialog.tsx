
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Current Stock: {item.currentStock} pieces</Label>
        </div>
        <div>
          <Label>Threshold: {item.threshold} pieces</Label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="newStock">New Stock Quantity</Label>
          <Input id="newStock" type="number" placeholder={item.currentStock.toString()} />
        </div>
        <div>
          <Label htmlFor="newThreshold">New Threshold</Label>
          <Input id="newThreshold" type="number" placeholder={item.threshold.toString()} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="requiredQty">Required Quantity</Label>
          <Input id="requiredQty" type="number" placeholder={item.requiredQuantity.toString()} />
        </div>
        <div>
          <Label htmlFor="inManufacturing">In Manufacturing</Label>
          <Input id="inManufacturing" type="number" placeholder={item.inManufacturing.toString()} />
        </div>
      </div>
      <div>
        <Label htmlFor="updateReason">Reason for Update</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="production">New Production</SelectItem>
            <SelectItem value="sale">Sold/Dispatched</SelectItem>
            <SelectItem value="damage">Damaged/Defective</SelectItem>
            <SelectItem value="correction">Stock Correction</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full">Update Stock</Button>
    </div>
  );
};

export default UpdateStockDialog;
