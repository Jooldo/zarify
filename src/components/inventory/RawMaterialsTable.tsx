
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, AlertTriangle, CheckCircle, AlertCircle, Edit } from 'lucide-react';
import { RawMaterial } from '@/hooks/useRawMaterials';
import ViewRawMaterialDialog from './ViewRawMaterialDialog';
import RaiseRequestDialog from './RaiseRequestDialog';
import RawMaterialStockUpdateDialog from './RawMaterialStockUpdateDialog';
import OrderedQtyDetailsDialog from './OrderedQtyDetailsDialog';
import { useOrderedQtyDetails } from '@/hooks/useOrderedQtyDetails';

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
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const { loading: orderDetailsLoading, fetchRawMaterialOrderDetails } = useOrderedQtyDetails();

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getStockStatusVariant = (currentStock: number, minimumStock: number) => {
    if (currentStock <= minimumStock) return "destructive" as const;
    if (currentStock <= minimumStock * 1.5) return "secondary" as const;
    return "default" as const;
  };

  const calculateShortfall = (currentStock: number, inProcurement: number, required: number, minimumStock: number) => {
    const totalAvailable = currentStock + inProcurement;
    const needed = Math.max(required, minimumStock);
    return needed - totalAvailable;
  };

  const getInventoryStatus = (currentStock: number, inProcurement: number, required: number, minimumStock: number) => {
    const shortfall = calculateShortfall(currentStock, inProcurement, required, minimumStock);
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (currentStock <= minimumStock) {
      return { status: 'Low', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const getShortfallTooltip = () => {
    return "Shortfall = (Ordered Qty + Minimum Stock) - (Current Stock + In Procurement). Negative values indicate shortfall, positive values indicate surplus.";
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

  const handleOrderedQtyClick = async (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsOrderDetailsOpen(true);
    const details = await fetchRawMaterialOrderDetails(material.id);
    setOrderDetails(details);
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
              <TableHead className="py-1 px-2 text-xs font-medium">Unit</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Current Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Min Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Ordered Qty</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">In Procurement</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Shortfall</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => {
              const shortfall = calculateShortfall(
                material.current_stock,
                material.in_procurement,
                material.required,
                material.minimum_stock
              );

              const statusInfo = getInventoryStatus(
                material.current_stock,
                material.in_procurement,
                material.required,
                material.minimum_stock
              );

              const StatusIcon = statusInfo.icon;
              
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
                  <TableCell className="py-1 px-2 text-xs">
                    {material.unit}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <Badge variant={getStockStatusVariant(material.current_stock, material.minimum_stock)} className="text-xs px-2 py-1 font-bold">
                      {formatIndianNumber(material.current_stock)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs font-medium">
                    {formatIndianNumber(material.minimum_stock)}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleOrderedQtyClick(material)}
                    >
                      {formatIndianNumber(material.required || 0)}
                    </Button>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs font-medium">
                    {formatIndianNumber(material.in_procurement)}
                  </TableCell>
                  <TableCell className="px-2 py-1">
                    <div 
                      className="cursor-help"
                      title={getShortfallTooltip()}
                    >
                      <span className={`text-xs font-medium ${shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {shortfall > 0 ? `-${formatIndianNumber(shortfall)}` : `+${formatIndianNumber(Math.abs(shortfall))}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
                      <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.status}
                      </span>
                    </div>
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
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleRaiseRequest(material)}
                        title="Raise Request"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
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
        mode="inventory"
      />

      <RawMaterialStockUpdateDialog
        isOpen={isStockUpdateOpen}
        onOpenChange={setIsStockUpdateOpen}
        material={selectedMaterial}
        onStockUpdated={onUpdate}
      />

      <OrderedQtyDetailsDialog
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        materialName={selectedMaterial?.name}
        orderDetails={orderDetails}
        totalQuantity={selectedMaterial?.required || 0}
        loading={orderDetailsLoading}
      />
    </>
  );
};

export default RawMaterialsTable;
