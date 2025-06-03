
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface RawMaterial {
  id: number;
  name: string;
  type: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  lastUpdated: string;
  supplier: string;
  costPerUnit: number;
  required: number;
  inProcurement: number;
  requestStatus: string;
}

interface RaiseRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMaterial: RawMaterial | null;
}

const RaiseRequestDialog = ({ isOpen, onOpenChange, selectedMaterial }: RaiseRequestDialogProps) => {
  const calculateStatus = (required: number, currentStock: number, threshold: number) => {
    return required - currentStock - threshold;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise Procurement Request - {selectedMaterial?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current Stock</Label>
              <Input value={`${selectedMaterial?.currentStock || 0} ${selectedMaterial?.unit || ''}`} disabled />
            </div>
            <div>
              <Label>Required Quantity</Label>
              <Input value={`${selectedMaterial?.required || 0} ${selectedMaterial?.unit || ''}`} disabled />
            </div>
          </div>
          <div>
            <Label htmlFor="requestQuantity">Request Quantity</Label>
            <Input 
              id="requestQuantity" 
              type="number" 
              placeholder={calculateStatus(selectedMaterial?.required || 0, selectedMaterial?.currentStock || 0, selectedMaterial?.minimumStock || 0).toString()}
              defaultValue={Math.max(0, calculateStatus(selectedMaterial?.required || 0, selectedMaterial?.currentStock || 0, selectedMaterial?.minimumStock || 0))}
            />
          </div>
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mumbai-silver">Mumbai Silver Co.</SelectItem>
                <SelectItem value="rajasthan-crafts">Rajasthan Crafts</SelectItem>
                <SelectItem value="delhi-accessories">Delhi Accessories</SelectItem>
                <SelectItem value="local-supplier">Local Supplier</SelectItem>
                <SelectItem value="artisan-supplies">Artisan Supplies</SelectItem>
                <SelectItem value="textile-hub">Textile Hub</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="eta">Expected Delivery Date</Label>
            <Input id="eta" type="date" />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Add any additional notes or requirements..." />
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">Submit Request</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseRequestDialog;
