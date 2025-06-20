
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useManufacturingOrdersRealtime = (onDataChange: () => void) => {
  useEffect(() => {
    const channelName = `manufacturing-orders-realtime-${Date.now()}-${Math.random()}`;
    console.log('Setting up real-time subscription for manufacturing orders:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manufacturing_orders'
        },
        (payload) => {
          console.log('Real-time update for manufacturing_orders:', payload);
          // Small delay to ensure database consistency
          setTimeout(() => {
            onDataChange();
          }, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manufacturing_order_steps'
        },
        (payload) => {
          console.log('Real-time update for manufacturing_order_steps:', payload);
          // Small delay to ensure database consistency
          setTimeout(() => {
            onDataChange();
          }, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manufacturing_order_step_values'
        },
        (payload) => {
          console.log('Real-time update for manufacturing_order_step_values:', payload);
          // Small delay to ensure database consistency
          setTimeout(() => {
            onDataChange();
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('Manufacturing orders real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up manufacturing orders real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [onDataChange]);
};
