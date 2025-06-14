
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Catalogue {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  is_active: boolean;
  public_url_slug: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCatalogueData {
  name: string;
  description?: string;
  cover_image_url?: string;
}

export const useCatalogues = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: catalogues = [], isLoading, error, refetch } = useQuery({
    queryKey: ['catalogues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Catalogue[];
    },
  });

  const createCatalogueMutation = useMutation({
    mutationFn: async (catalogueData: CreateCatalogueData) => {
      try {
        // Get merchant ID
        const { data: merchantId, error: merchantError } = await supabase
          .rpc('get_user_merchant_id');

        if (merchantError) throw merchantError;

        // Generate slug
        const { data: slug, error: slugError } = await supabase
          .rpc('generate_catalogue_slug', {
            catalogue_name: catalogueData.name,
            merchant_id_param: merchantId
          });

        if (slugError) throw slugError;

        // Create catalogue
        const { data, error } = await supabase
          .from('catalogues')
          .insert({
            ...catalogueData,
            merchant_id: merchantId,
            public_url_slug: slug
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating catalogue:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogues'] });
      toast({
        title: 'Success',
        description: `Catalogue "${data.name}" created successfully`,
      });
    },
    onError: (error) => {
      console.error('Error creating catalogue:', error);
      toast({
        title: 'Error',
        description: 'Failed to create catalogue',
        variant: 'destructive',
      });
    },
  });

  const updateCatalogueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Catalogue> }) => {
      const { data, error } = await supabase
        .from('catalogues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogues'] });
      toast({
        title: 'Success',
        description: 'Catalogue updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating catalogue:', error);
      toast({
        title: 'Error',
        description: 'Failed to update catalogue',
        variant: 'destructive',
      });
    },
  });

  const deleteCatalogueMutation = useMutation({
    mutationFn: async (catalogueId: string) => {
      const { error } = await supabase
        .from('catalogues')
        .delete()
        .eq('id', catalogueId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogues'] });
      toast({
        title: 'Success',
        description: 'Catalogue deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting catalogue:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete catalogue',
        variant: 'destructive',
      });
    },
  });

  const createCatalogue = (catalogueData: CreateCatalogueData) => {
    return createCatalogueMutation.mutate(catalogueData);
  };

  const updateCatalogue = (id: string, updates: Partial<Catalogue>) => {
    return updateCatalogueMutation.mutate({ id, updates });
  };

  const deleteCatalogue = (catalogueId: string) => {
    return deleteCatalogueMutation.mutate(catalogueId);
  };

  return {
    catalogues,
    isLoading,
    error,
    createCatalogue,
    updateCatalogue,
    deleteCatalogue,
    refetch,
    isCreating: createCatalogueMutation.isPending,
    isUpdating: updateCatalogueMutation.isPending,
    isDeleting: deleteCatalogueMutation.isPending,
  };
};
