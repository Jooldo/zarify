
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, AlertTriangle, CheckCircle, AlertCircle, Edit, Info, ArrowUp, ArrowDown, Tag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { RawMaterial } from '@/hooks/useRawMaterials';
import ViewRawMaterialDialog from './ViewRawMaterialDialog';
import RaiseRequestDialog from './RaiseRequestDialog';
import RawMaterialStockUpdateDialog from './RawMaterialStockUpdateDialog';
import OrderedQtyDetailsDialog from './OrderedQtyDetailsDialog';
import { useOrderedQtyDetails } from '@/hooks/useOrderedQtyDetails';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import SortDropdown from '@/components/ui/sort-dropdown';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated?: () => void;
  sortConfig?: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

const RawMaterialsTable = ({ materials, loading, onUpdate, onRequestCreated, sortConfig, onSortChange }: RawMaterialsTableProps) => {
  const [isViewMaterialOpen, setIsViewMaterialOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isStockUpdateOpen, setIsStockUpdateOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const [materialRequirements, setMaterialRequirements] = useState<{ [key: string]: number }>({});
  const { loading: orderDetailsLoading, fetchRawMaterialProductDetails } = useOrderedQtyDetails();

  // Calculate total material required for each material
  useEffect(() => {
    const calculateMaterialRequirements = async () => {
      const requirements: { [key: string]: number } = {};
      
      for (const material of materials) {
        try {
          const details = await fetchRawMaterialProductDetails(material.id);
          const totalRequired = details.reduce((sum, product) => {
            const materialRequiredFromShortfall = product.shortfall > 0 ? product.shortfall * product.material_quantity_per_unit : 0;
            return sum + materialRequiredFromShortfall;
          }, 0);
          requirements[material.id] = totalRequired;
        } catch (error) {
          console.error(`Error calculating requirements for material ${material.id}:`, error);
          requirements[material.id] = 0;
        }
      }
      
      setMaterialRequirements(requirements);
    };

    if (materials.length > 0) {
      calculateMaterialRequirements();
    }
  }, [materials, fetchRawMaterialProductDetails]);

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getShortUnit = (unit: string) => {
    const unitMap: { [key: string]: string } = {
      'grams': 'g',
      'gram': 'g',
      'kilograms': 'kg',
      'kilogram': 'kg',
      'liters': 'l',
      'liter': 'l',
      'milliliters': 'ml',
      'milliliter': 'ml',
      'pieces': 'pcs',
      'piece': 'pc',
      'meters': 'm',
      'meter': 'm',
      'centimeters': 'cm',
      'centimeter': 'cm',
      'pounds': 'lbs',
      'pound': 'lb',
      'ounces': 'oz',
      'ounce': 'oz'
    };
    return unitMap[unit.toLowerCase()] || unit;
  };

  const getStockStatusVariant = (currentStock: number, minimumStock: number) => {
    if (currentStock <= minimumStock) return "destructive" as const;
    if (currentStock <= minimumStock * 1.5) return "secondary" as const;
    return "default" as const;
  };

  const calculateShortfall = (currentStock: number, inProcurement: number, required: number, minimumStock: number) => {
    const totalAvailable = currentStock + inProcurement;
    const totalNeeded = required + minimumStock;
    return totalNeeded - totalAvailable;
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
    return "Shortfall = (Ordered Qty + Minimum Stock) - (Current Stock + In Procurement). Positive values indicate shortfall, negative values indicate surplus.";
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
    const details = await fetchRawMaterialProductDetails(material.id);
    setProductDetails(details);
  };

  const handleRequestCreated = () => {
    onUpdate();
    if (onRequestCreated) {
      onRequestCreated();
    }
  };

  // Sort materials based on sortConfig
  const sortedMaterials = [...materials].sort((a, b) => {
    if (!sortConfig) return 0;

    const { field, direction } = sortConfig;
    let aValue: number;
    let bValue: number;

    switch (field) {
      case 'ordered_qty':
        aValue = materialRequirements[a.id] || 0;
        bValue = materialRequirements[b.id] || 0;
        break;
      case 'current_stock':
        aValue = a.current_stock;
        bValue = b.current_stock;
        break;
      case 'in_procurement':
        aValue = a.in_procurement;
        bValue = b.in_procurement;
        break;
      case 'shortfall':
        const aRequired = materialRequirements[a.id] || 0;
        const bRequired = materialRequirements[b.id] || 0;
        aValue = calculateShortfall(a.current_stock, a.in_procurement, aRequired, a.minimum_stock);
        bValue = calculateShortfall(b.current_stock, b.in_procurement, bRequired, b.minimum_stock);
        break;
      default:
        return 0;
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  if (loading) {
    return (
      <TableSkeleton 
        rows={8} 
        columns={8}
        columnWidths={[
          'w-40', 'w-20', 'w-20', 'w-20', 'w-20', 'w-20', 'w-16', 'w-24'
        ]}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Material</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Threshold</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium text-center">
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-700 font-semibold text-xs leading-tight">Total Material Required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-700 font-semibold text-xs leading-tight">based on Finished Good Shortfall</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Total quantity of this material required for all pending orders (Created + In Progress status)</p>
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
                      <p className="max-w-xs">Quantity of this material currently being procured from suppliers</p>
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
                      <p className="max-w-xs">Shortage calculation: (Total Material Required + Min Stock) - (Current Stock + In Procurement). Positive values indicate shortage, negative indicate surplus.</p>
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
              const totalMaterialRequired = materialRequirements[material.id] || 0;
              const shortfall = calculateShortfall(
                material.current_stock,
                material.in_procurement,
                totalMaterialRequired,
                material.minimum_stock
              );

              const statusInfo = getInventoryStatus(
                material.current_stock,
                material.in_procurement,
                totalMaterialRequired,
                material.minimum_stock
              );

              const StatusIcon = statusInfo.icon;
              const shortUnit = getShortUnit(material.unit);
              
              return (
                <TableRow key={material.id} className="h-10">
                  <TableCell className="py-1 px-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{material.name}</span>
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        {material.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs font-medium">
                    {formatIndianNumber(material.minimum_stock)} {shortUnit}
                  </TableCell>
                  <TableCell className="py-1 px-2 text-center">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                      onClick={() => handleOrderedQtyClick(material)}
                    >
                      {formatIndianNumber(totalMaterialRequired)} {shortUnit}
                    </Button>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-sm font-bold text-center">
                    {formatIndianNumber(material.current_stock)} {shortUnit}
                  </TableCell>
                  <TableCell className="py-1 px-2 text-sm font-medium text-center">
                    {formatIndianNumber(material.in_procurement)} {shortUnit}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-center">
                    <div 
                      className="cursor-help flex items-center justify-center gap-1"
                      title={getShortfallTooltip()}
                    >
                      <span className={`text-sm font-medium ${shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatIndianNumber(Math.abs(shortfall))} {shortUnit}
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
        materialUnit={selectedMaterial?.unit}
        productDetails={productDetails}
        totalQuantity={materialRequirements[selectedMaterial?.id || ''] || 0}
        loading={orderDetailsLoading}
        isRawMaterial={true}
      />
    </TooltipProvider>
  );
};

export default RawMaterialsTable;
