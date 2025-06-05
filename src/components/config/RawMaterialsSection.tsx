
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface RawMaterial {
  material: string;
  quantity: number;
  unit: string;
}

interface RawMaterialsSectionProps {
  rawMaterials: RawMaterial[];
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

  // Safely handle available materials
  const materialOptions = Array.isArray(availableRawMaterials) 
    ? availableRawMaterials.filter(material => material?.id && material?.name)
    : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Raw Materials Required</CardTitle>
          <Button type="button" onClick={addRawMaterial} variant="outline" size="sm" className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Material
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {rawMaterials.map((material, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 items-end">
            <div>
              <Label className="text-xs">Material</Label>
              <Select 
                value={material.material} 
                onValueChange={(value) => updateRawMaterial(index, 'material', value)}
                disabled={loading}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={loading ? "Loading..." : "Select material"} />
                </SelectTrigger>
                <SelectContent>
                  {materialOptions.length > 0 ? (
                    materialOptions.map((rawMat) => (
                      <SelectItem key={rawMat.id} value={rawMat.id} className="text-xs">
                        {rawMat.name} ({rawMat.type})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-materials" disabled className="text-xs text-gray-500">
                      {loading ? "Loading materials..." : "No materials available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Quantity</Label>
              <Input
                type="number"
                value={material.quantity}
                onChange={(e) => updateRawMaterial(index, 'quantity', Number(e.target.value))}
                placeholder="0"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Unit</Label>
              <Select 
                value={material.unit} 
                onValueChange={(value) => updateRawMaterial(index, 'unit', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grams" className="text-xs">Grams</SelectItem>
                  <SelectItem value="pieces" className="text-xs">Pieces</SelectItem>
                  <SelectItem value="meters" className="text-xs">Meters</SelectItem>
                  <SelectItem value="rolls" className="text-xs">Rolls</SelectItem>
                  <SelectItem value="kg" className="text-xs">Kilograms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeRawMaterial(index)}
              disabled={rawMaterials.length === 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RawMaterialsSection;
