
import { supabase } from '@/integrations/supabase/client';
import { dummyWorkers } from '@/data/dummyWorkers';

export const seedDummyWorkers = async () => {
  try {
    // Get current user's merchant ID
    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_user_merchant_id');

    if (merchantError) {
      console.error('Error getting merchant ID:', merchantError);
      return { success: false, error: merchantError };
    }

    // Check if workers already exist for this merchant
    const { data: existingWorkers, error: checkError } = await supabase
      .from('workers')
      .select('id')
      .eq('merchant_id', merchantId)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing workers:', checkError);
      return { success: false, error: checkError };
    }

    if (existingWorkers && existingWorkers.length > 0) {
      console.log('Workers already exist for this merchant');
      return { success: true, message: 'Workers already exist' };
    }

    // Prepare workers data for insertion
    const workersToInsert = dummyWorkers.map(worker => ({
      name: worker.name,
      role: worker.role,
      contact_number: worker.contact_number,
      status: worker.status,
      joined_date: worker.joined_date,
      notes: worker.notes,
      merchant_id: merchantId
    }));

    // Insert dummy workers
    const { data, error } = await supabase
      .from('workers')
      .insert(workersToInsert)
      .select();

    if (error) {
      console.error('Error inserting dummy workers:', error);
      return { success: false, error };
    }

    console.log(`Successfully inserted ${data.length} dummy workers`);
    return { success: true, data, count: data.length };

  } catch (error) {
    console.error('Unexpected error seeding workers:', error);
    return { success: false, error };
  }
};

// Helper function to delete all workers (for testing)
export const clearAllWorkers = async () => {
  try {
    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_user_merchant_id');

    if (merchantError) {
      console.error('Error getting merchant ID:', merchantError);
      return { success: false, error: merchantError };
    }

    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('merchant_id', merchantId);

    if (error) {
      console.error('Error clearing workers:', error);
      return { success: false, error };
    }

    console.log('Successfully cleared all workers');
    return { success: true };

  } catch (error) {
    console.error('Unexpected error clearing workers:', error);
    return { success: false, error };
  }
};
