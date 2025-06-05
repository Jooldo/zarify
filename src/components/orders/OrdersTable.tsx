
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrdersTableRow from './OrdersTableRow';

interface OrdersTableProps {
  filteredOrders: any[];
  orders: any[];
  getOverallOrderStatus: (orderId: string) => string;
  getStatusVariant: (status: string) => "secondary" | "default" | "outline";
  getStockAvailable: (productCode: string) => number;
  onOrderUpdate: () => void;
}

const OrdersTable = ({ filteredOrders, orders, getOverallOrderStatus, getStatusVariant, getStockAvailable, onOrderUpdate }: OrdersTableProps) => {
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="py-1 px-2 text-xs font-medium">Order ID</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Suborder ID</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Customer</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Product Code</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Qty</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Stock Available</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Sub Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Order Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Sub Amount</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Total Amount</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Created</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Updated</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Expected</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((item) => (
            <OrdersTableRow
              key={item.id}
              item={item}
              orders={orders}
              getOverallOrderStatus={getOverallOrderStatus}
              getStatusVariant={getStatusVariant}
              getStockAvailable={getStockAvailable}
              onOrderUpdate={onOrderUpdate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
