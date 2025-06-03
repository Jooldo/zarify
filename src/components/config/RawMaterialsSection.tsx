
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface RawMaterialsSectionProps {
  rawMaterials: any[];
  setRawMaterials: (materials: any[]) => void;
  currentMaterial: {
    name: string;
    quantity: string;
    unit: string;
  };
  setCurrentMaterial: (material: any) => void;
  addRawMaterial: () => void;
  removeRawMaterial: (index: number) => void;
}

const RawMaterialsSection = ({
  rawMaterials,
  currentMaterial,
  setCurrentMaterial,
  addRawMaterial,
  removeRawMaterial
}: RawMaterialsSectionProps) => {
  const materialUnits = ["pieces", "meters", "kg", "grams", "rolls", "liters"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Materials Required</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <Label htmlFor="materialName">Material Name</Label>
            <Input
              id="materialName"
              value={currentMaterial.name}
              onChange={(e) => setCurrentMaterial({...currentMaterial, name: e.target.value})}
              placeholder="e.g., Silver Chain"
            />
          </div>
          <div>
            <Label htmlFor="materialQuantity">Quantity per Unit</Label>
            <Input
              id="materialQuantity"
              type="number"
              min="0"
              step="0.01"
              value={currentMaterial.quantity}
              onChange={(e) => setCurrentMaterial({...currentMaterial, quantity: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="materialUnit">Unit</Label>
            <Select value={currentMaterial.unit} onValueChange={(value) => setCurrentMaterial({...currentMaterial, unit: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {materialUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={addRawMaterial} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Material
          </Button>
        </div>

        {rawMaterials.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Quantity per Unit</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawMaterials.map((material, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.quantity}</TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRawMaterial(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RawMaterialsSection;
