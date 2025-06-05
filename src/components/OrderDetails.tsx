
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Package, Calendar, Phone, User } from 'lucide-react';
import { Order } from '@/hooks/useOrders';

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  // Add null check for order and order_items
  if (!order || !order.order_items) {
    return <div>Order not found or invalid order data.</div>;
  }

  const [suborderStatuses, setSuborderStatuses] = useState(
    order.order_items.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.status
    }), {})
  );

  const statusOptions = [
    "Created",
    "In Progress", 
    "Ready",
    "Delivered"
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Created":
        return "secondary";
      case "In Progress":
        return "default";
      case "Ready":
        return "default";
      case "Delivered":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleSuborderStatusUpdate = (suborderId, newStatus) => {
    setSuborderStatuses(prev => ({
      ...prev,
      [suborderId]: newStatus
    }));
    console.log(`Updating suborder ${suborderId} status to: ${newStatus}`);
  };

  const getOverallStatus = () => {
    const statuses = Object.values(suborderStatuses);
    
    // If all suborders are "Delivered", order is "Delivered"
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    
    // If all suborders are "Ready", order is "Ready"
    if (statuses.every(s => s === "Ready")) return "Ready";
    
    // If any suborder is "In Progress", order is "In Progress"
    if (statuses.some(s => s === "In Progress")) return "In Progress";
    
    // Otherwise, order is "Created"
    return "Created";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{order.order_number}</h2>
          <p className="text-gray-600">Order Details</p>
        </div>
        <Badge variant={getStatusColor(getOverallStatus())} className="text-sm px-3 py-1">
          Overall: {getOverallStatus()}
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
            <span>{order.customer.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{order.customer.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Order Date: {new Date(order.created_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Expected: {order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : 'N/A'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Suborders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suborder ID</TableHead>
                <TableHead>Product Code</TableHead>
                <TableHead>Product Details</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items.map((orderItem) => {
                const sizeInInches = orderItem.product_config.size_value 
                  ? (orderItem.product_config.size_value * 39.3701).toFixed(2) 
                  : 'N/A';
                const weightRange = orderItem.product_config.weight_range || 'N/A';
                
                return (
                  <TableRow key={orderItem.id}>
                    <TableCell className="font-medium text-blue-600">{orderItem.suborder_id}</TableCell>
                    <TableCell className="font-mono text-sm bg-gray-50">{orderItem.product_config.product_code}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{orderItem.product_config.subcategory}</div>
                        <div className="text-gray-500">{orderItem.product_config.category} - {sizeInInches}" / {weightRange}</div>
                      </div>
                    </TableCell>
                    <TableCell>{orderItem.quantity} pieces</TableCell>
                    <TableCell className="font-medium">₹{orderItem.total_price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(suborderStatuses[orderItem.id])}>
                        {suborderStatuses[orderItem.id]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <Select
                          value={suborderStatuses[orderItem.id]}
                          onValueChange={(value) => handleSuborderStatusUpdate(orderItem.id, value)}
                        >
                          <SelectTrigger className="w-40">
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Order Amount:</span>
            <span>₹{order.total_amount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Update All Suborders
            </Button>
            <Button variant="outline">
              Print Order Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
