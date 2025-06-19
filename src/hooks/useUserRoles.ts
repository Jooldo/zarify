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
  } | null;
  assigned_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const useUserRoles = () => {
  const queryClient = useQueryClient();

  const { data: userRoles, isLoading, error } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      console.log('🔍 Fetching user roles...');
      
      try {
        // First get the user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        console.log('📊 Raw roles data:', rolesData);
        console.log('❌ Roles error:', rolesError);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          throw rolesError;
        }

        if (!rolesData || rolesData.length === 0) {
          console.log('✅ No roles found, returning empty array');
          return [];
        }

        // Get unique user IDs for profile lookup
        const userIds = [...new Set([
          ...rolesData.map(role => role.user_id),
          ...rolesData.map(role => role.assigned_by).filter(Boolean)
        ])];

        console.log('👥 User IDs for profile lookup:', userIds);

        // Fetch profiles for all relevant users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        console.log('👤 Profiles data:', profilesData);
        console.log('❌ Profiles error:', profilesError);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          // Continue without profiles if there's an error
        }

        // Create a profile lookup map
        const profileLookup = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, { first_name: string | null; last_name: string | null }>);

        console.log('🗺️ Profile lookup map:', profileLookup);

        // Combine roles with profile data
        const rolesWithProfiles = rolesData.map(role => ({
          ...role,
          profiles: profileLookup[role.user_id] || null,
          assigned_by_profile: role.assigned_by ? profileLookup[role.assigned_by] || null : null,
        }));

        console.log('✅ Final roles with profiles:', rolesWithProfiles);
        return rolesWithProfiles as UserRoleWithProfile[];
      } catch (error) {
        console.error('🚨 Error in useUserRoles query:', error);
        throw error;
      }
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
      console.log('🎯 Assigning role:', { userId, role, permissions });
      
      // Get current user's merchant_id first
      const { data: profileData } = await supabase
        .from('profiles')
        .select('merchant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profileData?.merchant_id) {
        throw new Error('User merchant not found');
      }

      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          merchant_id: profileData.merchant_id,
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
      queryClient.invalidateQueries({ queryKey: ['has-role'] });
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

  console.log('🔄 useUserRoles hook state:', { 
    userRoles: userRoles?.length || 0, 
    isLoading, 
    error: error?.message || 'none' 
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
      console.log('🔍 Fetching current user roles...');
      
      const { data, error } = await supabase
        .rpc('get_user_roles');

      if (error) {
        console.error('Error fetching current user roles:', error);
        throw error;
      }

      console.log('✅ Current user roles:', data);
      return data;
    },
  });
};

export const useHasRole = (role: string) => {
  return useQuery({
    queryKey: ['has-role', role],
    queryFn: async () => {
      console.log('🔍 Checking if user has role:', role);
      
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        console.log('❌ No current user');
        return false;
      }

      console.log('👤 Current user ID:', currentUser.user.id);

      // Check user roles directly from the table first
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.user.id)
        .eq('role', role)
        .eq('is_active', true)
        .maybeSingle();

      console.log('🔍 Role query result:', { roleData, roleError });

      if (roleError) {
        console.error('Error checking role from table:', roleError);
        return false;
      }

      const hasRole = !!roleData;
      console.log(`✅ User ${hasRole ? 'has' : 'does not have'} role '${role}'`);
      
      return hasRole;
    },
  });
};
