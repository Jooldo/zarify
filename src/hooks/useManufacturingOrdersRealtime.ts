
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useManufacturingOrdersRealtime = (onDataChange: () => void) => {
  useEffect(() => {
    const channelName = `manufacturing-orders-realtime-${Date.now()}-${Math.random()}`;
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
          onDataChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onDataChange]);
};
