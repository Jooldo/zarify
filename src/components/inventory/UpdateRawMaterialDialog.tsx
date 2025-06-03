
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RawMaterial } from '@/hooks/useRawMaterials';

interface UpdateRawMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
  onMaterialUpdated: () => void;
}

const UpdateRawMaterialDialog = ({ isOpen, onOpenChange, material, onMaterialUpdated }: UpdateRawMaterialDialogProps) => {
  const [currentStock, setCurrentStock] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [required, setRequired] = useState('');
  const [inProcurement, setInProcurement] = useState('');
  const [updateReason, setUpdateReason] = useState('');

  if (!material) return null;

  const handleUpdate = () => {
    if (!updateReason) {
      alert('Please select a reason for the update');
      return;
    }

    // Implementation for updating material
    console.log('Update material:', material.name);
    onMaterialUpdated();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Material - {material.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <Label className="text-xs">Material: {material.name}</Label>
            </div>
            <div>
              <Label className="text-xs">Type: {material.type}</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="currentStock" className="text-xs">Current Stock</Label>
              <Input 
                id="currentStock" 
                type="number" 
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                placeholder={material.current_stock.toString()}
                className="h-8 text-xs" 
              />
            </div>
            <div>
              <Label htmlFor="minimumStock" className="text-xs">Minimum Stock</Label>
              <Input 
                id="minimumStock" 
                type="number" 
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
                placeholder={material.minimum_stock.toString()}
                className="h-8 text-xs" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="required" className="text-xs">Required</Label>
              <Input 
                id="required" 
                type="number" 
                value={required}
                onChange={(e) => setRequired(e.target.value)}
                placeholder={material.required.toString()}
                className="h-8 text-xs" 
              />
            </div>
            <div>
              <Label htmlFor="inProcurement" className="text-xs">In Procurement</Label>
              <Input 
                id="inProcurement" 
                type="number" 
                value={inProcurement}
                onChange={(e) => setInProcurement(e.target.value)}
                placeholder={material.in_procurement.toString()}
                className="h-8 text-xs" 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="updateReason" className="text-xs">Reason for Update</Label>
            <Select value={updateReason} onValueChange={setUpdateReason}>
              <SelectTrigger className="h-8 text-xs">
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
          <Button className="w-full h-8 text-xs" onClick={handleUpdate}>Update Material</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRawMaterialDialog;
