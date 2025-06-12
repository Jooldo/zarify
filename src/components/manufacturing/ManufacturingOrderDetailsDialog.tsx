
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Calendar, Package2, User, FileText, Save } from 'lucide-react';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useToast } from '@/hooks/use-toast';

interface ManufacturingOrderDetailsDialogProps {
  order: ManufacturingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

const ManufacturingOrderDetailsDialog = ({ 
  order, 
  open, 
  onOpenChange, 
  onStatusUpdate,
  getPriorityColor, 
  getStatusColor 
}: ManufacturingOrderDetailsDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { toast } = useToast();

  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const handleStatusUpdate = () => {
    if (order && selectedStatus !== order.status) {
      onStatusUpdate(order.id, selectedStatus);
      toast({
        title: 'Success',
        description: 'Manufacturing order status updated successfully',
      });
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Manufacturing Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Order Number</Label>
                <div className="text-lg font-mono">{order.order_number}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Product Name</Label>
                <div className="text-lg font-semibold">{order.product_name}</div>
              </div>

              {order.product_type && (
                <div>
                  <Label className="text-sm font-medium">Product Type</Label>
                  <div>{order.product_type}</div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Quantity Required</Label>
                <div className="text-lg font-semibold">{order.quantity_required}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <div>
                  <Badge className={`${getPriorityColor(order.priority)}`}>
                    {order.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Current Status</Label>
                <div>
                  <Badge className={`${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Created Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>

              {order.due_date && (
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {format(new Date(order.due_date), 'MMM dd, yyyy')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Update Section */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium">Update Status</Label>
            <div className="flex items-center gap-2 mt-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="qc_failed">QC Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleStatusUpdate} 
                disabled={selectedStatus === order.status}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                Update Status
              </Button>
            </div>
          </div>

          {/* Product Configuration */}
          {order.product_configs && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-3 block">Product Configuration</Label>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Product Code:</span>
                    <div className="font-mono">{order.product_configs.product_code}</div>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <div>{order.product_configs.category}</div>
                  </div>
                  <div>
                    <span className="font-medium">Subcategory:</span>
                    <div>{order.product_configs.subcategory}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Raw Material Requirements */}
          {order.product_configs?.product_config_materials && order.product_configs.product_config_materials.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-3 block">Material Requirements</Label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Material Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Unit Required</TableHead>
                      <TableHead>Total Required</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.product_configs.product_config_materials.map((material, index) => {
                      const totalRequired = material.quantity_required * order.quantity_required;
                      
                      return (
                        <TableRow key={material.id || index}>
                          <TableCell className="font-medium">
                            {material.raw_materials?.name || `Material #${material.raw_material_id.slice(-6)}`}
                          </TableCell>
                          <TableCell>
                            {material.raw_materials?.type || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {material.quantity_required} {material.unit}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {totalRequired.toFixed(2)} {material.unit}
                          </TableCell>
                          <TableCell>
                            {material.raw_materials?.unit || material.unit}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {order.special_instructions && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">Special Instructions</Label>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">{order.special_instructions}</div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Information */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Timeline</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Created:</span>
                <div>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</div>
              </div>
              {order.started_at && (
                <div>
                  <span className="font-medium">Started:</span>
                  <div>{format(new Date(order.started_at), 'MMM dd, yyyy HH:mm')}</div>
                </div>
              )}
              {order.completed_at && (
                <div>
                  <span className="font-medium">Completed:</span>
                  <div>{format(new Date(order.completed_at), 'MMM dd, yyyy HH:mm')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManufacturingOrderDetailsDialog;
