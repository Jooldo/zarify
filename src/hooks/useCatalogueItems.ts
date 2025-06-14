
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CatalogueItem {
  id: string;
  catalogue_id: string;
  product_config_id: string;
  display_order: number;
  custom_price?: number;
  custom_description?: string;
  is_featured: boolean;
  created_at: string;
  product_configs: {
    id: string;
    product_code: string;
    category: string;
    subcategory: string;
    size_value: number;
    weight_range?: string;
  };
}

export interface CreateCatalogueItemData {
  catalogue_id: string;
  product_config_id: string;
  custom_price?: number;
  custom_description?: string;
  is_featured?: boolean;
}

export const useCatalogueItems = (catalogueId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: catalogueItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['catalogue-items', catalogueId],
    queryFn: async () => {
      if (!catalogueId) return [];

      const { data, error } = await supabase
        .from('catalogue_items')
        .select(`
          *,
          product_configs (
            id,
            product_code,
            category,
            subcategory,
            size_value,
            weight_range
          )
        `)
        .eq('catalogue_id', catalogueId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Filter out items where product_configs failed to load and properly type the result
      return (data || [])
        .filter((item): item is CatalogueItem => {
          // Check if product_configs exists and is a valid object
          if (!item.product_configs || 
              item.product_configs === null || 
              item.product_configs === undefined) {
            return false;
          }
          
          // Check if it's an error object
          if (typeof item.product_configs === 'object' && 'error' in item.product_configs) {
            return false;
          }
          
          // Check if it has the required properties
          return typeof item.product_configs === 'object' && 
                 'id' in item.product_configs &&
                 'product_code' in item.product_configs &&
                 'category' in item.product_configs &&
                 'subcategory' in item.product_configs &&
                 'size_value' in item.product_configs;
        });
    },
    enabled: !!catalogueId,
  });

  const addItemMutation = useMutation({
    mutationFn: async (itemData: CreateCatalogueItemData) => {
      const { data, error } = await supabase
        .from('catalogue_items')
        .insert(itemData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue-items', catalogueId] });
      toast({
        title: 'Success',
        description: 'Item added to catalogue',
      });
    },
    onError: (error) => {
      console.error('Error adding item to catalogue:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to catalogue',
        variant: 'destructive',
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('catalogue_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue-items', catalogueId] });
      toast({
        title: 'Success',
        description: 'Item removed from catalogue',
      });
    },
    onError: (error) => {
      console.error('Error removing item from catalogue:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from catalogue',
        variant: 'destructive',
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CatalogueItem> }) => {
      const { data, error } = await supabase
        .from('catalogue_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue-items', catalogueId] });
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating catalogue item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      });
    },
  });

  const addItem = (itemData: CreateCatalogueItemData) => {
    return addItemMutation.mutate(itemData);
  };

  const removeItem = (itemId: string) => {
    return removeItemMutation.mutate(itemId);
  };

  const updateItem = (id: string, updates: Partial<CatalogueItem>) => {
    return updateItemMutation.mutate({ id, updates });
  };

  return {
    catalogueItems,
    isLoading,
    error,
    addItem,
    removeItem,
    updateItem,
    refetch,
    isAdding: addItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
  };
};
