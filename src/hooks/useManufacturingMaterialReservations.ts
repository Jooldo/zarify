
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ManufacturingMaterialReservation {
  id: string;
  manufacturing_order_id: string;
  raw_material_id: string;
  quantity_reserved: number;
  quantity_consumed: number;
  status: 'reserved' | 'in_progress' | 'consumed' | 'cancelled';
  merchant_id: string;
  created_at: string;
  updated_at: string;
  raw_materials?: {
    name: string;
    unit: string;
  };
  manufacturing_orders?: {
    order_number: string;
    product_name: string;
  };
}

export const useManufacturingMaterialReservations = () => {
  const [reservations, setReservations] = useState<ManufacturingMaterialReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('manufacturing_material_reservations')
        .select(`
          *,
          raw_materials(name, unit),
          manufacturing_orders!manufacturing_material_reservations_manufacturing_order_id_fkey(order_number, product_name)
        `)
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion to ensure proper typing
      const typedReservations = (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as 'reserved' | 'in_progress' | 'consumed' | 'cancelled'
      }));

      setReservations(typedReservations);
    } catch (error) {
      console.error('Error fetching manufacturing material reservations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch manufacturing material reservations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return { 
    reservations,
    loading,
    refetch: fetchReservations
  };
};
