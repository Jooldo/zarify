import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, AlertTriangle, CheckCircle, AlertCircle, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { RawMaterial } from '@/hooks/useRawMaterials';
import { useOrderedQtyDetails } from '@/hooks/useOrderedQtyDetails';
import OrderedQtyDetailsDialog from './OrderedQtyDetailsDialog';
import RaiseRequestDialog from './RaiseRequestDialog';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated: () => void;
  sortConfig?: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

const RawMaterialsTable = ({ materials, loading, onUpdate, onRequestCreated, sortConfig, onSortChange }: RawMaterialsTableProps) => {
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [isRaiseRequestOpen, setIsRaiseRequestOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const { loading: detailsLoading, fetchRawMaterialProductDetails } = useOrderedQtyDetails();

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getStockStatus = (currentStock: number, minimumStock: number, required: number, inProcurement: number) => {
    const shortfall = Math.max(0, required - (currentStock + inProcurement));
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (currentStock <= minimumStock) {
      return { status: 'Low', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const handleRaiseRequest = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsRaiseRequestOpen(true);
  };

  const handleRequiredClick = async (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsOrderDetailsOpen(true);
    const details = await fetchRawMaterialProductDetails(material.id);
    setProductDetails(details);
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
        aValue = Math.max(0, (a.required || 0) - ((a.current_stock || 0) + (a.in_procurement || 0)));
        bValue = Math.max(0, (b.required || 0) - ((b.current_stock || 0) + (b.in_procurement || 0)));
        break;
      default:
        return 0;
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-8">
        <div className="text-center text-gray-500">Loading raw materials...</div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8">
        <div className="text-center text-gray-500">No raw materials found</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Material Name</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Type</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Supplier</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium text-center">
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-purple-700 font-semibold text-xs leading-tight">Qty Required based</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-purple-700 font-semibold text-xs leading-tight">on FG Shortfall</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-purple-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Total quantity of this raw material required based on finished goods shortfall calculations</p>
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
                      <p className="max-w-xs">Shortage: Required - (Current Stock + In Procurement). Positive values indicate shortage.</p>
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
                      <p className="max-w-xs">Critical: Shortage exists; Low: Stock below minimum; Good: Adequate stock levels</p>
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
              
              const statusInfo = getStockStatus(
                material.current_stock,
                material.minimum_stock,
                material.required,
                material.in_procurement
              );

              const StatusIcon = statusInfo.icon;

              return (
                <TableRow key={material.id} className="h-10">
                  <TableCell className="px-2 py-1 text-xs font-medium">
                    <div className="flex flex-col">
                      <span>{material.name}</span>
                      <span className="text-xs text-gray-500">{material.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    {material.type}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    {material.supplier_name || '-'}
                  </TableCell>
                  <TableCell className="py-1 px-2 text-center">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-bold text-purple-700 hover:text-purple-900 hover:bg-purple-50"
                      onClick={() => handleRequiredClick(material)}
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
                        {formatIndianNumber(shortfall)}
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
                        onClick={() => handleRaiseRequest(material)}
                      >
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

      <RaiseRequestDialog
        isOpen={isRaiseRequestOpen}
        onOpenChange={setIsRaiseRequestOpen}
        material={selectedMaterial}
        mode="inventory"
        onRequestCreated={() => {
          onRequestCreated();
          setIsRaiseRequestOpen(false);
        }}
      />

      <OrderedQtyDetailsDialog
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        productDetails={productDetails}
        totalQuantity={selectedMaterial?.required || 0}
        loading={detailsLoading}
        materialName={selectedMaterial?.name}
      />
    </TooltipProvider>
  );
};

export default RawMaterialsTable;
