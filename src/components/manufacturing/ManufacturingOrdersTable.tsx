import React, { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, ArrowUp, Workflow } from 'lucide-react';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useFinishedGoods, FinishedGood } from '@/hooks/useFinishedGoods';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import ViewFinishedGoodDialog from '@/components/inventory/ViewFinishedGoodDialog';
import ManufacturingTagInDialog from './ManufacturingTagInDialog';
import DeleteOrderDialog from './DeleteOrderDialog';
import { useToast } from '@/hooks/use-toast';

interface ManufacturingOrdersTableProps {
  orders: ManufacturingOrder[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onViewOrder: (order: ManufacturingOrder) => void;
  onDeleteOrder?: (orderId: string) => void;
  onOrderUpdate?: () => void;
  onViewFlow?: (order: ManufacturingOrder) => void;
}

const ManufacturingOrdersTable = ({ 
  orders, 
  getPriorityColor, 
  getStatusColor, 
  onViewOrder, 
  onDeleteOrder,
  onOrderUpdate,
  onViewFlow
}: ManufacturingOrdersTableProps) => {
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState<FinishedGood | null>(null);
  const [isTagInDialogOpen, setIsTagInDialogOpen] = useState(false);
  const [selectedOrderForTagIn, setSelectedOrderForTagIn] = useState<ManufacturingOrder | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrderForDelete, setSelectedOrderForDelete] = useState<ManufacturingOrder | null>(null);
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

  const handleTagInClick = (order: ManufacturingOrder) => {
    setSelectedOrderForTagIn(order);
    setIsTagInDialogOpen(true);
  };

  const handleDeleteClick = (order: ManufacturingOrder) => {
    setSelectedOrderForDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedOrderForDelete && onDeleteOrder) {
      onDeleteOrder(selectedOrderForDelete.id);
      setIsDeleteDialogOpen(false);
      setSelectedOrderForDelete(null);
    }
  };

  const handleTagInComplete = () => {
    if (onOrderUpdate) {
      onOrderUpdate();
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

  const formatStepDisplay = (stepName: string, status: string) => {
    const statusText = status.replace('_', ' ');
    return `${stepName} ${statusText}`;
  };

  const handleFlowClick = (order: ManufacturingOrder) => {
    if (onViewFlow) {
      onViewFlow(order);
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 text-xs">Order Number</TableHead>
              <TableHead className="py-1 text-xs">Product Code</TableHead>
              <TableHead className="py-1 text-xs">Qty</TableHead>
              <TableHead className="py-1 text-xs">Priority</TableHead>
              <TableHead className="py-1 text-xs">Status</TableHead>
              <TableHead className="py-1 text-xs">Current Step</TableHead>
              <TableHead className="py-1 text-xs">Due Date</TableHead>
              <TableHead className="py-1 text-xs">Created</TableHead>
              <TableHead className="py-1 text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const currentStep = getCurrentStep(order.id);
              
              return (
                <TableRow key={order.id} className="hover:bg-muted/50 h-10">
                  <TableCell className="py-1 text-xs font-mono">{order.order_number}</TableCell>
                  <TableCell className="py-1 text-xs font-mono">
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
                  <TableCell className="py-1 text-xs">{order.quantity_required}</TableCell>
                  <TableCell className="py-1">
                    <Badge className={`text-xs ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1">
                    <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">
                        {formatStepDisplay(currentStep.stepName, currentStep.status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1 text-xs">
                    {order.due_date ? format(new Date(order.due_date), 'MMM dd') : 'Not set'}
                  </TableCell>
                  <TableCell className="py-1 text-xs">
                    {format(new Date(order.created_at), 'MMM dd')}
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => onViewOrder(order)} className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleFlowClick(order)}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                        title="View Production Flow"
                      >
                        <Workflow className="h-3 w-3" />
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteClick(order)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {order.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleTagInClick(order)}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
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

      <ManufacturingTagInDialog
        order={selectedOrderForTagIn}
        open={isTagInDialogOpen}
        onOpenChange={setIsTagInDialogOpen}
        onTagInComplete={handleTagInComplete}
      />

      <DeleteOrderDialog
        order={selectedOrderForDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default ManufacturingOrdersTable;
