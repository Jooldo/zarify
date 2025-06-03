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

  // Flatten orders to show suborders in table
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
    
    // If all suborders are "Delivered", order is "Delivered"
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    
    // If all suborders are "Ready", order is "Ready"
    if (statuses.every(s => s === "Ready")) return "Ready";
    
    // If any suborder is "In Progress", order is "In Progress"
    if (statuses.some(s => s === "In Progress")) return "In Progress";
    
    // Otherwise, order is "Created"
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
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 h-8 px-3 text-xs">
              <Plus className="h-3 w-3" />
              Create Order
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

      {/* Compact Orders Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Order ID</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Suborder ID</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Customer</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Product Code</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Qty</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Sub Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Order Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Sub Amount</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Total Amount</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Created</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Updated</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Expected</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((item) => (
              <TableRow key={item.id} className="h-10 hover:bg-gray-50">
                <TableCell className="py-1 px-2 text-xs font-medium">{item.orderId}</TableCell>
                <TableCell className="py-1 px-2 text-xs text-blue-600 font-medium">{item.id}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{item.customer}</TableCell>
                <TableCell className="py-1 px-2 text-xs font-mono bg-gray-50">{item.productCode}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{item.quantity}</TableCell>
                <TableCell className="py-1 px-2">
                  <Badge variant={getStatusVariant(item.status)} className="text-xs px-1 py-0">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2">
                  <Badge variant={getStatusVariant(getOverallOrderStatus(item.orderId))} className="text-xs px-1 py-0">
                    {getOverallOrderStatus(item.orderId)}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2 text-xs font-medium">₹{item.price.toLocaleString()}</TableCell>
                <TableCell className="py-1 px-2 text-xs font-medium">₹{item.totalOrderAmount.toLocaleString()}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{new Date(item.createdDate).toLocaleDateString('en-IN')}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{new Date(item.updatedDate).toLocaleDateString('en-IN')}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{new Date(item.expectedDelivery).toLocaleDateString('en-IN')}</TableCell>
                <TableCell className="py-1 px-2">
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                        </DialogHeader>
                        <OrderDetails order={orders.find(o => o.id === item.orderId)} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No orders found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
