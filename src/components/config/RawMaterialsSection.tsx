
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
  updateRawMaterialBatch: (index: number, updates: { material?: string; unit?: string; quantity?: number }) => void;
}

const RawMaterialsSection = ({ 
  rawMaterials, 
  addRawMaterial, 
  removeRawMaterial, 
  updateRawMaterial,
  updateRawMaterialBatch
}: RawMaterialsSectionProps) => {
  const { rawMaterials: availableRawMaterials, loading } = useRawMaterials();

  console.log('Available raw materials:', availableRawMaterials);
  console.log('Current raw materials state:', rawMaterials);

  const handleMaterialChange = (index: number, materialId: string) => {
    console.log('Material selection changed:', { index, materialId });
    const selectedMaterial = availableRawMaterials.find(m => m.id === materialId);
    console.log('Found selected material:', selectedMaterial);
    
    // Update both material and unit in a single batch update to avoid state conflicts
    if (selectedMaterial) {
      console.log('Updating material and unit together:', { materialId, unit: selectedMaterial.unit });
      updateRawMaterialBatch(index, {
        material: materialId,
        unit: selectedMaterial.unit
      });
    } else {
      updateRawMaterial(index, 'material', materialId);
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
          console.log(`Material ${index} state:`, { 
            materialId: material.material, 
            quantity: material.quantity, 
            unit: material.unit,
            selectedMaterial 
          });
          
          return (
            <div key={index} className="grid grid-cols-12 gap-1 items-end">
              <div className="col-span-5">
                <Label className="text-xs">Raw Material</Label>
                <Select 
                  value={material.material || ""} 
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
                  value={material.quantity || ""}
                  onChange={(e) => {
                    const newQuantity = parseFloat(e.target.value) || 0;
                    console.log('Quantity changed:', { index, newQuantity });
                    updateRawMaterial(index, 'quantity', newQuantity);
                  }}
                  placeholder="0"
                  className="h-7 text-xs"
                  min="0"
                />
              </div>
              
              <div className="col-span-3">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={selectedMaterial?.unit || material.unit || ""}
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
