
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
    <div className="bg-white rounded-lg border max-h-[calc(100vh-300px)] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow className="h-8">
            <TableHead className="py-1 px-2 text-xs font-medium bg-white">Order ID</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium w-24 bg-white">Suborder ID</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium bg-white">Customer</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium bg-white">Product Code</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium bg-white">Qty</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium bg-white">Stock Available</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium bg-white">Sub Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium bg-white">Order Status</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium bg-white">Expected Delivery</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium bg-white">Actions</TableHead>
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
