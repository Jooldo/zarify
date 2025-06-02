
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Eye } from 'lucide-react';
import OrderDetails from '@/components/OrderDetails';
import CreateOrderForm from '@/components/CreateOrderForm';

const OrdersTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const orders = [
    {
      id: "ORD-001",
      customer: "Priya Sharma",
      phone: "+91 98765 43210",
      totalAmount: 2400,
      createdDate: "2024-06-01",
      expectedDelivery: "2024-06-10",
      suborders: [
        {
          id: "SUB-001-1",
          category: "Traditional",
          subcategory: "Meena Work",
          size: "Medium (0.25m)",
          quantity: 2,
          price: 800,
          status: "In Manufacturing"
        },
        {
          id: "SUB-001-2", 
          category: "Traditional",
          subcategory: "Kundan Work",
          size: "Large (0.30m)",
          quantity: 1,
          price: 1600,
          status: "Pending"
        }
      ]
    },
    {
      id: "ORD-002",
      customer: "Anjali Patel",
      phone: "+91 87654 32109", 
      totalAmount: 1800,
      createdDate: "2024-05-28",
      expectedDelivery: "2024-06-05",
      suborders: [
        {
          id: "SUB-002-1",
          category: "Modern",
          subcategory: "Silver Chain", 
          size: "Small (0.20m)",
          quantity: 2,
          price: 900,
          status: "Ready for Dispatch"
        }
      ]
    },
    {
      id: "ORD-003",
      customer: "Meera Singh",
      phone: "+91 76543 21098",
      totalAmount: 3200, 
      createdDate: "2024-06-02",
      expectedDelivery: "2024-06-12",
      suborders: [
        {
          id: "SUB-003-1",
          category: "Traditional",
          subcategory: "Temple Style",
          size: "Extra Large (0.35m)",
          quantity: 1,
          price: 1200,
          status: "Pending"
        },
        {
          id: "SUB-003-2",
          category: "Traditional", 
          subcategory: "Meena Work",
          size: "Medium (0.25m)",
          quantity: 2,
          price: 1000,
          status: "Pending"
        }
      ]
    }
  ];

  // Flatten orders to show suborders in table
  const flattenedOrders = orders.flatMap(order => 
    order.suborders.map(suborder => ({
      ...suborder,
      orderId: order.id,
      customer: order.customer,
      phone: order.phone,
      createdDate: order.createdDate,
      expectedDelivery: order.expectedDelivery,
      totalOrderAmount: order.totalAmount
    }))
  );

  const filteredOrders = flattenedOrders.filter(item => 
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOverallOrderStatus = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return "Unknown";
    
    const statuses = order.suborders.map(sub => sub.status);
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    if (statuses.some(s => s === "Dispatched")) return "Dispatched";
    if (statuses.some(s => s === "Ready for Dispatch")) return "Ready for Dispatch";
    if (statuses.some(s => s === "In Manufacturing")) return "In Manufacturing";
    return "Pending";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary" as const;
      case "In Manufacturing":
        return "default" as const;
      case "Ready for Dispatch":
        return "default" as const;
      case "Dispatched":
        return "outline" as const;
      case "Delivered":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders by customer, order ID, or suborder ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <CreateOrderForm onClose={() => setIsCreateOrderOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Orders Table - Now showing suborders */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Suborder ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Product Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Suborder Status</TableHead>
              <TableHead>Overall Order Status</TableHead>
              <TableHead>Suborder Amount</TableHead>
              <TableHead>Total Order Amount</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.orderId}</TableCell>
                <TableCell className="font-medium text-blue-600">{item.id}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{item.subcategory}</div>
                    <div className="text-gray-500">{item.category} - {item.size}</div>
                  </div>
                </TableCell>
                <TableCell>{item.quantity} pieces</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(getOverallOrderStatus(item.orderId))}>
                    {getOverallOrderStatus(item.orderId)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">₹{item.price.toLocaleString()}</TableCell>
                <TableCell className="font-medium">₹{item.totalOrderAmount.toLocaleString()}</TableCell>
                <TableCell>{new Date(item.createdDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(item.expectedDelivery).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                        </DialogHeader>
                        <OrderDetails order={orders.find(o => o.id === item.orderId)} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
