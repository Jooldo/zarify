
import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';
import OrdersHeader from './orders/OrdersHeader';
import OrdersTable from './orders/OrdersTable';
import OrderFilters from './orders/OrderFilters';

const OrdersTab = () => {
  const { orders, loading, refetch } = useOrders();
  const { finishedGoods, refetch: refetchFinishedGoods } = useFinishedGoods();
  const { customers } = useCustomerAutocomplete();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    subStatus: 'all',
    stockStatus: 'all',
    customer: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Define utility functions first
  const getOverallOrderStatus = (orderId: string) => {
    const order = orders.find(o => o.order_number === orderId);
    if (!order) return "Created";
    
    const statuses = order.order_items.map(sub => sub.status);
    
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    if (statuses.every(s => s === "Ready")) return "Ready";
    if (statuses.some(s => s === "In Progress")) return "In Progress";
    
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

  const getStockAvailable = (productCode: string) => {
    const finishedGood = finishedGoods.find(item => item.product_code === productCode);
    return finishedGood ? finishedGood.current_stock : 0;
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

  const applyFilters = (orders: any[]) => {
    let filtered = orders;

    // Text search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.suborder_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => {
        const overallStatus = getOverallOrderStatus(item.orderId);
        return overallStatus === filters.status;
      });
    }

    // Sub-status filter
    if (filters.subStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filters.subStatus);
    }

    // Stock status filter
    if (filters.stockStatus !== 'all') {
      filtered = filtered.filter(item => {
        const stockAvailable = getStockAvailable(item.productCode);
        const isLowStock = stockAvailable < item.quantity;
        const isOutOfStock = stockAvailable === 0;
        
        switch (filters.stockStatus) {
          case 'in-stock':
            return !isLowStock && !isOutOfStock;
          case 'low-stock':
            return isLowStock && !isOutOfStock;
          case 'out-of-stock':
            return isOutOfStock;
          default:
            return true;
        }
      });
    }

    // Customer filter
    if (filters.customer !== 'all') {
      filtered = filtered.filter(item => item.customer === filters.customer);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.createdDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.createdDate) <= new Date(filters.dateTo)
      );
    }

    return filtered;
  };

  const filteredOrders = applyFilters(flattenedOrders);

  const uniqueCustomers = [...new Set(customers.map(c => c.name))];

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <OrdersHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        onOrderCreated={refetch}
      />
      
      <OrderFilters 
        filters={filters}
        onFiltersChange={setFilters}
        customers={uniqueCustomers}
      />
      
      <OrdersTable 
        filteredOrders={filteredOrders}
        orders={orders}
        getOverallOrderStatus={getOverallOrderStatus}
        getStatusVariant={getStatusVariant}
        getStockAvailable={getStockAvailable}
        onOrderUpdate={refetch}
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
