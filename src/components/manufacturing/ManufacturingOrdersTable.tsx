
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useFinishedGoods, FinishedGood } from '@/hooks/useFinishedGoods'; // Import useFinishedGoods and FinishedGood
import ViewFinishedGoodDialog from '@/components/inventory/ViewFinishedGoodDialog'; // Import ViewFinishedGoodDialog
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface ManufacturingOrdersTableProps {
  orders: ManufacturingOrder[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onViewOrder: (order: ManufacturingOrder) => void;
}

const ManufacturingOrdersTable = ({ orders, getPriorityColor, getStatusColor, onViewOrder }: ManufacturingOrdersTableProps) => {
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState<FinishedGood | null>(null);
  const { finishedGoods, loading: fgLoading, error: fgError } = useFinishedGoods(); // Fetch finished goods
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
      // console.warn(`Finished good with code ${productCode} not found.`);
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              {/* <TableHead>Product Name</TableHead> Removed */}
              <TableHead>Product Code</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                {/* <TableCell className="font-medium">{order.product_name}</TableCell> Removed */}
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
            ))}
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

