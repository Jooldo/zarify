
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';

interface ManufacturingOrdersTableProps {
  orders: ManufacturingOrder[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

const ManufacturingOrdersTable = ({ orders, getPriorityColor, getStatusColor }: ManufacturingOrdersTableProps) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Product Name</TableHead>
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
              <TableCell className="font-medium">{order.product_name}</TableCell>
              <TableCell className="font-mono text-sm">
                {order.product_configs?.product_code || 'N/A'}
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
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManufacturingOrdersTable;
