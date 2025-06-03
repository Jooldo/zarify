
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Package, Edit, Eye } from 'lucide-react';
import type { RawMaterial } from '@/hooks/useRawMaterials';
import UpdateStockDialog from './UpdateStockDialog';
import UpdateRawMaterialDialog from './UpdateRawMaterialDialog';
import ViewRawMaterialDialog from './ViewRawMaterialDialog';
import RaiseRequestDialog from './RaiseRequestDialog';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated?: () => void;
}

const RawMaterialsTable = ({ materials, loading, onUpdate, onRequestCreated }: RawMaterialsTableProps) => {
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [updateStockOpen, setUpdateStockOpen] = useState(false);
  const [updateMaterialOpen, setUpdateMaterialOpen] = useState(false);
  const [viewMaterialOpen, setViewMaterialOpen] = useState(false);
  const [raiseRequestOpen, setRaiseRequestOpen] = useState(false);

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { status: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle };
    if (current <= minimum) return { status: 'Low Stock', variant: 'secondary' as const, icon: AlertTriangle };
    return { status: 'In Stock', variant: 'default' as const, icon: Package };
  };

  const handleUpdateStock = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setUpdateStockOpen(true);
  };

  const handleUpdateMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setUpdateMaterialOpen(true);
  };

  const handleViewMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setViewMaterialOpen(true);
  };

  const handleRaiseRequest = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setRaiseRequestOpen(true);
  };

  const handleRequestCreated = () => {
    onUpdate();
    if (onRequestCreated) {
      onRequestCreated();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading materials...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Material Name</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Type</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Current Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Minimum Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Cost per Unit</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => {
              const stockInfo = getStockStatus(material.current_stock, material.minimum_stock);
              const Icon = stockInfo.icon;
              
              return (
                <TableRow key={material.id} className="h-8">
                  <TableCell className="py-1 px-2 text-xs font-medium">{material.name}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.type}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.current_stock} {material.unit}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.minimum_stock} {material.unit}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">
                    {material.cost_per_unit ? `₹${material.cost_per_unit}` : '-'}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <Badge variant={stockInfo.variant} className="text-xs px-1 py-0 flex items-center gap-1 w-fit">
                      <Icon className="h-2 w-2" />
                      {stockInfo.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleViewMaterial(material)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleUpdateMaterial(material)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => handleUpdateStock(material)}
                      >
                        Update Stock
                      </Button>
                      {material.current_stock <= material.minimum_stock && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 px-2 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => handleRaiseRequest(material)}
                        >
                          Raise Request
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <UpdateStockDialog
        isOpen={updateStockOpen}
        onOpenChange={setUpdateStockOpen}
        material={selectedMaterial}
        onStockUpdated={onUpdate}
      />

      <UpdateRawMaterialDialog
        isOpen={updateMaterialOpen}
        onOpenChange={setUpdateMaterialOpen}
        material={selectedMaterial}
        onMaterialUpdated={onUpdate}
      />

      <ViewRawMaterialDialog
        isOpen={viewMaterialOpen}
        onOpenChange={setViewMaterialOpen}
        material={selectedMaterial}
      />

      <RaiseRequestDialog
        isOpen={raiseRequestOpen}
        onOpenChange={setRaiseRequestOpen}
        material={selectedMaterial}
        onRequestCreated={handleRequestCreated}
      />
    </>
  );
};

export default RawMaterialsTable;
