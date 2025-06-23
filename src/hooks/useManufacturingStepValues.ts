
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useManufacturingStepValues = () => {
  const { data: stepValues = [], isLoading } = useQuery({
    queryKey: ['manufacturing_order_step_data_values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_step_data')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const getStepValue = (stepDataId: string, fieldKey: string) => {
    const stepData = stepValues.find(step => step.id === stepDataId);
    if (!stepData) return '';
    
    // Map field keys to actual column names in manufacturing_order_step_data
    const fieldMapping: Record<string, string> = {
      'quantity_assigned': 'quantity_assigned',
      'quantity_received': 'quantity_received', 
      'weight_assigned': 'weight_assigned',
      'weight_received': 'weight_received',
      'purity': 'purity',
      'wastage': 'wastage',
      'assigned_worker': 'assigned_worker',
      'due_date': 'due_date',
      'notes': 'notes',
      'instructions': 'instructions',
      'temperature': 'temperature',
      'pressure': 'pressure',
      'quality_grade': 'quality_grade',
      'batch_number': 'batch_number',
      'machine_used': 'machine_used'
    };

    const columnName = fieldMapping[fieldKey] || fieldKey;
    return stepData[columnName as keyof typeof stepData] || '';
  };

  const getStepValues = (stepDataId: string) => {
    return stepValues.filter(step => step.id === stepDataId);
  };

  return {
    stepValues,
    getStepValue,
    getStepValues,
    isLoading
  };
};
