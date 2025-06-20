import { useState, useMemo, useEffect } from 'react';
import { useOrders, OrderItem as FullOrderItem, Order as FullOrder } from '@/hooks/useOrders';
import { useFinishedGoods, FinishedGood } from '@/hooks/useFinishedGoods';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import { useInvoices } from '@/hooks/useInvoices';
import { startOfWeek, endOfWeek, addWeeks, isWithinInterval } from 'date-fns';
import OrdersHeader from './orders/OrdersHeader';
import OrdersTable from './orders/OrdersTable';
import OrdersStatsHeader from './orders/OrdersStatsHeader';

export interface OrderFilters {
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

interface OrdersTabProps {
  initialFilters?: OrderFilters | null;
  onFiltersConsumed?: () => void;
}

const OrdersTab = ({ initialFilters, onFiltersConsumed }: OrdersTabProps) => {
  const { orders, loading, refetch } = useOrders();
  const { finishedGoods, loading: fgLoading, refetch: refetchFinishedGoods } = useFinishedGoods();
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

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
      if (onFiltersConsumed) {
        onFiltersConsumed();
      }
    }
  }, [initialFilters, onFiltersConsumed]);

  const orderStats = useMemo(() => {
    const allOrderItems = orders.flatMap(order => order.order_items);
    return {
      total: allOrderItems.length,
      created: allOrderItems.filter(item => item.status === 'Created').length,
      inProgress: allOrderItems.filter(item => item.status === 'In Progress' || item.status === 'Partially Fulfilled').length,
      ready: allOrderItems.filter(item => item.status === 'Ready').length,
      delivered: allOrderItems.filter(item => item.status === 'Delivered').length,
    };
  }, [orders]);

  const { categories, subcategories } = useMemo(() => {
    const categoriesSet = new Set<string>();
    const subcategoriesSet = new Set<string>();
    
    orders.forEach(order => {
      order.order_items.forEach(item => {
        if (item.product_configs?.category) categoriesSet.add(item.product_configs.category);
        if (item.product_configs?.subcategory) subcategoriesSet.add(item.product_configs.subcategory);
      });
    });
    
    return {
      categories: Array.from(categoriesSet).sort(),
      subcategories: Array.from(subcategoriesSet).sort()
    };
  }, [orders]);

  const customerNames = useMemo(() => {
    const customersSet = new Set<string>();
    orders.forEach(order => {
      if (order.customers?.name) customersSet.add(order.customers.name);
    });
    return Array.from(customersSet).sort();
  }, [orders]);

  const getOverallOrderStatus = (orderId: string) => {
    const order = orders.find(o => o.order_number === orderId);
    if (!order) return "Created";
    
    const statuses = order.order_items.map(sub => sub.status);
    
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    if (statuses.every(s => s === "Ready")) return "Ready";
    if (statuses.some(s => s === "In Progress" || s === "Partially Fulfilled" || statuses.some(s => s === 'Created' && statuses.some(st => st !== 'Created')))) return "In Progress";

    if (statuses.every(s => s === "Created")) return "Created";
    
    if (statuses.some(s => s !== "Created") && statuses.some(s => s === "Created")) {
        return "In Progress";
    }
    
    return "Created";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Created":
        return "secondary" as const;
      case "In Progress":
      case "Partially Fulfilled":
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
    await refetchFinishedGoods(); 
    refetchInvoices();
  };

  const flattenedOrders = useMemo(() => orders.flatMap(order => 
    order.order_items.map(suborder => {
      const sizeValue = suborder.product_configs?.size_value || 'N/A';
      const weightRange = suborder.product_configs?.weight_range || 'N/A';
      
      return {
        ...suborder, 
        orderId: order.order_number,
        customer: order.customers?.name || '',
        phone: order.customers?.phone || '',
        createdDate: order.created_at,
        updatedDate: order.updated_at,
        expectedDelivery: order.expected_delivery || '',
        totalOrderAmount: order.total_amount,
        productCode: suborder.product_configs?.product_code || '',
        category: suborder.product_configs?.category || '',
        subcategory: suborder.product_configs?.subcategory || '',
        size: `${sizeValue}" / ${weightRange}`,
        price: suborder.total_price 
      };
    })
  ), [orders]);

  const filteredOrders = useMemo(() => flattenedOrders.filter(item => {
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
      const deliveryDateNormalized = new Date(deliveryDate);
      deliveryDateNormalized.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((deliveryDateNormalized.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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
        case 'This Week': {
            const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
            const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
            if (!isWithinInterval(deliveryDateNormalized, { start: startOfThisWeek, end: endOfThisWeek })) return false;
            break;
        }
        case 'Next Week': {
            const startOfNextWeek = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
            const endOfNextWeek = endOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
            if (!isWithinInterval(deliveryDateNormalized, { start: startOfNextWeek, end: endOfNextWeek })) return false;
            break;
        }
      }
    }

    // Custom expected delivery date range
    if (filters.expectedDeliveryFrom || filters.expectedDeliveryTo) {
      if (!item.expectedDelivery) return false;
      
      const deliveryDate = new Date(item.expectedDelivery);
      const deliveryDateNormalized = new Date(deliveryDate);
      deliveryDateNormalized.setHours(0,0,0,0);
      
      if (filters.expectedDeliveryFrom) {
        const fromDate = new Date(filters.expectedDeliveryFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (deliveryDateNormalized < fromDate) return false;
      }
      
      if (filters.expectedDeliveryTo) {
        const toDate = new Date(filters.expectedDeliveryTo);
        toDate.setHours(23, 59, 59, 999);
        if (deliveryDateNormalized > toDate) return false;
      }
    }

    // Quick filters
    if (filters.hasDeliveryDate && !item.expectedDelivery) return false;
    if (filters.overdueDelivery) {
      if (!item.expectedDelivery) return false;
      const today = new Date();
      today.setHours(0,0,0,0);
      const deliveryDate = new Date(item.expectedDelivery);
      deliveryDate.setHours(0,0,0,0);
      if (deliveryDate >= today) return false;
    }
    if (filters.lowStock) {
      const stockAvailableVal = getStockAvailable(item.productCode);
      if (stockAvailableVal >= item.quantity) return false;
    }
    if (filters.stockAvailable) {
      const stockAvailableVal = getStockAvailable(item.productCode);
      if (stockAvailableVal < item.quantity) return false;
    }

    return true;
  }), [flattenedOrders, searchTerm, filters, getOverallOrderStatus, getStockAvailable, orders]);

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
        finishedGoods={finishedGoods}
        loading={loading || fgLoading}
        getOverallOrderStatus={getOverallOrderStatus}
        getStatusVariant={getStatusVariant}
        getStockAvailable={getStockAvailable}
        onOrderUpdate={handleOrderUpdate}
        onFinishedGoodsUpdate={refetchFinishedGoods}
      />

      {filteredOrders.length === 0 && !loading && !fgLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No orders found matching your search and filters.</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
