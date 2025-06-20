
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

  return { customers, searchCustomers, loading };
};
