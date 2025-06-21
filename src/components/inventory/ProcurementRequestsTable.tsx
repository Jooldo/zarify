
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Trash2, FileText, AlertCircle, Plus, ArrowUpDown } from 'lucide-react';
import { Edit } from 'lucide-react';
import MaterialDetailsPopover from '@/components/procurement/MaterialDetailsPopover';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface ProcurementRequestsTableProps {
  requests: ProcurementRequest[];
  onViewRequest: (request: ProcurementRequest) => void;
  onDeleteRequest: (request: ProcurementRequest) => void;
  onGenerateBOM: (request: ProcurementRequest) => void;
  onRaiseMultiItemRequest?: () => void;
}

const ProcurementRequestsTable = ({ 
  requests, 
  onViewRequest,
  onDeleteRequest,
  onGenerateBOM,
  onRaiseMultiItemRequest 
}: ProcurementRequestsTableProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending': return "secondary" as const;
      case 'Approved': return "default" as const;
      case 'Received': return "outline" as const;
      default: return "outline" as const;
    }
  };

  const extractSupplierFromNotes = (notes?: string) => {
    if (!notes) return '-';
    const supplierMatch = notes.match(/Supplier:\s*([^\n]+)/);
    return supplierMatch ? supplierMatch[1].trim() : '-';
  };

  const getRequestOrigin = (notes?: string) => {
    if (!notes) return 'procurement';
    if (notes.includes('Source: Inventory Alert')) return 'inventory';
    if (notes.includes('Source: Multi-Item Procurement Request')) return 'multi-item';
    return 'procurement';
  };

  const isIncompleteRequest = (request: ProcurementRequest) => {
    const origin = getRequestOrigin(request.notes);
    return origin === 'inventory' && (!request.supplier_id || !request.eta);
  };

  const parseMultiItemMaterials = (notes?: string) => {
    if (!notes || !notes.includes('Materials in this request:')) return null;
    
    const materialsSection = notes.split('Materials in this request:')[1];
    if (!materialsSection) return null;

    const materialLines = materialsSection.trim().split('\n').filter(line => line.trim());
    
    return materialLines.map(line => {
      // Parse format: "1. Material Name (Type) - Quantity Unit - Notes"
      const match = line.match(/^\d+\.\s*(.+?)\s*\((.+?)\)\s*-\s*(\d+)\s*(\w+)(?:\s*-\s*(.+))?$/);
      if (match) {
        return {
          name: match[1].trim(),
          type: match[2].trim(),
          quantity: parseInt(match[3]),
          unit: match[4].trim(),
          notes: match[5]?.trim() || ''
        };
      }
      return null;
    }).filter(Boolean);
  };

  const getMaterialDisplayText = (request: ProcurementRequest) => {
    const origin = getRequestOrigin(request.notes);
    
    if (origin === 'multi-item') {
      const materials = parseMultiItemMaterials(request.notes);
      
      if (materials && materials.length > 1) {
        const primaryMaterial = materials[0];
        const additionalCount = materials.length - 1;
        
        return (
          <div className="flex flex-col space-y-1">
            <span className="font-medium text-gray-900">{primaryMaterial.name}</span>
            <span className="text-sm text-gray-500">({primaryMaterial.type})</span>
            <MaterialDetailsPopover materials={materials}>
              <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-left">
                +{additionalCount} more
              </button>
            </MaterialDetailsPopover>
          </div>
        );
      }
    }

    return (
      <div className="flex flex-col space-y-1">
        <span className="font-medium text-gray-900">{request.raw_material?.name || 'Unknown'}</span>
        <span className="text-sm text-gray-500">({request.raw_material?.type || 'Unknown'})</span>
      </div>
    );
  };

  const getTotalQuantity = (request: ProcurementRequest) => {
    const origin = getRequestOrigin(request.notes);
    
    if (origin === 'multi-item') {
      const materials = parseMultiItemMaterials(request.notes);
      if (materials && materials.length > 0) {
        return materials.reduce((total, material) => total + material.quantity, 0);
      }
    }
    
    return request.quantity_requested;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50/50">
              <TableHead className="h-12 px-6 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  Request ID
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="h-12 px-6 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  Material & Type
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="h-12 px-6 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  Total Quantity
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="h-12 px-6 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  Origin
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="h-12 px-6 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  Supplier
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="h-12 px-6 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  Status
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="h-12 px-6 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  ETA
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="h-12 px-6 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  Raised By
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="h-12 px-6 text-sm font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const origin = getRequestOrigin(request.notes);
              const isIncomplete = isIncompleteRequest(request);
              
              return (
                <TableRow key={request.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="h-16 px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{request.request_number}</span>
                      {isIncomplete && (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-3">
                    {getMaterialDisplayText(request)}
                  </TableCell>
                  <TableCell className="h-16 px-6 py-3">
                    <span className="font-medium text-gray-900">{getTotalQuantity(request)} {request.unit}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-3">
                    <Badge 
                      variant={
                        origin === 'inventory' ? "secondary" : 
                        origin === 'multi-item' ? "default" : 
                        "outline"
                      } 
                      className="text-sm px-3 py-1"
                    >
                      {origin === 'inventory' ? 'Alert' : 
                       origin === 'multi-item' ? 'Multi' : 
                       'Single'}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-3">
                    <span className="text-gray-900">{extractSupplierFromNotes(request.notes)}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-3">
                    <Badge variant={getStatusVariant(request.status)} className="text-sm px-3 py-1">
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-3">
                    <span className="text-gray-900">
                      {request.eta ? new Date(request.eta).toLocaleDateString() : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-3">
                    <span className="text-gray-900">{request.raised_by || '-'}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => onViewRequest(request)}
                        title="Update Request"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-full border-2 hover:bg-green-50 hover:border-green-200 transition-colors"
                        onClick={() => onGenerateBOM(request)}
                        title="Generate BOM"
                      >
                        <FileText className="h-4 w-4 text-gray-600" />
                      </Button>
                      {request.status !== 'Received' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 w-9 p-0 rounded-full border-2 hover:bg-red-50 hover:border-red-200 transition-colors"
                          onClick={() => onDeleteRequest(request)}
                          title="Delete Request"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-gray-500">
                  No procurement requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating Raise Procurement Request Button */}
      {onRaiseMultiItemRequest && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={onRaiseMultiItemRequest} 
            className="rounded-full h-16 px-6 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Raise Request</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProcurementRequestsTable;
