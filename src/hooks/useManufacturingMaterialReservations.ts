
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ManufacturingMaterialReservation {
  id: string;
  manufacturing_order_id: string;
  raw_material_id: string;
  quantity_reserved: number;
  quantity_consumed: number;
  status: 'reserved' | 'in_progress' | 'consumed' | 'cancelled';
  created_at: string;
  updated_at: string;
  raw_materials?: {
    name: string;
    unit: string;
  };
  manufacturing_orders?: {
    order_number: string;
    product_name: string;
    status: string;
  };
}

export const useManufacturingMaterialReservations = () => {
  const [reservations, setReservations] = useState<ManufacturingMaterialReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReservations = async (materialId?: string, orderId?: string) => {
    try {
      console.log('🔍 Fetching manufacturing material reservations...');
      setLoading(true);
      
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      let query = supabase
        .from('manufacturing_material_reservations')
        .select(`
          *,
          raw_materials(name, unit),
          manufacturing_orders(order_number, product_name, status)
        `)
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (materialId) {
        query = query.eq('raw_material_id', materialId);
      }
      if (orderId) {
        query = query.eq('manufacturing_order_id', orderId);
      }

      const { data: reservationsData, error: reservationsError } = await query;

      if (reservationsError) throw reservationsError;

      console.log('✅ Manufacturing material reservations fetched:', reservationsData?.length || 0, 'items');
      setReservations(reservationsData || []);
      
    } catch (error) {
      console.error('Error fetching manufacturing material reservations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch material reservations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('manufacturing_material_reservations')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId);

      if (error) throw error;

      // Refresh the reservations list
      await fetchReservations();
      
      toast({
        title: 'Success',
        description: 'Reservation status updated successfully',
      });
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reservation status',
        variant: 'destructive',
      });
    }
  };

  const refreshManufacturingQuantities = async () => {
    try {
      const { error } = await supabase.rpc('update_raw_material_manufacturing_quantities');
      if (error) throw error;
      
      console.log('✅ Manufacturing quantities refreshed');
    } catch (error) {
      console.error('Error refreshing manufacturing quantities:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh manufacturing quantities',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return { 
    reservations, 
    loading, 
    refetch: fetchReservations,
    updateReservationStatus,
    refreshManufacturingQuantities
  };
};
