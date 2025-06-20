
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrdersTableRow from './OrdersTableRow';
import { Order } from '@/hooks/useOrders';
import { FinishedGood } from '@/hooks/useFinishedGoods';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

interface OrdersTableProps {
  filteredOrders: any[];
  orders: Order[];
  finishedGoods: FinishedGood[];
  loading: boolean;
  getOverallOrderStatus: (orderId: string) => string;
  getStatusVariant: (status: string) => "secondary" | "default" | "outline";
  getStockAvailable: (productCode: string) => number;
  onOrderUpdate: () => void;
  onFinishedGoodsUpdate?: () => void;
}

const OrdersTable = ({ 
  filteredOrders, 
  orders,
  finishedGoods,
  loading,
  getOverallOrderStatus, 
  getStatusVariant, 
  getStockAvailable, 
  onOrderUpdate,
  onFinishedGoodsUpdate 
}: OrdersTableProps) => {
  
  if (loading) {
    return (
      <TableSkeleton 
        rows={10} 
        columns={12}
        columnWidths={[
          'w-20', 'w-24', 'w-32', 'w-24', 'w-12', 
          'w-32', 'w-24',
          'w-16', 'w-24', 'w-24', 'w-20', 'w-20'
        ]}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="h-12 border-b border-gray-200">
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Order ID</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700 w-24">Suborder ID</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Customer</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Product Code</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Qty</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700 w-32">Fulfillment</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Created</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Stock</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Item Status</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Order Status</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Delivery</TableHead>
            <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((item) => (
            <OrdersTableRow 
              key={item.id}
              item={item} 
              orders={orders}
              finishedGoods={finishedGoods}
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
