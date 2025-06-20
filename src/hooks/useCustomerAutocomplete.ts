
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export const useCustomerAutocomplete = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .eq('merchant_id', merchantId)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = (searchTerm: string) => {
    if (!searchTerm.trim()) return [];
    
    const search = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(search) ||
      (customer.phone && customer.phone.includes(search))
    ).slice(0, 5); // Limit to 5 suggestions
  };

  // New function to get customers with active orders for a specific product
  const fetchCustomersWithActiveOrders = async (productConfigId: string) => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, 
          name, 
          phone,
          orders!inner (
            id,
            status,
            order_items!inner (
              id,
              product_config_id,
              quantity,
              fulfilled_quantity,
              status
            )
          )
        `)
        .eq('merchant_id', merchantId)
        .eq('orders.order_items.product_config_id', productConfigId)
        .in('orders.status', ['Created', 'In Progress', 'Partially Fulfilled'])
        .order('name');

      if (error) throw error;

      // Filter customers who have unfulfilled items for this product
      const customersWithPendingOrders = (data || []).filter(customer => {
        return customer.orders.some((order: any) => 
          order.order_items.some((item: any) => 
            item.product_config_id === productConfigId && 
            item.fulfilled_quantity < item.quantity &&
            item.status !== 'Delivered'
          )
        );
      });

      return customersWithPendingOrders.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        activeOrderCount: customer.orders.length
      }));
    } catch (error) {
      console.error('Error fetching customers with active orders:', error);
      return [];
    }
  };

  return { 
    customers, 
    searchCustomers, 
    loading, 
    fetchCustomersWithActiveOrders 
  };
};
