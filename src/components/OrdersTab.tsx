
import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import OrdersHeader from './orders/OrdersHeader';
import OrdersTable from './orders/OrdersTable';
import OrdersQuickFilters from './orders/OrdersQuickFilters';

const OrdersTab = () => {
  const { orders, loading, refetch } = useOrders();
  const { finishedGoods, refetch: refetchFinishedGoods } = useFinishedGoods();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  // Sort orders by creation date (latest first)
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
  );

  const flattenedOrders = sortedOrders.flatMap(order => 
    order.order_items.map(suborder => {
      // Display size exactly as entered in product config without any conversion
      const sizeValue = suborder.product_config.size_value || 'N/A';
      const weightRange = suborder.product_config.weight_range || 'N/A';
      
      return {
        ...suborder,
        suborder_id: suborder.suborder_id,
        orderId: order.order_number,
        customer: order.customer.name,
        phone: order.customer.phone || '',
        createdDate: order.created_date,
        updatedDate: order.updated_date,
        expectedDelivery: order.expected_delivery || '',
        totalOrderAmount: order.total_amount,
        productCode: suborder.product_config.product_code,
        category: suborder.product_config.category,
        subcategory: suborder.product_config.subcategory,
        size: `${sizeValue}" / ${weightRange}`,
        price: suborder.total_price
      };
    })
  );

  const getStockAvailable = (productCode: string) => {
    const finishedGood = finishedGoods.find(item => item.product_code === productCode);
    return finishedGood ? finishedGood.current_stock : 0;
  };

  const filteredOrders = flattenedOrders.filter(item => {
    // Search filter
    const matchesSearch = item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.suborder_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productCode.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    // Stock filter
    const stockAvailable = getStockAvailable(item.productCode);
    const matchesStock = stockFilter === 'All' || 
      (stockFilter === 'Low Stock' && stockAvailable < item.quantity) ||
      (stockFilter === 'In Stock' && stockAvailable >= item.quantity);

    return matchesSearch && matchesStatus && matchesStock;
  });

  const getOverallOrderStatus = (orderId: string) => {
    const order = sortedOrders.find(o => o.order_number === orderId);
    if (!order) return "Created";
    
    const statuses = order.order_items.map(sub => sub.status);
    
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    if (statuses.every(s => s === "Ready")) return "Ready";
    if (statuses.some(s => s === "In Progress")) return "In Progress";
    
    return "Created";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Created":
        return "secondary" as const;
      case "In Progress":
        return "default" as const;
      case "Ready":
        return "default" as const;
      case "Delivered":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <OrdersHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        onOrderCreated={refetch}
      />
      
      <OrdersQuickFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
      />
      
      <OrdersTable 
        filteredOrders={filteredOrders}
        orders={sortedOrders}
        getOverallOrderStatus={getOverallOrderStatus}
        getStatusVariant={getStatusVariant}
        getStockAvailable={getStockAvailable}
        onOrderUpdate={refetch}
        onFinishedGoodsUpdate={refetchFinishedGoods}
      />

      {filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No orders found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
