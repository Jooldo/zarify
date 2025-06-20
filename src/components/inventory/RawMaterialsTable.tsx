
import { useState } from 'react';
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
import { useOrderedQtyDetails, type RawMaterialProductDetail } from '@/hooks/useOrderedQtyDetails';
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
  const [productDetails, setProductDetails] = useState<RawMaterialProductDetail[]>([]);
  const [calculatedTotalRequired, setCalculatedTotalRequired] = useState<number>(0);
  const { loading: orderDetailsLoading, fetchRawMaterialProductDetails } = useOrderedQtyDetails();

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

  const getInventoryStatus = (currentStock: number, inProcurement: number, inManufacturing: number, required: number, minimumStock: number) => {
    // Use the actual available stock for status calculation
    const actualAvailableStock = currentStock + inProcurement;
    const shortfall = Math.max(0, (required + minimumStock) - actualAvailableStock);
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (currentStock <= minimumStock) {
      return { status: 'Low', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const getShortfallTooltip = () => {
    return "Shortfall = (Required Qty + Minimum Stock) - (Current Stock + In Procurement). In Manufacturing shows reserved materials already deducted from Current Stock.";
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
    
    // Calculate the total material required from the product details
    const totalRequired = details.reduce((sum, product) => {
      return sum + (product.total_material_required || 0);
    }, 0);
    setCalculatedTotalRequired(totalRequired);
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
        aValue = a.required || 0;
        bValue = b.required || 0;
        break;
      case 'current_stock':
        aValue = a.current_stock;
        bValue = b.current_stock;
        break;
      case 'in_procurement':
        aValue = a.in_procurement;
        bValue = b.in_procurement;
        break;
      case 'in_manufacturing':
        aValue = a.in_manufacturing || 0;
        bValue = b.in_manufacturing || 0;
        break;
      case 'shortfall':
        aValue = a.shortfall;
        bValue = b.shortfall;
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
        columns={9}
        columnWidths={[
          'w-40', 'w-20', 'w-20', 'w-20', 'w-20', 'w-20', 'w-20', 'w-16', 'w-24'
        ]}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50">
              <TableHead className="text-gray-600 font-medium text-sm py-3 px-4">Material</TableHead>
              <TableHead className="text-gray-600 font-medium text-sm py-3 px-4">Type</TableHead>
              <TableHead className="text-gray-600 font-medium text-sm py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Current Stock</span>
                  <ArrowUp className="h-3 w-3 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="text-gray-600 font-medium text-sm py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>In Manufacturing</span>
                  <ArrowUp className="h-3 w-3 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="text-gray-600 font-medium text-sm py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>In Procurement</span>
                  <ArrowUp className="h-3 w-3 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="text-gray-600 font-medium text-sm py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-blue-700 font-semibold">Required</span>
                  <ArrowUp className="h-3 w-3 text-gray-400" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Total quantity of this material required for all pending orders (Created + In Progress status)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead className="text-gray-600 font-medium text-sm py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Shortfall</span>
                  <ArrowUp className="h-3 w-3 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="text-gray-600 font-medium text-sm py-3 px-4">Status</TableHead>
              <TableHead className="text-gray-600 font-medium text-sm py-3 px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMaterials.map((material, index) => {
              const statusInfo = getInventoryStatus(
                material.current_stock,
                material.in_procurement,
                material.in_manufacturing || 0,
                material.required,
                material.minimum_stock
              );

              const StatusIcon = statusInfo.icon;
              const shortUnit = getShortUnit(material.unit);
              
              // Use the shortfall calculated in the hook (which uses the correct formula)
              const shortfall = material.shortfall;
              
              return (
                <TableRow key={material.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 hover:bg-gray-100 transition-colors`}>
                  <TableCell className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 text-sm">{material.name}</div>
                      <div className="text-xs text-gray-500">No supplier</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border-gray-300">
                      {material.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-right">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-900 text-sm">{formatIndianNumber(material.current_stock)}</div>
                      <div className="text-xs text-gray-500">{shortUnit}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-right">
                    <div className="space-y-0.5">
                      <div className="font-medium text-blue-600 text-sm">{formatIndianNumber(material.in_manufacturing || 0)}</div>
                      <div className="text-xs text-gray-500">{shortUnit}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-right">
                    <div className="space-y-0.5">
                      <div className="font-medium text-orange-600 text-sm">{formatIndianNumber(material.in_procurement)}</div>
                      <div className="text-xs text-gray-500">{shortUnit}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-right">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-50 flex flex-col items-end"
                      onClick={() => handleOrderedQtyClick(material)}
                    >
                      <div>{formatIndianNumber(material.required || 0)}</div>
                      <div className="text-xs text-gray-500">{shortUnit}</div>
                    </Button>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-right">
                    {shortfall === 0 ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium text-gray-600">0</div>
                        <div className="text-xs text-gray-500">{shortUnit}</div>
                      </div>
                    ) : (
                      <div 
                        className="cursor-help space-y-0.5"
                        title={getShortfallTooltip()}
                      >
                        <div className={`text-sm font-medium ${shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {shortfall > 0 ? '+' : ''}{formatIndianNumber(Math.abs(shortfall))}
                        </div>
                        <div className="text-xs text-gray-500">{shortUnit}</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <Badge 
                      className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        statusInfo.status === 'Critical' ? 'bg-red-100 text-red-800 border-red-200' :
                        statusInfo.status === 'Low' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-gray-900 text-white border-gray-900'
                      }`}
                    >
                      {statusInfo.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => handleViewMaterial(material)}
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => handleUpdateStock(material)}
                        title="Update Stock"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => handleRaiseRequest(material)}
                        title="Raise Request"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
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
        productDetails={productDetails}
        totalQuantity={calculatedTotalRequired}
        loading={orderDetailsLoading}
        isRawMaterial={true}
        materialName={selectedMaterial?.name}
        materialUnit={selectedMaterial?.unit}
      />
    </TooltipProvider>
  );
};

export default RawMaterialsTable;
