
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useManufacturingMaterialReservations } from '@/hooks/useManufacturingMaterialReservations';
import { useEffect } from 'react';
import { RawMaterial } from '@/hooks/useRawMaterials';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface MaterialReservationsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
}

const MaterialReservationsDialog = ({ isOpen, onOpenChange, material }: MaterialReservationsDialogProps) => {
  const { reservations, loading, refetch } = useManufacturingMaterialReservations();

  useEffect(() => {
    if (isOpen && material?.id) {
      refetch(material.id);
    }
  }, [isOpen, material?.id, refetch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reserved':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'consumed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reserved':
        return <Badge variant="secondary">Reserved</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'consumed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Consumed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!material) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material Reservations: {material.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Material Summary */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{material.current_stock}</div>
              <div className="text-sm text-gray-600">Current Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{material.in_manufacturing}</div>
              <div className="text-sm text-gray-600">In Manufacturing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{material.in_procurement}</div>
              <div className="text-sm text-gray-600">In Procurement</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${material.shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {material.shortfall > 0 ? '+' : ''}{material.shortfall}
              </div>
              <div className="text-sm text-gray-600">Shortfall</div>
            </div>
          </div>

          {/* Reservations Table */}
          <div className="border rounded-lg">
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-lg">Loading reservations...</div>
              </div>
            ) : reservations.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 text-lg font-medium">No reservations found</div>
                <div className="text-sm text-gray-500">This material has no active manufacturing reservations</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manufacturing Order</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Reserved Qty</TableHead>
                    <TableHead>Consumed Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="font-medium">{reservation.manufacturing_orders?.order_number}</div>
                        <div className="text-sm text-gray-500">
                          Status: {reservation.manufacturing_orders?.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{reservation.manufacturing_orders?.product_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{reservation.quantity_reserved}</div>
                        <div className="text-xs text-gray-500">{reservation.raw_materials?.unit}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{reservation.quantity_consumed}</div>
                        <div className="text-xs text-gray-500">{reservation.raw_materials?.unit}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(reservation.status)}
                          {getStatusBadge(reservation.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(reservation.created_at).toLocaleDateString()}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialReservationsDialog;
