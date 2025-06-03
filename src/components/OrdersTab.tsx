import { useState } from 'react';
import OrdersHeader from './orders/OrdersHeader';
import OrdersTable from './orders/OrdersTable';

const OrdersTab = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const orders = [
    {
      id: "ORD-001",
      customer: "Priya Sharma",
      phone: "+91 98765 43210",
      totalAmount: 2400,
      createdDate: "2024-06-01",
      updatedDate: "2024-06-03",
      expectedDelivery: "2024-06-10",
      suborders: [
        {
          id: "SUB-001-1",
          category: "Traditional",
          subcategory: "Meena Work",
          size: "Medium (0.25m)",
          productCode: "TRD-MNA-MD",
          quantity: 2,
          price: 800,
          status: "In Progress"
        },
        {
          id: "SUB-001-2", 
          category: "Traditional",
          subcategory: "Kundan Work",
          size: "Large (0.30m)",
          productCode: "TRD-KND-LG",
          quantity: 1,
          price: 1600,
          status: "Created"
        }
      ]
    },
    {
      id: "ORD-002",
      customer: "Anjali Patel",
      phone: "+91 87654 32109", 
      totalAmount: 1800,
      createdDate: "2024-05-28",
      updatedDate: "2024-06-02",
      expectedDelivery: "2024-06-05",
      suborders: [
        {
          id: "SUB-002-1",
          category: "Modern",
          subcategory: "Silver Chain", 
          size: "Small (0.20m)",
          productCode: "MOD-SLV-SM",
          quantity: 2,
          price: 900,
          status: "Ready"
        }
      ]
    },
    {
      id: "ORD-003",
      customer: "Meera Singh",
      phone: "+91 76543 21098",
      totalAmount: 3200, 
      createdDate: "2024-06-02",
      updatedDate: "2024-06-02",
      expectedDelivery: "2024-06-12",
      suborders: [
        {
          id: "SUB-003-1",
          category: "Traditional",
          subcategory: "Temple Style",
          size: "Extra Large (0.35m)",
          productCode: "TRD-TMP-XL",
          quantity: 1,
          price: 1200,
          status: "Created"
        },
        {
          id: "SUB-003-2",
          category: "Traditional", 
          subcategory: "Meena Work",
          size: "Medium (0.25m)",
          productCode: "TRD-MNA-MD",
          quantity: 2,
          price: 1000,
          status: "Created"
        }
      ]
    }
  ];

  const flattenedOrders = orders.flatMap(order => 
    order.suborders.map(suborder => ({
      ...suborder,
      orderId: order.id,
      customer: order.customer,
      phone: order.phone,
      createdDate: order.createdDate,
      updatedDate: order.updatedDate,
      expectedDelivery: order.expectedDelivery,
      totalOrderAmount: order.totalAmount
    }))
  );

  const filteredOrders = flattenedOrders.filter(item => 
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOverallOrderStatus = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return "Created";
    
    const statuses = order.suborders.map(sub => sub.status);
    
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

  return (
    <div className="space-y-4">
      <OrdersHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <OrdersTable 
        filteredOrders={filteredOrders}
        orders={orders}
        getOverallOrderStatus={getOverallOrderStatus}
        getStatusVariant={getStatusVariant}
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
