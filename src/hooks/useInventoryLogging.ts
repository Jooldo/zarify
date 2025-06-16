
import { supabase } from '@/integrations/supabase/client';

export const useInventoryLogging = () => {
  const logInventoryActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    description: string
  ) => {
    try {
      await supabase.rpc('log_user_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_description: description
      });
    } catch (error) {
      console.error('Failed to log inventory activity:', error);
    }
  };

  const logStockUpdate = async (productId: string, productCode: string, oldStock: number, newStock: number) => {
    const change = newStock - oldStock;
    const changeText = change > 0 ? `increased by ${change}` : `decreased by ${Math.abs(change)}`;
    
    await logInventoryActivity(
      'Stock Updated',
      'Finished Goods',
      productId,
      `Stock for ${productCode} ${changeText} (${oldStock} → ${newStock})`
    );
  };

  const logTagOperation = async (operation: 'Tag In' | 'Tag Out', tagId: string, productCode: string, quantity: number) => {
    await logInventoryActivity(
      operation,
      'Inventory Tag',
      tagId,
      `${operation} ${quantity} units of ${productCode} using tag ${tagId}`
    );
  };

  const logRawMaterialUpdate = async (materialId: string, materialName: string, oldStock: number, newStock: number) => {
    const change = newStock - oldStock;
    const changeText = change > 0 ? `increased by ${change}` : `decreased by ${Math.abs(change)}`;
    
    await logInventoryActivity(
      'Stock Updated',
      'Raw Material',
      materialId,
      `Stock for ${materialName} ${changeText} (${oldStock} → ${newStock})`
    );
  };

  const logProcurementRequest = async (requestId: string, materialName: string, quantity: number, action: string) => {
    await logInventoryActivity(
      action,
      'Procurement Request',
      requestId,
      `${action} procurement request for ${quantity} units of ${materialName}`
    );
  };

  return {
    logStockUpdate,
    logTagOperation,
    logRawMaterialUpdate,
    logProcurementRequest
  };
};
