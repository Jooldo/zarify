
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, AlertCircle } from 'lucide-react';
import { RawMaterial } from '@/hooks/useRawMaterials';
import ViewRawMaterialDialog from './ViewRawMaterialDialog';
import RaiseRequestDialog from './RaiseRequestDialog';
import RawMaterialStockUpdateDialog from './RawMaterialStockUpdateDialog';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated?: () => void;
}

const RawMaterialsTable = ({ materials, loading, onUpdate, onRequestCreated }: RawMaterialsTableProps) => {
  const [isViewMaterialOpen, setIsViewMaterialOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isStockUpdateOpen, setIsStockUpdateOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);

  const getStockStatusVariant = (currentStock: number, minimumStock: number) => {
    if (currentStock <= minimumStock) return "destructive" as const;
    if (currentStock <= minimumStock * 1.5) return "secondary" as const;
    return "default" as const;
  };

  const handleViewMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsViewMaterialOpen(true);
  };

  const handleRaiseRequest = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsRequestDialogOpen(true);
  };

  const handleUpdateStock = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsStockUpdateOpen(true);
  };

  const handleRequestCreated = () => {
    onUpdate();
    if (onRequestCreated) {
      onRequestCreated();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading raw materials...</div>
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
              <TableHead className="py-1 px-2 text-xs font-medium">Min Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Required</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Shortfall</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Unit</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => {
              const shortfall = Math.max(0, (material.required || 0) + material.minimum_stock - material.current_stock);
              
              return (
                <TableRow key={material.id} className="h-10">
                  <TableCell className="py-1 px-2 text-xs font-medium">
                    {material.name}
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs">
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      {material.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <Badge variant={getStockStatusVariant(material.current_stock, material.minimum_stock)} className="text-xs px-2 py-1 font-bold">
                      {material.current_stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs font-medium">
                    {material.minimum_stock}
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs font-medium">
                    {material.required || 0}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <span className={`text-xs ${shortfall > 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                      {shortfall > 0 ? shortfall : 'OK'}
                    </span>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs">
                    {material.unit}
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
                        onClick={() => handleUpdateStock(material)}
                        title="Update Stock"
                      >
                        <AlertCircle className="h-3 w-3" />
                      </Button>
                      {shortfall > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleRaiseRequest(material)}
                          title="Raise Request"
                        >
                          <Plus className="h-3 w-3" />
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

      <ViewRawMaterialDialog 
        material={selectedMaterial}
        isOpen={isViewMaterialOpen}
        onOpenChange={setIsViewMaterialOpen}
      />

      <RaiseRequestDialog 
        isOpen={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        material={selectedMaterial}
        onRequestCreated={handleRequestCreated}
      />

      <RawMaterialStockUpdateDialog
        isOpen={isStockUpdateOpen}
        onOpenChange={setIsStockUpdateOpen}
        material={selectedMaterial}
        onStockUpdated={onUpdate}
      />
    </>
  );
};

export default RawMaterialsTable;
