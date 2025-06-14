
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ManufacturingOrder } from '@/types/manufacturing';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ManufacturingOrdersTableProps {
  orders: ManufacturingOrder[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onViewOrder: (order: ManufacturingOrder) => void;
}

const ManufacturingOrdersTable = ({ 
  orders, 
  getPriorityColor, 
  getStatusColor, 
  onViewOrder 
}: ManufacturingOrdersTableProps) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Order #</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{order.product_name}</TableCell>
              <TableCell>{order.quantity_required}</TableCell>
              <TableCell>
                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getPriorityColor(order.priority)}`}>
                  {order.priority}
                </div>
              </TableCell>
              <TableCell>
                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onViewOrder(order)}>
                  <Eye className="h-4 w-4 mr-2" />
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
