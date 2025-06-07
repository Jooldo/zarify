
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RawMaterial } from '@/hooks/useRawMaterials';

interface UpdateStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
  onStockUpdated: () => void;
}

const UpdateStockDialog = ({ isOpen, onOpenChange, material, onStockUpdated }: UpdateStockDialogProps) => {
  const [currentStock, setCurrentStock] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [updateReason, setUpdateReason] = useState('');

  if (!material) return null;

  const handleUpdate = () => {
    console.log('Update stock for:', material.name);
    onStockUpdated();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Update Stock - {material.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded">
            <div>
              <span className="font-medium">Current: </span>
              {material.current_stock} {material.unit}
            </div>
            <div>
              <span className="font-medium">Min: </span>
              {material.minimum_stock} {material.unit}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="newStock" className="text-xs">New Stock Quantity</Label>
              <Input 
                id="newStock" 
                type="number" 
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                placeholder={material.current_stock.toString()} 
                className="h-7 text-xs" 
              />
            </div>
            <div>
              <Label htmlFor="newThreshold" className="text-xs">New Min Stock</Label>
              <Input 
                id="newThreshold" 
                type="number" 
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
                placeholder={material.minimum_stock.toString()} 
                className="h-7 text-xs" 
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="updateReason" className="text-xs">Update Reason</Label>
            <Select value={updateReason} onValueChange={setUpdateReason}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="procurement" className="text-xs">New Procurement</SelectItem>
                <SelectItem value="production" className="text-xs">Used in Production</SelectItem>
                <SelectItem value="damage" className="text-xs">Damaged/Expired</SelectItem>
                <SelectItem value="correction" className="text-xs">Stock Correction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="w-full h-7 text-xs" onClick={handleUpdate}>
            Update Stock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStockDialog;
