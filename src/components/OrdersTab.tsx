
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit } from 'lucide-react';
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "secondary";
      case "In Manufacturing":
        return "default";
      case "Ready for Dispatch":
        return "default";
      case "Dispatched":
        return "outline";
      default:
        return "secondary";
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

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{order.id}</CardTitle>
                <Badge variant={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.customer}</p>
                <p className="text-sm text-gray-600">{order.phone}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-medium">₹{order.totalAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Items:</span>
                <span className="font-medium">{order.items.length} products</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expected:</span>
                <span className="text-sm">{new Date(order.expectedDelivery).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
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
            </CardContent>
          </Card>
        ))}
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
