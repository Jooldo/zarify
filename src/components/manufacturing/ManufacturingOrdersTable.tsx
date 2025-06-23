
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

  const handleViewFlow = (order: ManufacturingOrder) => {
    if (onViewFlow) {
      onViewFlow(order);
    }
  };

  const getCurrentStep = (orderId: string) => {
    const currentOrderSteps = orderSteps.filter(step => step.order_id === orderId);
    
    if (currentOrderSteps.length === 0) {
      return { stepName: 'Not Started', status: 'pending' };
    }
    
    // Find the latest step for this order
    const latestStep = currentOrderSteps
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    return {
      stepName: latestStep.step_name || 'Unknown',
      status: latestStep.status
    };
  };

  const formatStepDisplay = (stepName: string, status: string) => {
    const statusText = status.replace('_', ' ');
    return `${stepName} ${statusText}`;
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="h-12 bg-gray-50/50 border-b border-gray-200">
              <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700">Order Number</TableHead>
              <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700">Product Code</TableHead>
              <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700">Qty</TableHead>
              <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700">Priority</TableHead>
              <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700">Status</TableHead>
              <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700">Current Step</TableHead>
              <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700">Due Date</TableHead>
              <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700">Created</TableHead>
              <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const currentStep = getCurrentStep(order.id);
              
              return (
                <TableRow key={order.id} className="hover:bg-gray-50/50 h-16 border-b border-gray-100">
                  <TableCell className="py-4 px-4 text-sm font-mono font-medium text-gray-900">{order.order_number}</TableCell>
                  <TableCell className="py-4 px-4 text-sm font-mono">
                    {order.product_configs?.product_code ? (
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm font-mono text-blue-600 hover:text-blue-800"
                        onClick={() => handleProductCodeClick(order.product_configs?.product_code)}
                      >
                        {order.product_configs.product_code}
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-sm font-medium text-gray-900">{order.quantity_required}</TableCell>
                  <TableCell className="py-4 px-4">
                    <Badge className={`text-sm px-3 py-1 ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <Badge className={`text-sm px-3 py-1 ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {formatStepDisplay(currentStep.stepName, currentStep.status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-sm text-gray-600">
                    {order.due_date ? format(new Date(order.due_date), 'MMM dd') : 'N/A'}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-sm text-gray-600">
                    {format(new Date(order.created_at), 'MMM dd')}
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewOrder(order)} 
                        className="h-8 w-8 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        title="View Order"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewFlow(order)}
                        className="h-8 w-8 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        title="View production flow"
                      >
                        <Workflow className="h-4 w-4 text-gray-600" />
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteClick(order)}
                          className="h-8 w-8 p-0 rounded-full border-2 hover:bg-red-50 hover:border-red-200 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                      
                      {order.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleTagInClick(order)}
                          className="h-8 w-8 p-0 rounded-full border-2 hover:bg-green-50 hover:border-green-200 transition-colors"
                          title="Tag In Completed Order"
                        >
                          <ArrowUp className="h-4 w-4 text-green-600" />
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
