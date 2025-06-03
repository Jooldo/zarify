
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';

interface ProcurementRequest {
  id: string;
  materialName: string;
  materialId: number;
  quantityRequested: number;
  unit: string;
  dateRequested: string;
  status: string;
  supplier: string;
  eta?: string;
  notes?: string;
}

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
              <TableCell className="py-1 px-2 text-xs font-medium">{request.id}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{request.materialName}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{request.quantityRequested} {request.unit}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{request.supplier}</TableCell>
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
