import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, AlertCircle, ShoppingCart, Trash2, FileText } from 'lucide-react';
import MaterialDetailsPopover from '@/components/procurement/MaterialDetailsPopover';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface ProcurementRequestsTableProps {
  requests: ProcurementRequest[];
  onViewRequest: (request: ProcurementRequest) => void;
  onDeleteRequest: (request: ProcurementRequest) => void;
  onGenerateBOM: (request: ProcurementRequest) => void;
  onRaiseRequest?: () => void;
  onRaiseMultiItemRequest?: () => void;
}

const ProcurementRequestsTable = ({ 
  requests, 
  onViewRequest,
  onDeleteRequest,
  onGenerateBOM,
  onRaiseRequest, 
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
          <div className="flex flex-col">
            <span className="font-medium">{primaryMaterial.name}</span>
            <span className="text-xs text-gray-500">({primaryMaterial.type})</span>
            <MaterialDetailsPopover materials={materials}>
              <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline text-left mt-1">
                +{additionalCount} more
              </button>
            </MaterialDetailsPopover>
          </div>
        );
      }
    }

    return (
      <div className="flex flex-col">
        <span className="font-medium">{request.raw_material?.name || 'Unknown'}</span>
        <span className="text-xs text-gray-500">({request.raw_material?.type || 'Unknown'})</span>
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
    <div className="space-y-4">
      {(onRaiseRequest || onRaiseMultiItemRequest) && (
        <div className="flex justify-end gap-2">
          {onRaiseMultiItemRequest && (
            <Button onClick={onRaiseMultiItemRequest} className="flex items-center gap-2" variant="outline">
              <ShoppingCart className="h-4 w-4" />
              Multi-Item Request
            </Button>
          )}
          {onRaiseRequest && (
            <Button onClick={onRaiseRequest} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Single Item Request
            </Button>
          )}
        </div>
      )}
      
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Request ID</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Material & Type</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Total Quantity</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Origin</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Supplier</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">ETA</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Raised By</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const origin = getRequestOrigin(request.notes);
              const isIncomplete = isIncompleteRequest(request);
              
              return (
                <TableRow key={request.id} className="h-8">
                  <TableCell className="py-1 px-2 text-xs font-medium">
                    <div className="flex items-center gap-1">
                      {request.request_number}
                      {isIncomplete && (
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs">
                    {getMaterialDisplayText(request)}
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs font-medium">
                    {getTotalQuantity(request)} {request.unit}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <Badge 
                      variant={
                        origin === 'inventory' ? "secondary" : 
                        origin === 'multi-item' ? "default" : 
                        "outline"
                      } 
                      className="text-xs h-4 px-1"
                    >
                      {origin === 'inventory' ? 'Alert' : 
                       origin === 'multi-item' ? 'Multi' : 
                       'Single'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs">{extractSupplierFromNotes(request.notes)}</TableCell>
                  <TableCell className="py-1 px-2">
                    <Badge variant={getStatusVariant(request.status)} className="text-xs px-1 py-0">
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs">{request.eta ? new Date(request.eta).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{request.raised_by || '-'}</TableCell>
                  <TableCell className="py-1 px-2">
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => onViewRequest(request)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => onGenerateBOM(request)}
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={() => onDeleteRequest(request)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProcurementRequestsTable;
