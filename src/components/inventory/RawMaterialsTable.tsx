
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RawMaterial } from '@/hooks/useRawMaterials';
import ViewRawMaterialDialog from './ViewRawMaterialDialog';
import UpdateRawMaterialDialog from './UpdateRawMaterialDialog';
import RaiseRequestDialog from './RaiseRequestDialog';
import OrderedQtyButton from './OrderedQtyButton';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated: () => void;
}

const RawMaterialsTable = ({ materials, loading, onUpdate, onRequestCreated }: RawMaterialsTableProps) => {
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const getStatusBadge = (material: RawMaterial) => {
    const shortfall = Math.max(0, (material.required || 0) - ((material.current_stock || 0) + (material.in_procurement || 0)));
    
    if (shortfall > 0) {
      return <Badge variant="destructive" className="text-xs">Critical</Badge>;
    } else if ((material.current_stock || 0) <= (material.minimum_stock || 0)) {
      return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">Low</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs border-green-500 text-green-600">Good</Badge>;
    }
  };

  const getShortfall = (material: RawMaterial) => {
    return Math.max(0, (material.required || 0) - ((material.current_stock || 0) + (material.in_procurement || 0)));
  };

  const handleView = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setViewDialogOpen(true);
  };

  const handleEdit = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setEditDialogOpen(true);
  };

  const handleRaiseRequest = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setRequestDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="text-sm text-gray-500">Loading raw materials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-xs">Material</TableHead>
            <TableHead className="font-semibold text-xs">Type</TableHead>
            <TableHead className="font-semibold text-xs text-center">Current Stock</TableHead>
            <TableHead className="font-semibold text-xs text-center">Min Stock</TableHead>
            <TableHead className="font-semibold text-xs text-center">In Procurement</TableHead>
            <TableHead className="font-semibold text-xs text-center">Required</TableHead>
            <TableHead className="font-semibold text-xs text-center">Ordered Qty</TableHead>
            <TableHead className="font-semibold text-xs text-center">Shortfall</TableHead>
            <TableHead className="font-semibold text-xs text-center">Status</TableHead>
            <TableHead className="font-semibold text-xs text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                <div className="text-gray-500 text-sm">No raw materials found</div>
              </TableCell>
            </TableRow>
          ) : (
            materials.map((material) => {
              const shortfall = getShortfall(material);
              const orderedQty = Math.max(0, (material.required || 0) - (material.current_stock || 0) - (material.in_procurement || 0));
              
              return (
                <TableRow key={material.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{material.name}</div>
                      {material.supplier?.company_name && (
                        <div className="text-xs text-gray-500">Supplier: {material.supplier.company_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{material.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("text-sm font-medium", 
                      (material.current_stock || 0) <= (material.minimum_stock || 0) ? "text-red-600" : "text-gray-900"
                    )}>
                      {material.current_stock || 0}
                    </span>
                    <div className="text-xs text-gray-500">{material.unit}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{material.minimum_stock || 0}</span>
                    <div className="text-xs text-gray-500">{material.unit}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{material.in_procurement || 0}</span>
                    <div className="text-xs text-gray-500">{material.unit}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{material.required || 0}</span>
                    <div className="text-xs text-gray-500">{material.unit}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderedQtyButton
                      materialId={material.id}
                      materialName={material.name}
                      orderedQuantity={orderedQty}
                      type="raw-material"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {shortfall > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-sm font-medium text-red-600">{shortfall}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(material)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(material)}
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(material)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {shortfall > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRaiseRequest(material)}
                          className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {selectedMaterial && (
        <>
          <ViewRawMaterialDialog
            material={selectedMaterial}
            isOpen={viewDialogOpen}
            onOpenChange={(open) => {
              setViewDialogOpen(open);
              if (!open) setSelectedMaterial(null);
            }}
          />
          
          <UpdateRawMaterialDialog
            material={selectedMaterial}
            isOpen={editDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (!open) setSelectedMaterial(null);
            }}
            onMaterialUpdated={onUpdate}
          />
          
          <RaiseRequestDialog
            material={selectedMaterial}
            isOpen={requestDialogOpen}
            onOpenChange={(open) => {
              setRequestDialogOpen(open);
              if (!open) setSelectedMaterial(null);
            }}
            onRequestCreated={onRequestCreated}
            mode="inventory"
          />
        </>
      )}
    </div>
  );
};

export default RawMaterialsTable;
