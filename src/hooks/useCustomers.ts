
import { useState, useEffect } from 'react';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API call when backend is ready
    setTimeout(() => {
      setCustomers([]);
      setLoading(false);
    }, 1000);
  }, []);

  return { customers, loading };
};
