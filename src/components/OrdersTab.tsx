import { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import { useInvoices } from '@/hooks/useInvoices';
import OrdersHeader from './orders/OrdersHeader';
import OrdersTable from './orders/OrdersTable';
import OrdersStatsHeader from './orders/OrdersStatsHeader';

interface OrderFilters {
  customer: string;
  orderStatus: string;
  suborderStatus: string;
  category: string;
  subcategory: string;
  dateRange: string;
  minAmount: string;
  maxAmount: string;
  hasDeliveryDate: boolean;
  overdueDelivery: boolean;
  lowStock: boolean;
  stockAvailable: boolean;
  expectedDeliveryFrom: Date | null;
  expectedDeliveryTo: Date | null;
  expectedDeliveryRange: string;
}

const OrdersTab = () => {
  const { orders, loading, refetch } = useOrders();
  const { finishedGoods, refetch: refetchFinishedGoods } = useFinishedGoods();
  const { customers } = useCustomerAutocomplete();
  const { refetch: refetchInvoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<OrderFilters>({
    customer: '',
    orderStatus: '',
    suborderStatus: '',
    category: '',
    subcategory: '',
    dateRange: '',
    minAmount: '',
    maxAmount: '',
    hasDeliveryDate: false,
    overdueDelivery: false,
    lowStock: false,
    stockAvailable: false,
    expectedDeliveryFrom: null,
    expectedDeliveryTo: null,
    expectedDeliveryRange: ''
  });

  // Calculate order stats
  const orderStats = useMemo(() => {
    const allOrderItems = orders.flatMap(order => order.order_items);
    return {
      total: allOrderItems.length,
      created: allOrderItems.filter(item => item.status === 'Created').length,
      inProgress: allOrderItems.filter(item => item.status === 'Progress').length,
      ready: allOrderItems.filter(item => item.status === 'Ready').length,
      delivered: allOrderItems.filter(item => item.status === 'Delivered').length,
    };
  }, [orders]);

  // Extract unique categories and subcategories from orders
  const { categories, subcategories } = useMemo(() => {
    const categoriesSet = new Set<string>();
    const subcategoriesSet = new Set<string>();
    
    orders.forEach(order => {
      order.order_items.forEach(item => {
        if (item.product_config.category) categoriesSet.add(item.product_config.category);
        if (item.product_config.subcategory) subcategoriesSet.add(item.product_config.subcategory);
      });
    });
    
    return {
      categories: Array.from(categoriesSet).sort(),
      subcategories: Array.from(subcategoriesSet).sort()
    };
  }, [orders]);

  // Extract unique customer names
  const customerNames = useMemo(() => {
    const customersSet = new Set<string>();
    orders.forEach(order => {
      if (order.customer.name) customersSet.add(order.customer.name);
    });
    return Array.from(customersSet).sort();
  }, [orders]);

  // Define utility functions first
  const getOverallOrderStatus = (orderId: string) => {
    const order = orders.find(o => o.order_number === orderId);
    if (!order) return "Created";
    
    const statuses = order.order_items.map(sub => sub.status);
    
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    if (statuses.every(s => s === "Ready")) return "Ready";
    if (statuses.some(s => s === "Progress")) return "Progress";
    
    return "Created";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Created":
        return "secondary" as const;
      case "Progress":
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
    const finishedGood = finishedGoods.find(item => item.product_code === productCode);
    return finishedGood ? finishedGood.current_stock : 0;
  };

  const handleOrderUpdate = async () => {
    await refetch();
    await refetchFinishedGoods(); // Ensure finished goods are refreshed when orders change
    refetchInvoices();
  };

  const flattenedOrders = orders.flatMap(order => 
    order.order_items.map(suborder => {
      // Display size exactly as entered in product config without any conversion
      const sizeValue = suborder.product_config.size_value || 'N/A';
      const weightRange = suborder.product_config.weight_range || 'N/A';
      
      return {
        ...suborder,
        suborder_id: suborder.suborder_id,
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
        size: `${sizeValue}" / ${weightRange}`,
        price: suborder.total_price
      };
    })
  );

  const filteredOrders = flattenedOrders.filter(item => {
    // Text search filter
    if (searchTerm) {
      const searchMatch = item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.suborder_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
      if (!searchMatch) return false;
    }

    // Apply filters
    if (filters.customer && item.customer !== filters.customer) return false;
    if (filters.orderStatus && getOverallOrderStatus(item.orderId) !== filters.orderStatus) return false;
    if (filters.suborderStatus && item.status !== filters.suborderStatus) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.subcategory && item.subcategory !== filters.subcategory) return false;

    // Date range filter
    if (filters.dateRange) {
      const itemDate = new Date(item.createdDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (filters.dateRange) {
        case 'Today':
          if (daysDiff !== 0) return false;
          break;
        case 'Last 7 days':
          if (daysDiff > 7) return false;
          break;
        case 'Last 30 days':
          if (daysDiff > 30) return false;
          break;
        case 'Last 90 days':
          if (daysDiff > 90) return false;
          break;
      }
    }

    // Amount range filter
    if (filters.minAmount && item.totalOrderAmount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && item.totalOrderAmount > parseFloat(filters.maxAmount)) return false;

    // Expected delivery date filters
    if (filters.expectedDeliveryRange) {
      if (!item.expectedDelivery) return false;
      
      const deliveryDate = new Date(item.expectedDelivery);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deliveryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      switch (filters.expectedDeliveryRange) {
        case 'Today':
          if (daysDiff !== 0) return false;
          break;
        case 'Next 7 days':
          if (daysDiff < 0 || daysDiff > 7) return false;
          break;
        case 'Next 30 days':
          if (daysDiff < 0 || daysDiff > 30) return false;
          break;
        case 'Past due':
          if (daysDiff >= 0) return false;
          break;
      }
    }

    // Custom expected delivery date range
    if (filters.expectedDeliveryFrom || filters.expectedDeliveryTo) {
      if (!item.expectedDelivery) return false;
      
      const deliveryDate = new Date(item.expectedDelivery);
      
      if (filters.expectedDeliveryFrom) {
        const fromDate = new Date(filters.expectedDeliveryFrom);
        fromDate.setHours(0, 0, 0, 0);
        deliveryDate.setHours(0, 0, 0, 0);
        if (deliveryDate < fromDate) return false;
      }
      
      if (filters.expectedDeliveryTo) {
        const toDate = new Date(filters.expectedDeliveryTo);
        toDate.setHours(23, 59, 59, 999);
        deliveryDate.setHours(0, 0, 0, 0);
        if (deliveryDate > toDate) return false;
      }
    }

    // Quick filters
    if (filters.hasDeliveryDate && !item.expectedDelivery) return false;
    if (filters.overdueDelivery) {
      if (!item.expectedDelivery || new Date(item.expectedDelivery) >= new Date()) return false;
    }
    if (filters.lowStock) {
      const stockAvailable = getStockAvailable(item.productCode);
      if (stockAvailable >= item.quantity) return false;
    }
    if (filters.stockAvailable) {
      const stockAvailable = getStockAvailable(item.productCode);
      if (stockAvailable < item.quantity) return false;
    }

    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <OrdersStatsHeader orderStats={orderStats} />
      
      <OrdersHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        onOrderCreated={handleOrderUpdate}
        onFiltersChange={setFilters}
        customers={customerNames}
        categories={categories}
        subcategories={subcategories}
      />
      
      <OrdersTable 
        filteredOrders={filteredOrders}
        orders={orders}
        getOverallOrderStatus={getOverallOrderStatus}
        getStatusVariant={getStatusVariant}
        getStockAvailable={getStockAvailable}
        onOrderUpdate={handleOrderUpdate}
        onFinishedGoodsUpdate={refetchFinishedGoods}
      />

      {filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No orders found matching your search and filters.</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
