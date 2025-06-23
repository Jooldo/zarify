
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

      // Since manufacturing_material_reservations table doesn't exist, 
      // we'll return empty data for now
      console.log('Manufacturing material reservations table not found in database');
      setReservations([]);
    } catch (error) {
      console.error('Error fetching manufacturing material reservations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch manufacturing material reservations',
        variant: 'destructive',
      });
      setReservations([]);
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
