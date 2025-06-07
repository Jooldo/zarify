
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface RawMaterialEntry {
  material: string;
  quantity: number;
  unit: string;
}

interface AddRawMaterialConfigDialogProps {
  rawMaterials: RawMaterialEntry[];
  onUpdateRawMaterials: (materials: RawMaterialEntry[]) => void;
}

const AddRawMaterialConfigDialog = ({ rawMaterials, onUpdateRawMaterials }: AddRawMaterialConfigDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localMaterials, setLocalMaterials] = useState<RawMaterialEntry[]>([]);
  const { rawMaterials: availableRawMaterials, loading: rawMaterialsLoading } = useRawMaterials();

  const handleOpen = () => {
    setLocalMaterials(rawMaterials.length > 0 ? [...rawMaterials] : [{ material: '', quantity: 0, unit: 'grams' }]);
    setIsOpen(true);
  };

  const addMaterial = () => {
    setLocalMaterials([...localMaterials, { material: '', quantity: 0, unit: 'grams' }]);
  };

  const removeMaterial = (index: number) => {
    if (localMaterials.length > 1) {
      const newMaterials = [...localMaterials];
      newMaterials.splice(index, 1);
      setLocalMaterials(newMaterials);
    }
  };

  const updateMaterial = (index: number, field: keyof RawMaterialEntry, value: any) => {
    const updatedMaterials = localMaterials.map((material, i) => {
      if (i === index) {
        if (field === 'material') {
          const selectedMaterial = availableRawMaterials.find(m => m.id === value);
          return { 
            ...material, 
            [field]: value,
            unit: selectedMaterial?.unit || material.unit
          };
        }
        return { ...material, [field]: value };
      }
      return material;
    });
    setLocalMaterials(updatedMaterials);
  };

  const handleSave = () => {
    const validMaterials = localMaterials.filter(material => material.material && material.quantity > 0);
    onUpdateRawMaterials(validMaterials);
    setIsOpen(false);
  };

  const getSelectedMaterialInfo = (materialId: string) => {
    return availableRawMaterials.find(m => m.id === materialId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          className="h-10 text-sm"
          onClick={handleOpen}
        >
          <Package className="h-4 w-4 mr-2" />
          Configure Raw Materials ({rawMaterials.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Configure Raw Materials Required</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {localMaterials.map((material, index) => {
            const selectedMaterial = getSelectedMaterialInfo(material.material);
            
            return (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Raw Material #{index + 1}</Label>
                  {localMaterials.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMaterial(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Raw Material Selection */}
                <div className="space-y-2">
                  <Label className="text-sm">Select Raw Material *</Label>
                  <Select 
                    value={material.material} 
                    onValueChange={(value) => updateMaterial(index, 'material', value)}
                    disabled={rawMaterialsLoading}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={rawMaterialsLoading ? "Loading materials..." : "Choose raw material"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableRawMaterials.map((rawMat) => (
                        <SelectItem key={rawMat.id} value={rawMat.id} className="py-3">
                          <div className="space-y-1">
                            <div className="font-medium">{rawMat.name}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{rawMat.type}</Badge>
                              <span>Stock: {rawMat.current_stock} {rawMat.unit}</span>
                              <span>Unit: {rawMat.unit}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMaterial && (
                    <div className="text-xs text-gray-600 flex gap-4">
                      <span>Type: <Badge variant="secondary" className="text-xs">{selectedMaterial.type}</Badge></span>
                      <span>Available: {selectedMaterial.current_stock} {selectedMaterial.unit}</span>
                    </div>
                  )}
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Quantity Required *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={material.quantity}
                      onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="h-10"
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Unit</Label>
                    <Input
                      value={selectedMaterial?.unit || material.unit}
                      className="h-10 bg-gray-100"
                      readOnly
                      placeholder="Unit will be set automatically"
                    />
                    <p className="text-xs text-gray-500">Unit is set based on selected material</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add More Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={addMaterial}
              className="h-10 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Raw Material
            </Button>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <Button 
            type="button" 
            onClick={handleSave} 
            className="flex-1 h-10"
            disabled={localMaterials.every(m => !m.material || m.quantity <= 0)}
          >
            Save Raw Materials
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)} 
            className="h-10 px-6"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRawMaterialConfigDialog;
