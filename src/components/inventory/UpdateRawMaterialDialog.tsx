
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RawMaterial } from '@/hooks/useRawMaterials';

interface UpdateRawMaterialDialogProps {
  material: RawMaterial;
  onUpdate: (id: string, updates: {
    current_stock?: number;
    minimum_stock?: number;
    required?: number;
    in_procurement?: number;
  }) => void;
}

const UpdateRawMaterialDialog = ({ material, onUpdate }: UpdateRawMaterialDialogProps) => {
  const [currentStock, setCurrentStock] = useState(material.current_stock.toString());
  const [minimumStock, setMinimumStock] = useState(material.minimum_stock.toString());
  const [required, setRequired] = useState(material.required.toString());
  const [inProcurement, setInProcurement] = useState(material.in_procurement.toString());
  const [updateReason, setUpdateReason] = useState('');

  const handleUpdate = () => {
    if (!updateReason) {
      alert('Please select a reason for the update');
      return;
    }

    onUpdate(material.id, {
      current_stock: parseInt(currentStock),
      minimum_stock: parseInt(minimumStock),
      required: parseInt(required),
      in_procurement: parseInt(inProcurement),
    });
  };

  return (
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
  );
};

export default UpdateRawMaterialDialog;
