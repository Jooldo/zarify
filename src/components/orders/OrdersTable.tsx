
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrdersTableRow from './OrdersTableRow';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

interface OrdersTableProps {
  filteredOrders: any[];
  orders: any[];
  getOverallOrderStatus: (orderId: string) => string;
  getStatusVariant: (status: string) => "secondary" | "default" | "outline";
  getStockAvailable: (productCode: string) => number;
  onOrderUpdate: () => void;
  onFinishedGoodsUpdate?: () => void;
  loading?: boolean;
}

const OrdersTable = ({ 
  filteredOrders, 
  orders, 
  getOverallOrderStatus, 
  getStatusVariant, 
  getStockAvailable, 
  onOrderUpdate, 
  onFinishedGoodsUpdate,
  loading = false
}: OrdersTableProps) => {
  
  if (loading) {
    return (
      <TableSkeleton 
        rows={10} 
        columns={8}
        columnWidths={[
          'w-20', 'w-24', 'w-32', 'w-12', 'w-20', 
          'w-16', 'w-24', 'w-20'
        ]}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="py-1 px-2 text-xs font-medium">Order ID</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium w-24">Suborder ID</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Customer</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Product Code & Type</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Qty</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Stock Available</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Sub Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Order Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Expected Delivery</TableHead>
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
              onFinishedGoodsUpdate={onFinishedGoodsUpdate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
