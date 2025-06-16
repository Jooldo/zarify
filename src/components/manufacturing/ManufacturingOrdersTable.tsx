
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useFinishedGoods, FinishedGood } from '@/hooks/useFinishedGoods';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import ViewFinishedGoodDialog from '@/components/inventory/ViewFinishedGoodDialog';
import { useToast } from '@/hooks/use-toast';

interface ManufacturingOrdersTableProps {
  orders: ManufacturingOrder[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onViewOrder: (order: ManufacturingOrder) => void;
}

const ManufacturingOrdersTable = ({ orders, getPriorityColor, getStatusColor, onViewOrder }: ManufacturingOrdersTableProps) => {
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState<FinishedGood | null>(null);
  const { finishedGoods, loading: fgLoading, error: fgError } = useFinishedGoods();
  const { orderSteps } = useManufacturingSteps();
  const { toast } = useToast();

  const handleProductCodeClick = (productCode: string | undefined) => {
    if (!productCode) {
      toast({ title: "Info", description: "Product code is not available.", variant: "default" });
      return;
    }
    if (fgLoading) {
      toast({ title: "Info", description: "Product details are loading, please wait...", variant: "default" });
      return;
    }
    if (fgError) {
      toast({ title: "Error", description: "Could not load product details.", variant: "destructive" });
      return;
    }

    const finishedGood = finishedGoods.find(fg => fg.product_code === productCode);
    if (finishedGood) {
      setSelectedProductForView(finishedGood);
      setIsViewProductOpen(true);
    } else {
      toast({ title: "Not Found", description: `Details for product code ${productCode} not found.`, variant: "default" });
    }
  };

  const getCurrentStep = (orderId: string) => {
    const currentOrderSteps = orderSteps.filter(step => step.manufacturing_order_id === orderId);
    
    if (currentOrderSteps.length === 0) {
      return { stepName: 'Not Started', status: 'pending' };
    }
    
    // Find the highest step order that has been created for this order
    const highestStep = currentOrderSteps
      .sort((a, b) => (b.manufacturing_steps?.step_order || 0) - (a.manufacturing_steps?.step_order || 0))[0];
    
    return {
      stepName: highestStep.manufacturing_steps?.step_name || 'Unknown',
      status: highestStep.status
    };
  };

  const getStepStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStepDisplay = (stepName: string, status: string) => {
    const statusText = status.replace('_', ' ');
    return `${stepName} ${statusText}`;
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Product Code</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Step</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const currentStep = getCurrentStep(order.id);
              
              return (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {order.product_configs?.product_code ? (
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs font-mono text-blue-600 hover:text-blue-800"
                        onClick={() => handleProductCodeClick(order.product_configs?.product_code)}
                      >
                        {order.product_configs.product_code}
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{order.quantity_required}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium">
                        {formatStepDisplay(currentStep.stepName, currentStep.status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.due_date ? format(new Date(order.due_date), 'MMM dd, yyyy') : 'Not set'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => onViewOrder(order)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View Order
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {selectedProductForView && (
        <ViewFinishedGoodDialog
          isOpen={isViewProductOpen}
          onClose={() => setIsViewProductOpen(false)}
          product={selectedProductForView}
        />
      )}
    </>
  );
};

export default ManufacturingOrdersTable;
