
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from "@/components/ui/progress";

interface OrderDetailsProps {
  order: any;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  console.log('OrderDetails - Full order object:', order);
  console.log('OrderDetails - Order items:', order.order_items);

  // Get customer data with proper fallbacks
  const getCustomerData = () => {
    console.log('getCustomerData - Order structure check:', {
      hasCustomers: !!order.customers,
      hasCustomer: !!order.customer,
      hasCustomerName: !!order.customer_name,
      customersData: order.customers,
      customerData: order.customer,
      customerName: order.customer_name,
      customerPhone: order.customer_phone
    });

    let customerName = 'Unknown Customer';
    let customerPhone = '';
    
    // Try different possible customer data structures
    if (order.customers && order.customers.name) {
      customerName = order.customers.name;
      customerPhone = order.customers.phone || '';
      console.log('getCustomerData - Using order.customers');
    } else if (order.customer && order.customer.name) {
      customerName = order.customer.name;
      customerPhone = order.customer.phone || '';
      console.log('getCustomerData - Using order.customer');
    } else if (order.customer_name) {
      customerName = order.customer_name;
      customerPhone = order.customer_phone || '';
      console.log('getCustomerData - Using order.customer_name');
    } else {
      console.log('getCustomerData - No customer data found, using fallback');
    }
    
    const result = {
      name: customerName,
      phone: customerPhone
    };

    console.log('getCustomerData - Final result:', result);
    return result;
  };

  const customerData = getCustomerData();
  
  return (
    <div className="space-y-2 max-w-full">
      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Order Number:</Label>
              <div className="font-semibold">{order.order_number}</div>
            </div>
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Customer:</Label>
              <div className="font-semibold">{customerData.name}</div>
            </div>
            {customerData.phone && (
              <div className="flex justify-between">
                <Label className="text-xs text-gray-500">Phone:</Label>
                <div>{customerData.phone}</div>
              </div>
            )}
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Total Amount:</Label>
              <div className="font-semibold">₹{order.total_amount.toLocaleString()}</div>
            </div>
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Order Date:</Label>
              <div>{new Date(order.created_at).toLocaleDateString()}</div>
            </div>
            {order.expected_delivery && (
              <div className="flex justify-between">
                <Label className="text-xs text-gray-500">Expected Delivery:</Label>
                <div>{new Date(order.expected_delivery).toLocaleDateString()}</div>
              </div>
            )}
            <div className="flex justify-between">
              <Label className="text-xs text-gray-500">Order Status:</Label>
              <Badge variant="secondary" className="text-xs">
                {order.status || 'Created'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1.5">
            {order.order_items.map((item: any) => {
              const sizeValue = item.product_configs?.size_value || 'N/A';
              const weightRange = item.product_configs?.weight_range || 'N/A';
              const sizeWeight = `${sizeValue}" / ${weightRange}`;
              const fulfillmentProgress = item.quantity > 0 ? (item.fulfilled_quantity / item.quantity) * 100 : 0;
              
              return (
                <div key={item.id} className="p-2 border border-gray-200 rounded bg-gray-50 space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium text-blue-600">{item.suborder_id}</div>
                    <Badge variant="secondary" className="text-xs h-4 px-1">{item.status}</Badge>
                  </div>
                  
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Product Code:</span>
                      <span className="font-medium">{item.product_configs?.product_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span>{item.product_configs?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span>{item.product_configs?.subcategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size & Weight:</span>
                      <span>{sizeWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-gray-500">Fulfilled:</span>
                      <span className="font-medium">{item.fulfilled_quantity} / {item.quantity}</span>
                    </div>
                    {item.quantity > 0 && (item.fulfilled_quantity > 0 || item.status === 'Partially Fulfilled' || item.status === 'Delivered') && (
                       <Progress value={fulfillmentProgress} className="h-1.5 w-full mt-0.5" />
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Unit Price:</span>
                      <span>₹{item.unit_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sub Amount:</span>
                      <span className="font-medium">₹{item.total_price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
