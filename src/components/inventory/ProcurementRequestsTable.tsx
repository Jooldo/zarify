
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface ProcurementRequestsTableProps {
  requests: ProcurementRequest[];
  onViewRequest: (request: ProcurementRequest) => void;
}

const ProcurementRequestsTable = ({ requests, onViewRequest }: ProcurementRequestsTableProps) => {
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

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="py-1 px-2 text-xs font-medium">Request ID</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Material</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Quantity</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Supplier</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">ETA</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="h-8">
              <TableCell className="py-1 px-2 text-xs font-medium">{request.request_number}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{request.raw_material?.name || 'Unknown'}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{request.quantity_requested} {request.unit}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{extractSupplierFromNotes(request.notes)}</TableCell>
              <TableCell className="py-1 px-2">
                <Badge variant={getStatusVariant(request.status)} className="text-xs px-1 py-0">
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell className="py-1 px-2 text-xs">{request.eta ? new Date(request.eta).toLocaleDateString() : '-'}</TableCell>
              <TableCell className="py-1 px-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => onViewRequest(request)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProcurementRequestsTable;
