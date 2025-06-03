
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RawMaterialsDialogProps {
  item: {
    id: number;
    productCode: string;
    currentStock: number;
  };
  shortfall: number;
}

const RawMaterialsDialog = ({ item, shortfall }: RawMaterialsDialogProps) => {
  const rawMaterialsRequired = {
    1: [
      { material: "Gold Wire (22K)", required: 20, available: 150, unit: "grams" },
      { material: "Meena Enamel", required: 10, available: 50, unit: "grams" },
      { material: "Silver Base", required: 40, available: 200, unit: "grams" }
    ],
    2: [
      { material: "Gold Wire (22K)", required: 32, available: 150, unit: "grams" },
      { material: "Kundan Stones", required: 8, available: 25, unit: "pieces" },
      { material: "Silver Base", required: 48, available: 200, unit: "grams" }
    ],
    3: [
      { material: "Silver Chain", required: 16, available: 80, unit: "meters" },
      { material: "Silver Clasps", required: 4, available: 20, unit: "pieces" }
    ]
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="font-medium">Shortfall Quantity:</Label>
          <div className="text-lg font-bold text-red-600">
            {Math.abs(shortfall)} units {shortfall < 0 ? 'needed' : 'surplus'}
          </div>
        </div>
        <div>
          <Label className="font-medium">Current Stock:</Label>
          <div className="text-lg font-bold text-blue-600">
            {item.currentStock} units
          </div>
        </div>
      </div>
      
      {shortfall < 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Raw Materials Required for Production:</h4>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="h-8">
                  <TableHead className="text-xs">Material</TableHead>
                  <TableHead className="text-xs">Required per Unit</TableHead>
                  <TableHead className="text-xs">Total Required</TableHead>
                  <TableHead className="text-xs">Available</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(rawMaterialsRequired[item.id] || []).map((material, index) => {
                  const totalRequired = material.required * Math.abs(shortfall);
                  const shortage = Math.max(0, totalRequired - material.available);
                  return (
                    <TableRow key={index} className="h-8">
                      <TableCell className="text-xs">{material.material}</TableCell>
                      <TableCell className="text-xs">{material.required} {material.unit}</TableCell>
                      <TableCell className="text-xs font-medium">{totalRequired} {material.unit}</TableCell>
                      <TableCell className="text-xs">{material.available} {material.unit}</TableCell>
                      <TableCell className="text-xs">
                        {shortage > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            Need {shortage} {material.unit}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs">
                            Sufficient
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      {shortfall >= 0 && (
        <div className="text-center py-4 text-green-600 font-medium">
          ✓ Stock levels are sufficient. No additional production needed.
        </div>
      )}
    </div>
  );
};

export default RawMaterialsDialog;
