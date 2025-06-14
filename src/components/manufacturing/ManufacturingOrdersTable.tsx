import React, { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useFinishedGoods, FinishedGood } from '@/hooks/useFinishedGoods';
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

  return (
    <>
      <div className="border rounded-lg overflow-hidden"> {/* Added overflow-hidden for rounded corners with bg */}
        <Table>
          <TableHeader className="bg-primary/5 dark:bg-primary/10"> {/* Themed table header */}
            <TableRow>
              <TableHead className="text-primary dark:text-primary-foreground/80">Order Number</TableHead>
              <TableHead className="text-primary dark:text-primary-foreground/80">Product Code</TableHead>
              <TableHead className="text-primary dark:text-primary-foreground/80">Quantity</TableHead>
              <TableHead className="text-primary dark:text-primary-foreground/80">Priority</TableHead>
              <TableHead className="text-primary dark:text-primary-foreground/80">Status</TableHead>
              <TableHead className="text-primary dark:text-primary-foreground/80">Due Date</TableHead>
              <TableHead className="text-primary dark:text-primary-foreground/80">Created</TableHead>
              <TableHead className="text-primary dark:text-primary-foreground/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50 dark:hover:bg-muted/20">
                <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                <TableCell className="font-mono text-sm">
                  {order.product_configs?.product_code ? (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs font-mono text-primary hover:text-primary/80" // Themed link
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
