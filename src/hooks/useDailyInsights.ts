
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DailyInsight {
  id: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  icon: string;
}

export const useDailyInsights = () => {
  const [insights, setInsights] = useState<DailyInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const generateInsights = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const today = new Date().toISOString().split('T')[0];
      const generatedInsights: DailyInsight[] = [];

      // Check raw materials shortfalls
      const { data: rawMaterials, error: rmError } = await supabase
        .from('raw_materials')
        .select('name, current_stock, minimum_stock, shortfall')
        .eq('merchant_id', merchantId)
        .gt('shortfall', 0)
        .order('shortfall', { ascending: false })
        .limit(3);

      if (rmError) throw rmError;

      rawMaterials?.forEach((material, index) => {
        if (index < 2) { // Limit to 2 material insights
          generatedInsights.push({
            id: `rm-${material.name}`,
            message: `Today, ${material.name} material is short by ${material.shortfall} units and needs to be procured`,
            type: 'critical',
            icon: 'alert-triangle'
          });
        }
      });

      // Check finished goods below threshold
      const { data: finishedGoods, error: fgError } = await supabase
        .from('finished_goods')
        .select(`
          product_code,
          current_stock,
          threshold,
          product_config:product_configs(category, subcategory)
        `)
        .eq('merchant_id', merchantId)
        .order('current_stock', { ascending: true })
        .limit(2);

      if (fgError) throw fgError;

      const lowStockGoods = finishedGoods?.filter(fg => fg.current_stock < fg.threshold) || [];
      if (lowStockGoods.length > 0) {
        const item = lowStockGoods[0];
        generatedInsights.push({
          id: `fg-${item.product_code}`,
          message: `${item.product_code} inventory is running low with only ${item.current_stock} pieces left, consider manufacturing more`,
          type: 'warning',
          icon: 'package'
        });
      }

      // Check today's orders
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, total_amount')
        .eq('merchant_id', merchantId)
        .eq('created_date', today);

      if (ordersError) throw ordersError;

      if (todayOrders && todayOrders.length > 0) {
        const totalAmount = todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        generatedInsights.push({
          id: 'orders-today',
          message: `${todayOrders.length} new orders received today worth ₹${totalAmount.toLocaleString()}`,
          type: 'success',
          icon: 'trending-up'
        });
      } else {
        generatedInsights.push({
          id: 'no-orders',
          message: 'No new orders received today, consider following up with customers',
          type: 'info',
          icon: 'bell'
        });
      }

      // Check pending procurement requests
      const { data: pendingRequests, error: procError } = await supabase
        .from('procurement_requests')
        .select('id, status')
        .eq('merchant_id', merchantId)
        .eq('status', 'Pending');

      if (procError) throw procError;

      if (pendingRequests && pendingRequests.length > 0) {
        generatedInsights.push({
          id: 'pending-procurement',
          message: `${pendingRequests.length} procurement requests are pending approval from suppliers`,
          type: 'warning',
          icon: 'clock'
        });
      }

      // Add positive insight if all is well
      if (generatedInsights.filter(i => i.type === 'critical' || i.type === 'warning').length === 0) {
        generatedInsights.push({
          id: 'all-good',
          message: 'All inventory levels are healthy and no urgent actions needed today',
          type: 'success',
          icon: 'check'
        });
      }

      // Manufacturing capacity insight
      const inManufacturingCount = finishedGoods?.reduce((sum, fg) => sum + (fg.in_manufacturing || 0), 0) || 0;
      if (inManufacturingCount === 0) {
        generatedInsights.push({
          id: 'manufacturing-capacity',
          message: 'Manufacturing capacity is available for immediate production',
          type: 'info',
          icon: 'settings'
        });
      }

      setInsights(generatedInsights.slice(0, 6)); // Limit to 6 insights
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate daily insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  return { insights, loading, refetch: generateInsights };
};
