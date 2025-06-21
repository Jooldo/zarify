import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, ShoppingCart, ArrowUp, ArrowDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRawMaterialsContext } from '@/hooks/useRawMaterials';
import { RawMaterial } from '@/hooks/useRawMaterials';
import { useOrderedQtyDetails } from '@/hooks/useOrderedQtyDetails';
import { formatIndianNumber } from '@/lib/utils';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import ViewRawMaterialDialog from './ViewRawMaterialDialog';
import EditRawMaterialDialog from './EditRawMaterialDialog';
import RaiseProcurementRequestDialog from './RaiseProcurementRequestDialog';
import type { SortConfig } from '@/components/ui/sort-dropdown';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  loading: boolean;
  onUpdate: () => void;
  onRequestCreated: () => void;
  sortConfig: SortConfig | null;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
}

const RawMaterialsTable = ({ materials, loading, onUpdate, onRequestCreated, sortConfig, onSortChange }: RawMaterialsTableProps) => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const { toast } = useToast();
  const { fetchRawMaterialOrderDetails } = useOrderedQtyDetails();
  const { refetch } = useRawMaterialsContext();

  const handleViewMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsViewDialogOpen(true);
  };

  const handleEditMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsEditDialogOpen(true);
  };

  const handleRaiseRequest = async (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsRequestDialogOpen(true);
  };

  const handleRequestCreated = () => {
    setIsRequestDialogOpen(false);
    onRequestCreated();
  };

  const handleEditSuccess = async () => {
    setIsEditDialogOpen(false);
    setSelectedMaterial(null);
    toast({
      title: "Success",
      description: "Raw material updated successfully",
    });
    refetch();
    onUpdate();
  };

  const handleSort = (field: string) => {
    if (!onSortChange) return;
    
    const direction = sortConfig?.field === field && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(field, direction);
  };

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return null;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-3 w-3 inline ml-1" /> : 
      <ArrowDown className="h-3 w-3 inline ml-1" />;
  };

  const getStockStatusVariant = (stock: number, threshold: number) => {
    if (stock <= threshold * 0.5) return "destructive" as const;
    if (stock <= threshold) return "secondary" as const;
    return "default" as const;
  };

  const calculateShortfall = (currentStock: number, inProcurement: number, inManufacturing: number, required: number, minimumStock: number) => {
    const totalAvailable = currentStock + inProcurement + inManufacturing;
    const totalNeeded = required + minimumStock;
    return totalNeeded - totalAvailable;
  };

  const getInventoryStatus = (currentStock: number, inProcurement: number, inManufacturing: number, required: number, minimumStock: number) => {
    const shortfall = calculateShortfall(currentStock, inProcurement, inManufacturing, required, minimumStock);
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (currentStock <= minimumStock) {
      return { status: 'Low', icon: CheckCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const handleOrderedQtyClick = async (material: RawMaterial) => {
    try {
      const details = await fetchRawMaterialOrderDetails(material.id);
      console.log('Order Details:', details);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const sortedMaterials = [...materials].sort((a, b) => {
    if (!sortConfig) return 0;

    const { field, direction } = sortConfig;
    let aValue: any = a[field as keyof RawMaterial];
    let bValue: any = b[field as keyof RawMaterial];

    if (field === 'shortfall') {
      aValue = calculateShortfall(a.current_stock, a.in_procurement, a.in_manufacturing || 0, a.required, a.minimum_stock);
      bValue = calculateShortfall(b.current_stock, b.in_procurement, b.in_manufacturing || 0, b.required, b.minimum_stock);
    }

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {loading ? (
        <TableSkeleton 
          rows={8} 
          columns={12}
          columnWidths={['w-32', 'w-20', 'w-16', 'w-16', 'w-16', 'w-20', 'w-20', 'w-16', 'w-16', 'w-20', 'w-16', 'w-20']}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="h-10 bg-gray-50 border-b border-gray-200">
              <TableHead 
                className="px-3 py-2 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Material & Type
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="px-3 py-2 text-xs font-semibold text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('minimum_stock')}
              >
                <div className="flex items-center justify-center gap-1">
                  Min Stock
                  {getSortIcon('minimum_stock')}
                </div>
              </TableHead>
              <TableHead 
                className="px-3 py-2 text-xs font-semibold text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('current_stock')}
              >
                <div className="flex items-center justify-center gap-1">
                  Current
                  {getSortIcon('current_stock')}
                </div>
              </TableHead>
              <TableHead 
                className="px-3 py-2 text-xs font-semibold text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ordered_qty')}
              >
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
                  <span className="text-blue-700 font-semibold text-xs leading-tight">Live Orders</span>
                  {getSortIcon('ordered_qty')}
                </div>
              </TableHead>
              <TableHead 
                className="px-3 py-2 text-xs font-semibold text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('in_procurement')}
              >
                <div className="flex items-center justify-center gap-1">
                  In Procurement
                  {getSortIcon('in_procurement')}
                </div>
              </TableHead>
              <TableHead 
                className="px-3 py-2 text-xs font-semibold text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('in_manufacturing')}
              >
                <div className="flex items-center justify-center gap-1">
                  In Manuf.
                  {getSortIcon('in_manufacturing')}
                </div>
              </TableHead>
              <TableHead 
                className="px-3 py-2 text-xs font-semibold text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shortfall')}
              >
                <div className="flex items-center justify-center gap-1">
                  Shortfall
                  {getSortIcon('shortfall')}
                </div>
              </TableHead>
              <TableHead className="px-3 py-2 text-xs font-semibold text-gray-700 text-center">Status</TableHead>
              <TableHead className="px-3 py-2 text-xs font-semibold text-gray-700 text-center">Last Updated</TableHead>
              <TableHead className="px-3 py-2 text-xs font-semibold text-gray-700 text-center">Supplier</TableHead>
              <TableHead className="px-3 py-2 text-xs font-semibold text-gray-700 text-center">Unit</TableHead>
              <TableHead className="px-3 py-2 text-xs font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMaterials.map((material) => {
              const shortfall = calculateShortfall(
                material.current_stock,
                material.in_procurement,
                material.in_manufacturing || 0,
                material.required,
                material.minimum_stock
              );

              const statusInfo = getInventoryStatus(
                material.current_stock,
                material.in_procurement,
                material.in_manufacturing || 0,
                material.required,
                material.minimum_stock
              );

              const StatusIcon = statusInfo.icon;

              return (
                <TableRow key={material.id} className="h-12 hover:bg-gray-50 border-b border-gray-100">
                  <TableCell className="px-3 py-2">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-medium text-gray-900 text-sm">{material.name}</span>
                      <span className="text-xs text-gray-500">({material.type})</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center text-sm font-medium text-gray-900">
                    {formatIndianNumber(material.minimum_stock)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center">
                    <Badge variant={getStockStatusVariant(material.current_stock, material.minimum_stock)} className="text-xs px-2 py-0.5 font-bold">
                      {formatIndianNumber(material.current_stock)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleOrderedQtyClick(material)}
                    >
                      {formatIndianNumber(material.required)}
                    </Button>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center text-sm font-medium text-purple-600">
                    {formatIndianNumber(material.in_procurement)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center text-sm font-medium text-orange-600">
                    {formatIndianNumber(material.in_manufacturing || 0)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-sm font-medium ${shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatIndianNumber(Math.abs(shortfall))}
                      </span>
                      {shortfall > 0 ? (
                        <ArrowDown className="h-3 w-3 text-red-600" />
                      ) : (
                        <ArrowUp className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center">
                    <div className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full ${statusInfo.bgColor}`}>
                      <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center text-xs text-gray-600">
                    {material.updated_at ? formatDistanceToNow(new Date(material.updated_at), { addSuffix: true }) : '-'}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center text-xs text-gray-900">
                    {material.supplier_name || '-'}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-center text-xs font-medium text-gray-700">
                    {material.unit}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex gap-1.5">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 w-7 rounded-full p-0 border-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => handleViewMaterial(material)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 w-7 rounded-full p-0 border-2 hover:bg-green-50 hover:border-green-200 transition-colors"
                        onClick={() => handleEditMaterial(material)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {shortfall > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 w-7 rounded-full p-0 border-2 hover:bg-orange-50 hover:border-orange-200 transition-colors"
                          onClick={() => handleRaiseRequest(material)}
                        >
                          <ShoppingCart className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Dialogs */}
      <ViewRawMaterialDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        material={selectedMaterial}
      />

      <EditRawMaterialDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        material={selectedMaterial}
        onSuccess={handleEditSuccess}
      />

      <RaiseProcurementRequestDialog
        isOpen={isRequestDialogOpen}
        onClose={() => setIsRequestDialogOpen(false)}
        material={selectedMaterial}
        onRequestCreated={handleRequestCreated}
      />
    </div>
  );
};

export default RawMaterialsTable;
