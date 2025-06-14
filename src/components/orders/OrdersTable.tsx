
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrdersTableRow from './OrdersTableRow';
import { Order } from '@/hooks/useOrders';
import { FinishedGood } from '@/hooks/useFinishedGoods'; // Import type

interface OrdersTableProps {
  filteredOrders: any[]; // These are flattened order items
  orders: Order[]; // Original orders structure
  finishedGoods: FinishedGood[]; // Pass finished goods data
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
        columns={8}
        columnWidths={[
          'w-20', 'w-24', 'w-32', 'w-12', 'w-20', 
          'w-16', 'w-24', 'w-20'
        ]}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="h-10 bg-gray-50">
            <TableHead className="py-1 px-2 text-xs">Order ID</TableHead>
            <TableHead className="py-1 px-2 text-xs w-24">Suborder ID</TableHead>
            <TableHead className="py-1 px-2 text-xs">Customer</TableHead>
            <TableHead className="py-1 px-2 text-xs">Product Code</TableHead>
            <TableHead className="py-1 px-2 text-xs">Qty</TableHead>
            <TableHead className="py-1 px-2 text-xs">Stock</TableHead>
            <TableHead className="py-1 px-2 text-xs">Item Status</TableHead>
            <TableHead className="py-1 px-2 text-xs">Order Status</TableHead>
            <TableHead className="py-1 px-2 text-xs">Delivery</TableHead>
            <TableHead className="py-1 px-2 text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((item) => (
            <OrdersTableRow 
              key={item.id} // item.id is the suborder_item_id, which should be unique
              item={item} 
              orders={orders} // Pass full orders list
              finishedGoods={finishedGoods} // Pass finished goods list
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
