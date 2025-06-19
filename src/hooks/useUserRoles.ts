
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserRole {
  id: string;
  user_id: string;
  merchant_id: string;
  role: 'admin' | 'manager' | 'worker' | 'operator' | 'viewer';
  permissions: Record<string, any>;
  is_active: boolean;
  assigned_by: string | null;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleWithProfile extends UserRole {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
  assigned_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const useUserRoles = () => {
  const queryClient = useQueryClient();

  const { data: userRoles, isLoading, error } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          ),
          assigned_by_profile:assigned_by (
            first_name,
            last_name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }

      return data as UserRoleWithProfile[];
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      role, 
      permissions = {} 
    }: { 
      userId: string; 
      role: string; 
      permissions?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          permissions,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role assigned successfully');
    },
    onError: (error: any) => {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ 
      roleId, 
      updates 
    }: { 
      roleId: string; 
      updates: Partial<UserRole>;
    }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .update(updates)
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    },
  });

  const deactivateRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role deactivated successfully');
    },
    onError: (error: any) => {
      console.error('Error deactivating role:', error);
      toast.error('Failed to deactivate role');
    },
  });

  return {
    userRoles,
    isLoading,
    error,
    assignRole: assignRoleMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    deactivateRole: deactivateRoleMutation.mutate,
    isAssigning: assignRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeactivating: deactivateRoleMutation.isPending,
  };
};

export const useCurrentUserRoles = () => {
  return useQuery({
    queryKey: ['current-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_user_roles');

      if (error) {
        console.error('Error fetching current user roles:', error);
        throw error;
      }

      return data;
    },
  });
};

export const useHasRole = (role: string) => {
  return useQuery({
    queryKey: ['has-role', role],
    queryFn: async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return false;

      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: currentUser.user.id, 
          _role: role 
        });

      if (error) {
        console.error('Error checking role:', error);
        return false;
      }

      return data;
    },
  });
};
