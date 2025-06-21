
import { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface RawMaterial {
  id: string;
  name: string;
  type: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  required: number;
  in_procurement: number;
  in_manufacturing: number; // Reserved materials (deducted from current_stock)
  shortfall: number;
  supplier_name?: string;
  supplier_id?: string;
  last_updated?: string;
  updated_at?: string; // Add missing property
  cost_per_unit?: number;
}

export interface CreateRawMaterialData {
  name: string;
  type: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

// Create context for raw materials
const RawMaterialsContext = createContext<{
  rawMaterials: RawMaterial[];
  loading: boolean;
  refetch: () => Promise<void>;
  addRawMaterial: (data: CreateRawMaterialData) => Promise<void>;
} | null>(null);

export const useRawMaterials = () => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRawMaterials = async () => {
    try {
      console.log('🔍 Fetching raw materials with database values...');
      setLoading(true);
      
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Fetch raw materials with supplier info - use the required field directly from database
      const { data: rawMaterialsData, error: rawMaterialsError } = await supabase
        .from('raw_materials')
        .select(`
          *,
          supplier:suppliers(company_name)
        `)
        .eq('merchant_id', merchantId)
        .order('name');

      if (rawMaterialsError) throw rawMaterialsError;

      // Use the database values directly (calculation service should have updated them)
      const materialsWithCalculations = rawMaterialsData?.map(material => {
        // Calculate shortfall for this material using new logic:
        // Shortfall = (required + minimum_stock) - (current_stock + in_procurement)
        // Note: in_manufacturing represents reserved materials already deducted from current_stock
        const actualAvailableStock = material.current_stock + material.in_procurement;
        const shortfall = (material.required + material.minimum_stock) - actualAvailableStock;

        if (material.name.includes('Chain') || material.name.includes('M Chain')) {
          console.log(`🔍 DEBUG M Chain material: ${material.name}`);
          console.log(`   Required from DB: ${material.required}`);
          console.log(`   Current stock: ${material.current_stock}`);
          console.log(`   Minimum stock: ${material.minimum_stock}`);
          console.log(`   In procurement: ${material.in_procurement}`);
          console.log(`   In manufacturing (reserved): ${material.in_manufacturing || 0}`);
          console.log(`   Actual available stock: ${actualAvailableStock}`);
          console.log(`   Calculated shortfall: ${shortfall}`);
          console.log(`   Formula: (${material.required} + ${material.minimum_stock}) - (${material.current_stock} + ${material.in_procurement})`);
        }

        return {
          ...material,
          required: material.required || 0, // Use database value directly
          in_manufacturing: material.in_manufacturing || 0, // Ensure this is always a number
          shortfall,
          supplier_name: material.supplier?.company_name,
          updated_at: material.last_updated || material.created_at // Map updated_at properly
        };
      }) || [];

      console.log('✅ Raw materials fetched with database values:', materialsWithCalculations.length, 'items');
      setRawMaterials(materialsWithCalculations);
      
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch raw materials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addRawMaterial = async (data: CreateRawMaterialData) => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { error } = await supabase
        .from('raw_materials')
        .insert({
          ...data,
          merchant_id: merchantId
        });

      if (error) throw error;

      await fetchRawMaterials();
    } catch (error) {
      console.error('Error adding raw material:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  return { 
    rawMaterials, 
    loading, 
    refetch: fetchRawMaterials, 
    addRawMaterial
  };
};

// Context hook
export const useRawMaterialsContext = () => {
  const context = useContext(RawMaterialsContext);
  if (!context) {
    // Return a mock context with minimal functionality for backwards compatibility
    return {
      refetch: async () => {},
      loading: false,
      rawMaterials: []
    };
  }
  return context;
};
