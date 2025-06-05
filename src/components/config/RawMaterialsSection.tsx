
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface RawMaterialsSectionProps {
  rawMaterials: Array<{
    material: string;
    quantity: number;
    unit: string;
  }>;
  addRawMaterial: () => void;
  removeRawMaterial: (index: number) => void;
  updateRawMaterial: (index: number, field: string, value: any) => void;
}

const RawMaterialsSection = ({ 
  rawMaterials, 
  addRawMaterial, 
  removeRawMaterial, 
  updateRawMaterial 
}: RawMaterialsSectionProps) => {
  const { rawMaterials: availableRawMaterials, loading } = useRawMaterials();

  const handleMaterialChange = (index: number, materialId: string) => {
    const selectedMaterial = availableRawMaterials.find(m => m.id === materialId);
    updateRawMaterial(index, 'material', materialId);
    if (selectedMaterial) {
      updateRawMaterial(index, 'unit', selectedMaterial.unit);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm flex items-center justify-between">
          Raw Materials Required
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRawMaterial}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {rawMaterials.map((material, index) => {
          const selectedMaterial = availableRawMaterials.find(m => m.id === material.material);
          
          return (
            <div key={index} className="grid grid-cols-12 gap-1 items-end">
              <div className="col-span-5">
                <Label className="text-xs">Raw Material</Label>
                <Select 
                  value={material.material} 
                  onValueChange={(value) => handleMaterialChange(index, value)}
                  disabled={loading}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder={loading ? "Loading..." : "Select material"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRawMaterials.map((rawMat) => (
                      <SelectItem key={rawMat.id} value={rawMat.id} className="text-xs">
                        {rawMat.name} ({rawMat.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-3">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={material.quantity}
                  onChange={(e) => updateRawMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="h-7 text-xs"
                  min="0"
                />
              </div>
              
              <div className="col-span-3">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={selectedMaterial?.unit || material.unit}
                  className="h-7 text-xs bg-gray-50"
                  readOnly
                  placeholder="Unit"
                />
              </div>
              
              <div className="col-span-1">
                {rawMaterials.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRawMaterial(index)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RawMaterialsSection;
