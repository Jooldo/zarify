import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, AlertTriangle, CheckCircle, AlertCircle, Edit, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { RawMaterial } from '@/hooks/useRawMaterials';
import RaiseRequestDialog from './RaiseRequestDialog';
import RawMaterialStockUpdateDialog from './RawMaterialStockUpdateDialog';
import OrderedQtyDetailsDialog from './OrderedQtyDetailsDialog';
import { useOrderedQtyDetails, type RawMaterialProductDetail } from '@/hooks/useOrderedQtyDetails';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated?: () => void;
  sortConfig?: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

const RawMaterialsTable = ({ materials, loading, onUpdate, onRequestCreated, sortConfig, onSortChange }: RawMaterialsTableProps) => {
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

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-3 w-3 ml-1" /> : 
      <ChevronDown className="h-3 w-3 ml-1" />;
  };

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="h-10 border-b border-gray-200">
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700">Material</TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700">Threshold</TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <span>Required</span>
                  {getSortIcon('ordered_qty')}
                </div>
              </TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <span>Current Stock</span>
                  {getSortIcon('current_stock')}
                </div>
              </TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <span>In Procurement</span>
                  {getSortIcon('in_procurement')}
                </div>
              </TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <span>In Manufacturing</span>
                  {getSortIcon('in_manufacturing')}
                </div>
              </TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <span>Shortfall</span>
                  {getSortIcon('shortfall')}
                </div>
              </TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700">Status</TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMaterials.map((material) => {
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
                <TableRow key={material.id} className="h-14 border-b border-gray-100 hover:bg-gray-50/50">
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 text-sm">{material.name}</span>
                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-600">
                        {material.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-600">
                    {formatIndianNumber(material.minimum_stock)} {shortUnit}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleOrderedQtyClick(material)}
                    >
                      {formatIndianNumber(material.required || 0)} {shortUnit}
                    </Button>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm font-semibold text-center text-gray-900">
                    {formatIndianNumber(material.current_stock)} {shortUnit}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <span className="text-sm font-semibold text-yellow-600">
                      {formatIndianNumber(material.in_procurement)} {shortUnit}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <span className="text-sm font-semibold text-orange-600">
                      {formatIndianNumber(material.in_manufacturing || 0)} {shortUnit}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {shortfall === 0 ? (
                      <span className="text-sm font-medium text-gray-600">
                        0 {shortUnit}
                      </span>
                    ) : (
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
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
                      <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 w-7 p-0 rounded-full border-gray-300 hover:bg-gray-50"
                        onClick={() => handleUpdateStock(material)}
                        title="Update Stock"
                      >
                        <Edit className="h-3 w-3 text-gray-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 w-7 p-0 rounded-full border-gray-300 hover:bg-gray-50"
                        onClick={() => handleRaiseRequest(material)}
                        title="Raise Request"
                      >
                        <Plus className="h-3 w-3 text-gray-600" />
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
