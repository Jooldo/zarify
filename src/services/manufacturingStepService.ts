import { supabase } from '@/integrations/supabase/client';

export interface ManufacturingOrderStepData {
  id: string;
  merchant_id: string;
  order_id: string;
  step_name: string;
  instance_id?: string;
  instance_number?: number;
  parent_instance_id?: string;
  is_rework?: boolean; // New field for rework tracking
  origin_step_id?: string; // New field for origin step reference
  quantity_assigned?: number;
  quantity_received?: number;
  weight_assigned?: number;
  weight_received?: number;
  purity?: number;
  wastage?: number;
  assigned_worker?: string;
  due_date?: string;
  notes?: string;
  instructions?: string;
  temperature?: number;
  pressure?: number;
  quality_grade?: string;
  batch_number?: string;
  machine_used?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'rework';
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStepData {
  order_id: string;
  step_name: string;
  instance_number?: number;
  parent_instance_id?: string;
  is_rework?: boolean; // Add rework support
  origin_step_id?: string; // Add origin step support
  [key: string]: any;
}

export const createManufacturingOrderStep = async (stepData: CreateStepData): Promise<ManufacturingOrderStepData> => {
  const { data: merchantId, error: merchantError } = await supabase
    .rpc('get_user_merchant_id');

  if (merchantError) throw merchantError;

  // Get next instance number if not provided
  let instanceNumber = stepData.instance_number;
  if (!instanceNumber) {
    const { data: nextInstance, error: instanceError } = await supabase
      .rpc('get_next_step_instance_number', {
        p_order_id: stepData.order_id,
        p_step_name: stepData.step_name
      });

    if (instanceError) throw instanceError;
    instanceNumber = nextInstance;
  }

  const { data, error } = await supabase
    .from('manufacturing_order_step_data')
    .insert({
      merchant_id: merchantId,
      order_id: stepData.order_id,
      step_name: stepData.step_name,
      instance_number: instanceNumber,
      parent_instance_id: stepData.parent_instance_id,
      is_rework: stepData.is_rework || false, // Include rework flag
      origin_step_id: stepData.origin_step_id, // Include origin step reference
      ...stepData,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    status: data.status as ManufacturingOrderStepData['status']
  };
};

export const updateManufacturingOrderStep = async (stepId: string, updates: Partial<ManufacturingOrderStepData>): Promise<ManufacturingOrderStepData> => {
  const { data, error } = await supabase
    .from('manufacturing_order_step_data')
    .update(updates)
    .eq('id', stepId)
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    status: data.status as ManufacturingOrderStepData['status']
  };
};

export const fetchManufacturingOrderSteps = async (orderId: string): Promise<ManufacturingOrderStepData[]> => {
  const { data, error } = await supabase
    .from('manufacturing_order_step_data')
    .select('*')
    .eq('order_id', orderId)
    .order('step_name')
    .order('instance_number');

  if (error) throw error;
  
  return (data || []).map(step => ({
    ...step,
    status: step.status as ManufacturingOrderStepData['status']
  }));
};
