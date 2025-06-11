
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Eye, AlertTriangle, CheckCircle, AlertCircle, Info, ArrowUp, ArrowDown, Package } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { RawMaterial } from '@/hooks/useRawMaterials';
import { useOrderedQtyDetails } from '@/hooks/useOrderedQtyDetails';
import OrderedQtyDetailsDialog from './OrderedQtyDetailsDialog';
import RawMaterialStockUpdateDialog from './RawMaterialStockUpdateDialog';
import RaiseRequestDialog from './RaiseRequestDialog';
import UpdateRawMaterialDialog from './UpdateRawMaterialDialog';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated?: () => void;
  sortConfig?: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const [isRaiseRequestDialogOpen, setIsRaiseRequestDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [productDetails, setProductDetails] = useState<any[]>([]);
  
  const { loading: orderLoading, fetchRawMaterialOrderDetails, fetchRawMaterialProductDetails } = useOrderedQtyDetails();

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getStockStatusVariant = (stock: number, threshold: number) => {
    if (stock <= threshold) return "destructive" as const;
    if (stock <= threshold * 1.5) return "secondary" as const;
    return "default" as const;
  };

  const getInventoryStatus = (material: RawMaterial) => {
    const shortfall = Math.max(0, material.required - (material.current_stock + material.in_procurement));
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (material.current_stock <= material.minimum_stock) {
      return { status: 'Low', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const handleOrderedQtyClick = async (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsOrderDetailsOpen(true);
    
    // Fetch both order details and product details
    const [orders, products] = await Promise.all([
      fetchRawMaterialOrderDetails(material.id),
      fetchRawMaterialProductDetails(material.id)
    ]);
    
    setOrderDetails(orders);
    setProductDetails(products);
  };

  const handleViewMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStock = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsStockUpdateDialogOpen(true);
  };

  const handleRaiseRequest = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsRaiseRequestDialogOpen(true);
  };

  const handleUpdateMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsUpdateDialogOpen(true);
  };

  // Sort materials based on sortConfig
  const sortedMaterials = [...materials].sort((a, b) => {
    if (!sortConfig) return 0;

    const { field, direction } = sortConfig;
    let aValue: number;
    let bValue: number;

    switch (field) {
      case 'ordered_qty':
        aValue = a.required || 0;
        bValue = b.required || 0;
        break;
      case 'current_stock':
        aValue = a.current_stock || 0;
        bValue = b.current_stock || 0;
        break;
      case 'in_procurement':
        aValue = a.in_procurement || 0;
        bValue = b.in_procurement || 0;
        break;
      case 'shortfall':
        aValue = Math.max(0, a.required - (a.current_stock + a.in_procurement));
        bValue = Math.max(0, b.required - (b.current_stock + b.in_procurement));
        break;
      default:
        return 0;
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg border min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading raw materials...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Material</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Supplier</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Min Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium text-center">
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-700 font-semibold text-xs leading-tight">Required Qty Based</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-700 font-semibold text-xs leading-tight">On Product Shortfall</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Total quantity of this raw material required to fulfill product shortfalls</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium text-center">Current Stock</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>In Procurement</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Quantity of this material currently being procured</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Shortfall</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Shortage calculation: Required - (Current Stock + In Procurement). Positive values indicate shortage.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Critical: Shortage exists; Low: Current stock below minimum; Good: Adequate stock levels</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMaterials.map((material) => {
              const shortfall = Math.max(0, material.required - (material.current_stock + material.in_procurement));
              const statusInfo = getInventoryStatus(material);
              const StatusIcon = statusInfo.icon;

              return (
                <TableRow key={material.id} className="h-10">
                  <TableCell className="px-2 py-1">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{material.name}</div>
                      <div className="text-xs text-gray-500">
                        {material.type} • {material.unit}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    {material.supplier_name || '-'}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs font-medium">
                    {formatIndianNumber(material.minimum_stock)}
                  </TableCell>
                  <TableCell className="py-1 px-2 text-center">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                      onClick={() => handleOrderedQtyClick(material)}
                    >
                      {formatIndianNumber(material.required)}
                    </Button>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-sm font-bold text-center">
                    {formatIndianNumber(material.current_stock)}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-sm font-medium text-center">
                    {formatIndianNumber(material.in_procurement)}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-sm font-medium ${shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatIndianNumber(Math.abs(shortfall))}
                      </span>
                      {shortfall > 0 ? (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      )}
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
                  <TableCell className="px-2 py-1">
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
                        className="h-6 w-6 p-0"
                        onClick={() => handleUpdateStock(material)}
                      >
                        <Package className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OrderedQtyDetailsDialog
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        materialName={selectedMaterial?.name}
        orderDetails={orderDetails}
        productDetails={productDetails}
        totalQuantity={selectedMaterial?.required || 0}
        loading={orderLoading}
      />

      <RawMaterialStockUpdateDialog
        material={selectedMaterial}
        isOpen={isStockUpdateDialogOpen}
        onClose={() => setIsStockUpdateDialogOpen(false)}
        onUpdate={onUpdate}
      />

      <RaiseRequestDialog
        material={selectedMaterial}
        isOpen={isRaiseRequestDialogOpen}
        onClose={() => setIsRaiseRequestDialogOpen(false)}
        onRequestCreated={onRequestCreated}
      />

      <UpdateRawMaterialDialog
        material={selectedMaterial}
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        onUpdate={onUpdate}
      />
    </TooltipProvider>
  );
};

export default RawMaterialsTable;
