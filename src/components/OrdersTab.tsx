import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import { CreateOrderDialog } from './CreateOrderDialog';
import { useOrders } from '@/hooks/useOrders';
import { Badge } from '@/components/ui/badge';
import VoiceCommandButton from './orders/VoiceCommandButton';

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  total_amount: number;
  created_at: string;
  expected_delivery: string;
  customers: {
    name: string;
    phone: string;
  };
}

const OrdersTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const { orders, isLoading, refetch } = useOrders();

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchMatch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customers?.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!searchMatch) return false;

      if (fromDate && new Date(order.created_at) < fromDate) return false;
      if (toDate && new Date(order.created_at) > toDate) return false;

      return true;
    });
  }, [orders, searchQuery, fromDate, toDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Orders Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <VoiceCommandButton onOrderCreated={refetch} />
          <CreateOrderDialog onOrderCreated={refetch} />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-sm text-muted-foreground">All orders in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Orders awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Orders currently in transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivered Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Orders successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-10 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={
                  "justify-start text-left font-normal w-[180px] h-8" +
                  (!fromDate
                    ? " text-muted-foreground"
                    : "")
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "PPP") : <span>Pick a from date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={
                  "justify-start text-left font-normal w-[180px] h-8" +
                  (!toDate
                    ? " text-muted-foreground"
                    : "")
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "PPP") : <span>Pick a to date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <Card>
          <CardContent>Loading orders...</CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent>No orders found.</CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableCaption>A list of your recent orders.</TableCaption>
            <TableHead>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Customer Phone</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.customers?.name}</TableCell>
                  <TableCell>{order.customers?.phone}</TableCell>
                  <TableCell>{order.total_amount}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : <Badge variant="outline">Not set</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
