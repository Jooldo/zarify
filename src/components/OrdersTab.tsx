
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
      status: "In Manufacturing",
      totalAmount: 2400,
      items: [
        { category: "Traditional", subcategory: "Meena Work", size: "0.25m", quantity: 2, price: 800 },
        { category: "Traditional", subcategory: "Kundan Work", size: "0.30m", quantity: 1, price: 1600 }
      ],
      createdDate: "2024-06-01",
      expectedDelivery: "2024-06-10"
    },
    {
      id: "ORD-002",
      customer: "Anjali Patel", 
      phone: "+91 87654 32109",
      status: "Ready for Dispatch",
      totalAmount: 1800,
      items: [
        { category: "Modern", subcategory: "Silver Chain", size: "0.20m", quantity: 2, price: 900 }
      ],
      createdDate: "2024-05-28",
      expectedDelivery: "2024-06-05"
    },
    {
      id: "ORD-003",
      customer: "Meera Singh",
      phone: "+91 76543 21098", 
      status: "Pending",
      totalAmount: 3200,
      items: [
        { category: "Traditional", subcategory: "Temple Style", size: "0.35m", quantity: 1, price: 1200 },
        { category: "Traditional", subcategory: "Meena Work", size: "0.25m", quantity: 2, price: 1000 }
      ],
      createdDate: "2024-06-02",
      expectedDelivery: "2024-06-12"
    }
  ];

  const filteredOrders = orders.filter(order => 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            placeholder="Search orders by customer or order ID..."
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.phone}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        {item.quantity}x {item.subcategory} ({item.size})
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-medium">₹{order.totalAmount.toLocaleString()}</TableCell>
                <TableCell>{new Date(order.createdDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(order.expectedDelivery).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <OrderDetails order={order} />
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
