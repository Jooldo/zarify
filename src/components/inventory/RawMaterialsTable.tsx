
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, ArrowUpDown, AlertTriangle, Package } from 'lucide-react';
import { RawMaterial } from '@/hooks/useRawMaterials';
import RaiseRequestDialog from './RaiseRequestDialog';
import ViewRawMaterialDialog from './ViewRawMaterialDialog';
import RawMaterialStockUpdateDialog from './RawMaterialStockUpdateDialog';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated: () => void;
  sortConfig: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
}

const RawMaterialsTable = ({ 
  materials, 
  loading, 
  onUpdate, 
  onRequestCreated,
  sortConfig,
  onSortChange 
}: RawMaterialsTableProps) => {
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [isRaiseRequestOpen, setIsRaiseRequestOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStockUpdateOpen, setIsStockUpdateOpen] = useState(false);

  const handleSort = (field: string) => {
    const direction = sortConfig?.field === field && sortConfig?.direction === 'desc' ? 'asc' : 'desc';
    onSortChange(field, direction);
  };

  const getSortIcon = (field: string) => {
    if (sortConfig?.field === field) {
      return <ArrowUpDown className="h-3 w-3 ml-1" />;
    }
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
  };

  const getStatusBadge = (material: RawMaterial) => {
    if (material.shortfall > 0) {
      return <Badge variant="destructive" className="text-xs">Critical</Badge>;
    } else if (material.current_stock <= material.minimum_stock) {
      return <Badge variant="secondary" className="text-xs">Low</Badge>;
    }
    return <Badge variant="default" className="text-xs">Good</Badge>;
  };

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
    setIsStockUpdateOpen(true);
  };

  if (loading) {
    return (
      <div className="border rounded-lg p-8">
        <div className="text-center">
          <div className="text-lg font-medium">Loading raw materials...</div>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="border rounded-lg p-8">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 text-lg font-medium">No raw materials found</div>
          <div className="text-sm text-gray-500">Add materials to your inventory to get started</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[200px]">Material</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort('current_stock')}
                >
                  Current Stock
                  {getSortIcon('current_stock')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort('in_manufacturing')}
                >
                  In Manufacturing
                  {getSortIcon('in_manufacturing')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort('in_procurement')}
                >
                  In Procurement
                  {getSortIcon('in_procurement')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort('required')}
                >
                  Required
                  {getSortIcon('required')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort('shortfall')}
                >
                  Shortfall
                  {getSortIcon('shortfall')}
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium">{material.name}</div>
                  <div className="text-sm text-gray-500">{material.supplier_name || 'No supplier'}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {material.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{material.current_stock}</div>
                  <div className="text-xs text-gray-500">{material.unit}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-blue-600">{material.in_manufacturing}</div>
                  <div className="text-xs text-gray-500">{material.unit}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-orange-600">{material.in_procurement}</div>
                  <div className="text-xs text-gray-500">{material.unit}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{material.required}</div>
                  <div className="text-xs text-gray-500">{material.unit}</div>
                </TableCell>
                <TableCell>
                  <div className={`font-medium ${material.shortfall > 0 ? 'text-red-600' : material.shortfall < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {material.shortfall > 0 ? '+' : ''}{material.shortfall}
                  </div>
                  <div className="text-xs text-gray-500">{material.unit}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(material)}
                    {material.shortfall > 0 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewMaterial(material)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStock(material)}
                      className="h-8 w-8 p-0"
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRaiseRequest(material)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
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
        onSuccess={() => {
          onRequestCreated();
          setIsRaiseRequestOpen(false);
        }}
      />

      <ViewRawMaterialDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        material={selectedMaterial}
      />

      <RawMaterialStockUpdateDialog
        isOpen={isStockUpdateOpen}
        onOpenChange={setIsStockUpdateOpen}
        material={selectedMaterial}
        onSuccess={() => {
          onUpdate();
          setIsStockUpdateOpen(false);
        }}
      />
    </>
  );
};

export default RawMaterialsTable;
