
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Edit, Eye, Plus } from 'lucide-react';
import RaiseRequestDialog from './RaiseRequestDialog';
import ViewRawMaterialDialog from './ViewRawMaterialDialog';
import UpdateStockDialog from './UpdateStockDialog';
import MaterialStatusBadge from './MaterialStatusBadge';
import type { RawMaterial } from '@/hooks/useRawMaterials';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated: () => void;
}

const RawMaterialsTable = ({ materials, loading, onUpdate, onRequestCreated }: RawMaterialsTableProps) => {
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [isRaiseRequestOpen, setIsRaiseRequestOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false);

  const handleRaiseRequest = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsRaiseRequestOpen(true);
  };

  const handleViewMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStock = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsUpdateStockOpen(true);
  };

  const handleRequestCreated = () => {
    setIsRaiseRequestOpen(false);
    onRequestCreated();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading raw materials...</div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">No raw materials found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Material</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Type</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Current Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Min. Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Required</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">In Procurement</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id} className="h-10">
                <TableCell className="py-1 px-2 text-xs font-medium">
                  {material.name}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {material.type}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2 text-xs font-bold">
                  {material.current_stock} {material.unit}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {material.minimum_stock} {material.unit}
                </TableCell>
                <TableCell className="py-1 px-2">
                  <MaterialStatusBadge 
                    currentStock={material.current_stock}
                    minimumStock={material.minimum_stock}
                  />
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {material.required} {material.unit}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {material.in_procurement} {material.unit}
                </TableCell>
                <TableCell className="py-1 px-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleViewMaterial(material)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleUpdateStock(material)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleRaiseRequest(material)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RaiseRequestDialog
        isOpen={isRaiseRequestOpen}
        onOpenChange={setIsRaiseRequestOpen}
        material={selectedMaterial}
        onRequestCreated={handleRequestCreated}
      />

      <ViewRawMaterialDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        material={selectedMaterial}
      />

      <UpdateStockDialog
        isOpen={isUpdateStockOpen}
        onOpenChange={setIsUpdateStockOpen}
        material={selectedMaterial}
        onStockUpdated={onUpdate}
      />
    </>
  );
};

export default RawMaterialsTable;
