
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Edit, Package, Calendar, Phone, User } from 'lucide-react';

const OrderDetails = ({ order }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const statusOptions = [
    "Pending",
    "In Manufacturing", 
    "Ready for Dispatch",
    "Dispatched",
    "Delivered",
    "Cancelled"
  ];

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
      case "Delivered":
        return "default";
      case "Cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleStatusUpdate = (newStatus) => {
    setCurrentStatus(newStatus);
    // Here you would typically make an API call to update the status
    console.log(`Updating order ${order.id} status to: ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{order.id}</h2>
          <p className="text-gray-600">Order Details</p>
        </div>
        <Badge variant={getStatusColor(currentStatus)} className="text-sm px-3 py-1">
          {currentStatus}
        </Badge>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{order.customer}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{order.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Order Date: {new Date(order.createdDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{item.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subcategory</p>
                    <p className="font-medium">{item.subcategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="font-medium">{item.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium">{item.quantity} pieces</p>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Item Total:</span>
                  <span className="font-medium">₹{item.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount:</span>
            <span>₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={currentStatus} onValueChange={handleStatusUpdate}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Update Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
