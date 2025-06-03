
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit } from 'lucide-react';

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

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  onRaiseRequest: (material: RawMaterial) => void;
}

const RawMaterialsTable = ({ materials, onRaiseRequest }: RawMaterialsTableProps) => {
  const calculateStatus = (required: number, currentStock: number, threshold: number) => {
    return required - currentStock - threshold;
  };

  const getStatusDisplay = (status: number) => {
    if (status > 0) {
      return `Deficit of ${status}`;
    } else if (status < 0) {
      return `Surplus of ${Math.abs(status)}`;
    } else {
      return "Balanced";
    }
  };

  const getStatusTextColor = (status: number) => {
    if (status > 0) return "text-red-800 font-bold";
    if (status < 0) return "text-green-800 font-bold";
    return "text-gray-600 font-bold";
  };

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="py-1 px-2 text-xs font-medium">Material</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Current Stock</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Required</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">In Procurement</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => {
            const status = calculateStatus(material.required, material.currentStock, material.minimumStock);
            return (
              <TableRow key={material.id} className="h-8">
                <TableCell className="py-1 px-2 text-xs">
                  <div>
                    <div className="font-medium">{material.name}</div>
                    <div className="text-gray-500">{material.type}</div>
                  </div>
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  <div>
                    <div>{material.currentStock} {material.unit}</div>
                    <div className="text-gray-500">Min: {material.minimumStock}</div>
                  </div>
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {material.required} {material.unit}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {material.inProcurement} {material.unit}
                </TableCell>
                <TableCell className="py-1 px-2">
                  <span className={`text-xs ${getStatusTextColor(status)}`}>
                    {getStatusDisplay(status)}
                  </span>
                </TableCell>
                <TableCell className="py-1 px-2">
                  <div className="flex gap-1">
                    {material.requestStatus === 'None' && status > 0 ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => onRaiseRequest(material)}
                      >
                        Raise Request
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                        Update
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RawMaterialsTable;
