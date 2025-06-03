
import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import OrdersHeader from './orders/OrdersHeader';
import OrdersTable from './orders/OrdersTable';

const OrdersTab = () => {
  const { orders, loading } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');

  // Sample finished goods inventory data for stock availability
  const finishedGoodsInventory = [
    { productCode: "TRD-MNA-MD", currentStock: 15 },
    { productCode: "TRD-KND-LG", currentStock: 3 },
    { productCode: "MOD-SLV-SM", currentStock: 25 },
    { productCode: "TRD-TMP-XL", currentStock: 8 },
    { productCode: "BRD-HEA-XL", currentStock: 2 }
  ];

  const flattenedOrders = orders.flatMap(order => 
    order.order_items.map(suborder => ({
      ...suborder,
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
      size: suborder.product_config.size,
      price: suborder.total_price
    }))
  );

  const filteredOrders = flattenedOrders.filter(item => 
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOverallOrderStatus = (orderId: string) => {
    const order = orders.find(o => o.order_number === orderId);
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

  const getStockAvailable = (productCode: string) => {
    const stock = finishedGoodsInventory.find(item => item.productCode === productCode);
    return stock ? stock.currentStock : 0;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <OrdersHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <OrdersTable 
        filteredOrders={filteredOrders}
        orders={orders}
        getOverallOrderStatus={getOverallOrderStatus}
        getStatusVariant={getStatusVariant}
        getStockAvailable={getStockAvailable}
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
